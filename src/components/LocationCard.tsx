import React from 'react';
import { LocationItem } from '../types/location';
import { getCountryByCode } from '../data/countries';
import { Globe, Building2, MapPin, CheckCircle2, Bookmark, Pencil, Trash2, Navigation } from 'lucide-react';

interface LocationCardProps {
  location: LocationItem;
  isSelected: boolean;
  onSelect: (location: LocationItem) => void;
  onToggleVisited: (id: string) => void;
  onEdit: (location: LocationItem) => void;
  onDelete: (location: LocationItem) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
  onToggleVisited,
  onEdit,
  onDelete,
}) => {
  const country = getCountryByCode(location.countryCode);
  const flag = country?.flag || '📍';
  const countryName = country?.namePt || location.countryCode;

  const getTypeIcon = () => {
    switch (location.type) {
      case 'country':
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
      case 'city':
        return <Building2 className="w-3.5 h-3.5 text-amber-500" />;
      case 'point':
        return <MapPin className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (location.type) {
      case 'country':
        return 'País';
      case 'city':
        return 'Cidade';
      case 'point':
        return 'Ponto Específico';
    }
  };

  return (
    <div
      onClick={() => onSelect(location)}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-400 dark:border-brand-600 shadow-md ring-2 ring-brand-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Flag & Info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-inner group-hover:scale-105 transition-transform">
            {flag}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {location.name}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                {getTypeIcon()}
                <span>{getTypeLabel()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {location.type !== 'country' && countryName ? `${countryName} • ` : ''}
              {location.coordinates.lat.toFixed(2)}°, {location.coordinates.lng.toFixed(2)}°
            </p>

            {location.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic mt-1 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded">
                "{location.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Right Status Badge / Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisited(location.id);
          }}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-transform active:scale-90 ${
            location.visited
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
          }`}
          title={location.visited ? 'Clique para marcar como não visitado' : 'Clique para marcar como visitado'}
        >
          {location.visited ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Visitado</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Quero Ir</span>
            </>
          )}
        </button>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <div className="flex items-center text-[11px] text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          <Navigation className="w-3 h-3 mr-1" />
          <span>Ver no mapa</span>
        </div>

        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(location)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Editar local"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(location)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Excluir local"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
