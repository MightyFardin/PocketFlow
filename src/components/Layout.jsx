import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Target, Calendar, FileText, Settings, Menu, X, Palette, CircleDollarSign, Star, Receipt, Clock, Search, Award, Flag, Lock } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import SettingsModal from './SettingsModal';
import HeaderSearch from './HeaderSearch';
import UserMenu from './UserMenu';

const Layout = () => {
  const { theme, settings } = useFinance();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Transactions', icon: Wallet, path: '/transactions' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
    { name: 'Budgets', icon: Target, path: '/budgets' },
    { name: 'Bills', icon: Receipt, path: '/bills' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Timeline', icon: Clock, path: '/timeline' },
    { name: 'Goals', icon: Flag, path: '/goals' },
    { name: 'Wishlist', icon: Star, path: '/wishlist' },
    { name: 'Achievements', icon: Award, path: '/achievements' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-64 flex flex-col h-screen
        bg-white dark:bg-[#111]
        border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center mr-3 shadow-sm">
            <CircleDollarSign className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            PocketFlow
          </h1>
          <button 
            type="button"
            className="ml-auto p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-none">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-3 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }
              `}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button 
            onClick={() => setSettingsOpen(true)}
            className="flex items-center w-full px-3 py-3 mt-1 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
          >
            <Palette className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">UI Settings</span>
          </button>
        </div>
      </aside>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Header (Always visible now) */}
        <header className="group h-16 flex items-center justify-between px-4 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-slate-800 z-30 shrink-0">
          <div className="flex items-center">
            <button 
              className="p-2 mr-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              onClick={(e) => { e.stopPropagation(); setMobileOpen(true); }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center mr-2 shadow-sm">
              <CircleDollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white transition-all duration-300 origin-left whitespace-nowrap overflow-hidden max-w-[150px] opacity-100 group-has-[input:focus]:max-w-0 group-has-[input:focus]:opacity-0">
              PocketFlow
            </h1>
          </div>
          
          <div className="flex-1 flex justify-end items-center ml-4 space-x-4 sm:space-x-5 relative">
            <HeaderSearch />
            
            {settings.pinCode && (
              <button 
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors shrink-0 z-10"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  sessionStorage.removeItem('pf_unlocked');
                  window.location.reload(); 
                }}
                title="Lock Application"
              >
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            <UserMenu onOpenSettings={() => setSettingsOpen(true)} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
