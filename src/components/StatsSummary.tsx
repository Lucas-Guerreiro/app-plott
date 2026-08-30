import React from 'react';
import { Globe, CheckCircle2, Bookmark } from 'lucide-react';

interface StatsSummaryProps {
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
  onOpenStatsModal: () => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, onOpenStatsModal }) => {
  const percentNum = Math.min(100, Math.max(0, parseFloat(stats.worldPercentage)));

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Passaporte Global</span>
        </div>
        <button
          onClick={onOpenStatsModal}
          className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
        >
          Ver detalhes →
        </button>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            {stats.visitedCountriesCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {stats.totalUnCountries} países</span>
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            {stats.worldPercentage}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${Math.max(percentNum, 3)}%` }}
          />
        </div>
      </div>

      {/* Quick Counters Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
              Visitados
            </div>
            <div className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
              {stats.visited} <span className="text-[11px] font-normal text-slate-500">locais</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-800 dark:text-indigo-300">
              Quero Ir
            </div>
            <div className="text-sm font-extrabold text-indigo-950 dark:text-indigo-100">
              {stats.unvisited} <span className="text-[11px] font-normal text-slate-500">locais</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
