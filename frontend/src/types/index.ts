export interface IncidentData {
  id: string;
  name: string;
  status: 'UNDER_INVESTIGATION' | 'VERIFIED_SPILL' | 'MONITORING' | 'RESOLVED';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  detectionTime: string;
  satellitePlatform: string;
  sensor: string;
  resolutionMeters: number;
  latitude: number;
  longitude: number;
  locationName: string;
  spillAreaKm2: number;
  spillLengthKm: number;
  spillMaxWidthKm: number;
  orientation: string;
  confidence: number;
  oilProbability: number;
  lookalikeProbability: number;
  noOilProbability: number;
  probableOriginLat: number;
  probableOriginLon: number;
  originConfidence: number;
  estimatedSpillTime: string;
  candidateVesselsCount: number;
}

export interface VesselData {
  mmsi: string;
  name: string;
  type: string;
  flag: string;
  callSign: string;
  lengthMeters: number;
  beamMeters: number;
  currentLat: number;
  currentLon: number;
  speedKnots: number;
  courseDeg: number;
  headingDeg: number;
  firstSeen: string;
  lastSeen: string;
  closestApproachDistanceKm: number;
  closestApproachTime: string;
  proximityScore: number;
  timeScore: number;
  trajectoryScore: number;
  driftScore: number;
  anomalyScore: number;
  totalAssociationScore: number;
  associationCategory: 'High Association' | 'Medium Association' | 'Low Association' | 'Requires Investigation' | 'Low Probability';
  isCandidate: boolean;
  trajectory: Array<{
    lat: number;
    lon: number;
    timestamp: string;
    speed: number;
  }>;
  evidenceItems: string[];
  anomaliesDetected: string[];
}

export interface DriftVector {
  lat: number;
  lon: number;
  u: number;
  v: number;
  speedKnots: number;
  directionDeg: number;
}

export interface DriftSimulationConditions {
  currentSpeedKnots: number;
  currentDirectionDeg: number;
  windSpeedKnots: number;
  windDirectionDeg: number;
  simulationHours: number;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  level: 'critical' | 'warning' | 'info' | 'success';
  category: 'HIGH PRIORITY' | 'INVESTIGATION' | 'DRIFT UPDATE' | 'ANALYSIS COMPLETE';
  title: string;
  description: string;
  unread: boolean;
}

export type PageId =
  | 'landing'
  | 'dashboard'
  | 'satellite'
  | 'drift'
  | 'ais'
  | 'investigation'
  | 'reports'
  | 'about'
  | 'settings';