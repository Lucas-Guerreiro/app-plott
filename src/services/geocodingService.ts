import { GeocodingResult } from '../types/location';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Busca qualquer local do mundo (cidades, restaurantes, monumentos, praias, museus, etc.)
 * com suporte a decomposição inteligente de consultas (ex: "Fiorella Italian Restaurant" -> acha "Fiorella" em Lisboa/Portugal).
 */
export async function searchNominatimPlaces(
  query: string,
  countryCodeFilter?: string
): Promise<GeocodingResult[]> {
  const rawQuery = query.trim();
  if (rawQuery.length < 2) {
    return [];
  }

  const results: GeocodingResult[] = [];
  const seenIds = new Set<string>();

  // Cria variações da consulta para lidar com descritores como "Italian Restaurant", "Restaurante", etc.
  const queriesToTry = [rawQuery];

  // Remove termos descritivos comuns de estabelecimentos em vários idiomas
  const stripped = rawQuery
    .replace(
      /\b(italian\s+restaurant|italian\s+ristorante|restaurant|restaurante|ristorante|hotel|cafe|café|bar|pizzaria|pizzeria|bistrô|bistro)\b/gi,
      ''
    )
    .trim();

  if (stripped.length >= 2 && stripped.toLowerCase() !== rawQuery.toLowerCase()) {
    queriesToTry.push(stripped);
  }

  for (const q of queriesToTry) {
    try {
      const countryParam = countryCodeFilter && countryCodeFilter !== 'ALL'
        ? `&countrycodes=${encodeURIComponent(countryCodeFilter.toLowerCase())}`
        : '';

      const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(
        q
      )}&format=json&addressdetails=1&limit=10&accept-language=pt,en${countryParam}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const id = `${item.osm_type || 'osm'}-${item.osm_id || item.place_id || item.lat}`;
            if (!seenIds.has(id)) {
              seenIds.add(id);

              const address = item.address || {};
              const specificName =
                item.name ||
                address.restaurant ||
                address.cafe ||
                address.amenity ||
                address.tourism ||
                address.historic ||
                address.attraction ||
                address.museum ||
                address.hotel ||
                address.leisure ||
                address.road ||
                address.city ||
                address.town ||
                address.village ||
                item.display_name.split(',')[0].trim();

              const city =
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                address.suburb ||
                address.city_district ||
                address.state ||
                '';

              const country = address.country || '';
              const countryCode = (address.country_code || '').toUpperCase();

              // Formata subtítulo descritivo com endereço e cidade
              const road = address.road || address.pedestrian || address.neighbourhood || '';
              let locationSubtitle = country;
              if (city && city !== specificName) {
                locationSubtitle = road ? `${road}, ${city} • ${country}` : `${city} • ${country}`;
              } else if (road) {
                locationSubtitle = `${road} • ${country}`;
              }

              results.push({
                displayName: item.display_name,
                name: specificName,
                country: locationSubtitle,
                countryCode: countryCode,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                type: item.type || item.class,
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('Busca no Nominatim falhou ou sofreu timeout:', error);
    }
  }

  // Ordenação inteligente: se o usuário digitou nome de país/cidade ou filtrou, prioriza
  const qLower = rawQuery.toLowerCase();
  results.sort((a, b) => {
    const aMatch = a.country.toLowerCase().includes(qLower) || a.name.toLowerCase().includes(qLower);
    const bMatch = b.country.toLowerCase().includes(qLower) || b.name.toLowerCase().includes(qLower);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return results;
}

/**
 * Busca especificamente cidades usando Nominatim.
 */
export async function searchNominatimCities(query: string): Promise<GeocodingResult[]> {
  return searchNominatimPlaces(query);
}

/**
 * Geocodificação reversa: obtém informações do local a partir de coordenadas lat/lng
 */
export async function reverseGeocodeNominatim(lat: number, lng: number): Promise<GeocodingResult | null> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt,en`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const item = await response.json();
    if (!item || item.error) return null;

    const address = item.address || {};
    const name =
      item.name ||
      address.restaurant ||
      address.cafe ||
      address.tourism ||
      address.amenity ||
      address.historic ||
      address.leisure ||
      address.attraction ||
      address.road ||
      address.suburb ||
      address.city ||
      address.town ||
      address.village ||
      'Ponto no mapa';

    const city = address.city || address.town || address.village || address.municipality || '';
    const country = address.country || '';
    const countryCode = (address.country_code || '').toUpperCase();

    return {
      displayName: item.display_name || 'Ponto selecionado',
      name: name,
      country: city ? `${city}, ${country}` : country,
      countryCode: countryCode,
      lat: lat,
      lng: lng,
    };
  } catch (error) {
    console.warn('Geocodificação reversa falhou:', error);
    return null;
  }
}
