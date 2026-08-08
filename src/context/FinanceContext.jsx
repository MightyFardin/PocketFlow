import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useConfirm } from './ConfirmationContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pocketflow_theme') || 'light';
  });
  
  const { confirm } = useConfirm();
  const hasUnlocked = useRef(false);

  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [bills, setBills] = useState([]);
  const [notes, setNotes] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // Settings & Security
  const [settings, setSettings] = useState({
    privacyMode: false,
    pinCode: null,
    currency: 'BDT'
  });
  const [isLocked, setIsLocked] = useState(false);
  
  const [loading, setLoading] = useState(true);

  // Load from Firebase
  useEffect(() => {
    // Transactions listener
    const txQuery = query(collection(db, 'pocketflow_transactions'), orderBy('date', 'desc'));
    const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      console.error("Error loading transactions:", error);
      setLoading(false);
    });

    // Goals listener
    const goalsQuery = query(collection(db, 'pocketflow_goals'));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const g = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(g);
    });

    // Wishlist listener
    const wishlistQuery = query(collection(db, 'pocketflow_wishlists'), orderBy('targetDate', 'asc'));
    const unsubscribeWishlists = onSnapshot(wishlistQuery, (snapshot) => {
      const w = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWishlists(w);
    });

    // Budgets listener
    const budgetQuery = query(collection(db, 'pocketflow_budgets'));
    const unsubscribeBudgets = onSnapshot(budgetQuery, (snapshot) => {
      const b = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBudgets(b);
    });

    // Bills listener
    const billQuery = query(collection(db, 'pocketflow_bills'), orderBy('dueDate', 'asc'));
    const unsubscribeBills = onSnapshot(billQuery, (snapshot) => {
      const bl = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBills(bl);
    });

    // Notes listener
    const notesQuery = query(collection(db, 'pocketflow_notes'), orderBy('createdAt', 'desc'));
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Achievements listener
    const achievementsQuery = query(collection(db, 'pocketflow_achievements'));
    const unsubscribeAchievements = onSnapshot(achievementsQuery, (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Settings listener from Firebase
    const settingsDocRef = doc(db, 'pocketflow_settings', 'global');
    const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({...prev, ...data}));
        if (data.pinCode && !hasUnlocked.current) {
          setIsLocked(true);
        }
      }
    });

    return () => {
      unsubscribeTx();
      unsubscribeGoals();
      unsubscribeWishlists();
      unsubscribeBudgets();
      unsubscribeBills();
      unsubscribeNotes();
      unsubscribeAchievements();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('theme-minimalist');
      document.documentElement.classList.remove('theme-glass');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('theme-minimalist');
      document.documentElement.classList.remove('theme-glass');
    }
    localStorage.setItem('pocketflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const addTransaction = async (transaction) => {
    try {
      const { id, ...dataToSave } = transaction;
      await addDoc(collection(db, 'pocketflow_transactions'), {
        ...dataToSave,
        isPlanned: dataToSave.isPlanned || false,
        isEssential: dataToSave.isEssential || false,
        isFixed: dataToSave.isFixed || false,
        priority: dataToSave.priority || 'Medium',
        isFavorite: dataToSave.isFavorite || false,
        isPinned: dataToSave.isPinned || false,
        isArchived: dataToSave.isArchived || false,
        deletedAt: null,
        tags: dataToSave.tags || [],
        attachments: dataToSave.attachments || []
      });
    } catch (error) {
      console.error("Error adding transaction: ", error);
      alert("Error saving to database: " + error.message);
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      await updateDoc(doc(db, 'pocketflow_transactions', id), data);
    } catch (error) {
      console.error("Error updating transaction: ", error);
    }
  };

  const softDeleteTransaction = async (id) => {
    try {
      await updateDoc(doc(db, 'pocketflow_transactions', id), { deletedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error soft deleting transaction: ", error);
    }
  };

  const restoreTransaction = async (id) => {
    try {
      await updateDoc(doc(db, 'pocketflow_transactions', id), { deletedAt: null });
    } catch (error) {
      console.error("Error restoring transaction: ", error);
    }
  };

  const deleteTransaction = async (id) => {
    const isConfirmed = await confirm('Delete Transaction', 'Are you sure you want to permanently delete this transaction?');
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, 'pocketflow_transactions', id));
    } catch (error) {
      console.error("Error deleting transaction: ", error);
      alert("Error deleting from database: " + error.message);
    }
  };

  const addGoal = async (goal) => {
    try {
      const { id, ...dataToSave } = goal;
      await addDoc(collection(db, 'pocketflow_goals'), {
        ...dataToSave,
        status: dataToSave.status || 'Active',
        milestones: dataToSave.milestones || []
      });
    } catch (error) {
      console.error("Error adding goal: ", error);
      alert("Error saving to database: " + error.message);
    }
  };

  const updateGoal = async (id, data) => {
    try {
      await updateDoc(doc(db, 'pocketflow_goals', id), data);
    } catch (error) {
      console.error("Error updating goal: ", error);
    }
  };

  const deleteGoal = async (id) => {
    const isConfirmed = await confirm('Delete Goal', 'Are you sure you want to permanently delete this goal?');
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, 'pocketflow_goals', id));
    } catch (error) {
      console.error("Error deleting goal: ", error);
    }
  };

  const addWishlist = async (item) => {
    try {
      const { id, ...dataToSave } = item;
      await addDoc(collection(db, 'pocketflow_wishlists'), {
        ...dataToSave,
        priority: dataToSave.priority || 'Medium',
        status: dataToSave.status || 'Pending'
      });
    } catch (error) {
      console.error("Error adding wishlist: ", error);
      alert("Error saving wishlist: " + error.message);
    }
  };

  const updateWishlist = async (id, data) => {
    try {
      await updateDoc(doc(db, 'pocketflow_wishlists', id), data);
    } catch (error) {
      console.error("Error updating wishlist: ", error);
    }
  };

  const updateWishlistStatus = async (id, status) => {
    await updateWishlist(id, { status });
  };

  const deleteWishlist = async (id) => {
    const isConfirmed = await confirm('Delete Wishlist Item', 'Are you sure you want to delete this wishlist item?');
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, 'pocketflow_wishlists', id));
    } catch (error) {
      console.error("Error deleting wishlist: ", error);
    }
  };

  const addBudget = async (budget) => {
    try {
      const { id, ...dataToSave } = budget;
      await addDoc(collection(db, 'pocketflow_budgets'), dataToSave);
    } catch (error) {
      console.error("Error adding budget: ", error);
      alert("Error saving budget: " + error.message);
    }
  };

  const updateBudget = async (id, data) => {
    try {
      await updateDoc(doc(db, 'pocketflow_budgets', id), data);
    } catch (error) {
      console.error("Error updating budget: ", error);
    }
  };

  const deleteBudget = async (id) => {
    const isConfirmed = await confirm('Delete Budget', 'Are you sure you want to delete this budget?');
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, 'pocketflow_budgets', id));
    } catch (error) {
      console.error("Error deleting budget: ", error);
    }
  };

  const addBill = async (bill) => {
    try {
      const { id, ...dataToSave } = bill;
      await addDoc(collection(db, 'pocketflow_bills'), {
        ...dataToSave,
        recurrence: dataToSave.recurrence || 'Monthly',
        history: dataToSave.history || []
      });
    } catch (error) {
      console.error("Error adding bill: ", error);
      alert("Error saving bill: " + error.message);
    }
  };

  const updateBill = async (id, data) => {
    try {
      await updateDoc(doc(db, 'pocketflow_bills', id), data);
    } catch (error) {
      console.error("Error updating bill: ", error);
    }
  };

  const deleteBill = async (id) => {
    const isConfirmed = await confirm('Delete Bill', 'Are you sure you want to delete this bill?');
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, 'pocketflow_bills', id));
    } catch (error) {
      console.error("Error deleting bill: ", error);
    }
  };

  const toggleBillStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'pocketflow_bills', id), {
        status: currentStatus === 'paid' ? 'unpaid' : 'paid'
      });
    } catch (error) {
      console.error("Error toggling bill status: ", error);
    }
  };

  const addNote = async (note) => {
    try {
      const { id, ...dataToSave } = note;
      await addDoc(collection(db, 'pocketflow_notes'), dataToSave);
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  const updateNote = async (id, data) => {
    try {
      await updateDoc(doc(db, 'pocketflow_notes', id), data);
    } catch (error) {
      console.error("Error updating note: ", error);
    }
  };

  const deleteNote = async (id) => {
    const isConfirmed = await confirm('Delete Note', 'Are you sure you want to delete this note?');
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, 'pocketflow_notes', id));
    } catch (error) {
      console.error("Error deleting note: ", error);
    }
  };

  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      await setDoc(doc(db, 'pocketflow_settings', 'global'), merged, { merge: true });
    } catch (err) {
      console.error("Error saving settings to Firebase:", err);
    }
  };

  const unlockApp = (pin) => {
    if (pin === settings.pinCode) {
      setIsLocked(false);
      hasUnlocked.current = true;
      return true;
    }
    return false;
  };

  // Computed values for dashboard
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const activeTransactions = transactions.filter(t => !t.deletedAt);

  const monthlyTransactions = activeTransactions.filter(t => 
    isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  const totalIncome = activeTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = activeTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  // Format money helper
  const formatMoney = (amount) => {
    if (settings.privacyMode) return '****';
    
    let symbol = '৳';
    if (settings.currency === 'USD') symbol = '$';
    if (settings.currency === 'EUR') symbol = '€';
    if (settings.currency === 'GBP') symbol = '£';
    if (settings.currency === 'INR') symbol = '₹';

    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <FinanceContext.Provider value={{
      theme,
      toggleTheme,
      addTransaction,
      updateTransaction,
      softDeleteTransaction,
      restoreTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      addWishlist,
      updateWishlist,
      updateWishlistStatus,
      deleteWishlist,
      addBudget,
      updateBudget,
      deleteBudget,
      addBill,
      updateBill,
      deleteBill,
      toggleBillStatus,
      addNote,
      updateNote,
      deleteNote,
      updateSettings,
      unlockApp,
      formatMoney,
      transactions,
      goals,
      wishlists,
      budgets,
      bills,
      notes,
      achievements,
      settings,
      isLocked,
      loading,
      stats: {
        totalIncome,
        totalExpense,
        balance,
        monthlyIncome,
        monthlyExpense,
        remainingBudget: monthlyIncome - monthlyExpense,
        netSavings: monthlyIncome - monthlyExpense
      }
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
