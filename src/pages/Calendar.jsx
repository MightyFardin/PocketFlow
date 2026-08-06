import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Wallet, X, Plus } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import TransactionModal from '../components/TransactionModal';

const CalendarPage = () => {
  const { transactions, bills, goals, formatMoney } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get transactions for the current month
  const monthTransactions = transactions.filter(t => 
    new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
  );

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // padding for the first week
  const startDay = monthStart.getDay(); // 0 is Sunday
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Transaction Calendar</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Track your daily income and expenses.</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-[#111] p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <button onClick={prevMonth} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-w-[100px] sm:min-w-[120px] text-center">
            {format(currentDate, 'MMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="card-minimal overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-500">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-l border-slate-200 dark:border-slate-800">
          {paddingDays.map(day => (
            <div key={`padding-${day}`} className="min-h-[70px] sm:min-h-[100px] p-1 sm:p-2 border-r border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/10"></div>
          ))}
          
          {daysInMonth.map(day => {
            const dayTxs = monthTransactions.filter(t => isSameDay(new Date(t.date), day));
            const dayBills = bills.filter(b => isSameDay(new Date(b.dueDate), day));
            const dayGoals = goals.filter(g => isSameDay(new Date(g.deadline), day));

            return (
              <div 
                key={day.toString()} 
                onClick={() => setSelectedDay(day)}
                className={`min-h-[70px] sm:min-h-[100px] p-1 sm:p-2 border-r border-b border-slate-200 dark:border-slate-800 transition-colors cursor-pointer group ${
                  isToday(day) ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-medium transition-transform group-hover:scale-110 ${
                    isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-0.5 sm:space-y-1">
                  {dayTxs.slice(0, 2).map(t => (
                    <div 
                      key={t.id} 
                      className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded flex items-center gap-0.5 sm:gap-1 truncate ${
                        t.type === 'income' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}
                    >
                      {getCategoryIcon(t.category, "w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0")}
                      <span className="truncate">{formatMoney(t.amount)}</span>
                    </div>
                  ))}
                  {dayBills.slice(0, 1).map(b => (
                    <div key={`bill-${b.id}`} className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 truncate">
                      Bill: {b.name}
                    </div>
                  ))}
                  {dayGoals.slice(0, 1).map(g => (
                    <div key={`goal-${g.id}`} className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 truncate">
                      Goal: {g.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedDay(null)}
          />
          <div className="card-minimal w-full max-w-lg relative z-10 flex flex-col max-h-[80vh] shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </h3>
                {isToday(selectedDay) && (
                  <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Today</span>
                )}
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
              {(() => {
                const dayTxs = transactions.filter(t => isSameDay(new Date(t.date), selectedDay));
                const dayBills = bills.filter(b => isSameDay(new Date(b.dueDate), selectedDay));
                const dayGoals = goals.filter(g => isSameDay(new Date(g.deadline), selectedDay));
                
                if (dayTxs.length === 0 && dayBills.length === 0 && dayGoals.length === 0) {
                  return (
                    <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-slate-500">
                      <Wallet className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-20" />
                      <p className="text-sm sm:text-base">No events on this day.</p>
                    </div>
                  );
                }
                
                return (
                  <>
                    {dayBills.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20">
                        <div>
                          <p className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-100">Bill Due: {b.name}</p>
                          <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">Status: {b.status}</p>
                        </div>
                        <div className="font-bold text-base sm:text-lg text-amber-600 dark:text-amber-400">{formatMoney(b.amount)}</div>
                      </div>
                    ))}
                    {dayGoals.map(g => (
                      <div key={g.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20">
                        <div>
                          <p className="font-bold text-sm sm:text-base text-blue-900 dark:text-blue-100">Goal Deadline: {g.name}</p>
                          <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Target: {formatMoney(g.target)}</p>
                        </div>
                      </div>
                    ))}
                    {dayTxs.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {getCategoryIcon(t.category, "w-5 h-5 sm:w-6 sm:h-6")}
                          </div>
                          <div>
                            <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{t.category}</p>
                            <p className="text-xs sm:text-sm text-slate-500">{t.note}</p>
                          </div>
                        </div>
                        <div className={`font-bold text-base sm:text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200/50 dark:border-slate-800/50">
              <button 
                onClick={() => { setSelectedDay(null); setIsTxModalOpen(true); }}
                className="btn-primary w-full py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Global Transaction Modal triggered from Calendar */}
      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} />

    </div>
  );
};

export default CalendarPage;
