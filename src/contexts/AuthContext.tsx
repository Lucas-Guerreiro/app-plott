import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  loginAsGuest: () => User;
  logout: () => void;
  updateProfile: (updates: { name?: string; avatarEmoji?: string }) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    if (isFirebaseConfigured && auth) {
      // Timeout de segurança: se o Firebase demorar mais de 5s, inicia como convidado
      const safetyTimeout = setTimeout(() => {
        if (isMounted && isLoading) {
          const guest = authService.loginAsGuest();
          setUser(guest);
          setIsLoading(false);
        }
      }, 5000);

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        clearTimeout(safetyTimeout);
        if (!isMounted) return;
        if (firebaseUser) {
          const activeUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Viajante',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || undefined,
            avatarEmoji: '✈️',
            provider:
              firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          };
          setUser(activeUser);
        } else {
          const guest = authService.loginAsGuest();
          setUser(guest);
        }
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
        unsubscribe();
      };
    } else {
      async function initLocal() {
        try {
          const localUser = await authService.getCurrentUser();
          if (localUser && isMounted) {
            setUser(localUser);
          } else if (isMounted) {
            const guest = authService.loginAsGuest();
            setUser(guest);
          }
        } catch {
          if (isMounted) {
            const guest = authService.loginAsGuest();
            setUser(guest);
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
      initLocal();
    }

    return () => { isMounted = false; };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    await storageService.migrateGuestLocationsToUser(loggedInUser.id);
    return loggedInUser;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const newUser = await authService.register(credentials);
    setUser(newUser);
    await storageService.migrateGuestLocationsToUser(newUser.id);
    return newUser;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const googleUser = await authService.loginWithGoogle();
    setUser(googleUser);
    await storageService.migrateGuestLocationsToUser(googleUser.id);
    return googleUser;
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser = authService.loginAsGuest();
    setUser(guestUser);
    return guestUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    const guestUser = authService.loginAsGuest();
    setUser(guestUser);
  }, []);

  const updateProfile = useCallback(async (updates: { name?: string; avatarEmoji?: string }) => {
    if (!user) throw new Error('Nenhum usuário logado.');
    const updated = await authService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  }, [user]);

  const requestPasswordReset = useCallback(async (email: string) => {
    return await authService.requestPasswordReset(email);
  }, []);

  const isAuthenticated = !!user && user.provider !== 'guest';
  const isGuest = !user || user.provider === 'guest';

  // Enquanto o Firebase está inicializando, mostra tela de carregamento
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl">🧭</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
            Carregando Plott...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuest,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateProfile,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
