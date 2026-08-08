import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

const ConfirmationContext = createContext();
export const useConfirm = () => useContext(ConfirmationContext);

export const ConfirmationProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const modal = modalState.isOpen ? createPortal(
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm z-[99999] flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{modalState.title || 'Confirm Deletion'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{modalState.message || 'Are you sure you want to delete this item? This action cannot be undone.'}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3">
          <button onClick={modalState.onCancel} className="btn-secondary px-4 py-2">Cancel</button>
          <button onClick={modalState.onConfirm} className="bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl px-4 py-2 transition-colors">Delete</button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {modal}
    </ConfirmationContext.Provider>
  );
};
