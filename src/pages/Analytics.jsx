import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const Analytics = () => {
  const { transactions, theme } = useFinance();

  // Compute trends over the last 6 months
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(d);
    const monthEnd = endOfMonth(d);
    
    const monthTxs = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
    );

    const income = monthTxs.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

    return {
      name: format(d, 'MMM'),
      income,
      expense
    };
  });

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400">Deep dive into your financial patterns.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Income vs Expense Trend (Area Chart) */}
        <div className="card-minimal p-6 xl:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Income vs Expense Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b'}} />
                <YAxis stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b'}} />
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={0.1} fill="#f43f5e" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Comparison (Bar Chart) */}
        <div className="card-minimal p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Monthly Comparison</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} />
                <YAxis stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} />
                <RechartsTooltip contentStyle={tooltipStyle} cursor={{fill: theme === 'dark' ? '#1e293b' : '#f1f5f9'}} />
                <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
