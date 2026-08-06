import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Tag } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {Icon && <Icon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />}
      
      <div 
        className={`w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all ${
          isOpen ? 'ring-2 ring-blue-500/50 border-blue-500' : 'hover:border-slate-300 dark:hover:border-slate-700'
        } ${Icon ? 'pl-10' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm ${!value ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
          {value ? (options.length > 0 && typeof options[0] === 'object' ? options.find(o => o.value === value)?.label : value) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm sm:hidden animate-in fade-in"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          />
          
          {/* Dropdown / Bottom Sheet */}
          <div className="
            fixed bottom-0 left-0 w-full rounded-t-2xl z-[101] pb-8 pt-3 px-2 
            sm:absolute sm:bottom-auto sm:left-auto sm:w-full sm:rounded-lg sm:p-0 sm:mt-1 sm:z-50
            bg-white dark:bg-[#111] border-t sm:border border-slate-200 dark:border-slate-800 
            shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-xl overflow-hidden
            animate-in slide-in-from-bottom-full sm:slide-in-from-top-2 duration-200 sm:duration-150
          ">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
            
            <div className="max-h-[60vh] sm:max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => {
                const isObj = typeof option === 'object';
                const optValue = isObj ? option.value : option;
                const optLabel = isObj ? option.label : option;
                
                return (
                  <div
                    key={optValue}
                    className={`px-4 py-3 sm:py-2 text-base sm:text-sm cursor-pointer transition-colors sm:rounded-none rounded-xl mb-1 sm:mb-0 ${
                      value === optValue 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold sm:font-medium' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                  >
                    {optLabel}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomSelect;
