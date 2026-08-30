export type LocationType = 'country' | 'city' | 'point';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationItem {
  id: string;
  type: LocationType;
  name: string;
  countryCode: string; // ISO 2 letters (ex: BR, FR, US, JP)
  coordinates: Coordinates;
  visited: boolean;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  
  // Campos opcionais previstos para extensões futuras
  visitDate?: string;
  notes?: string;
  photoUrl?: string;
}

export interface CountryData {
  code: string;
  name: string;
  namePt: string;
  flag: string;
  coordinates: [number, number]; // [lat, lng]
  continent: string;
}

export type FilterStatus = 'all' | 'visited' | 'unvisited';
export type FilterType = 'all' | LocationType;
export type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'status';

export interface GeocodingResult {
  displayName: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  type?: string;
}
