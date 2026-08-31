import { GeocodingResult } from '../types/location';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const PHOTON_BASE = 'https://photon.komoot.io';

/**
 * Busca no Nominatim/OpenStreetMap — ótimo para cidades, países, bairros.
 */
async function searchNominatim(
  query: string,
  countryCodeFilter?: string
): Promise<GeocodingResult[]> {
  const countryParam =
    countryCodeFilter && countryCodeFilter !== 'ALL'
      ? `&countrycodes=${encodeURIComponent(countryCodeFilter.toLowerCase())}`
      : '';

  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&accept-language=pt,en${countryParam}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any): GeocodingResult => {
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
      const road = address.road || address.pedestrian || address.neighbourhood || '';
      let locationSubtitle = country;
      if (city && city !== specificName) {
        locationSubtitle = road ? `${road}, ${city} • ${country}` : `${city} • ${country}`;
      } else if (road) {
        locationSubtitle = `${road} • ${country}`;
      }

      return {
        displayName: item.display_name,
        name: specificName,
        country: locationSubtitle,
        countryCode,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || item.class,
      };
    });
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Busca no Photon (Komoot) — muito superior para restaurantes, hotéis, cafés, lojas.
 * Suporta full-text e retorna POIs detalhados de toda a Europa e mundo.
 */
async function searchPhoton(
  query: string,
  countryCodeFilter?: string
): Promise<GeocodingResult[]> {
  const langParam = 'lang=pt';
  const limitParam = 'limit=8';
  const layersParam = 'osm_tag=place&osm_tag=amenity&osm_tag=tourism&osm_tag=historic&osm_tag=leisure&osm_tag=shop&osm_tag=natural';

  let url = `${PHOTON_BASE}/api/?q=${encodeURIComponent(query)}&${langParam}&${limitParam}&${layersParam}`;

  // Photon suporta filtro por país via bbox ou "location_bias" — usamos country code via osm_tag
  if (countryCodeFilter && countryCodeFilter !== 'ALL') {
    // Photon usa parâmetro de filtragem por country code indireto (não oficial mas funcional)
    url += `&osm_tag=country:${countryCodeFilter.toLowerCase()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data?.features || !Array.isArray(data.features)) return [];

    return data.features
      .filter((feature: any) => feature?.geometry?.coordinates && feature?.properties)
      .map((feature: any): GeocodingResult => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates; // [lng, lat]

        const name = props.name || props.street || props.city || 'Local';
        const city = props.city || props.town || props.village || props.state || '';
        const country = props.country || '';
        const countryCode = (props.countrycode || '').toUpperCase();
        const street = props.street || '';

        let locationSubtitle = country;
        if (city) {
          locationSubtitle = street ? `${street}, ${city} • ${country}` : `${city} • ${country}`;
        }

        // Detecta o tipo do local
        const osmValue = props.osm_value || props.type || '';
        const osmKey = props.osm_key || '';
        const typeLabel = osmValue || osmKey || 'place';

        return {
          displayName: [name, city, country].filter(Boolean).join(', '),
          name,
          country: locationSubtitle,
          countryCode,
          lat: coords[1],
          lng: coords[0],
          type: typeLabel,
        };
      });
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Deduplicação por proximidade de coordenadas (< 100m de distância = mesmo local).
 */
function deduplicateByProximity(results: GeocodingResult[]): GeocodingResult[] {
  const deduplicated: GeocodingResult[] = [];
  const THRESHOLD = 0.001; // ~100m em graus decimais

  for (const result of results) {
    const isDuplicate = deduplicated.some(
      (existing) =>
        Math.abs(existing.lat - result.lat) < THRESHOLD &&
        Math.abs(existing.lng - result.lng) < THRESHOLD &&
        existing.name.toLowerCase().trim() === result.name.toLowerCase().trim()
    );
    if (!isDuplicate) {
      deduplicated.push(result);
    }
  }
  return deduplicated;
}

/**
 * Ordenação inteligente: prioriza resultados cujo nome começa com a consulta.
 */
function smartSort(results: GeocodingResult[], query: string): GeocodingResult[] {
  const qLower = query.toLowerCase().trim();
  return [...results].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aStartsWith = aName.startsWith(qLower) ? 0 : aName.includes(qLower) ? 1 : 2;
    const bStartsWith = bName.startsWith(qLower) ? 0 : bName.includes(qLower) ? 1 : 2;
    return aStartsWith - bStartsWith;
  });
}

/**
 * Busca principal: dispara Nominatim + Photon em paralelo e combina os resultados.
 * Garante cobertura muito maior para POIs (restaurantes, hotéis, museus, praias, lojas...).
 */
export async function searchNominatimPlaces(
  query: string,
  countryCodeFilter?: string
): Promise<GeocodingResult[]> {
  const rawQuery = query.trim();
  if (rawQuery.length < 2) return [];

  // Gera variações removendo termos descritivos comuns
  const stripped = rawQuery
    .replace(
      /\b(italian|french|japanese|chinese|brazilian|greek|mexican|indian|thai|spanish|portuguese)\s+(restaurant|ristorante|restaurante|cuisine|food)\b/gi,
      ''
    )
    .replace(
      /\b(restaurant|restaurante|ristorante|hotel|cafe|café|bar|pizzaria|pizzeria|bistrô|bistro|hostel|pousada)\b/gi,
      ''
    )
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Busca em paralelo: consulta original (Nominatim + Photon) + consulta simplificada (Photon)
  const searches: Promise<GeocodingResult[]>[] = [
    searchNominatim(rawQuery, countryCodeFilter),
    searchPhoton(rawQuery, countryCodeFilter),
  ];

  if (stripped.length >= 2 && stripped.toLowerCase() !== rawQuery.toLowerCase()) {
    searches.push(searchPhoton(stripped, countryCodeFilter));
    searches.push(searchNominatim(stripped, countryCodeFilter));
  }

  const allSettled = await Promise.allSettled(searches);
  const combined: GeocodingResult[] = [];

  for (const settled of allSettled) {
    if (settled.status === 'fulfilled' && Array.isArray(settled.value)) {
      combined.push(...settled.value);
    }
  }

  // Filtra por país quando selecionado
  let filtered = combined;
  if (countryCodeFilter && countryCodeFilter !== 'ALL') {
    const ccLower = countryCodeFilter.toLowerCase();
    filtered = combined.filter(
      (r) =>
        !r.countryCode ||
        r.countryCode.toLowerCase() === ccLower ||
        r.country.toLowerCase().includes(ccLower)
    );
    // Se o filtro de país não retornou nada, usa todos os resultados sem filtrar
    if (filtered.length === 0) {
      filtered = combined;
    }
  }

  const deduped = deduplicateByProximity(filtered);
  const sorted = smartSort(deduped, rawQuery);
  return sorted.slice(0, 15);
}

/**
 * Busca especificamente cidades (alias para compatibilidade).
 */
export async function searchNominatimCities(query: string): Promise<GeocodingResult[]> {
  return searchNominatimPlaces(query);
}

/**
 * Geocodificação reversa: obtém informações a partir de coordenadas lat/lng.
 */
export async function reverseGeocodeNominatim(lat: number, lng: number): Promise<GeocodingResult | null> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt,en`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
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
      name,
      country: city ? `${city}, ${country}` : country,
      countryCode,
      lat,
      lng,
    };
  } catch {
    return null;
  }
}
