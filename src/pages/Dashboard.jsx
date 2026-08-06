import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  Target, AlertCircle, ShoppingBag, Coffee, 
  Car, Film, Plus, PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { format } from 'date-fns';
import TransactionModal from '../components/TransactionModal';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

const StatCard = ({ title, amount, icon: Icon, colorClass, iconColorClass, formatMoney }) => (
  <div className="card-minimal p-5 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass}`} />
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(amount)}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${iconColorClass}`} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { stats, transactions, goals, formatMoney, settings } = useFinance();
  const [isModalOpen, ReactSetIsModalOpen] = React.useState(false);
  
  // Calculate expenses by category for pie chart
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's your financial summary.</p>
        </div>
        <button className="btn-primary" onClick={() => ReactSetIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => ReactSetIsModalOpen(false)} />

      {/* Main Stats */}
      {settings.showWidgets?.mainStats !== false && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Balance" 
          amount={stats.balance} 
          icon={Wallet}
          colorClass="bg-blue-500"
          iconColorClass="text-blue-500"
          formatMoney={formatMoney}
        />
        <StatCard 
          title="Monthly Income" 
          amount={stats.monthlyIncome} 
          icon={TrendingUp}
          colorClass="bg-emerald-500"
          iconColorClass="text-emerald-500"
          formatMoney={formatMoney}
        />
        <StatCard 
          title="Monthly Expenses" 
          amount={stats.monthlyExpense} 
          icon={TrendingDown}
          colorClass="bg-rose-500"
          iconColorClass="text-rose-500"
          formatMoney={formatMoney}
        />
        <StatCard 
          title="Net Savings" 
          amount={stats.netSavings} 
          icon={DollarSign}
          colorClass="bg-indigo-500"
          iconColorClass="text-indigo-500"
          formatMoney={formatMoney}
        />
      </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Charts & Lists) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Budget Progress */}
          {settings.showWidgets?.budgetProgress !== false && (
            <div className="card-minimal p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Income Utilization
              </h3>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {formatMoney(stats.remainingBudget)} left
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">Spent: {formatMoney(stats.monthlyExpense)}</span>
                <span className="font-medium text-slate-500">Income: {formatMoney(stats.monthlyIncome)}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    stats.monthlyIncome === 0 ? 'bg-slate-300' :
                    (stats.monthlyExpense / stats.monthlyIncome) > 0.9 ? 'bg-rose-500' : 
                    (stats.monthlyExpense / stats.monthlyIncome) > 0.7 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${stats.monthlyIncome === 0 ? 0 : Math.min(100, (stats.monthlyExpense / stats.monthlyIncome) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          )}

          {/* Recent Transactions */}
          {settings.showWidgets?.recentTx !== false && (
            <div className="card-minimal p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {getCategoryIcon(t.category, "w-5 h-5")}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t.category}</p>
                      <p className="text-xs text-slate-500">{format(new Date(t.date), 'MMM dd, yyyy')} • {t.note}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Coffee className="w-12 h-12 mb-3 opacity-20" />
                  <p>No recent transactions.</p>
                </div>
              )}
            </div>
          </div>
          )}
          
        </div>

        {/* Right Column (Pie Chart & Goals) */}
        <div className="space-y-6">
          
          {/* Expense Breakdown */}
          {settings.showWidgets?.expenseChart !== false && (
            <div className="card-minimal p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Expense Breakdown</h3>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => formatMoney(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#1e293b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p>Add expenses to see breakdown.</p>
                </div>
              )}
            </div>
            {pieData.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map(entry => (
                  <div key={entry.name} className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getCategoryColor(entry.name) }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Savings Goals */}
          {settings.showWidgets?.savingsGoals !== false && (
            <div className="card-minimal p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Savings Goals</h3>
            <div className="space-y-6">
              {goals.length > 0 ? goals.map(goal => {
                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div key={goal.id} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-900 dark:text-white">{goal.name}</span>
                      <span className="text-slate-500">{percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full group-hover:scale-y-110 transition-transform origin-left"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {formatMoney(goal.current)} of {formatMoney(goal.target)} • Ends {format(new Date(goal.deadline), 'MMM yyyy')}
                    </p>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                  <Target className="w-12 h-12 mb-3 opacity-20" />
                  <p>No active goals.</p>
                </div>
              )}
            </div>
          </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
