import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  flyToCoords: { lat: number; lng: number; zoom?: number } | null;
}

export const MapController: React.FC<MapControllerProps> = ({ flyToCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (flyToCoords) {
      const zoom = flyToCoords.zoom || (map.getZoom() < 7 ? 8 : map.getZoom());
      map.flyTo([flyToCoords.lat, flyToCoords.lng], zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [flyToCoords, map]);

  return null;
};
