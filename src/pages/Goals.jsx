import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, X, Target, Calendar, DollarSign, Trash2, ArrowUpCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import ConfirmModal from '../components/ConfirmModal';

const GoalModal = ({ isOpen, onClose }) => {
  const { addGoal } = useFinance();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState(format(new Date(), 'yyyy-MM-dd'));

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetAmount || isNaN(Number(targetAmount)) || !name) return;

    addGoal({
      name,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      deadline: new Date(deadline).toISOString(),
      createdAt: new Date().toISOString()
    });
    
    setName('');
    setTargetAmount('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="card-minimal w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Savings Goal</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 custom-scrollbar">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Goal Name</label>
              <div className="relative">
                <Target className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, New Car"
                  className="input-field pl-10 h-[42px]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Target Amount</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="input-field pl-10 h-[42px]"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Target Date</label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  className="input-field pl-10 h-[42px]"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0 bg-slate-50 dark:bg-black/20 rounded-b-xl">
          <button type="submit" form="goal-form" className="w-full btn-primary py-3 text-base">
            Save Goal
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AddMoneyModal = ({ isOpen, onClose, goal, currentBalance }) => {
  const { updateGoal, formatMoney, addTransaction } = useFinance();
  const [amount, setAmount] = useState('');
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });

  if (!isOpen || !goal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount)) return;

    // Ghost Money Prevention Logic
    if (numAmount > currentBalance) {
      setConfirmModal({
        isOpen: true,
        title: 'Insufficient Funds',
        message: `You cannot add ${formatMoney(numAmount)} to this goal because your current balance is only ${formatMoney(currentBalance)}.`,
        type: 'danger',
        onConfirm: () => setConfirmModal(prev => ({...prev, isOpen: false}))
      });
      return;
    }

    // Update Goal
    const newAmount = (goal.currentAmount || 0) + numAmount;
    updateGoal(goal.id, {
      currentAmount: newAmount,
      status: newAmount >= goal.targetAmount ? 'Completed' : 'Active'
    });
    
    // Log expense to reflect the money leaving available balance
    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      type: 'expense',
      amount: numAmount,
      category: 'Other',
      date: new Date().toISOString(),
      note: `Contributed to goal: ${goal.name}`,
      tags: ['Goal'],
      isRecurring: false,
      priority: 'Medium'
    });

    setAmount('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="card-minimal w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-200/50 dark:border-slate-800/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fund Goal</h3>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 custom-scrollbar text-center">
          <p className="text-sm text-slate-500 mb-4">Adding funds to <strong>{goal.name}</strong></p>
          <form id="fund-form" onSubmit={handleSubmit}>
            <div className="relative inline-block mx-auto mb-2">
              <DollarSign className="w-6 h-6 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="input-field pl-10 text-2xl font-bold py-4 text-center w-full max-w-[200px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-400">Available Balance: {formatMoney(currentBalance)}</p>
          </form>
        </div>

        <div className="p-5 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-black/20 rounded-b-xl">
          <button type="submit" form="fund-form" className="w-full btn-primary py-3">
            Add Funds
          </button>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        hideCancel={true}
        confirmText="Okay"
        onConfirm={confirmModal.onConfirm}
      />
    </div>,
    document.body
  );
};

const Goals = () => {
  const { goals, deleteGoal, stats, formatMoney } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [fundModal, setFundModal] = useState({ isOpen: false, goal: null });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h2>
          <p className="text-slate-500 dark:text-slate-400">Track and fund your long-term financial goals.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          <span>Create Goal</span>
        </button>
      </div>

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AddMoneyModal 
        isOpen={fundModal.isOpen} 
        goal={fundModal.goal} 
        onClose={() => setFundModal({ isOpen: false, goal: null })} 
        currentBalance={stats.balance} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const percentage = Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100);
          const isCompleted = goal.status === 'Completed' || percentage >= 100;
          
          return (
            <div key={goal.id} className="card-minimal p-5 relative overflow-hidden group flex flex-col">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <div className="pr-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                  </p>
                </div>
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-2 absolute right-3 top-3 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="pl-2 mt-4 flex-1 flex flex-col justify-end">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                    {formatMoney(goal.currentAmount || 0)}
                  </span>
                  <span className="text-slate-500">
                    of {formatMoney(goal.targetAmount)}
                  </span>
                </div>
                
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                    isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {isCompleted ? 'Completed' : `${percentage.toFixed(1)}% Funded`}
                  </span>
                  
                  {!isCompleted && (
                    <button 
                      onClick={() => setFundModal({ isOpen: true, goal })}
                      className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-1.5" />
                      Add Funds
                    </button>
                  )}
                  {isCompleted && (
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Goal Reached
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-[#111] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Target className="w-12 h-12 mb-3 opacity-20" />
            <p>You have no active savings goals. Set a target and start saving!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
