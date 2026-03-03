/**
 * Geo utilities for bounding box and Haversine distance.
 */

const MILES_PER_DEG_LAT = 69;
const EARTH_RADIUS_MILES = 3959;

/**
 * Compute bounding box (lat/lng range) for a center point and radius in miles.
 * Approximate: 1° lat ≈ 69 mi; 1° lng ≈ 69 * cos(lat) mi.
 */
export function boundingBox(
  centerLat: number,
  centerLng: number,
  radiusMiles: number
): {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
} {
  const deltaLat = radiusMiles / MILES_PER_DEG_LAT;
  const deltaLng =
    radiusMiles / (MILES_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180));
  return {
    latMin: centerLat - deltaLat,
    latMax: centerLat + deltaLat,
    lngMin: centerLng - deltaLng,
    lngMax: centerLng + deltaLng,
  };
}

/**
 * Haversine distance in miles between two points.
 */
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}
