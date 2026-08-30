import { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationItem, FilterStatus, FilterType, SortOption } from '../types/location';
import { storageService } from '../services/storageService';
import { TOTAL_UN_COUNTRIES, getCountryByCode } from '../data/countries';
import confetti from 'canvas-confetti';

export function useLocations(userId?: string) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  // Load locations on mount or when userId changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await storageService.getLocations(userId);
        setLocations(data);
      } catch (err) {
        console.error('Erro ao carregar locais do usuário:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const addLocation = useCallback(
    async (itemData: Omit<LocationItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newItem = await storageService.addLocation(itemData, userId);
      setLocations((prev) => [newItem, ...prev]);
      setSelectedLocation(newItem);
      setFlyToCoords({
        lat: newItem.coordinates.lat,
        lng: newItem.coordinates.lng,
        zoom: newItem.type === 'country' ? 5 : 12,
      });

      if (newItem.visited) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#14b8a6', '#0d9488', '#38bdf8', '#fbbf24'],
        });
      }
      return newItem;
    },
    [userId]
  );

  const updateLocation = useCallback(
    async (id: string, updates: Partial<LocationItem>) => {
      const updated = await storageService.updateLocation(id, updates, userId);
      setLocations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedLocation?.id === id) {
        setSelectedLocation(updated);
      }
      if (updates.coordinates) {
        setFlyToCoords({ lat: updates.coordinates.lat, lng: updates.coordinates.lng });
      }
      return updated;
    },
    [selectedLocation, userId]
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      await storageService.deleteLocation(id, userId);
      setLocations((prev) => prev.filter((item) => item.id !== id));
      if (selectedLocation?.id === id) {
        setSelectedLocation(null);
      }
    },
    [selectedLocation, userId]
  );

  const toggleVisited = useCallback(
    async (id: string) => {
      const item = locations.find((l) => l.id === id);
      if (!item) return;
      const newStatus = !item.visited;
      const updated = await storageService.updateLocation(id, { visited: newStatus }, userId);
      setLocations((prev) => prev.map((l) => (l.id === id ? updated : l)));
      if (selectedLocation?.id === id) {
        setSelectedLocation(updated);
      }
      if (newStatus) {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.85 },
          colors: ['#14b8a6', '#10b981', '#6ee7b7'],
        });
      }
    },
    [locations, selectedLocation, userId]
  );

  const resetLocations = useCallback(async () => {
    const list = await storageService.resetToInitial(userId);
    setLocations(list);
    setSelectedLocation(null);
  }, [userId]);

  const clearLocations = useCallback(async () => {
    await storageService.clearAll(userId);
    setLocations([]);
    setSelectedLocation(null);
  }, [userId]);

  const focusLocation = useCallback((item: LocationItem) => {
    setSelectedLocation(item);
    const zoomLevel = item.type === 'country' ? 5 : item.type === 'city' ? 10 : 13;
    setFlyToCoords({ lat: item.coordinates.lat, lng: item.coordinates.lng, zoom: zoomLevel });
  }, []);

  // Filtered and Sorted list
  const filteredLocations = useMemo(() => {
    let result = [...locations];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      result = result.filter((item) => {
        const nameNorm = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const country = getCountryByCode(item.countryCode);
        const countryPt = country?.namePt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
        const notesNorm = (item.notes || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return (
          nameNorm.includes(q) ||
          countryPt.includes(q) ||
          notesNorm.includes(q) ||
          item.countryCode.toLowerCase().includes(q)
        );
      });
    }

    // Status filter
    if (filterStatus === 'visited') {
      result = result.filter((item) => item.visited);
    } else if (filterStatus === 'unvisited') {
      result = result.filter((item) => !item.visited);
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name, 'pt-BR');
      }
      if (sortBy === 'status') {
        if (a.visited === b.visited)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return a.visited ? -1 : 1;
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [locations, searchQuery, filterStatus, filterType, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = locations.length;
    const visitedCount = locations.filter((l) => l.visited).length;
    const unvisitedCount = totalCount - visitedCount;

    const visitedCountryCodes = new Set<string>();
    locations.forEach((item) => {
      if (item.visited && item.countryCode) {
        visitedCountryCodes.add(item.countryCode.toUpperCase());
      }
    });
    const visitedCountriesCount = visitedCountryCodes.size;
    const worldPercentage = ((visitedCountriesCount / TOTAL_UN_COUNTRIES) * 100).toFixed(1);

    const visitedCities = locations.filter((l) => l.type === 'city' && l.visited).length;
    const visitedPoints = locations.filter((l) => l.type === 'point' && l.visited).length;

    return {
      total: totalCount,
      visited: visitedCount,
      unvisited: unvisitedCount,
      visitedCountriesCount,
      totalUnCountries: TOTAL_UN_COUNTRIES,
      worldPercentage,
      visitedCities,
      visitedPoints,
    };
  }, [locations]);

  return {
    locations,
    filteredLocations,
    loading,
    selectedLocation,
    setSelectedLocation,
    flyToCoords,
    setFlyToCoords,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    addLocation,
    updateLocation,
    deleteLocation,
    toggleVisited,
    resetLocations,
    clearLocations,
    focusLocation,
    stats,
  };
}
