import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Check, Sparkles } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AVATAR_EMOJIS = ['✈️', '🎒', '🌍', '🚀', '🏖️', '🧭', '🏔️', '🗺️', '🏝️', '⛺', '🚗', '🚢'];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState<string>('');
  const [avatarEmoji, setAvatarEmoji] = useState<string>('✈️');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarEmoji(user.avatarEmoji || '✈️');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), avatarEmoji });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            Editar Perfil
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ícone / Avatar
            </label>
            <div className="grid grid-cols-6 gap-2 p-1">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                    avatarEmoji === emoji
                      ? 'bg-brand-100 dark:bg-brand-950 border-2 border-brand-500 scale-110 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
