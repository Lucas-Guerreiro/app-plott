import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Compass,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: 'login' | 'register';
}

const AVATAR_EMOJIS = ['✈️', '🎒', '🌍', '🚀', '🏖️', '🧭', '🏔️', '🗺️', '🏝️', '⛺'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login',
}) => {
  const { login, register, loginWithGoogle, loginAsGuest, requestPasswordReset } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  
  // Form fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [avatarEmoji, setAvatarEmoji] = useState<string>('✈️');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculates password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: 'Vazia', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, text: 'Fraca', color: 'bg-rose-500' };
    if (score <= 2) return { score: 2, text: 'Média', color: 'bg-amber-500' };
    return { score: 3, text: 'Forte', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        await login({ email, password, rememberMe });
        if (onSuccess) onSuccess();
        onClose();
      } else if (tab === 'register') {
        await register({ name, email, password, avatarEmoji });
        if (onSuccess) onSuccess();
        onClose();
      } else if (tab === 'forgot') {
        await requestPasswordReset(email);
        setSuccessMsg('Enviamos um link seguro de recuperação para seu e-mail!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar com Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestContinue = () => {
    loginAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '15s' }} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {tab === 'login' && 'Entrar no Plott'}
                {tab === 'register' && 'Criar sua Conta de Viajante'}
                {tab === 'forgot' && 'Recuperar Senha'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seu passaporte de viagens seguro e sincronizado
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

        {/* Tab switcher */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Já tenho conta (Entrar)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Criar nova conta
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* REGISTER: Avatar Emoji selection */}
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Escolha seu ícone de viajante:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform ${
                      avatarEmoji === emoji
                        ? 'bg-brand-100 dark:bg-brand-950 border-2 border-brand-500 scale-110 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-transparent'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REGISTER: Full Name */}
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* EMAIL (All tabs) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
            </div>
          </div>

          {/* PASSWORD (Login & Register) */}
          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Senha
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter on register */}
              {tab === 'register' && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Força da senha:</span>
                    <span className="font-bold">{strength.text}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remember me (Login only) */}
          {tab === 'login' && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                />
                <span>Lembrar meu login neste dispositivo</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {isSubmitting ? (
              <span>Processando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {tab === 'login' && 'Entrar na Conta'}
                  {tab === 'register' && 'Criar Conta Segura'}
                  {tab === 'forgot' && 'Enviar Instruções'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Forgot tab back to login */}
          {tab === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              ← Voltar para a tela de login
            </button>
          )}

          {/* Social login divider */}
          {tab !== 'forgot' && (
            <>
              <div className="relative text-center my-2">
                <span className="px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 font-medium relative z-10">
                  ou acesse instantaneamente
                </span>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>

              {/* Continue as guest */}
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 pt-1"
              >
                Continuar sem conta (Modo Convidado) →
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
