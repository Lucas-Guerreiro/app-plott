import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  LogOut,
  
  ShieldCheck,
  
  ChevronDown,
  Globe,
  Settings,
} from 'lucide-react';

interface UserProfileMenuProps {
  onOpenAuthModal: () => void;
  onOpenEditProfileModal: () => void;
  onOpenStatsModal: () => void;
  visitedCountriesCount: number;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  onOpenAuthModal,
  onOpenEditProfileModal,
  onOpenStatsModal,
  visitedCountriesCount,
}) => {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getExplorerBadge = () => {
    if (visitedCountriesCount >= 30) return { title: 'Trotamundos Lendário', icon: '👑', color: 'text-amber-500' };
    if (visitedCountriesCount >= 15) return { title: 'Viajante Cosmopolita', icon: '🌟', color: 'text-purple-500' };
    if (visitedCountriesCount >= 5) return { title: 'Explorador Ativo', icon: '🧭', color: 'text-teal-500' };
    return { title: 'Mochileiro Iniciante', icon: '🎒', color: 'text-blue-500' };
  };

  const badge = getExplorerBadge();

  if (isGuest || !isAuthenticated) {
    return (
      <button
        onClick={onOpenAuthModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
      >
        <User className="w-3.5 h-3.5 text-brand-600" />
        <span>Entrar / Cadastrar</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-sm shadow-sm">
          {user?.avatarEmoji || '✈️'}
        </div>
        <div className="text-left hidden lg:block">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[100px]">
            {user?.name}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            {badge.title}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                {user?.avatarEmoji || '✈️'}
              </span>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                <ShieldCheck className="w-3 h-3" /> Conta Protegida
              </span>
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {badge.icon} {badge.title}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <button
            onClick={() => {
              setMenuOpen(false);
              onOpenEditProfileModal();
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Editar Perfil & Avatar</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              onOpenStatsModal();
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-4 h-4 text-brand-500" />
            <span>Meu Passaporte & Estatísticas</span>
          </button>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
