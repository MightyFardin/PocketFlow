import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Settings, Lock } from 'lucide-react';

const UserMenu = ({ onOpenSettings }) => {
  const { settings } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const userName = settings.profileName || 'User';
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLock = () => {
    if (settings.pinCode) {
      sessionStorage.removeItem('pf_unlocked');
      window.location.reload();
    } else {
      alert("Please set up a PIN in Settings > Security first!");
    }
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#111] z-50"
      >
        {initial}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-black/40 sm:hidden animate-in fade-in"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          />
          
          <div className="
            fixed bottom-0 left-0 w-full rounded-t-3xl z-[101] pb-8 pt-2 px-2 
            sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-64 sm:rounded-2xl sm:p-0 
            bg-white dark:bg-[#111] border-t sm:border border-slate-200 dark:border-slate-800 
            shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl overflow-hidden
            animate-in slide-in-from-bottom-full sm:slide-in-from-top-2 duration-200 sm:duration-150 origin-top-right
          ">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
            
            <div className="p-5 sm:p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate text-base sm:text-sm">{userName}</p>
                <p className="text-sm sm:text-xs text-slate-500 truncate">{settings.profileEmail || 'Setup email in Settings'}</p>
              </div>
            </div>
            
            <div className="p-3 sm:p-2 space-y-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenSettings(); }} 
                className="w-full flex items-center gap-4 sm:gap-3 px-4 sm:px-3 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="p-2 sm:p-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 shrink-0">
                  <Settings className="w-5 h-5 sm:w-4 sm:h-4" />
                </div>
                App Settings
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); handleLock(); }} 
                className="w-full flex items-center gap-4 sm:gap-3 px-4 sm:px-3 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="p-2 sm:p-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 shrink-0">
                  <Lock className="w-5 h-5 sm:w-4 sm:h-4" />
                </div>
                Lock Application
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
