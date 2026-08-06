import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Award, Star, Zap, Target, TrendingUp, ShieldCheck } from 'lucide-react';

const Achievements = () => {
  const { achievements, stats } = useFinance();

  // Define all possible achievements
  const allAchievements = [
    {
      id: 'first_tx',
      title: 'First Step',
      description: 'Log your very first transaction.',
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      id: 'saver_1000',
      title: 'Saver 1K',
      description: 'Reach a net savings of 1,000.',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      id: 'budget_master',
      title: 'Budget Master',
      description: 'Stay under budget for the month.',
      icon: ShieldCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'goal_crusher',
      title: 'Goal Crusher',
      description: 'Successfully complete a savings goal.',
      icon: Target,
      color: 'text-rose-500',
      bg: 'bg-rose-100 dark:bg-rose-900/30'
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      description: 'Log a transaction 7 days in a row.',
      icon: Zap,
      color: 'text-indigo-500',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30'
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-amber-500" />
            Achievements
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Unlock badges by reaching financial milestones.</p>
        </div>
        
        <div className="card-minimal px-4 py-2 flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">Total Unlocked</span>
          <span className="text-xl font-black text-amber-500">{achievements.length} / {allAchievements.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {allAchievements.map(badge => {
          // If achievement is unlocked, find it in the context state
          const unlocked = achievements.find(a => a.id === badge.id);
          
          return (
            <div 
              key={badge.id}
              className={`card-minimal p-6 relative overflow-hidden transition-all duration-300 ${unlocked ? 'border-amber-200 dark:border-amber-900/50 shadow-md shadow-amber-500/10' : 'opacity-60 grayscale'}`}
            >
              {unlocked && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full flex items-start justify-end p-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${unlocked ? badge.bg : 'bg-slate-100 dark:bg-slate-800'}`}>
                <badge.icon className={`w-7 h-7 ${unlocked ? badge.color : 'text-slate-400'}`} />
              </div>
              
              <h3 className={`text-lg font-bold ${unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{badge.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{badge.description}</p>
              
              {unlocked ? (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-4">
                  Unlocked on {new Date(unlocked.unlockedAt).toLocaleDateString()}
                </p>
              ) : (
                <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 dark:bg-slate-600 w-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
