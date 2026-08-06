import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, MoreVertical, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import TransactionModal from '../components/TransactionModal';
import CustomSelect from '../components/CustomSelect';
import { getCategoryIcon } from '../utils/categoryIcons';

const Transactions = () => {
  const { transactions, deleteTransaction, formatMoney } = useFinance();
  const [activeTab, setActiveTab] = useState('all'); // all, income, expense
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all'); // all, this_month, last_month, this_year
  const filterRef = useRef(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueCategories = ['all', ...new Set(transactions.map(t => t.category))];

  const filteredTransactions = transactions.filter(t => {
    if (activeTab !== 'all' && t.type !== activeTab) return false;
    
    if (searchQuery && !t.note.toLowerCase().includes(searchQuery.toLowerCase()) && !t.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    
    if (filterDate !== 'all') {
      const txDate = new Date(t.date);
      const now = new Date();
      if (filterDate === 'this_month') {
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
      } else if (filterDate === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (txDate.getMonth() !== lastMonth.getMonth() || txDate.getFullYear() !== lastMonth.getFullYear()) return false;
      } else if (filterDate === 'this_year') {
        if (txDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your income and expenses.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative" ref={filterRef}>
            <button 
              className={`btn-secondary ${isFilterOpen || filterCategory !== 'all' || filterDate !== 'all' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            
            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left sm:origin-top-right">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Time Period</label>
                    <CustomSelect
                      options={[
                        { label: 'All Time', value: 'all' },
                        { label: 'This Month', value: 'this_month' },
                        { label: 'Last Month', value: 'last_month' },
                        { label: 'This Year', value: 'this_year' }
                      ]}
                      value={filterDate}
                      onChange={(val) => setFilterDate(val)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <CustomSelect
                      options={uniqueCategories.map(cat => ({
                        label: cat === 'all' ? 'All Categories' : cat,
                        value: cat
                      }))}
                      value={filterCategory}
                      onChange={(val) => setFilterCategory(val)}
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => {
                        setFilterDate('all');
                        setFilterCategory('all');
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-sm font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Stats/Summary for Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-minimal p-5 flex items-center justify-between bg-emerald-500/10 border-emerald-500/20">
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Total Income</p>
            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatMoney(transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0))}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <ArrowDownRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        
        <div className="card-minimal p-5 flex items-center justify-between bg-rose-500/10 border-rose-500/20">
          <div>
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {formatMoney(transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0))}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/20">
            <ArrowUpRight className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="card-minimal p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 dark:bg-[#111] p-1 rounded-lg w-full sm:w-auto">
          {['all', 'income', 'expense'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:px-6 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="card-minimal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(t.date), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {getCategoryIcon(t.category, "w-3 h-3 mr-1.5 text-slate-500")}
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900 dark:text-white">{t.note}</span>
                    {t.type === 'expense' && t.priority !== undefined && (
                      <span className={`ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        t.priority === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' 
                        : t.priority === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {t.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-semibold flex items-center justify-end ${
                      t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
