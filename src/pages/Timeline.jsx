import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { format } from 'date-fns';
import { Target, Clock } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';

const Timeline = () => {
  const { transactions, goals, formatMoney } = useFinance();

  // Combine and sort events
  const events = [
    ...transactions.map(t => ({
      id: t.id,
      type: t.type,
      date: new Date(t.date),
      title: t.note || t.category,
      amount: t.amount,
      category: t.category
    })),
    ...goals.map(g => ({
      id: g.id,
      type: 'goal',
      date: new Date(g.deadline),
      title: `Goal Deadline: ${g.name}`,
      amount: g.target,
      category: 'Target'
    }))
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Timeline</h2>
        <p className="text-slate-500 dark:text-slate-400">Your financial history and upcoming milestones.</p>
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 py-4">
        {events.length > 0 ? events.map((event, index) => (
          <div key={`${event.id}-${index}`} className="relative pl-8">
            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center
              ${event.type === 'income' ? 'bg-emerald-500' : event.type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`}
            ></div>
            
            <div className="card-minimal p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${event.type === 'goal' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {event.type === 'goal' ? <Target className="w-5 h-5" /> : getCategoryIcon(event.category, "w-5 h-5")}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(event.date, 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${event.type === 'income' ? 'text-emerald-500' : event.type === 'expense' ? 'text-rose-500' : 'text-blue-500'}`}>
                  {event.type === 'income' ? '+' : event.type === 'expense' ? '-' : ''}{formatMoney(event.amount)}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-slate-500 pl-8">No events found in timeline.</p>
        )}
      </div>
    </div>
  );
};

export default Timeline;
