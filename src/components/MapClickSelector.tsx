import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

interface MapClickSelectorProps {
  isSelectingPoint: boolean;
  onPointSelected: (coords: { lat: number; lng: number }) => void;
}

export const MapClickSelector: React.FC<MapClickSelectorProps> = ({
  isSelectingPoint,
  onPointSelected,
}) => {
  const map = useMapEvents({
    click(e: LeafletMouseEvent) {
      if (isSelectingPoint) {
        onPointSelected({
          lat: parseFloat(e.latlng.lat.toFixed(5)),
          lng: parseFloat(e.latlng.lng.toFixed(5)),
        });
      }
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    if (isSelectingPoint) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }
  }, [isSelectingPoint, map]);

  return null;
};
