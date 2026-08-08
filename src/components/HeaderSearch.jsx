import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { Search, FileText, Wallet, Calendar, X, ArrowRight, Flag } from 'lucide-react';

const CommandPalette = ({ onClose }) => {
  const { transactions, notes, goals, formatMoney } = useFinance();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // slight delay to ensure portal is rendered
    setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getResults = () => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const results = [];

    transactions.forEach(t => {
      if (
        t.category.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        t.amount.toString().includes(q) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      ) {
        results.push({ type: 'transaction', data: t });
      }
    });

    notes.forEach(n => {
      if (n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)) {
        results.push({ type: 'note', data: n });
      }
    });

    goals.forEach(g => {
      if (g.name.toLowerCase().includes(q)) {
        results.push({ type: 'goal', data: g });
      }
    });

    return results;
  };

  const results = getResults();

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[99999] flex justify-center items-start pt-[10vh] sm:pt-[15vh] px-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-6 h-6 text-slate-400 mr-3 shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search transactions, notes, goals..." 
            className="flex-1 bg-transparent border-none p-0 text-lg text-slate-900 dark:text-white outline-none placeholder-slate-400 font-medium focus:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose} 
            className="p-1 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0 flex items-center"
          >
             <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a1a1a]">ESC</span>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
           {!query ? (
             <div className="py-12 text-center text-slate-400 flex flex-col items-center">
               <Search className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-medium">Start typing to search across your finances...</p>
             </div>
           ) : results.length > 0 ? (
             <div className="space-y-1">
               {results.map((result, idx) => (
                  <div key={idx} className="p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 group cursor-pointer flex justify-between items-center transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-[#1a1a1a] group-hover:shadow-sm transition-all shrink-0">
                        {result.type === 'transaction' && <Wallet className="w-5 h-5 text-blue-500" />}
                        {result.type === 'note' && <FileText className="w-5 h-5 text-emerald-500" />}
                        {result.type === 'goal' && <Flag className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {result.type === 'transaction' ? result.data.category : result.type === 'note' ? result.data.title : result.data.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {result.type === 'transaction' ? (result.data.note || 'No note') : result.type === 'note' ? result.data.content : `Target: ${formatMoney(result.data.target)}`}
                        </p>
                      </div>
                    </div>
                    {result.type === 'transaction' ? (
                      <div className={`font-bold whitespace-nowrap ml-4 shrink-0 ${result.data.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {result.data.type === 'income' ? '+' : '-'}{formatMoney(result.data.amount)}
                      </div>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 shrink-0" />
                    )}
                  </div>
               ))}
             </div>
           ) : (
             <div className="py-12 text-center text-slate-500">
               <p className="text-sm">No results found for "<span className="font-medium text-slate-900 dark:text-white">{query}</span>"</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const HeaderSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex justify-center sm:justify-between items-center h-10 w-10 sm:px-3 sm:w-56 bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:hover:bg-slate-800 transition-colors rounded-xl text-slate-500 dark:text-slate-400 group relative border border-transparent dark:border-slate-800 shrink-0"
      >
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline-block text-sm font-medium">Search...</span>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">⌘K</span>
      </button>

      {isOpen && createPortal(
        <CommandPalette onClose={() => setIsOpen(false)} />, 
        document.body
      )}
    </>
  );
};

export default HeaderSearch;
