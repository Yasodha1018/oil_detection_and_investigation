import { DriftSimulationConditions } from '../types';

export const baselineDriftConditions: DriftSimulationConditions = {
  currentSpeedKnots: 1.4,
  currentDirectionDeg: 52,
  windSpeedKnots: 14.5,
  windDirectionDeg: 45,
  simulationHours: 24,
};

export const hindcastTrajectory = [
  { hoursAgo: 0, lat: 18.718, lon: 72.934, label: 'Detected Slick (14:20 UTC)', confidence: 94.2 },
  { hoursAgo: 1, lat: 18.692, lon: 72.901, label: '-1 hr (13:20 UTC)', confidence: 92.0 },
  { hoursAgo: 2, lat: 18.665, lon: 72.868, label: '-2 hr (12:20 UTC)', confidence: 89.5 },
  { hoursAgo: 2.6, lat: 18.642, lon: 72.841, label: 'Probable Origin Zone (11:45 UTC)', confidence: 87.4, isOrigin: true },
];

export const forecastIntervals = [
  { hoursAhead: 0, label: 'Current (0h)', lat: 18.718, lon: 72.934, areaKm2: 42.7, spreadFactor: 1.0 },
  { hoursAhead: 6, label: '+6 Hours', lat: 18.752, lon: 72.975, areaKm2: 56.4, spreadFactor: 1.32 },
  { hoursAhead: 12, label: '+12 Hours', lat: 18.788, lon: 73.018, areaKm2: 74.1, spreadFactor: 1.73 },
  { hoursAhead: 24, label: '+24 Hours', lat: 18.845, lon: 73.085, areaKm2: 108.5, spreadFactor: 2.54, shorelineAlert: 'Alibaug Coastline Proximity' },
  { hoursAhead: 48, label: '+48 Hours', lat: 18.910, lon: 73.160, areaKm2: 162.0, spreadFactor: 3.79, shorelineAlert: 'Critical: Mumbai Harbor Entrance Buffer' },
];

export const oceanCurrentGrid = [
  { lat: 18.60, lon: 72.75, u: 0.55, v: 0.62, speedKnots: 1.3, directionDeg: 50 },
  { lat: 18.65, lon: 72.85, u: 0.60, v: 0.70, speedKnots: 1.5, directionDeg: 53 },
  { lat: 18.70, lon: 72.95, u: 0.58, v: 0.65, speedKnots: 1.4, directionDeg: 51 },
  { lat: 18.75, lon: 72.80, u: 0.52, v: 0.60, speedKnots: 1.2, directionDeg: 49 },
  { lat: 18.80, lon: 72.90, u: 0.56, v: 0.68, speedKnots: 1.4, directionDeg: 52 },
];

export const windVectorsGrid = [
  { lat: 18.58, lon: 72.80, speedKnots: 14.8, directionDeg: 45 },
  { lat: 18.68, lon: 72.88, speedKnots: 14.5, directionDeg: 46 },
  { lat: 18.78, lon: 72.98, speedKnots: 14.2, directionDeg: 44 },
  { lat: 18.62, lon: 72.96, speedKnots: 15.0, directionDeg: 47 },
];