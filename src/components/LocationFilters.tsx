import React from 'react';
import { FilterStatus, FilterType, SortOption } from '../types/location';
import { Globe, Building2, MapPin, Layers, ArrowDownUp } from 'lucide-react';

interface LocationFiltersProps {
  filterStatus: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  filterType: FilterType;
  onTypeChange: (type: FilterType) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    visited: number;
    unvisited: number;
  };
}

export const LocationFilters: React.FC<LocationFiltersProps> = ({
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
  sortBy,
  onSortChange,
  counts,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Status Segmented Control */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
        <button
          onClick={() => onStatusChange('all')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            filterStatus === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Todos</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => onStatusChange('visited')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            filterStatus === 'visited'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300'
          }`}
        >
          <span>Visitados</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
            {counts.visited}
          </span>
        </button>

        <button
          onClick={() => onStatusChange('unvisited')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            filterStatus === 'unvisited'
              ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'
          }`}
        >
          <span>Não visitados</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
            {counts.unvisited}
          </span>
        </button>
      </div>

      {/* Types Pills and Sort in a row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onTypeChange('all')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
              filterType === 'all'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Todos</span>
          </button>

          <button
            onClick={() => onTypeChange('country')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
              filterType === 'country'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Países</span>
          </button>

          <button
            onClick={() => onTypeChange('city')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
              filterType === 'city'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Cidades</span>
          </button>

          <button
            onClick={() => onTypeChange('point')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
              filterType === 'point'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Pontos</span>
          </button>
        </div>

        {/* Sort Select */}
        <div className="relative shrink-0 flex items-center">
          <ArrowDownUp className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="pl-6 pr-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer appearance-none"
            aria-label="Ordenar locais"
          >
            <option value="date_desc">Mais recentes</option>
            <option value="date_asc">Mais antigos</option>
            <option value="name_asc">Nome (A - Z)</option>
            <option value="name_desc">Nome (Z - A)</option>
            <option value="status">Status (Visitados 1º)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
