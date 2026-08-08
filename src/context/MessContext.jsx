import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { startOfMonth, format, subMonths, isSameMonth, parseISO } from 'date-fns';
import { useConfirm } from './ConfirmationContext';

const MessContext = createContext();

export const useMess = () => useContext(MessContext);

export const MessProvider = ({ children }) => {
  const [variables, setVariables] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { confirm } = useConfirm();

  useEffect(() => {
    // Listen to Mess Variables
    const variablesQuery = query(collection(db, 'pocketflow_mess_variables'), orderBy('order', 'asc'));
    const unsubscribeVars = onSnapshot(variablesQuery, (snapshot) => {
      setVariables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Mess Entries
    const entriesQuery = query(collection(db, 'pocketflow_mess_entries'));
    const unsubscribeEntries = onSnapshot(entriesQuery, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeVars();
      unsubscribeEntries();
    };
  }, []);

  // Variables CRUD
  const addVariable = async (variable) => {
    try {
      await addDoc(collection(db, 'pocketflow_mess_variables'), {
        ...variable,
        isArchived: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error adding variable", e);
    }
  };

  const updateVariable = async (id, data) => {
    try {
      await updateDoc(doc(db, 'pocketflow_mess_variables', id), data);
    } catch (e) {
      console.error("Error updating variable", e);
    }
  };

  const deleteVariable = async (id) => {
    const isConfirmed = await confirm('Delete Variable', 'Are you sure you want to delete this variable? This will permanently remove it.');
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, 'pocketflow_mess_variables', id));
    } catch (e) {
      console.error("Error deleting variable", e);
    }
  };

  const reorderVariables = async (reorderedVars) => {
    try {
      const promises = reorderedVars.map((v, index) => 
        updateDoc(doc(db, 'pocketflow_mess_variables', v.id), { order: index })
      );
      await Promise.all(promises);
    } catch (e) {
      console.error("Error reordering", e);
    }
  };

  // Entries CRUD
  // entry = { month: '2023-10', variableId: '...', amount: 100 }
  const saveEntry = async (month, variableId, amount) => {
    // Check if entry exists
    const existing = entries.find(e => e.month === month && e.variableId === variableId);
    try {
      if (existing) {
        if (amount === 0 || amount === '' || amount === null) {
           await deleteDoc(doc(db, 'pocketflow_mess_entries', existing.id));
        } else {
           await updateDoc(doc(db, 'pocketflow_mess_entries', existing.id), { amount: Number(amount) });
        }
      } else {
        if (amount && Number(amount) > 0) {
          await addDoc(collection(db, 'pocketflow_mess_entries'), {
            month,
            variableId,
            amount: Number(amount)
          });
        }
      }
    } catch (e) {
      console.error("Error saving entry", e);
    }
  };

  // Computations
  const getMonthlyStats = (monthString) => {
    const monthEntries = entries.filter(e => e.month === monthString);
    let total = 0;
    let foodTotal = 0;
    let nonFoodTotal = 0;
    let highestCategory = { name: '-', amount: 0 };

    monthEntries.forEach(entry => {
      const v = variables.find(v => v.id === entry.variableId);
      if (v) {
        total += entry.amount;
        if (v.type === 'food') foodTotal += entry.amount;
        else nonFoodTotal += entry.amount;

        if (entry.amount > highestCategory.amount) {
          highestCategory = { name: v.name, amount: entry.amount };
        }
      }
    });

    // Approximate days in month based on string "YYYY-MM"
    const [year, month] = monthString.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return {
      total,
      foodTotal,
      nonFoodTotal,
      avgPerDay: total / daysInMonth,
      // Assuming 3 meals per day roughly
      avgPerMeal: foodTotal / (daysInMonth * 3),
      highestCategory,
      entries: monthEntries
    };
  };

  return (
    <MessContext.Provider value={{
      variables,
      entries,
      loading,
      addVariable,
      updateVariable,
      deleteVariable,
      reorderVariables,
      saveEntry,
      getMonthlyStats
    }}>
      {children}
    </MessContext.Provider>
  );
};
