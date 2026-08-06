import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, X, Star, Calendar, DollarSign, Trash2, Tag as TagIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import ConfirmModal from '../components/ConfirmModal';

const WishlistModal = ({ isOpen, onClose }) => {
  const { addWishlist } = useFinance();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price || isNaN(Number(price)) || !name) return;

    addWishlist({
      name,
      price: Number(price),
      priority,
      targetDate: new Date(targetDate).toISOString(),
      note,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    setName('');
    setPrice('');
    setNote('');
    setPriority('Medium');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="card-minimal w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add to Wishlist</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-6 custom-scrollbar">
          <form id="wishlist-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Item Name</label>
              <div className="relative">
                <Star className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. New Laptop"
                  className="input-field pl-10 text-base py-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Estimated Price</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="input-field pl-10 h-[42px]"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Target Date</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    className="input-field pl-10 h-[42px]"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Priority</label>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      priority === p 
                        ? (p === 'High' ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400' 
                           : p === 'Medium' ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                           : 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400')
                        : 'bg-transparent border-slate-200 text-slate-500 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Notes</label>
              <textarea
                placeholder="Any details, links, or specifications..."
                className="input-field p-3 min-h-[100px] resize-y"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0 bg-slate-50 dark:bg-black/20 rounded-b-xl">
          <button type="submit" form="wishlist-form" className="w-full btn-primary py-3 text-base">
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Wishlist = () => {
  const { wishlists, addWishlist, deleteWishlist, updateWishlistStatus, addTransaction, stats, formatMoney } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    item: null,
    title: '',
    message: '',
    type: 'info',
    hideCancel: false,
    onConfirm: () => {}
  });

  const handlePurchase = (item) => {
    if (stats.balance < item.price) {
      setConfirmModal({
        isOpen: true,
        title: 'Insufficient Funds',
        message: `You cannot afford "${item.name}" yet! You need ${formatMoney(item.price)} but your balance is only ${formatMoney(stats.balance)}. Keep saving!`,
        type: 'danger',
        hideCancel: true,
        confirmText: 'Okay',
        onConfirm: () => setConfirmModal(prev => ({...prev, isOpen: false}))
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Log Purchase',
      message: `You can afford this! Do you want to mark "${item.name}" as purchased and automatically log this expense?`,
      type: 'info',
      hideCancel: false,
      confirmText: 'Yes, log it',
      cancelText: 'Cancel',
      onConfirm: () => {
        updateWishlistStatus(item.id, 'Purchased');
        addTransaction({
          id: Math.random().toString(36).substr(2, 9),
          type: 'expense',
          amount: item.price,
          category: 'Shopping',
          date: new Date().toISOString(),
          note: `Wishlist item: ${item.name}`,
          tags: ['Wishlist'],
          isRecurring: false,
          priority: item.priority
        });
        setConfirmModal(prev => ({...prev, isOpen: false}));
      },
      onCancel: () => setConfirmModal(prev => ({...prev, isOpen: false}))
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Wishlist</h2>
          <p className="text-slate-500 dark:text-slate-400">Track items you plan to purchase in the future.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      <WishlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlists.map(item => (
          <div key={item.id} className="card-minimal p-5 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${
              item.priority === 'High' ? 'bg-rose-500' : item.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            
            <div className="flex justify-between items-start mb-4 pl-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">{item.name}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Est. {formatMoney(item.price)}</p>
              </div>
              <button 
                onClick={() => deleteWishlist(item.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="pl-2 space-y-3">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                Target: {format(new Date(item.targetDate), 'MMM dd, yyyy')}
              </div>
              
              {item.note && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                  {item.note}
                </div>
              )}
              
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  item.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                  : item.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  {item.priority} Priority
                </span>
                
                {item.status.toLowerCase() === 'pending' ? (
                  <button 
                    onClick={() => handlePurchase(item)}
                    className="flex items-center text-[10px] uppercase font-bold text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Mark Purchased
                  </button>
                ) : (
                  <span className="flex items-center text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Purchased
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {wishlists.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-[#111] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Star className="w-12 h-12 mb-3 opacity-20" />
            <p>Your wishlist is empty. Add items you want to buy later!</p>
          </div>
        )}
      </div>
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        hideCancel={confirmModal.hideCancel}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
    </div>
  );
};

export default Wishlist;
