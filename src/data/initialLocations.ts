import { LocationItem } from '../types/location';

export const INITIAL_LOCATIONS: LocationItem[] = [
  {
    id: 'loc-1',
    type: 'country',
    name: 'Brasil',
    countryCode: 'BR',
    coordinates: { lat: -14.235, lng: -51.9253 },
    visited: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    notes: 'País de origem e viagens incríveis!'
  },
  {
    id: 'loc-2',
    type: 'city',
    name: 'Paris',
    countryCode: 'FR',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    visited: true,
    createdAt: '2024-03-20T14:30:00.000Z',
    updatedAt: '2024-03-20T14:30:00.000Z',
    notes: 'Cidade Luz, visita à Torre Eiffel e Museu do Louvre.'
  },
  {
    id: 'loc-3',
    type: 'point',
    name: 'Cristo Redentor (Rio de Janeiro)',
    countryCode: 'BR',
    coordinates: { lat: -22.9519, lng: -43.2105 },
    visited: true,
    createdAt: '2024-02-10T16:00:00.000Z',
    updatedAt: '2024-02-10T16:00:00.000Z',
    notes: 'Uma das 7 maravilhas do mundo moderno.'
  },
  {
    id: 'loc-4',
    type: 'city',
    name: 'Tóquio',
    countryCode: 'JP',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    visited: false,
    createdAt: '2024-04-05T09:00:00.000Z',
    updatedAt: '2024-04-05T09:00:00.000Z',
    notes: 'Sonho de viagem: tecnologia, culinária e templos históricos.'
  },
  {
    id: 'loc-5',
    type: 'point',
    name: 'Machu Picchu',
    countryCode: 'PE',
    coordinates: { lat: -13.1631, lng: -72.545 },
    visited: false,
    createdAt: '2024-05-12T11:20:00.000Z',
    updatedAt: '2024-05-12T11:20:00.000Z',
    notes: 'Trilha Inca planejada para as próximas férias.'
  },
  {
    id: 'loc-6',
    type: 'country',
    name: 'Itália',
    countryCode: 'IT',
    coordinates: { lat: 41.8719, lng: 12.5674 },
    visited: true,
    createdAt: '2024-02-28T08:15:00.000Z',
    updatedAt: '2024-02-28T08:15:00.000Z',
    notes: 'Gastronomia espetacular, arte renascentista e história.'
  }
];
