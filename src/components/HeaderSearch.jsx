import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Search, FileText, Wallet, Calendar, X } from 'lucide-react';

const HeaderSearch = () => {
  const { transactions, notes, goals, formatMoney } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      ref={searchRef}
      className="relative z-50 h-10 w-10 sm:w-64 flex items-center shrink-0"
    >
      <div 
        className={`absolute right-0 top-0 h-full flex items-center cursor-text group transition-all duration-300 ease-out origin-right ${isOpen ? 'w-[calc(100vw-140px)] sm:w-80' : 'w-full'}`}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 10);
          }
        }}
      >
        <div className={`absolute inset-0 rounded-xl transition-colors pointer-events-none ${isOpen ? 'bg-white dark:bg-slate-900 shadow-md ring-1 ring-slate-200 dark:ring-slate-800' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`} />
        
        <Search className={`w-5 h-5 absolute left-2.5 z-10 pointer-events-none transition-colors ${isOpen ? 'text-blue-500' : 'text-slate-500'}`} />
        
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search notes, transactions..." 
          className={`w-full h-full bg-transparent pl-10 pr-10 text-sm outline-none transition-colors relative z-10 ${isOpen ? 'text-slate-900 dark:text-white placeholder-slate-400' : 'text-slate-900 dark:text-white placeholder-transparent sm:placeholder-slate-500 cursor-text'}`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        {!isOpen && <span className="absolute right-2 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded opacity-0 sm:opacity-100 transition-opacity pointer-events-none z-10">⌘K</span>}
        
        {isOpen && query && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }} 
            className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && query.trim() !== '' && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[calc(100vw-32px)] sm:w-[400px] bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[60vh] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
          <div className="overflow-y-auto p-2 flex-1 custom-scrollbar">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result, idx) => (
                  <div key={idx} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {result.type === 'transaction' && <Wallet className="w-4 h-4 text-blue-500" />}
                        {result.type === 'note' && <FileText className="w-4 h-4 text-emerald-500" />}
                        {result.type === 'goal' && <Calendar className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {result.type === 'transaction' ? result.data.category : result.type === 'note' ? result.data.title : result.data.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {result.type === 'transaction' ? result.data.note : result.type === 'note' ? result.data.content : `Goal Target: ${formatMoney(result.data.target)}`}
                        </p>
                      </div>
                    </div>
                    {result.type === 'transaction' && (
                      <div className={`font-semibold text-sm whitespace-nowrap ml-2 ${result.data.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {result.data.type === 'income' ? '+' : '-'}{formatMoney(result.data.amount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-6 text-sm">
                <p>No results found for "{query}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
