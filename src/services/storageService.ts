import { LocationItem } from '../types/location';
import { INITIAL_LOCATIONS } from '../data/initialLocations';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

const DEFAULT_STORAGE_KEY = 'plott_locations_v1';
const THEME_KEY = 'plott_theme_v1';

export interface StorageProvider {
  getLocations(userId?: string): Promise<LocationItem[]>;
  saveLocations(locations: LocationItem[], userId?: string): Promise<void>;
  addLocation(location: Omit<LocationItem, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<LocationItem>;
  updateLocation(id: string, updates: Partial<LocationItem>, userId?: string): Promise<LocationItem>;
  deleteLocation(id: string, userId?: string): Promise<void>;
  resetToInitial(userId?: string): Promise<LocationItem[]>;
  clearAll(userId?: string): Promise<void>;
  migrateGuestLocationsToUser(userId: string): Promise<void>;
}

class StorageManager implements StorageProvider {
  private getKey(userId?: string): string {
    if (!userId || userId === 'guest-user-default') {
      return DEFAULT_STORAGE_KEY;
    }
    return `plott_locations_${userId}`;
  }

  async getLocations(userId?: string): Promise<LocationItem[]> {
    // 1. Tenta carregar do Firestore se Firebase estiver configurado e usuário autenticado
    if (isFirebaseConfigured && db && userId && userId !== 'guest-user-default') {
      try {
        const locationsCol = collection(db, 'users', userId, 'locations');
        const snapshot = await getDocs(locationsCol);
        if (!snapshot.empty) {
          const list: LocationItem[] = [];
          snapshot.forEach((docItem) => {
            list.push(docItem.data() as LocationItem);
          });
          return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch (err) {
        console.warn('Erro ao ler locais do Cloud Firestore:', err);
      }
    }

    // 2. Fallback: LocalStorage
    try {
      const key = this.getKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(INITIAL_LOCATIONS));
        return INITIAL_LOCATIONS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_LOCATIONS;
    } catch (e) {
      console.error('Erro ao ler locais do localStorage:', e);
      return INITIAL_LOCATIONS;
    }
  }

  async saveLocations(locations: LocationItem[], userId?: string): Promise<void> {
    // Salva no LocalStorage
    try {
      const key = this.getKey(userId);
      localStorage.setItem(key, JSON.stringify(locations));
    } catch (e) {
      console.error('Erro ao salvar locais no localStorage:', e);
    }
  }

  async addLocation(
    data: Omit<LocationItem, 'id' | 'createdAt' | 'updatedAt'>,
    userId?: string
  ): Promise<LocationItem> {
    const list = await this.getLocations(userId);
    const now = new Date().toISOString();
    const newItem: LocationItem = {
      ...data,
      id: 'loc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: now,
      updatedAt: now,
    };
    const updatedList = [newItem, ...list];
    await this.saveLocations(updatedList, userId);

    // Se Firebase estiver ativo, sincroniza no Firestore
    if (isFirebaseConfigured && db && userId && userId !== 'guest-user-default') {
      try {
        const docRef = doc(db, 'users', userId, 'locations', newItem.id);
        await setDoc(docRef, newItem);
      } catch (err) {
        console.warn('Erro ao sincronizar novo local no Firestore:', err);
      }
    }

    return newItem;
  }

  async updateLocation(
    id: string,
    updates: Partial<LocationItem>,
    userId?: string
  ): Promise<LocationItem> {
    const list = await this.getLocations(userId);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Local com id ${id} não encontrado.`);
    }
    const updatedItem: LocationItem = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedItem;
    await this.saveLocations(list, userId);

    if (isFirebaseConfigured && db && userId && userId !== 'guest-user-default') {
      try {
        const docRef = doc(db, 'users', userId, 'locations', id);
        await setDoc(docRef, updatedItem, { merge: true });
      } catch (err) {
        console.warn('Erro ao atualizar local no Firestore:', err);
      }
    }

    return updatedItem;
  }

  async deleteLocation(id: string, userId?: string): Promise<void> {
    const list = await this.getLocations(userId);
    const filtered = list.filter((item) => item.id !== id);
    await this.saveLocations(filtered, userId);

    if (isFirebaseConfigured && db && userId && userId !== 'guest-user-default') {
      try {
        const docRef = doc(db, 'users', userId, 'locations', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Erro ao excluir local do Firestore:', err);
      }
    }
  }

  async resetToInitial(userId?: string): Promise<LocationItem[]> {
    await this.saveLocations(INITIAL_LOCATIONS, userId);
    return INITIAL_LOCATIONS;
  }

  async clearAll(userId?: string): Promise<void> {
    await this.saveLocations([], userId);
  }

  async migrateGuestLocationsToUser(userId: string): Promise<void> {
    if (!userId || userId === 'guest-user-default') return;

    try {
      const guestKey = DEFAULT_STORAGE_KEY;
      const userKey = this.getKey(userId);

      const guestRaw = localStorage.getItem(guestKey);
      if (guestRaw) {
        const guestLocs = JSON.parse(guestRaw);
        if (Array.isArray(guestLocs) && guestLocs.length > 0) {
          const userLocs = await this.getLocations(userId);
          const existingIds = new Set(userLocs.map((l) => l.id));
          const toAdd = guestLocs.filter((l) => !existingIds.has(l.id));
          const merged = [...userLocs, ...toAdd];
          localStorage.setItem(userKey, JSON.stringify(merged));

          // Sincroniza em lote no Firestore se ativo
          if (isFirebaseConfigured && db) {
            for (const item of merged) {
              try {
                const docRef = doc(db, 'users', userId, 'locations', item.id);
                await setDoc(docRef, item, { merge: true });
              } catch {}
            }
          }
        }
      }
    } catch (e) {
      console.warn('Falha ao migrar dados de convidado:', e);
    }
  }
}

export const storageService = new StorageManager();
export { THEME_KEY };
