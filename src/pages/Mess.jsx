import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useMess } from '../context/MessContext';
import { useFinance } from '../context/FinanceContext';
import { 
  Utensils, Droplets, Home, Zap, Wifi, ShoppingCart, Info, 
  Settings, ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2, GripVertical, Check
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, addMonths, parse } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MESS_ICONS = {
  Utensils, Droplets, Home, Zap, Wifi, ShoppingCart, Info
};
const MESS_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-purple-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'
];

const StatCard = ({ title, amount, subtitle, icon: Icon, colorClass, formatMoney }) => (
  <div className="card-minimal p-5 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass}`} />
    
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney ? formatMoney(amount) : amount}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        {Icon && <Icon className={`w-6 h-6 text-${colorClass.split('-')[1]}-500`} />}
      </div>
    </div>
    {subtitle && <p className="text-xs text-slate-500 relative z-10">{subtitle}</p>}
  </div>
);

const CustomSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];
  
  return (
    <div className="relative">
      <div 
        className="input-field flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-slate-700 dark:text-slate-300">{selected.label}</span>
        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", open ? "rotate-90" : "")} />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {options.map(o => (
            <div 
              key={o.value} 
              className={cn("px-4 py-3 cursor-pointer transition-colors text-sm", value === o.value ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose }) => {
  const { variables, addVariable, updateVariable, deleteVariable, reorderVariables } = useMess();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: 'Utensils', color: 'bg-blue-500', type: 'food' });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateVariable(editingId, form);
      setEditingId(null);
    } else {
      addVariable({ ...form, order: variables.length });
    }
    setForm({ name: '', icon: 'Utensils', color: 'bg-blue-500', type: 'food' });
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    setForm({ name: v.name, icon: v.icon, color: v.color, type: v.type });
  };

  const IconComponent = MESS_ICONS[form.icon];

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mess Expenses Settings</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="card-minimal p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">{editingId ? 'Edit Variable' : 'Add New Variable'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Rice, WiFi..." />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
                <CustomSelect 
                  value={form.type} 
                  onChange={val => setForm({...form, type: val})}
                  options={[
                    { value: 'food', label: 'Food' },
                    { value: 'non-food', label: 'Non-Food' }
                  ]}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-500 mb-2 block">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(MESS_ICONS).map(ik => {
                  const Ik = MESS_ICONS[ik];
                  return (
                    <button key={ik} onClick={() => setForm({...form, icon: ik})} className={cn("p-2 rounded-xl transition-colors", form.icon === ik ? "bg-slate-200 dark:bg-slate-700" : "hover:bg-slate-100 dark:hover:bg-slate-800")}>
                      <Ik className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-500 mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {MESS_COLORS.map(c => (
                  <button key={c} onClick={() => setForm({...form, color: c})} className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-transform", c, form.color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-110")}>
                    {form.color === c && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', icon: 'Utensils', color: 'bg-blue-500', type: 'food' }); }} className="btn-secondary">Cancel</button>}
              <button onClick={handleSave} className="btn-primary">{editingId ? 'Save Changes' : 'Add Variable'}</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Existing Variables</h3>
            <div className="space-y-2">
              {variables.map(v => {
                const Icon = MESS_ICONS[v.icon] || Info;
                return (
                  <div key={v.id} className="flex items-center justify-between p-3 card-minimal border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", v.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{v.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{v.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateVariable(v.id, { isArchived: !v.isArchived })} className={cn("text-xs px-2 py-1 rounded-md", v.isArchived ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                        {v.isArchived ? 'Archived' : 'Active'}
                      </button>
                      <button onClick={() => handleEdit(v)} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteVariable(v.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const Mess = () => {
  const { variables, entries, saveEntry, getMonthlyStats } = useMess();
  const { formatMoney } = useFinance();
  
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const monthString = format(currentMonthDate, 'yyyy-MM');
  const prevMonthString = format(subMonths(currentMonthDate, 1), 'yyyy-MM');
  
  const currentStats = getMonthlyStats(monthString);
  const prevStats = getMonthlyStats(prevMonthString);

  // Prepare chart data for last 6 months
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(currentMonthDate, 5 - i);
      const mStr = format(d, 'yyyy-MM');
      const s = getMonthlyStats(mStr);
      return {
        name: format(d, 'MMM'),
        Food: s.foodTotal,
        'Non-Food': s.nonFoodTotal,
        Total: s.total
      };
    });
  }, [entries, currentMonthDate, variables]);

  const activeVariables = variables.filter(v => !v.isArchived || currentStats.entries.some(e => e.variableId === v.id));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mess Expenses</h2>
          <p className="text-slate-500 dark:text-slate-400">Track and manage your shared mess costs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl p-1">
            <button onClick={() => setCurrentMonthDate(subMonths(currentMonthDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><ChevronLeft className="w-5 h-5"/></button>
            <span className="px-4 font-medium text-sm text-slate-900 dark:text-white min-w-[120px] text-center">{format(currentMonthDate, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentMonthDate(addMonths(currentMonthDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><ChevronRight className="w-5 h-5"/></button>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Mess Cost" 
          amount={currentStats.total} 
          icon={ShoppingCart} colorClass="bg-blue-500" formatMoney={formatMoney}
          subtitle={`Prev: ${formatMoney(prevStats.total)}`}
        />
        <StatCard 
          title="Total Food Cost" 
          amount={currentStats.foodTotal} 
          icon={Utensils} colorClass="bg-emerald-500" formatMoney={formatMoney}
          subtitle={`Avg Meal: ${formatMoney(currentStats.avgPerMeal)}`}
        />
        <StatCard 
          title="Total Non-Food" 
          amount={currentStats.nonFoodTotal} 
          icon={Home} colorClass="bg-amber-500" formatMoney={formatMoney}
        />
        <StatCard 
          title="Avg Cost / Day" 
          amount={currentStats.avgPerDay} 
          icon={Zap} colorClass="bg-purple-500" formatMoney={formatMoney}
          subtitle={`Highest: ${currentStats.highestCategory.name} (${formatMoney(currentStats.highestCategory.amount)})`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Entries */}
        <div className="lg:col-span-2 card-minimal p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Monthly Variables ({format(currentMonthDate, 'MMM yyyy')})</h3>
          
          <div className="space-y-4">
            {activeVariables.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p>No variables found.</p>
                <button onClick={() => setSettingsOpen(true)} className="text-blue-500 hover:underline mt-2">Add Variables in Settings</button>
              </div>
            ) : (
              <div className="flex flex-col">
                {activeVariables.map(v => {
                  const Icon = MESS_ICONS[v.icon] || Info;
                  const entry = currentStats.entries.find(e => e.variableId === v.id);
                  const amount = entry ? entry.amount : '';
                  return (
                    <div key={v.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 group">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105", v.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{v.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{v.type}</p>
                        </div>
                      </div>
                      <div className="w-32">
                        <input 
                          type="number"
                          className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-right text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => saveEntry(monthString, v.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="card-minimal p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">6-Month Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNonFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="Food" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFood)" />
                <Area type="monotone" dataKey="Non-Food" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorNonFood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Mess;
