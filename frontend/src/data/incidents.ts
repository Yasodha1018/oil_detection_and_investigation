import { IncidentData } from '../types';

export const activeIncident: IncidentData = {
  id: 'MR-2026-0147', // you can change this to a real incident ID
  name: 'Arabian Sea Crude Oil Slick (Mumbai Coast)',
  status: 'UNDER_INVESTIGATION',
  severity: 'HIGH',
  detectionTime: '2026-09-07T14:20:00Z', // real Sentinel-1 pass time (from your data)
  satellitePlatform: 'Sentinel-1B SAR',
  sensor: 'C-Band IW',
  resolutionMeters: 10,
  latitude: 18.718,
  longitude: 72.934, // real coordinates from Sentinel-1 scene
  locationName: 'Mumbai Offshore Shipping Channel, Arabian Sea (EEZ)',
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
  estimatedSpillTime: '2026-09-07T11:45:00Z',
  candidateVesselsCount: 7,
};

export const sampleSARImageData = {
  satellite: 'ESA Sentinel-1B SAR IW',
  passType: 'Descending',
  polarization: 'VV + VH',
  incidentAngle: '34.2°',
  windSpeedAtPass: '14.2 knots (7.3 m/s)',
  waveHeight: '1.2 m',
  spillShape: 'Linear plume with trailing sheen',
  slickPerimeterKm: 38.6,
  estimatedThicknessUm: '0.1 - 50 µm (Heavy crude sheen)',
};

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    timestamp: '10 mins ago',
    level: 'critical',
    category: 'HIGH PRIORITY',
    title: 'High Association Match Detected',
    description: 'MT New Confidence (MMSI 636021942) scored 89% correlation with spill origin #MR-2026-0147.',
    unread: false,
  },
  {
    id: 'n-2',
    timestamp: '25 mins ago',
    level: 'info',
    category: 'INVESTIGATION',
    title: 'New Satellite Swath Ingested',
    description: 'Sentinel-1B IW descending pass processed over Mumbai shipping approaches.',
    unread: false,
  },
  {
    id: 'n-3',
    timestamp: '45 mins ago',
    level: 'info',
    category: 'DRIFT UPDATE',
    title: 'Drift Hindcast Simulation Complete',
    description: 'Coupled hydrodynamic Lagrangian hindcast localized origin at 18.642° N, 72.841° E.',
    unread: true,
  },
  {
    id: 'n-4',
    timestamp: '1 hour ago',
    level: 'info',
    category: 'ANALYSIS COMPLETE',
    title: 'AIS Vessel Corridor Query',
    description: '7 candidate vessels isolated within 50 km surveillance radius across discharge window.',
    unread: true,
  },
];