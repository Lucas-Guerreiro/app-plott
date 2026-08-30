import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import { LocationItem } from '../types/location';
import { getCountryByCode } from '../data/countries';
import { MapClickSelector } from './MapClickSelector';
import { MapController } from './MapController';
import {
  CheckCircle2,
  Bookmark,
  Pencil,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
} from 'lucide-react';

interface MapViewProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  flyToCoords: { lat: number; lng: number; zoom?: number } | null;
  onSelectLocation: (loc: LocationItem) => void;
  onToggleVisited: (id: string) => void;
  onEditLocation: (loc: LocationItem) => void;
  onDeleteLocation: (loc: LocationItem) => void;
  isSelectingPoint: boolean;
  onPointSelected: (coords: { lat: number; lng: number }) => void;
  isDark: boolean;
}

/**
 * Cria ícone visual SVG customizado e responsivo para o Leaflet.
 */
function createCustomPinIcon(item: LocationItem, isSelected: boolean) {
  const isVisited = item.visited;
  const pinColor = isVisited ? '#059669' : '#4f46e5';
  const ringColor = isVisited ? '#10b981' : '#6366f1';

  const typeIconSvg =
    item.type === 'country'
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
      : item.type === 'city'
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line></svg>`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

  const badgeIconSvg = isVisited
    ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

  const pulseEffect = isSelected
    ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-75 bg-brand-500 pointer-events-none"></div>`
    : '';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group select-none">
      ${pulseEffect}
      <div style="
        background: radial-gradient(circle at 30% 30%, ${ringColor}, ${pinColor});
        width: ${isSelected ? '38px' : '32px'};
        height: ${isSelected ? '38px' : '32px'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.2s, height 0.2s;
      " class="hover:scale-110">
        <div style="
          transform: rotate(45deg);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        ">
          ${typeIconSvg}
        </div>
      </div>
      <div style="
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: ${isVisited ? '#059669' : '#4f46e5'};
        border: 1.5px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      ">
        ${badgeIconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-map-pin',
    iconSize: isSelected ? [38, 38] : [32, 32],
    iconAnchor: isSelected ? [19, 38] : [16, 32],
    popupAnchor: [0, -34],
    tooltipAnchor: [0, -32],
  });
}

export const MapView: React.FC<MapViewProps> = ({
  locations,
  selectedLocation,
  flyToCoords,
  onSelectLocation,
  onToggleVisited,
  onEditLocation,
  onDeleteLocation,
  isSelectingPoint,
  onPointSelected,
  isDark,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const resetToWorld = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([20, 0], 2.2, { duration: 1.5 });
    }
  };

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="relative flex-1 h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-900">
      {/* Map selecting point banner */}
      {isSelectingPoint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-brand-600 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce border-2 border-white/50 backdrop-blur-md">
          <MapPin className="w-5 h-5 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            Clique no mapa para fixar as coordenadas do local!
          </span>
        </div>
      )}

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col">
          <button
            onClick={zoomIn}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors border-b border-slate-200/60 dark:border-slate-800/60"
            title="Aproximar zoom"
            aria-label="Aproximar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="Afastar zoom"
            aria-label="Afastar zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={resetToWorld}
          className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          title="Ver mapa-múndi completo"
          aria-label="Ver mapa-múndi"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2.5}
        minZoom={2}
        maxZoom={18}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={0.8}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />

        <MapController flyToCoords={flyToCoords} />
        <MapClickSelector
          isSelectingPoint={isSelectingPoint}
          onPointSelected={onPointSelected}
        />

        {locations.map((item) => {
          const isSelected = selectedLocation?.id === item.id;
          const icon = createCustomPinIcon(item, isSelected);
          const country = getCountryByCode(item.countryCode);
          const flag = country?.flag || '📍';
          const countryName = country?.namePt || item.countryCode;

          return (
            <Marker
              key={item.id}
              position={[item.coordinates.lat, item.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectLocation(item),
              }}
            >
              {/* Tooltip on Hover */}
              <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>{flag}</span>
                  <span>{item.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      item.visited ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {item.visited ? 'Visitado' : 'Quero ir'}
                  </span>
                </div>
              </Tooltip>

              {/* Rich Popup on Click */}
              <Popup className="custom-leaflet-popup" minWidth={260}>
                <div className="p-1 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        {flag}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {countryName} • {item.type === 'country' ? 'País' : item.type === 'city' ? 'Cidade' : 'Ponto'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg italic border border-slate-100 dark:border-slate-700">
                      "{item.notes}"
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 font-mono">
                    Coord: {item.coordinates.lat.toFixed(4)}°, {item.coordinates.lng.toFixed(4)}°
                  </div>

                  {/* Actions in Popup */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleVisited(item.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        item.visited
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {item.visited ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Visitado ✓</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Marcar Visitado</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditLocation(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLocation(item)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
