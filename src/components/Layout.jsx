import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Target, Calendar, FileText, Settings, Menu, X, Palette, CircleDollarSign, Star, Receipt, Clock, Search, Award, Flag, Lock, Utensils, ChevronDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import SettingsModal from './SettingsModal';
import HeaderSearch from './HeaderSearch';
import UserMenu from './UserMenu';

const Layout = () => {
  const { theme, settings } = useFinance();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    expenses: true,
    insights: false,
    milestones: false
  });

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      name: 'Expenses',
      icon: Wallet,
      key: 'expenses',
      children: [
        { name: 'Transactions', icon: Wallet, path: '/transactions' },
        { name: 'Budgets', icon: Target, path: '/budgets' },
        { name: 'Bills', icon: Receipt, path: '/bills' },
        { name: 'Mess Expenses', icon: Utensils, path: '/mess' },
      ]
    },
    {
      name: 'Insights',
      icon: PieChart,
      key: 'insights',
      children: [
        { name: 'Analytics', icon: PieChart, path: '/analytics' },
        { name: 'Reports', icon: FileText, path: '/reports' },
        { name: 'Calendar', icon: Calendar, path: '/calendar' },
        { name: 'Timeline', icon: Clock, path: '/timeline' },
      ]
    },
    {
      name: 'Milestones',
      icon: Flag,
      key: 'milestones',
      children: [
        { name: 'Goals', icon: Flag, path: '/goals' },
        { name: 'Wishlist', icon: Star, path: '/wishlist' },
        { name: 'Achievements', icon: Award, path: '/achievements' },
      ]
    }
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
            className="ml-auto p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer md:hidden"
            onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
          {navGroups.map((group) => {
            if (!group.children) {
              return (
                <NavLink
                  key={group.name}
                  to={group.path}
                  className={({ isActive }) => `
                    flex items-center px-3 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                  onClick={() => setMobileOpen(false)}
                >
                  <group.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium text-sm">{group.name}</span>
                </NavLink>
              );
            }

            const isOpen = openMenus[group.key];

            return (
              <div key={group.name} className="space-y-1">
                <button
                  onClick={() => toggleMenu(group.key)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                >
                  <div className="flex items-center">
                    <group.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium text-sm">{group.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="pl-11 space-y-1 mt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    {group.children.map(child => (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className={({ isActive }) => `
                          flex items-center px-3 py-2 rounded-xl transition-all duration-200 text-sm
                          ${isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' 
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                          }
                        `}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button 
            onClick={() => setSettingsOpen(true)}
            className="flex items-center w-full px-3 py-3 mt-1 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
          >
            <Palette className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">UI Settings</span>
          </button>
          <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium">
            PocketFlow v1.0.0
          </div>
        </div>
      </aside>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Header (Always visible now) */}
        <header className="group h-16 flex items-center justify-between px-3 sm:px-4 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-slate-800 z-30 shrink-0">
          <div className="flex items-center">
            <button 
              className="p-1.5 sm:p-2 mr-2 sm:mr-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shrink-0"
              onClick={(e) => { e.stopPropagation(); setMobileOpen(true); }}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-600 items-center justify-center mr-1.5 sm:mr-2 shadow-sm shrink-0">
              <CircleDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white transition-all duration-300 origin-left whitespace-nowrap overflow-hidden opacity-100 group-has-[input:focus]:max-w-0 group-has-[input:focus]:opacity-0">
              PocketFlow
            </h1>
          </div>
          
          <div className="flex-1 flex justify-end items-center ml-2 gap-2 sm:gap-5 relative">
            <HeaderSearch />
            
            {settings.pinCode && (
              <button 
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors shrink-0 z-10"
                onClick={(e) => { 
                  e.stopPropagation(); 
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
