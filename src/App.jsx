import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Lock } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Timeline from './pages/Timeline';
import Wishlist from './pages/Wishlist';
import Goals from './pages/Goals';
import Achievements from './pages/Achievements';
import Bills from './pages/Bills';
import Reports from './pages/Reports';
import Mess from './pages/Mess';
import { MessProvider } from './context/MessContext';
import { ConfirmationProvider } from './context/ConfirmationContext';

const LockScreen = () => {
  const { unlockApp } = useFinance();
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!unlockApp(pin)) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="card-minimal w-full max-w-sm p-8 text-center animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">App Locked</h2>
        <p className="text-slate-500 mb-8">Enter your PIN to access PocketFlow.</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            className={`input-field text-center text-2xl tracking-[0.5em] font-bold py-4 mb-4 ${error ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
          />
          {error && <p className="text-rose-500 text-sm mb-4">Incorrect PIN. Try again.</p>}
          <button type="submit" className="btn-primary w-full py-3 text-lg">
            Unlock App
          </button>
        </form>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isLocked } = useFinance();
  
  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="bills" element={<Bills />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="goals" element={<Goals />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="reports" element={<Reports />} />
          <Route path="mess" element={<Mess />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <ConfirmationProvider>
      <FinanceProvider>
        <MessProvider>
          <AppContent />
        </MessProvider>
      </FinanceProvider>
    </ConfirmationProvider>
  );
}

export default App;
