export type AuthProvider = 'email' | 'google' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  provider: AuthProvider;
  createdAt: string;
  lastLoginAt: string;
}

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  provider: 'email' | 'google';
  createdAt: string;
  lastLoginAt: string;
}

export interface UserSession {
  token: string;
  userId: string;
  expiresAt: string;
  rememberMe: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  avatarEmoji?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
