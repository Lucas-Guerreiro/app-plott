import {
  User,
  StoredUserAccount,
  UserSession,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
} from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';

const USERS_STORAGE_KEY = 'plott_users_v1';
const SESSION_STORAGE_KEY = 'plott_session_v1';
const GUEST_USER_ID = 'guest-user-default';

class CryptoUtils {
  static generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt + 'plott_travel_secure_pepper_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  static generateToken(): string {
    return 'plt_' + crypto.randomUUID().replace(/-/g, '') + '_' + Date.now().toString(36);
  }
}

class AuthService {
  private getUsers(): StoredUserAccount[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredUserAccount[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private getSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as UserSession;
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private saveSession(session: UserSession): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  async getCurrentUser(): Promise<User | null> {
    // 1. Firebase Auth se configurado
    if (isFirebaseConfigured && auth) {
      const current = auth.currentUser;
      if (current) {
        return {
          id: current.uid,
          name: current.displayName || 'Viajante',
          email: current.email || '',
          avatarEmoji: '✈️',
          provider: 'email',
          createdAt: current.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: current.metadata.lastSignInTime || new Date().toISOString(),
        };
      }
    }

    // 2. Sessão Local
    const session = this.getSession();
    if (!session) return null;

    if (session.userId === GUEST_USER_ID) {
      return {
        id: GUEST_USER_ID,
        name: 'Viajante Convidado',
        email: 'convidado@plott.app',
        avatarEmoji: '🧭',
        provider: 'guest',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    const users = this.getUsers();
    const account = users.find((u) => u.id === session.userId);
    if (!account) {
      this.logout();
      return null;
    }

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      avatarEmoji: account.avatarEmoji || '✈️',
      provider: account.provider,
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
    };
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    const emailNorm = credentials.email.trim().toLowerCase();
    const nameNorm = credentials.name.trim();
    const password = credentials.password || '';

    if (!nameNorm || nameNorm.length < 2) {
      throw new Error('Por favor, informe seu nome completo.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNorm)) {
      throw new Error('Por favor, informe um endereço de e-mail válido.');
    }

    if (password.length < 6) {
      throw new Error('A senha deve conter no mínimo 6 caracteres.');
    }

    // Se Firebase estiver configurado, registra no Firebase Authentication
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailNorm, password);
        await firebaseUpdateProfile(userCredential.user, {
          displayName: nameNorm,
        });

        return {
          id: userCredential.user.uid,
          name: nameNorm,
          email: emailNorm,
          avatarEmoji: credentials.avatarEmoji || '🎒',
          provider: 'email',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          throw new Error('Este e-mail já está cadastrado no Firebase.');
        }
        throw new Error(err.message || 'Erro ao registrar no Firebase.');
      }
    }

    // Fallback: Registro com Web Crypto API local
    const users = this.getUsers();
    const exists = users.some((u) => u.email === emailNorm);
    if (exists) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.');
    }

    const salt = CryptoUtils.generateSalt();
    const passwordHash = await CryptoUtils.hashPassword(password, salt);
    const now = new Date().toISOString();

    const newAccount: StoredUserAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: nameNorm,
      email: emailNorm,
      passwordHash,
      passwordSalt: salt,
      avatarEmoji: credentials.avatarEmoji || '🎒',
      provider: 'email',
      createdAt: now,
      lastLoginAt: now,
    };

    users.push(newAccount);
    this.saveUsers(users);

    const session: UserSession = {
      token: CryptoUtils.generateToken(),
      userId: newAccount.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: true,
    };
    this.saveSession(session);

    return {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      avatarEmoji: newAccount.avatarEmoji,
      provider: 'email',
      createdAt: newAccount.createdAt,
      lastLoginAt: newAccount.lastLoginAt,
    };
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const emailNorm = credentials.email.trim().toLowerCase();
    const password = credentials.password || '';

