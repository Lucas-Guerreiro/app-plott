import React from 'react';
import { LocationItem } from '../types/location';
import { getCountryByCode } from '../data/countries';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  location: LocationItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  location,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !location) return null;

  const country = getCountryByCode(location.countryCode);
  const flag = country?.flag || '📍';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Excluir Local?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tem certeza de que deseja remover permanentemente{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {flag} {location.name}
            </strong>{' '}
            do seu mapa de viagens?
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Local</span>
          </button>
        </div>
      </div>
    </div>
  );
};
