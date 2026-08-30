import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLocations } from './hooks/useLocations';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { LocationListPanel } from './components/LocationListPanel';
import { AddLocationModal } from './components/AddLocationModal';
import { EditLocationModal } from './components/EditLocationModal';
import { ConfirmModal } from './components/ConfirmModal';
import { StatsModal } from './components/StatsModal';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LocationItem, LocationType } from './types/location';
import { reverseGeocodeNominatim } from './services/geocodingService';
import { getCountryByCode } from './data/countries';

export const App: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const {
    locations,
    filteredLocations,
    selectedLocation,
    flyToCoords,
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
    focusLocation,
    stats,
  } = useLocations(user?.id);

  // Modals & Dialogs state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalInitialQuery, setAddModalInitialQuery] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [locationToEdit, setLocationToEdit] = useState<LocationItem | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [locationToDelete, setLocationToDelete] = useState<LocationItem | null>(null);

  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);

  // Map Point Selection State (when choosing 'Ponto específico' -> 'Toque no mapa')
  const [isSelectingPointOnMap, setIsSelectingPointOnMap] = useState<boolean>(false);
  const [selectedPointCoords, setSelectedPointCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, title, description };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Actions
  const handleOpenAdd = (initialQuery?: string) => {
    setSelectedPointCoords(null);
    setAddModalInitialQuery(initialQuery || '');
    setIsAddModalOpen(true);
  };

  const handleStartMapSelection = (_tempState: {
    type: LocationType;
    name: string;
    countryCode: string;
    visited: boolean;
    notes: string;
  }) => {
    setIsAddModalOpen(false);
    setIsSelectingPointOnMap(true);
    showToast('info', 'Modo de seleção ativo', 'Clique em qualquer lugar do mapa para marcar as coordenadas.');
  };

  const handlePointSelectedOnMap = async (coords: { lat: number; lng: number }) => {
    setIsSelectingPointOnMap(false);

    const geoInfo = await reverseGeocodeNominatim(coords.lat, coords.lng);
    const detectedName = geoInfo?.name || `Ponto (${coords.lat}, ${coords.lng})`;

    setSelectedPointCoords(coords);
    setAddModalInitialQuery('');
    setIsAddModalOpen(true);
    showToast('success', 'Coordenadas fixadas!', `Local selecionado: ${detectedName}`);
  };

  const handleSaveNewLocation = async (itemData: Omit<LocationItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const saved = await addLocation(itemData);
      const flag = getCountryByCode(saved.countryCode)?.flag || '📍';
      showToast(
        'success',
        `${flag} ${saved.name} adicionado!`,
        saved.visited ? 'Carimbado como visitado no seu passaporte.' : 'Adicionado aos seus planos de viagem.'
      );
    } catch {
      showToast('error', 'Erro ao salvar local');
    }
  };

  const handleOpenEdit = (item: LocationItem) => {
    setLocationToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: Partial<LocationItem>) => {
    try {
      const updated = await updateLocation(id, updates);
      showToast('success', 'Local atualizado', `${updated.name} foi atualizado com sucesso.`);
    } catch {
      showToast('error', 'Erro ao atualizar local');
    }
  };

  const handleOpenDelete = (item: LocationItem) => {
    setLocationToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      const name = locationToDelete.name;
      await deleteLocation(locationToDelete.id);
      showToast('info', 'Local excluído', `${name} foi removido do seu mapa.`);
      setLocationToDelete(null);
    } catch {
      showToast('error', 'Erro ao excluir local');
    }
  };

  const handleToggleVisited = async (id: string) => {
    try {
      await toggleVisited(id);
      const item = locations.find((l) => l.id === id);
      if (item) {
        const nextStatus = !item.visited;
        showToast(
          'success',
          nextStatus ? 'Marcado como Visitado!' : 'Marcado como Quero Ir',
          `${item.name} status alterado.`
        );
      }
    } catch {
      showToast('error', 'Erro ao alterar status');
    }
  };

  const handleImportLocations = (imported: LocationItem[]) => {
    const key = user?.id && user.id !== 'guest-user-default' ? `plott_locations_${user.id}` : 'plott_locations_v1';
    localStorage.setItem(key, JSON.stringify(imported));
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Header
        onOpenAddModal={() => handleOpenAdd()}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenEditProfileModal={() => setIsEditProfileModalOpen(true)}
        visitedCountriesCount={stats.visitedCountriesCount}
        totalUnCountries={stats.totalUnCountries}
        worldPercentage={stats.worldPercentage}
      />

      {/* Main Workspace: Sidebar/Sheet + Leaflet Map */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Left Registered Locations Panel (Desktop sidebar / Mobile bottom sheet) */}
        <LocationListPanel
          locations={locations}
          filteredLocations={filteredLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={focusLocation}
          onToggleVisited={handleToggleVisited}
          onEditLocation={handleOpenEdit}
          onDeleteLocation={handleOpenDelete}
          onOpenAddModal={handleOpenAdd}
          onOpenStatsModal={() => setIsStatsModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterType={filterType}
          onTypeChange={setFilterType}
          sortBy={sortBy}
          onSortChange={setSortBy}
          stats={stats}
        />

        {/* Central Interactive Leaflet Map */}
        <MapView
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          flyToCoords={flyToCoords}
          onSelectLocation={focusLocation}
          onToggleVisited={handleToggleVisited}
          onEditLocation={handleOpenEdit}
          onDeleteLocation={handleOpenDelete}
          isSelectingPoint={isSelectingPointOnMap}
          onPointSelected={handlePointSelectedOnMap}
          isDark={isDark}
        />
      </div>

      {/* Modals & Dialogs */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalInitialQuery('');
        }}
        onSave={handleSaveNewLocation}
        onStartMapSelection={handleStartMapSelection}
        selectedPointCoords={selectedPointCoords}
        initialQuery={addModalInitialQuery}
      />

      <EditLocationModal
        isOpen={isEditModalOpen}
        location={locationToEdit}
        onClose={() => {
          setIsEditModalOpen(false);
          setLocationToEdit(null);
        }}
        onSave={handleSaveEdit}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        location={locationToDelete}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setLocationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        locations={locations}
        stats={stats}
        onResetToInitial={() => {
          resetLocations();
          showToast('info', 'Dados padrão restaurados');
        }}
        onImportLocations={handleImportLocations}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => showToast('success', 'Bem-vindo ao Plott!', 'Sua sessão foi autenticada com sucesso.')}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSuccess={() => showToast('success', 'Perfil atualizado!')}
      />

      {/* Floating Notifications Toast System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default App;