    // Se Firebase estiver configurado
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailNorm, password);
        return {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || 'Viajante',
          email: userCredential.user.email || emailNorm,
          avatarEmoji: '✈️',
          provider: 'email',
          createdAt: userCredential.user.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
      } catch (err: any) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          throw new Error('E-mail ou senha incorretos no Firebase.');
        }
        throw new Error(err.message || 'Erro ao autenticar no Firebase.');
      }
    }

    // Fallback: Login local com Hash + Salt
    const users = this.getUsers();
    const account = users.find((u) => u.email === emailNorm);

    if (!account) {
      throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
    }

    const computedHash = await CryptoUtils.hashPassword(password, account.passwordSalt);
    if (computedHash !== account.passwordHash) {
      throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
    }

    account.lastLoginAt = new Date().toISOString();
    this.saveUsers(users);

    const sessionDurationDays = credentials.rememberMe ? 30 : 1;
    const session: UserSession = {
      token: CryptoUtils.generateToken(),
      userId: account.id,
      expiresAt: new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: !!credentials.rememberMe,
    };
    this.saveSession(session);

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      avatarEmoji: account.avatarEmoji || '✈️',
      provider: account.provider,
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
    };
  }

  async loginWithGoogle(): Promise<User> {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return {
          id: result.user.uid,
          name: result.user.displayName || 'Viajante Google',
          email: result.user.email || '',
          avatarUrl: result.user.photoURL || undefined,
          avatarEmoji: '🌟',
          provider: 'google',
          createdAt: result.user.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
      } catch (err: any) {
        throw new Error(err.message || 'Erro no login com Google no Firebase.');
      }
    }

    // Mock local de login social
    const googleProfile = {
      name: 'Viajante Google',
      email: 'viajante.google@gmail.com',
      avatarEmoji: '🌟',
    };

    const users = this.getUsers();
    let account = users.find((u) => u.email === googleProfile.email);
    const now = new Date().toISOString();

    if (!account) {
      const salt = CryptoUtils.generateSalt();
      account = {
        id: 'usr_g_' + Date.now(),
        name: googleProfile.name,
        email: googleProfile.email,
        passwordHash: 'oauth_google_verified',
        passwordSalt: salt,
        avatarEmoji: googleProfile.avatarEmoji,
        provider: 'google',
        createdAt: now,
        lastLoginAt: now,
      };
      users.push(account);
      this.saveUsers(users);
    } else {
      account.lastLoginAt = now;
      this.saveUsers(users);
    }

    const session: UserSession = {
      token: CryptoUtils.generateToken(),
      userId: account.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: true,
    };
    this.saveSession(session);

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      avatarEmoji: account.avatarEmoji,
      provider: 'google',
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
    };
  }

  loginAsGuest(): User {
    const guestUser: User = {
      id: GUEST_USER_ID,
      name: 'Viajante Convidado',
      email: 'convidado@plott.app',
      avatarEmoji: '🧭',
      provider: 'guest',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const session: UserSession = {
      token: CryptoUtils.generateToken(),
      userId: GUEST_USER_ID,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: true,
    };
    this.saveSession(session);

    return guestUser;
  }

  async updateProfile(userId: string, updates: { name?: string; avatarEmoji?: string }): Promise<User> {
    if (isFirebaseConfigured && auth && auth.currentUser) {
      if (updates.name) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: updates.name });
      }
      return {
        id: auth.currentUser.uid,
        name: updates.name || auth.currentUser.displayName || 'Viajante',
        email: auth.currentUser.email || '',
        avatarEmoji: updates.avatarEmoji || '✈️',
        provider: 'email',
        createdAt: auth.currentUser.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    if (userId === GUEST_USER_ID) {
      return {
        id: GUEST_USER_ID,
        name: updates.name || 'Viajante Convidado',
        email: 'convidado@plott.app',
        avatarEmoji: updates.avatarEmoji || '🧭',
        provider: 'guest',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('Usuário não encontrado.');

    if (updates.name) users[index].name = updates.name.trim();
    if (updates.avatarEmoji) users[index].avatarEmoji = updates.avatarEmoji;

    this.saveUsers(users);

    return {
      id: users[index].id,
      name: users[index].name,
      email: users[index].email,
      avatarEmoji: users[index].avatarEmoji,
      avatarUrl: users[index].avatarUrl,
      provider: users[index].provider,
      createdAt: users[index].createdAt,
      lastLoginAt: users[index].lastLoginAt,
    };
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const emailNorm = email.trim().toLowerCase();
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, emailNorm);
      return true;
    }

    const users = this.getUsers();
    const exists = users.some((u) => u.email === emailNorm);
    if (!exists) {
      throw new Error('Nenhuma conta foi encontrada com este endereço de e-mail.');
    }
    return true;
  }

  logout(): void {
    if (isFirebaseConfigured && auth) {
      firebaseSignOut(auth).catch(() => {});
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export const authService = new AuthService();
export { GUEST_USER_ID };
