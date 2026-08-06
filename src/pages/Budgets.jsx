import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { Target, AlertTriangle, ArrowUpRight, DollarSign, Plus, X, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import CustomSelect from '../components/CustomSelect';
import { Tag as TagIcon } from 'lucide-react';

const BudgetModal = ({ isOpen, onClose, existingBudgets }) => {
  const { addBudget, deleteBudget } = useFinance();
  const [category, setCategory] = useState('Overall');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('Monthly'); // Monthly, Yearly

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    // Check if budget exists, if so delete it to replace
    const existing = existingBudgets.find(b => b.category === category && b.period === period);
    if (existing) {
      deleteBudget(existing.id);
    }

    addBudget({
      category,
      amount: Number(amount),
      period
    });
    
    setAmount('');
    setCategory('Overall');
    setPeriod('Monthly');
    onClose();
  };

  const categories = ['Overall', 'Food', 'Transport', 'Education', 'Health', 'Shopping', 'Entertainment', 'Bills', 'Internet', 'Phone', 'Travel', 'Rent', 'Family', 'Emergency', 'Personal', 'Other'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="card-minimal w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Set Budget Limit</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 custom-scrollbar">
          <form id="budget-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</label>
              <CustomSelect 
                options={categories} 
                value={category} 
                onChange={(val) => setCategory(val)} 
                icon={TagIcon} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Limit Amount</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="input-field pl-10 h-[42px] font-bold"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Period</label>
                <CustomSelect 
                  options={['Monthly', 'Yearly']}
                  value={period}
                  onChange={(val) => setPeriod(val)}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0 bg-slate-50 dark:bg-black/20 rounded-b-xl">
          <button type="submit" form="budget-form" className="w-full btn-primary py-3 text-base">
            Save Budget
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Budgets = () => {
  const { transactions, stats, budgets, deleteBudget, formatMoney } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewPeriod, setViewPeriod] = useState('Monthly'); // Monthly, Yearly
  
  const budgetStats = useMemo(() => {
    const now = new Date();
    const periodStart = viewPeriod === 'Monthly' ? startOfMonth(now) : startOfYear(now);
    const periodEnd = viewPeriod === 'Monthly' ? endOfMonth(now) : endOfYear(now);
    
    // Filter expenses in this period
    const periodExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      isWithinInterval(new Date(t.date), { start: periodStart, end: periodEnd })
    );

    // Calculate spent per category
    const spendingByCategory = {};
    let totalSpent = 0;
    periodExpenses.forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
      totalSpent += t.amount;
    });

    // Filter budgets for this period
    const activeBudgets = budgets.filter(b => b.period === viewPeriod);
    
    // Map existing budgets
    const mergedStats = activeBudgets.map(b => {
      const spent = b.category === 'Overall' ? totalSpent : (spendingByCategory[b.category] || 0);
      return {
        ...b,
        spent,
        remaining: b.amount - spent,
        percentage: (spent / b.amount) * 100,
        isOverall: b.category === 'Overall'
      };
    });

    // Sort: Overall first, then highest percentage
    return mergedStats.sort((a, b) => {
      if (a.isOverall) return -1;
      if (b.isOverall) return 1;
      return b.percentage - a.percentage;
    });
  }, [transactions, budgets, viewPeriod]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Budgets</h2>
          <p className="text-slate-500 dark:text-slate-400">Set limits and track your spending goals.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 dark:bg-[#111] p-1 rounded-lg">
            {['Monthly', 'Yearly'].map(tab => (
              <button
                key={tab}
                onClick={() => setViewPeriod(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewPeriod === tab 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Set Budget</span>
          </button>
        </div>
      </div>

      <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} existingBudgets={budgets} />

      {/* Main Stats Card if Overall Budget Exists */}
      {(() => {
        const overall = budgetStats.find(b => b.isOverall);
        if (!overall) return (
          <div className="card-minimal p-8 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500/20 relative overflow-hidden flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Overall Budget Set</h3>
              <p className="text-slate-500">Set an overall {viewPeriod.toLowerCase()} budget to track your total spending limits.</p>
            </div>
            <button className="btn-secondary text-indigo-600 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400" onClick={() => setIsModalOpen(true)}>
              Set Overall Limit
            </button>
          </div>
        );

        return (
          <div className="card-minimal p-8 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Target className="w-48 h-48 text-indigo-500" />
            </div>
            
            <button 
              onClick={() => deleteBudget(overall.id)}
              className="absolute top-4 right-4 p-2 text-rose-400 hover:text-rose-600 bg-white/50 dark:bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete Overall Budget"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-2 flex items-center">
                  <DollarSign className="w-5 h-5 mr-1" /> Overall {viewPeriod} Limit
                </p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {formatMoney(overall.amount)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  You have spent <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatMoney(overall.spent)}</span> so far.
                </p>
              </div>
              
              <div className="w-full md:w-64 text-right">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Utilization</span>
                  <span className={overall.percentage > 90 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}>
                    {overall.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      overall.percentage > 100 ? 'bg-rose-600' :
                      overall.percentage > 90 ? 'bg-rose-500' : 
                      overall.percentage > 75 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, overall.percentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Category Budgets */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">Category Limits</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgetStats.filter(b => !b.isOverall).length > 0 ? budgetStats.filter(b => !b.isOverall).map((stat) => (
          <div key={stat.id} className="card-minimal p-6 flex flex-col group relative">
            
            <button 
              onClick={() => deleteBudget(stat.id)}
              className="absolute top-4 right-4 p-2 text-rose-400 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete Category Budget"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4 pr-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  {getCategoryIcon(stat.category, "w-6 h-6")}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{stat.category}</h4>
                  <p className="text-sm text-slate-500">
                    {formatMoney(stat.spent)} / {formatMoney(stat.amount)}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className={`font-bold text-lg ${stat.remaining < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  {stat.remaining < 0 ? 'Overspent' : `${formatMoney(stat.remaining)} left`}
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                <span>{stat.percentage.toFixed(0)}% Used</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    stat.percentage > 100 ? 'bg-rose-600' :
                    stat.percentage > 90 ? 'bg-rose-500' :
                    stat.percentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, stat.percentage)}%` }}
                />
              </div>
              
              {stat.percentage > 100 ? (
                <div className="flex items-center text-xs font-medium text-rose-600 dark:text-rose-400 mt-3 bg-rose-50 dark:bg-rose-900/30 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/50">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                  You have exceeded your limit by {formatMoney(Math.abs(stat.remaining))}.
                </div>
              ) : stat.percentage > 80 ? (
                <div className="flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/30 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                  You are nearing your budget limit for {stat.category.toLowerCase()}.
                </div>
              ) : null}
            </div>
          </div>
        )) : (
          <div className="col-span-1 lg:col-span-2 card-minimal p-12 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 bg-transparent shadow-none">
            <Target className="w-12 h-12 mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No category limits set</h3>
            <p>Click "Set Budget" to create specific limits for your categories.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Budgets;
