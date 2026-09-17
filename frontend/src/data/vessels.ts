// frontend/src/data/vessels.ts
import { VesselData, IncidentData } from '../types';
import { haversineDistance } from '../utils/calculations';

// Helper to generate deterministic pseudo‑random numbers
function seededRandom(seed: number) {
  return function(min: number, max: number) {
    const x = Math.sin(seed * 127.1 + 43758.5453123) * 43758.5453123;
    return min + (x - Math.floor(x)) * (max - min);
  };
}

/**
 * Generate a list of vessels for a given incident (location).
 * Uses the incident ID as a seed so the same location always produces the same vessels.
 */
export function generateVesselsForLocation(incident: IncidentData): VesselData[] {
  // Use incident ID to seed the random generator
  const seed = parseInt(incident.id.split('-').pop() || '0') || 1;
  const rand = seededRandom(seed);

  // Base vessel info (will be assigned to each vessel)
  const vesselNames = ['MV Ocean Star', 'Sea Pioneer', 'Blue Horizon', 'Pacific Leader', 'Al-Mirqab Express', 'Golden Trident', 'Neptune Trader'];
  const types = ['Crude Oil Tanker', 'Chemical Tanker', 'Bulk Carrier', 'Container Ship', 'LPG Tanker', 'Bulk Carrier', 'General Cargo'];
  const flags = ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Qatar', 'Cyprus', 'United Kingdom'];
  const mmsis = ['123456789', '987654321', '456789123', '334198274', '412589012', '563412987', '235198004'];
  const callsigns = ['3E2910', 'A8QK4', 'V7XQ2', '9V8812', 'A7BD3', '5B789', '2HUK7'];

  const baseLat = incident.probableOriginLat;
  const baseLon = incident.probableOriginLon;
  const orientation = parseFloat(incident.orientation.split('(')[1]?.replace('°', '')) || 234;
  const spillTime = incident.estimatedSpillTime || '2026-09-14T11:45:00Z';

  const vessels: VesselData[] = [];

  for (let i = 0; i < 7; i++) {
    const off = i * 1000;
    const course = 180 + rand(0, 90, off);
    const speed = 8 + rand(0, 8, off + 1);
    const distKm = 5 + rand(0, 35, off + 2);
    const timeOffsetMinutes = -30 + rand(0, 60, off + 3);

    // Build trajectory – 5 points over ±60 minutes
    const trajectoryPoints = [];
    const times = [-60, -30, 0, 30, 60].map(t => t + timeOffsetMinutes);
    for (let j = 0; j < times.length; j++) {
      const t = times[j];
      const rad = course * Math.PI / 180;
      const distFactor = (j / (times.length - 1)) * 2 - 1;
      const dist = distKm * (1 + distFactor * 0.5);
      const lat = baseLat + (dist * Math.cos(rad) / 111);
      const lon = baseLon + (dist * Math.sin(rad) / (111 * Math.cos(baseLat * Math.PI / 180)));
      const timestamp = new Date(Date.parse(spillTime) + t * 60000).toISOString();
      trajectoryPoints.push({
        lat,
        lon,
        timestamp,
        speed: speed + (j - 2) * 0.5,
      });
    }

    // Calculate closest approach to origin
    const distances = trajectoryPoints.map(p => haversineDistance(baseLat, baseLon, p.lat, p.lon));
    const minDist = Math.min(...distances);
    const closestIdx = distances.indexOf(minDist);
    const closestTime = trajectoryPoints[closestIdx].timestamp;

    // Compute score components
    const spatial = 100 * Math.exp(-minDist / 20);
    const temporal = 100 * Math.exp(-Math.abs(timeOffsetMinutes) / 30);
    const courseDiff = Math.abs(course - orientation);
    const trajectory = 100 * (1 - Math.min(courseDiff, 360 - courseDiff) / 180);
    const drift = 50 + rand(0, 40, off + 4);
    const anomaly = 50 + rand(0, 40, off + 5);
    const total = 0.30 * spatial + 0.25 * temporal + 0.25 * trajectory + 0.10 * drift + 0.10 * anomaly;

    const vessel: VesselData = {
      mmsi: mmsis[i],
      name: vesselNames[i],
      type: types[i],
      flag: flags[i],
      callSign: callsigns[i],
      lengthMeters: 150 + rand(0, 100, off + 6),
      beamMeters: 20 + rand(0, 15, off + 7),
      currentLat: trajectoryPoints[trajectoryPoints.length - 1].lat,
      currentLon: trajectoryPoints[trajectoryPoints.length - 1].lon,
      speedKnots: speed,
      courseDeg: course,
      headingDeg: course,
      firstSeen: trajectoryPoints[0].timestamp,
      lastSeen: trajectoryPoints[trajectoryPoints.length - 1].timestamp,
      closestApproachDistanceKm: parseFloat(minDist.toFixed(1)),
      closestApproachTime: closestTime,
      proximityScore: Math.round(spatial),
      timeScore: Math.round(temporal),
      trajectoryScore: Math.round(trajectory),
      driftScore: Math.round(drift),
      anomalyScore: Math.round(anomaly),
      totalAssociationScore: Math.round(total),
      associationCategory: total >= 85 ? 'High Association' : total >= 70 ? 'Medium Association' : total >= 50 ? 'Requires Investigation' : total >= 30 ? 'Low Association' : 'Low Probability',
      isCandidate: true,
      trajectory: trajectoryPoints.map(p => ({ lat: p.lat, lon: p.lon, timestamp: p.timestamp, speed: p.speed })),
      evidenceItems: [
        `Passed within ${minDist.toFixed(1)} km of origin (${baseLat.toFixed(3)}°N, ${baseLon.toFixed(3)}°E)`,
        `Timing overlaps release window (${spillTime.slice(11, 16)} UTC)`,
        `AIS trajectory intersects drift envelope`,
        `Course aligns with spill axis (${course}° vs ${orientation}°)`,
        `Speed variation detected (${(speed - 2).toFixed(1)} → ${(speed + 2).toFixed(1)} kt)`,
      ],
      anomaliesDetected: [
        `Speed fluctuation at ${closestTime.slice(11, 16)} UTC`,
        `Course deviation from typical route`,
      ],
    };
    vessels.push(vessel);
  }

  // Sort by total score descending
  vessels.sort((a, b) => b.totalAssociationScore - a.totalAssociationScore);
  return vessels;
}

/**
 * Fallback static vessels (used when API fails or no data).
 * They correspond to the Mumbai incident (MR-2026-0147).
 */
export const mockVessels: VesselData[] = generateVesselsForLocation({
  id: 'MR-2026-0147',
  name: 'Arabian Sea Corridor Spill Event',
  status: 'UNDER_INVESTIGATION',
  severity: 'HIGH',
  detectionTime: '2026-09-14T14:20:00Z',
  satellitePlatform: 'Sentinel-1B SAR',
  sensor: 'C-Band IW',
  resolutionMeters: 10,
  latitude: 18.718,
  longitude: 72.934,
  locationName: 'Mumbai Offshore, Arabian Sea (EEZ)',
  spillAreaKm2: 42.7,
  spillLengthKm: 14.8,
  spillMaxWidthKm: 4.2,
  orientation: 'NE → SW (234°)',
  confidence: 94.2,
  oilProbability: 94.2,
  lookalikeProbability: 3.8,
  noOilProbability: 2.0,
  probableOriginLat: 18.642,
  probableOriginLon: 72.841,
  originConfidence: 87.4,
  estimatedSpillTime: '2026-09-14T11:45:00Z',
  candidateVesselsCount: 7,
});