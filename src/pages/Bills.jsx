import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, X, Calendar, DollarSign, Trash2, Repeat, CheckCircle, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { createPortal } from 'react-dom';
import CustomSelect from '../components/CustomSelect';
import ConfirmModal from '../components/ConfirmModal';

const BillModal = ({ isOpen, onClose }) => {
  const { addBill } = useFinance();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [repeat, setRepeat] = useState('Monthly'); // None, Weekly, Monthly, Yearly

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !name) return;

    addBill({
      name,
      amount: Number(amount),
      dueDate: new Date(dueDate).toISOString(),
      repeat,
      status: 'unpaid',
      createdAt: new Date().toISOString()
    });
    
    setName('');
    setAmount('');
    setRepeat('Monthly');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="card-minimal w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Recurring Bill</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 custom-scrollbar">
          <form id="bill-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Bill Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Internet, Netflix, Rent"
                className="input-field p-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Amount</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="input-field pl-10 h-[42px]"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Due Date</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    className="input-field pl-10 h-[42px]"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Repeat Frequency</label>
              <CustomSelect 
                options={[
                  { label: 'Does not repeat', value: 'None' },
                  { label: 'Weekly', value: 'Weekly' },
                  { label: 'Monthly', value: 'Monthly' },
                  { label: 'Yearly', value: 'Yearly' }
                ]}
                value={repeat}
                onChange={(val) => setRepeat(val)}
                icon={Repeat}
              />
            </div>
          </form>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0 bg-slate-50 dark:bg-black/20 rounded-b-xl">
          <button type="submit" form="bill-form" className="w-full btn-primary py-3 text-base">
            Save Bill
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Bills = () => {
  const { bills, deleteBill, toggleBillStatus, addTransaction, formatMoney, transactions } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    bill: null,
    title: '',
    message: '',
    type: 'info',
    hideCancel: false,
    onConfirm: () => {}
  });

  const handleToggleStatus = (bill) => {
    if (bill.status === 'unpaid') {
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = totalIncome - totalExpenses;
      
      if (currentBalance < bill.amount) {
        setConfirmModal({
          isOpen: true,
          title: 'Insufficient Funds',
          message: `You do not have enough balance to pay for "${bill.name}". Your current balance is ${formatMoney(currentBalance)} but this bill requires ${formatMoney(bill.amount)}.`,
          type: 'danger',
          hideCancel: true,
          confirmText: 'Okay',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }

      setConfirmModal({
        isOpen: true,
        title: 'Log Transaction',
        message: `Mark "${bill.name}" as paid and automatically log this expense in your Transactions?`,
        type: 'info',
        hideCancel: false,
        confirmText: 'Yes, log it',
        cancelText: 'No, just mark paid',
        onConfirm: () => {
          toggleBillStatus(bill.id, bill.status);
          addTransaction({
            id: Math.random().toString(36).substr(2, 9),
            type: 'expense',
            amount: bill.amount,
            category: 'Bills',
            date: new Date().toISOString(),
            note: `Auto-logged: ${bill.name}`,
            tags: ['Bill', bill.repeat],
            isRecurring: bill.repeat !== 'None',
            priority: 'High'
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          toggleBillStatus(bill.id, bill.status);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      toggleBillStatus(bill.id, bill.status);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bills & Subscriptions</h2>
          <p className="text-slate-500 dark:text-slate-400">Never miss a payment. Track your recurring expenses.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          <span>Add Bill</span>
        </button>
      </div>

      <BillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        hideCancel={confirmModal.hideCancel}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel || (() => setConfirmModal(prev => ({ ...prev, isOpen: false })))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bills.map(bill => {
          const dDate = new Date(bill.dueDate);
          const pastDue = isPast(dDate) && !isToday(dDate) && bill.status === 'unpaid';

          return (
            <div key={bill.id} className={`card-minimal p-5 relative overflow-hidden group ${
              bill.status === 'paid' ? 'opacity-70' : ''
            }`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${
                bill.status === 'paid' ? 'bg-emerald-500' : (pastDue ? 'bg-rose-500' : 'bg-amber-500')
              }`} />
              
              <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                  <h3 className={`text-lg font-bold ${bill.status === 'paid' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {bill.name}
                  </h3>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">{formatMoney(bill.amount)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleStatus(bill)}
                    className={`p-2 rounded-lg transition-colors ${
                      bill.status === 'paid' 
                        ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' 
                        : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title="Mark as Paid/Unpaid"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteBill(bill.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="pl-2 space-y-3">
                <div className={`flex items-center text-sm font-medium ${
                  pastDue ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  <Clock className="w-4 h-4 mr-2" />
                  Due: {format(dDate, 'MMM dd, yyyy')}
                  {pastDue && <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Overdue</span>}
                </div>
                
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                    <Repeat className="w-3 h-3 mr-1" />
                    {bill.repeat}
                  </span>
                  
                  <span className={`text-xs uppercase font-bold px-2 py-1 rounded-full ${
                    bill.status === 'paid' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {bill.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {bills.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-[#111] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Repeat className="w-12 h-12 mb-3 opacity-20" />
            <p>No bills added. Track your rent, internet, and subscriptions here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;
