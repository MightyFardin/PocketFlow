import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "warning",
  hideCancel = false 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <XCircle className="w-8 h-8" />;
      case 'success': return <CheckCircle className="w-8 h-8" />;
      case 'info': return <Info className="w-8 h-8" />;
      default: return <AlertTriangle className="w-8 h-8" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'danger': return 'bg-rose-100 text-rose-500 dark:bg-rose-900/30';
      case 'success': return 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30';
      case 'info': return 'bg-blue-100 text-blue-500 dark:bg-blue-900/30';
      default: return 'bg-amber-100 text-amber-500 dark:bg-amber-900/30';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-rose-500 hover:bg-rose-600';
      case 'success': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'info': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-amber-500 hover:bg-amber-600';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={hideCancel ? onConfirm : onCancel} />
      
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 max-w-sm w-full p-6 text-center">
        
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${getColorClass()}`}>
          {getIcon()}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 w-full">
          {!hideCancel && (
            <button 
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-white transition-colors shadow-sm ${getButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
