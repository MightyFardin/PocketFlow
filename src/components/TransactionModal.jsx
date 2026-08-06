import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { X, Calendar, DollarSign, Tag as TagIcon, FileText, Paperclip, Repeat, AlertCircle } from 'lucide-react';
import { format, isFuture, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import CustomSelect from './CustomSelect';
import AttachmentUploader from './AttachmentUploader';
import ConfirmModal from './ConfirmModal';

const TransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, transactions, budgets, formatMoney } = useFinance();
  
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  
  // New Fields
  const [tags, setTags] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [priority, setPriority] = useState('Medium'); // Low, Medium, High
  const [attachments, setAttachments] = useState([]);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Proceed',
    cancelText: 'Cancel',
    onConfirm: () => {}
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    const numAmount = Number(amount);
    const txDate = new Date(date);

    // 1. Future Income Check
    if (type === 'income' && isFuture(txDate) && format(txDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')) {
       setConfirmModal({
         isOpen: true,
         title: 'Future Income Warning',
         message: 'Logging future income will falsely increase your available balance today. Are you sure you want to proceed?',
         type: 'warning',
         confirmText: 'Yes, log it',
         onConfirm: () => performSave()
       });
       return;
    }

    // 2. Duplicate Check
    const isDuplicate = transactions.find(t => 
      t.type === type && 
      t.amount === numAmount && 
      t.category === category && 
      format(new Date(t.date), 'yyyy-MM-dd') === format(txDate, 'yyyy-MM-dd')
    );
    
    if (isDuplicate) {
       setConfirmModal({
         isOpen: true,
         title: 'Duplicate Transaction',
         message: `It looks like you already logged a ${formatMoney(numAmount)} '${category}' ${type} today. Are you sure you want to log it again?`,
         type: 'warning',
         confirmText: 'Yes, add duplicate',
         onConfirm: () => performSave()
       });
       return;
    }

    // 3. Budget Overdraft Check
    if (type === 'expense' && budgets) {
      // Find matching category budget or overall budget
      const applicableBudget = budgets.find(b => b.category === category) || budgets.find(b => b.category === 'Overall');
      
      if (applicableBudget) {
        const start = applicableBudget.period === 'Monthly' ? startOfMonth(txDate) : startOfYear(txDate);
        const end = applicableBudget.period === 'Monthly' ? endOfMonth(txDate) : endOfYear(txDate);
        
        const spent = transactions
          .filter(t => t.type === 'expense' && (applicableBudget.category === 'Overall' || t.category === applicableBudget.category))
          .filter(t => isWithinInterval(new Date(t.date), { start, end }))
          .reduce((sum, t) => sum + t.amount, 0);

        if (spent + numAmount > applicableBudget.amount) {
           setConfirmModal({
             isOpen: true,
             title: 'Budget Exceeded',
             message: `This transaction will exceed your '${applicableBudget.category === 'Overall' ? 'Overall' : applicableBudget.category}' limit of ${formatMoney(applicableBudget.amount)}. You have already spent ${formatMoney(spent)}. Do you still want to proceed?`,
             type: 'warning',
             confirmText: 'Yes, proceed',
             onConfirm: () => performSave()
           });
           return;
        }
      }
    }

    performSave();
  };

  const performSave = () => {
    // Process tags
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');

    const newTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount: Number(amount),
      category,
      date: new Date(date).toISOString(),
      note,
      tags: tagArray,
      isRecurring,
      attachments
    };

    if (type === 'expense') {
      newTransaction.priority = priority;
    }

    addTransaction(newTransaction);
    
    // Reset form
    setAmount('');
    setNote('');
    setTags('');
    setIsRecurring(false);
    setPriority('Medium');
    setAttachments([]);
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    onClose();
  };

  const categories = type === 'income' 
    ? ['Salary', 'Scholarship', 'Freelancing', 'Business', 'Gift', 'Refund', 'Investment', 'Other']
    : ['Food', 'Transport', 'Education', 'Health', 'Shopping', 'Entertainment', 'Bills', 'Internet', 'Phone', 'Travel', 'Rent', 'Family', 'Emergency', 'Personal', 'Other'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="card-minimal w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Transaction</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-6 custom-scrollbar">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Type Toggle */}
            <div className="flex bg-slate-100 dark:bg-[#111] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  type === 'expense' 
                    ? 'bg-rose-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  type === 'income' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Income
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="input-field pl-10 text-lg font-bold py-3"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                <CustomSelect 
                  options={categories} 
                  value={category} 
                  onChange={(val) => setCategory(val)} 
                  icon={TagIcon} 
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    className="input-field pl-10 h-[42px]"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Note & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Note</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="What was this for?"
                    className="input-field pl-9 h-[42px] text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tags (Comma separated)</label>
                <div className="relative">
                  <TagIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Vacation, Medical"
                    className="input-field pl-9 h-[42px] text-sm"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Expense Specific: Priority */}
            {type === 'expense' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        priority === p 
                          ? (p === 'High' ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400' 
                             : p === 'Medium' ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                             : 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400')
                          : 'bg-transparent border-slate-200 text-slate-500 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring & Attachments */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700" 
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <Repeat className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recurring Entry</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Attachments</label>
              <AttachmentUploader 
                attachments={attachments}
                onUploadComplete={(file) => setAttachments([...attachments, file])}
                onRemoveAttachment={(file) => setAttachments(attachments.filter(a => a.url !== file.url))}
              />
            </div>

          </form>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0 bg-slate-50 dark:bg-black/20 rounded-b-xl">
          <button type="submit" form="transaction-form" className="w-full btn-primary py-3 text-base">
            Save Transaction
          </button>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
    </div>,
    document.body
  );
};

export default TransactionModal;
