import React, { useState } from 'react';
import { LocationItem } from '../types/location';
import { COUNTRIES, getCountryByCode } from '../data/countries';
import {
  X,
  Award,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Share2,
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationItem[];
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
  onResetToInitial: () => void;
  onImportLocations: (imported: LocationItem[]) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  locations,
  stats,
  onResetToInitial,
  onImportLocations,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const continents = ['América do Sul', 'América do Norte', 'América Central', 'Europa', 'Ásia', 'África', 'Oceania'];
  const visitedCountryCodes = new Set(
    locations.filter((l) => l.visited && l.countryCode).map((l) => l.countryCode.toUpperCase())
  );

  const continentStats = continents.map((cont) => {
    const totalInContinent = COUNTRIES.filter((c) => c.continent === cont).length;
    const visitedInContinent = COUNTRIES.filter(
      (c) => c.continent === cont && visitedCountryCodes.has(c.code.toUpperCase())
    ).length;
    const pct = totalInContinent > 0 ? ((visitedInContinent / totalInContinent) * 100).toFixed(0) : '0';
    return { name: cont, total: totalInContinent, visited: visitedInContinent, pct };
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(locations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `plott_viagens_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportLocations(parsed);
            alert('Dados importados com sucesso!');
            onClose();
          }
        } catch {
          alert('Arquivo JSON inválido.');
        }
      };
    }
  };

  const handleShareSummary = () => {
    const text = `🗺️ Já visitei ${stats.visitedCountriesCount} de ${stats.totalUnCountries} países (${stats.worldPercentage}% do mundo) no meu mapa de viagens Plott!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Passaporte & Estatísticas de Viagem
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seu resumo global de exploração
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Main Global Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-600 via-teal-600 to-sky-600 text-white shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold opacity-80 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Cobertura Global
                </span>
                <div className="text-3xl font-extrabold mt-1">
                  {stats.worldPercentage}% <span className="text-sm font-medium opacity-80">do planeta</span>
                </div>
              </div>
              <button
                onClick={handleShareSummary}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
              </button>
            </div>

            <div className="w-full bg-black/20 rounded-full h-3 p-0.5">
              <div
                className="bg-white h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(parseFloat(stats.worldPercentage), 4)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-lg font-extrabold">{stats.visitedCountriesCount}</div>
                <div className="text-[11px] opacity-80">Países Visitados</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-lg font-extrabold">{stats.visitedCities}</div>
                <div className="text-[11px] opacity-80">Cidades Conhecidas</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-lg font-extrabold">{stats.unvisited}</div>
                <div className="text-[11px] opacity-80">Locais Planejados</div>
              </div>
            </div>
          </div>

          {/* Continents Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Exploração por Continente
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {continentStats.map((c) => (
                <div
                  key={c.name}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {c.visited} / {c.total} ({c.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visited Countries Gallery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Países Carimbados ({visitedCountryCodes.size})
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 custom-scrollbar">
              {Array.from(visitedCountryCodes).map((code) => {
                const c = getCountryByCode(code);
                if (!c) return null;
                return (
                  <span
                    key={c.code}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm"
                  >
                    <span>{c.flag}</span>
                    <span>{c.namePt}</span>
                  </span>
                );
              })}
              {visitedCountryCodes.size === 0 && (
                <div className="text-xs text-slate-400 p-2">Nenhum país marcado como visitado ainda.</div>
              )}
            </div>
          </div>

          {/* Backup & Tools */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Backup e Gerenciamento de Dados
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-brand-600" />
                <span>Exportar Dados (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-sky-600" />
                <span>Importar Backup</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (confirm('Deseja restaurar os dados de exemplo padrão?')) {
                    onResetToInitial();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Restaurar Dados Exemplo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
