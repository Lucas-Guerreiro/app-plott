import React, { useState } from 'react';
import { LocationItem, FilterStatus, FilterType, SortOption } from '../types/location';
import { LocationCard } from './LocationCard';
import { LocationFilters } from './LocationFilters';
import { StatsSummary } from './StatsSummary';
import { Search, X, MapPinOff, Plus, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface LocationListPanelProps {
  locations: LocationItem[];
  filteredLocations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (loc: LocationItem) => void;
  onToggleVisited: (id: string) => void;
  onEditLocation: (loc: LocationItem) => void;
  onDeleteLocation: (loc: LocationItem) => void;
  onOpenAddModal: (initialQuery?: string) => void;
  onOpenStatsModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterStatus: FilterStatus;
  onStatusChange: (s: FilterStatus) => void;
  filterType: FilterType;
  onTypeChange: (t: FilterType) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  stats: {
    total: number;
    visited: number;
    unvisited: number;
    visitedCountriesCount: number;
    totalUnCountries: number;
    worldPercentage: string;
    visitedCities: number;
    visitedPoints: number;
  };
}

export const LocationListPanel: React.FC<LocationListPanelProps> = ({
  locations,
  filteredLocations,
  selectedLocation,
  onSelectLocation,
  onToggleVisited,
  onEditLocation,
  onDeleteLocation,
  onOpenAddModal,
  onOpenStatsModal,
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
  sortBy,
  onSortChange,
  stats,
}) => {
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(false);

  const counts = {
    all: locations.length,
    visited: stats.visited,
    unvisited: stats.unvisited,
  };

  return (
    <>
      {/* DESKTOP SIDEBAR (visible on md+) */}
      <aside className="hidden md:flex flex-col w-96 lg:w-[420px] h-[calc(100vh-4rem)] border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-md z-20 shrink-0 transition-colors duration-200">
        {/* Scrollable Container Header */}
        <div className="p-4 space-y-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
          <StatsSummary stats={stats} onOpenStatsModal={onOpenStatsModal} />

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtrar locais salvos no passaporte..."
              className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <LocationFilters
            filterStatus={filterStatus}
            onStatusChange={onStatusChange}
            filterType={filterType}
            onTypeChange={onTypeChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            counts={counts}
          />
        </div>

        {/* Locations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((item) => (
              <LocationCard
                key={item.id}
                location={item}
                isSelected={selectedLocation?.id === item.id}
                onSelect={onSelectLocation}
                onToggleVisited={onToggleVisited}
                onEdit={onEditLocation}
                onDelete={onDeleteLocation}
              />
            ))
          ) : (
            <div className="py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400 mb-3">
                <MapPinOff className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {searchQuery
                  ? `"${searchQuery}" não está na sua lista salva`
                  : 'Nenhum local registrado'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto">
                {searchQuery
                  ? 'Essa barra filtra seus locais já cadastrados. Deseja buscar esse restaurante, monumento ou cidade no mapa-múndi para adicionar?'
                  : 'Comece a marcar os lugares que você já conheceu ou quer visitar no mundo!'}
              </p>

              {searchQuery ? (
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => onOpenAddModal(searchQuery)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/25 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buscar "{searchQuery}" no mundo e adicionar</span>
                  </button>
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  >
                    Limpar filtro
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onOpenAddModal()}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Novo Local</span>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM SHEET (visible on mobile only) */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-30 bg-white dark:bg-slate-950 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          mobileSheetOpen ? 'h-[75vh]' : 'h-24'
        }`}
      >
        {/* Drag Handle / Bar Header */}
        <div
          onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
          className="p-3 pb-2 cursor-pointer flex flex-col items-center border-b border-slate-100 dark:border-slate-800/80 select-none shrink-0"
        >
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-2" />
          <div className="w-full flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Locais Salvos ({filteredLocations.length})
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {stats.worldPercentage}% do mundo
              </span>
            </div>
            <button className="p-1 text-slate-500">
              {mobileSheetOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {mobileSheetOpen && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filtrar locais salvos..."
                className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <LocationFilters
              filterStatus={filterStatus}
              onStatusChange={onStatusChange}
              filterType={filterType}
              onTypeChange={onTypeChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              counts={counts}
            />

            <div className="space-y-3 pt-2">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((item) => (
                  <LocationCard
                    key={item.id}
                    location={item}
                    isSelected={selectedLocation?.id === item.id}
                    onSelect={(loc) => {
                      onSelectLocation(loc);
                      setMobileSheetOpen(false);
                    }}
                    onToggleVisited={onToggleVisited}
                    onEdit={onEditLocation}
                    onDelete={onDeleteLocation}
                  />
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-500">
                    Nenhum local salvo encontrado.
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        onOpenAddModal(searchQuery);
                        setMobileSheetOpen(false);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Buscar "{searchQuery}" no mundo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
