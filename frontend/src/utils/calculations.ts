/**
 * Geospatial and Oceanographic calculations for MARITRACE
 */

/**
 * Format coordinates as degrees with cardinal direction.
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}° ${latDir}, ${Math.abs(lon).toFixed(3)}° ${lonDir}`;
}

/**
 * Haversine distance between two points in kilometers.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Computes projected drift point given current position, current & wind vectors, and delta hours.
 * Ocean surface drift empirical rule:
 * Drift velocity = (100% surface current) + (3% wind speed along wind vector with Coriolis deflection)
 */
export function projectDrift(
  startLat: number,
  startLon: number,
  hours: number,
  currentSpeedKnots: number,
  currentDirDeg: number,
  windSpeedKnots: number,
  windDirDeg: number,
  isHindcast: boolean = false
): { lat: number; lon: number } {
  const sign = isHindcast ? -1 : 1;

  const currentKmH = currentSpeedKnots * 1.852;
  const windKmH = windSpeedKnots * 1.852 * 0.035;

  const currentRad = (currentDirDeg * Math.PI) / 180;
  const windRad = (windDirDeg * Math.PI) / 180;

  const dxKm = (currentKmH * Math.sin(currentRad) + windKmH * Math.sin(windRad)) * hours * sign;
  const dyKm = (currentKmH * Math.cos(currentRad) + windKmH * Math.cos(windRad)) * hours * sign;

  const dLat = dyKm / 111;
  const dLon = dxKm / (111 * Math.cos((startLat * Math.PI) / 180));

  return {
    lat: Math.round((startLat + dLat) * 1000) / 1000,
    lon: Math.round((startLon + dLon) * 1000) / 1000,
  };
}
