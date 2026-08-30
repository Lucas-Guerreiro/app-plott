import React, { useState, useEffect } from 'react';
import { LocationItem, LocationType } from '../types/location';
import { COUNTRIES } from '../data/countries';
import { X, CheckCircle2, Bookmark } from 'lucide-react';

interface EditLocationModalProps {
  isOpen: boolean;
  location: LocationItem | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<LocationItem>) => Promise<any>;
}

export const EditLocationModal: React.FC<EditLocationModalProps> = ({
  isOpen,
  location,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<LocationType>('country');
  const [countryCode, setCountryCode] = useState<string>('BR');
  const [visited, setVisited] = useState<boolean>(true);
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (location) {
      setName(location.name);
      setType(location.type);
      setCountryCode(location.countryCode);
      setVisited(location.visited);
      setLat(location.coordinates.lat);
      setLng(location.coordinates.lng);
      setNotes(location.notes || '');
    }
  }, [location, isOpen]);

  if (!isOpen || !location) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(location.id, {
        name: name.trim(),
        type,
        countryCode,
        visited,
        coordinates: { lat, lng },
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar local:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Editar Local
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modifique informações, status ou coordenadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nome do Local
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LocationType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="country">País</option>
                <option value="city">Cidade</option>
                <option value="point">Ponto Específico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                País
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.namePt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Status da Viagem
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setVisited(true)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  visited
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Visitado</span>
              </button>

              <button
                type="button"
                onClick={() => setVisited(false)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  !visited
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Quero Visitar</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas / Comentários
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Lat</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Lng</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
