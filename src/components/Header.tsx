import React from 'react';
import { Compass, Plus, Moon, Sun, BarChart3, Globe2, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { UserProfileMenu } from './UserProfileMenu';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenStatsModal: () => void;
  onOpenAuthModal: () => void;
  onOpenEditProfileModal: () => void;
  visitedCountriesCount: number;
  totalUnCountries: number;
  worldPercentage: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenStatsModal,
  onOpenAuthModal,
  onOpenEditProfileModal,
  visitedCountriesCount,
  totalUnCountries,
  worldPercentage,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 relative transition-colors duration-200">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white transform hover:scale-105 transition-transform shrink-0">
          <Compass className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-brand-600 via-teal-500 to-sky-500 bg-clip-text text-transparent tracking-tight">
              Plott
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <Sparkles className="w-3 h-3 mr-1" />
              Passaporte Visual
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
            Mapa de Lugares Visitados e Sonhos de Viagem
          </p>
        </div>
      </div>

      {/* Center Stats Pill (Interactive) */}
      <button
        onClick={onOpenStatsModal}
        className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all hover:scale-102 cursor-pointer shadow-sm group"
        title="Ver passaporte e estatísticas detalhadas"
      >
        <Globe2 className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:rotate-12 transition-transform" />
        <span>
          <strong className="text-brand-600 dark:text-brand-400">{visitedCountriesCount}</strong> de {totalUnCountries} países
        </span>
        <span className="text-slate-400 dark:text-slate-500">•</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{worldPercentage}% do mundo</span>
      </button>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Stats button for mobile */}
        <button
          onClick={onOpenStatsModal}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          title="Estatísticas do Passaporte"
          aria-label="Estatísticas"
        >
          <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* User Profile Menu / Login Trigger */}
        <UserProfileMenu
          onOpenAuthModal={onOpenAuthModal}
          onOpenEditProfileModal={onOpenEditProfileModal}
          onOpenStatsModal={onOpenStatsModal}
          visitedCountriesCount={visitedCountriesCount}
        />

        {/* Add Location Primary Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/35 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline sm:inline">Novo Local</span>
        </button>
      </div>
    </header>
  );
};
