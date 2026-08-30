import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white'
              : toast.type === 'error'
              ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-slate-900 dark:text-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-brand-500" />}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold">{toast.title}</h5>
            {toast.description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
