import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import CustomSelect from './CustomSelect';
import { X, Palette, Moon, Sun, Lock, Eye, EyeOff, Globe, User, LayoutDashboard, DollarSign, Tags, Bell, Database, Calendar as CalendarIcon, Settings, Target, Download, Upload } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, settings, updateSettings, transactions, goals, wishlists, budgets, bills, notes } = useFinance();
  const [activeTab, setActiveTab] = useState('Profile');
  const [pinInput, setPinInput] = useState('');

  if (!isOpen) return null;

  const tabs = [
    { id: 'Profile', icon: User },
    { id: 'Appearance', icon: Palette },
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Finance', icon: DollarSign },
    { id: 'Notifications', icon: Bell },
    { id: 'Security', icon: Lock },
    { id: 'Backup', icon: Database },
    { id: 'Advanced', icon: Settings }
  ];

  const handleSavePin = () => {
    if (pinInput.length === 0) {
      updateSettings({ pinCode: null });
      setPinInput('');
    } else if (pinInput.length >= 4) {
      updateSettings({ pinCode: pinInput });
      setPinInput('');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg dark:text-white">Profile Settings</h4>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" className="input-field w-full" value={settings.profileName || ''} onChange={(e) => updateSettings({ profileName: e.target.value })} placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="input-field w-full" value={settings.profileEmail || ''} onChange={(e) => updateSettings({ profileEmail: e.target.value })} placeholder="Your Email" />
            </div>
          </div>
        );
      case 'Appearance':
        return (
          <div className="space-y-6">
            <h4 className="font-semibold text-lg dark:text-white">Appearance</h4>
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="flex gap-2">
                <button onClick={() => theme === 'dark' && toggleTheme()} className={`flex-1 p-3 border rounded-xl flex items-center justify-center gap-2 ${theme === 'light' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 dark:border-slate-700'}`}><Sun className="w-5 h-5"/> Light</button>
                <button onClick={() => theme === 'light' && toggleTheme()} className={`flex-1 p-3 border rounded-xl flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}><Moon className="w-5 h-5"/> Dark</button>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded" checked={settings.compactMode || false} onChange={e => updateSettings({compactMode: e.target.checked})} />
                <span>Compact UI Mode</span>
              </label>
            </div>
          </div>
        );
      case 'Dashboard':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg dark:text-white">Dashboard Widgets</h4>
            {[
              { id: 'mainStats', label: 'Main Statistics (Income/Expenses)' },
              { id: 'budgetProgress', label: 'Budget Progress' },
              { id: 'recentTx', label: 'Recent Transactions' },
              { id: 'expenseChart', label: 'Expense Breakdown Chart' },
              { id: 'savingsGoals', label: 'Savings Goals' }
            ].map(widget => (
              <label key={widget.id} className="flex justify-between items-center p-3 border dark:border-slate-700 rounded-lg">
                <span>{widget.label}</span>
                <input type="checkbox" className="w-5 h-5" checked={settings.showWidgets?.[widget.id] ?? true} onChange={e => updateSettings({showWidgets: {...(settings.showWidgets || {}), [widget.id]: e.target.checked}})} />
              </label>
            ))}
          </div>
        );
      case 'Finance':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg dark:text-white">Financial Preferences</h4>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <CustomSelect 
                options={[
                  { label: 'BDT (৳)', value: 'BDT' },
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR' },
                  { label: 'GBP (£)', value: 'GBP' },
                  { label: 'INR (₹)', value: 'INR' }
                ]}
                value={settings.currency || 'BDT'}
                onChange={(val) => updateSettings({ currency: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number Format</label>
              <CustomSelect 
                options={[
                  { label: '1,234,567.89', value: 'en-US' },
                  { label: '1.234.567,89', value: 'de-DE' },
                  { label: '12,34,567.89', value: 'en-IN' }
                ]}
                value={settings.numberFormat || 'en-US'}
                onChange={(val) => updateSettings({ numberFormat: val })}
              />
            </div>
          </div>
        );
      case 'Security':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg dark:text-white">Security & Privacy</h4>
            <label className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg">
              <input type="checkbox" className="w-5 h-5" checked={settings.privacyMode || false} onChange={e => updateSettings({privacyMode: e.target.checked})} />
              <span>Privacy Mode (Hide Amounts)</span>
            </label>
            <div className="p-4 border dark:border-slate-700 rounded-lg space-y-3">
              <p className="font-medium text-sm">App Lock (PIN)</p>
              <div className="flex gap-2">
                <input type="password" inputMode="numeric" pattern="[0-9]*" placeholder={settings.pinCode ? "Enter new PIN to change" : "Enter 4-digit PIN"} maxLength={4} className="input-field flex-1" value={pinInput} onChange={e => setPinInput(e.target.value)} />
                <button onClick={handleSavePin} className="btn-primary">Save</button>
              </div>
              {settings.pinCode && (
                <div className="flex items-center justify-between mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✅ PIN is active</p>
                  <button 
                    onClick={() => {
                      updateSettings({ pinCode: null });
                      setPinInput('');
                    }} 
                    className="text-xs font-medium px-3 py-1.5 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                  >
                    Remove PIN
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'Backup':
        const handleExport = () => {
          const data = { transactions, goals, wishlists, budgets, bills, notes, settings };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pocketflow_backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        };
        const handleImport = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const data = JSON.parse(event.target.result);
              alert(`Backup parsed successfully! Found ${data.transactions?.length || 0} transactions. Full restore functionality will be completed shortly.`);
            } catch (err) {
              alert('Invalid backup file.');
            }
          };
          reader.readAsText(file);
        };
        return (
          <div className="space-y-6">
            <h4 className="font-semibold text-lg dark:text-white">Data Backup & Restore</h4>
            <div className="card-minimal p-6 flex flex-col items-center justify-center text-center">
              <Database className="w-12 h-12 text-blue-500 mb-4" />
              <p className="text-slate-500 mb-6">Securely download all your financial data, including transactions, goals, and bills.</p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button onClick={handleExport} className="btn-primary flex-1 py-3 flex justify-center items-center gap-2">
                  <Download className="w-5 h-5" /> Export Data
                </button>
                <label className="btn-primary flex-1 py-3 flex justify-center items-center gap-2 bg-slate-600 hover:bg-slate-700 cursor-pointer">
                  <Upload className="w-5 h-5" /> Import Data
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
              </div>
            </div>
          </div>
        );
      case 'Advanced':
        return (
          <div className="space-y-4">
             <h4 className="font-semibold text-lg text-rose-500">Danger Zone</h4>
             <button className="w-full py-3 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-lg font-medium" onClick={() => alert('Reset feature to be implemented')}>Factory Reset App</button>
          </div>
        );
      default:
        return <p className="text-slate-500 text-center py-10">Tab content under construction</p>;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="card-minimal w-full max-w-4xl max-h-[90vh] relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex overflow-hidden flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 justify-between items-center hidden md:flex">
            <h3 className="font-bold text-lg dark:text-white">Settings</h3>
          </div>
          <div className="flex flex-wrap md:flex-col p-3 md:p-4 gap-2 md:gap-1 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
              >
                <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                {tab.id}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center md:justify-end shrink-0">
            <h3 className="font-bold text-lg dark:text-white md:hidden">{activeTab} Settings</h3>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 sm:p-6 text-slate-900 dark:text-slate-300">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
