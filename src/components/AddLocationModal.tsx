import React, { useState, useEffect } from 'react';
import { LocationType, LocationItem, GeocodingResult } from '../types/location';
import { searchCountries, getCountryByCode } from '../data/countries';
import { searchNominatimPlaces } from '../services/geocodingService';
import { useDebounce } from '../hooks/useDebounce';
import {
  X,
  Globe,
  Building2,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  Sparkles,
  MousePointerClick,
  UtensilsCrossed,
  Filter,
} from 'lucide-react';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<LocationItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  onStartMapSelection: (tempState: { type: LocationType; name: string; countryCode: string; visited: boolean; notes: string }) => void;
  selectedPointCoords?: { lat: number; lng: number } | null;
  initialQuery?: string;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onStartMapSelection,
  selectedPointCoords,
  initialQuery = '',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<LocationType>('point');
  
  // Step 2 Form States
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('BR');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  
  const [placeSearch, setPlaceSearch] = useState<string>(initialQuery);
  const [placeResults, setPlaceResults] = useState<GeocodingResult[]>([]);
  const [isSearchingPlace, setIsSearchingPlace] = useState<boolean>(false);
  const debouncedPlaceQuery = useDebounce(placeSearch, 350);

  // Step 3 Details
  const [name, setName] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: -14.235, lng: -51.9253 });
  const [visited, setVisited] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Auto-search places/cities/restaurants via Nominatim with smart term decomposition
  useEffect(() => {
    async function fetchPlaces() {
      if (debouncedPlaceQuery.trim().length >= 2) {
        setIsSearchingPlace(true);
        const results = await searchNominatimPlaces(debouncedPlaceQuery, countryFilter);
        setPlaceResults(results);
        setIsSearchingPlace(false);
      } else {
        setPlaceResults([]);
      }
    }
    if (type === 'city' || type === 'point') {
      fetchPlaces();
    }
  }, [debouncedPlaceQuery, type, countryFilter]);

  // If point was selected on the map
  useEffect(() => {
    if (selectedPointCoords) {
      setCoordinates(selectedPointCoords);
      if (!name) {
        setName(`Ponto (${selectedPointCoords.lat.toFixed(2)}, ${selectedPointCoords.lng.toFixed(2)})`);
      }
      setStep(3);
    }
  }, [selectedPointCoords]);

  // Reset form on open
  useEffect(() => {
    if (isOpen && !selectedPointCoords) {
      setStep(initialQuery ? 2 : 1);
      setType(initialQuery ? 'point' : 'point');
      setCountrySearch('');
      setSelectedCountryCode('PT');
      setCountryFilter('ALL');
      setPlaceSearch(initialQuery || '');
      setName('');
      setCoordinates({ lat: 38.7223, lng: -9.1393 }); // Default to Lisbon / world
      setVisited(true);
      setNotes('');
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  // Filtered countries for step 2
  const filteredCountries = searchCountries(countrySearch);

  const handleSelectCountry = (code: string) => {
    const country = getCountryByCode(code);
    if (!country) return;
    setSelectedCountryCode(country.code);
    setName(country.namePt);
    setCoordinates({ lat: country.coordinates[0], lng: country.coordinates[1] });
    setStep(3);
  };

  const handleSelectPlace = (place: GeocodingResult) => {
    setName(place.name);
    setSelectedCountryCode(place.countryCode || 'PT');
    setCoordinates({ lat: place.lat, lng: place.lng });
    setStep(3);
  };

  const handleSelectPointDirectly = () => {
    onStartMapSelection({
      type: 'point',
      name: name || 'Ponto no mapa',
      countryCode: selectedCountryCode,
      visited,
      notes,
    });
  };

  const handleFinalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        type,
        name: name.trim(),
        countryCode: selectedCountryCode,
        coordinates,
        visited,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar local:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              Adicionar Novo Local
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Passo {step} de 3: {step === 1 ? 'Escolha o tipo' : step === 2 ? 'Busca mundial ou toque no mapa' : 'Defina os detalhes'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-teal-400 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* STEP 1: CHOOSE TYPE */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Que tipo de local você deseja adicionar ao seu passaporte?
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* Option 1: Ponto específico (Restaurante, Monumento, Praia, etc.) */}
                <button
                  type="button"
                  onClick={() => {
                    setType('point');
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-all text-left group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        Restaurante, Ponto Turístico ou Endereço
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Busque qualquer restaurante, café, monumento, hotel, praia ou toque direto no mapa.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Option 2: Cidade */}
                <button
                  type="button"
                  onClick={() => {
                    setType('city');
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-all text-left group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      Cidade ou Município
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Busque por qualquer cidade ou região do mundo com coordenadas automáticas.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Option 3: País */}
                <button
                  type="button"
                  onClick={() => {
                    setType('country');
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-all text-left group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      País Inteiro
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Selecione um país da lista de 195+ nações com bandeira e estatísticas oficiais.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATE */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Type: COUNTRY */}
              {type === 'country' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Escolha o país:
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Filtrar por nome ou código (ex: Portugal, Brasil, França)..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl p-1">
                    {filteredCountries.slice(0, 30).map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleSelectCountry(c.code)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{c.flag}</span>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                              {c.namePt}
                            </div>
                            <div className="text-xs text-slate-400">{c.name} • {c.continent}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type: POINT or CITY (Global Real-Time Search) */}
              {(type === 'point' || type === 'city') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {type === 'point'
                        ? 'Buscar qualquer local no mundo:'
                        : 'Buscar cidade no mundo:'}
                    </label>

                    {/* Quick country filter */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <Filter className="w-3 h-3 text-slate-400" />
                      <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        aria-label="Filtrar por país"
                      >
                        <option value="ALL">🌍 Todo o mundo</option>
                        <option value="PT">🇵🇹 Portugal</option>
                        <option value="BR">🇧🇷 Brasil</option>
                        <option value="ES">🇪🇸 Espanha</option>
                        <option value="FR">🇫🇷 França</option>
                        <option value="IT">🇮🇹 Itália</option>
                        <option value="US">🇺🇸 Estados Unidos</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={placeSearch}
                      onChange={(e) => setPlaceSearch(e.target.value)}
                      placeholder={
                        type === 'point'
                          ? 'Ex: Fiorella Lisboa, Pastéis de Belém, Belcanto, Ramiro...'
                          : 'Ex: Lisboa, Porto, Paris, Roma...'
                      }
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                      autoFocus
                    />
                    {isSearchingPlace && (
                      <Loader2 className="w-4 h-4 text-brand-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {/* Results list */}
                  <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl p-1 bg-white/50 dark:bg-slate-900/50">
                    {placeResults.length > 0 ? (
                      placeResults.map((res, i) => {
                        const country = getCountryByCode(res.countryCode);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectPlace(res)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-800 text-left transition-colors group border border-transparent hover:border-brand-200 dark:hover:border-brand-900"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl shrink-0">
                                {country?.flag || (type === 'point' ? '📍' : '🏙️')}
                              </span>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
                                  {res.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {res.country}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {res.lat.toFixed(2)}°, {res.lng.toFixed(2)}°
                            </span>
                          </button>
                        );
                      })
                    ) : placeSearch.length >= 2 && !isSearchingPlace ? (
                      <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                        <p>Nenhum resultado encontrado para "{placeSearch}".</p>
                        <p className="text-slate-400">
                          Dica: tente digitar apenas o nome principal (ex: "Fiorella") ou mude o filtro de país.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Digite o nome do restaurante, café, monumento ou cidade para buscar em todo o mundo.
                      </div>
                    )}
                  </div>

                  {/* Option to Click on Map for point */}
                  {type === 'point' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Prefere marcar visualmente?</span>
                      <button
                        type="button"
                        onClick={handleSelectPointDirectly}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <MousePointerClick className="w-3.5 h-3.5 text-brand-600" />
                        <span>Toque direto no mapa</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao tipo
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS & STATUS */}
          {step === 3 && (
            <form onSubmit={handleFinalSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Local *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Restaurante Fiorella, Torre Eiffel..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Type and Country Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Marcação
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LocationType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="point">Ponto / Restaurante / Atração</option>
                    <option value="city">Cidade</option>
                    <option value="country">País</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    País
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {searchCountries('').map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.namePt} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Segmented */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status da Viagem *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setVisited(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      visited
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Já visitei ✓</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisited(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      !visited
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Quero Visitar</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas / Memórias (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Prato favorito, ambiente agradável, melhor vinho..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Coordinates Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={coordinates.lat}
                    onChange={(e) => setCoordinates({ ...coordinates, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={coordinates.lng}
                    onChange={(e) => setCoordinates({ ...coordinates, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition-all"
                >
                  {isSaving ? 'Salvando...' : 'Salvar no Passaporte'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
