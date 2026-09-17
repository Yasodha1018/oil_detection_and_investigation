import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Crosshair,
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  Ship,
  Waves,
  Wind,
} from 'lucide-react';
import { IncidentData, VesselData } from '../types';
import { hindcastTrajectory, forecastIntervals, oceanCurrentGrid, windVectorsGrid } from '../data/drift';

interface MapViewProps {
  incident: IncidentData;
  vessels: VesselData[];
  selectedVessel?: VesselData | null;
  onSelectVessel?: (vessel: VesselData) => void;
  showForecast?: boolean;
  forecastHour?: number;
  highlightHindcast?: boolean;
  heightClass?: string;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  mapType?: 'dark' | 'satellite';
}

// Fallback center (Mumbai) – used if incident coordinates are invalid
const FALLBACK_CENTER: [number, number] = [18.68, 72.82];

export const MapView: React.FC<MapViewProps> = ({
  incident,
  vessels,
  selectedVessel,
  onSelectVessel,
  showForecast = false,
  forecastHour = 0,
  highlightHindcast = true,
  heightClass = 'h-[520px]',
  className = '',
  initialCenter,
  initialZoom = 10,
  mapType = 'satellite',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});

  const [layers, setLayers] = useState({
    spill: true,
    origin: true,
    vessels: true,
    trajectories: true,
    drift: true,
    wind: false,
    current: true,
    boundary: true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState<'dark' | 'satellite'>(mapType);

  // ----- SAFE COORDINATE EXTRACTION -----
  const getSafeCenter = (): [number, number] => {
    // 1. Use provided initialCenter if it's valid
    if (
      initialCenter &&
      typeof initialCenter[0] === 'number' &&
      typeof initialCenter[1] === 'number' &&
      !isNaN(initialCenter[0]) &&
      !isNaN(initialCenter[1])
    ) {
      return initialCenter;
    }
    // 2. Try incident coordinates
    if (
      incident &&
      typeof incident.latitude === 'number' &&
      typeof incident.longitude === 'number' &&
      !isNaN(incident.latitude) &&
      !isNaN(incident.longitude)
    ) {
      return [incident.latitude, incident.longitude];
    }
    // 3. Final fallback
    return FALLBACK_CENTER;
  };

  const center = getSafeCenter();

  // ----- INITIALIZE MAP -----
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    const tileUrl =
      currentMapType === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    L.tileLayer(tileUrl, { maxZoom: 18, subdomains: 'abcd' }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    const groups = ['spill', 'origin', 'vessels', 'trajectories', 'drift', 'wind', 'current', 'boundary'];
    groups.forEach((name) => {
      const group = L.layerGroup().addTo(map);
      layerGroupsRef.current[name] = group;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], initialZoom, currentMapType]);

  // Update tile layer on map type change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    const tileUrl =
      currentMapType === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    L.tileLayer(tileUrl, { maxZoom: 18, subdomains: 'abcd' }).addTo(map);
  }, [currentMapType]);

  // ----- RENDER MAP LAYERS (Spill, Origin, Vessels, etc.) -----
  useEffect(() => {
    const map = mapInstanceRef.current;
    const groups = layerGroupsRef.current;
    if (!map || !groups.spill || !incident) return;

    // Clear all layers
    Object.values(groups).forEach((g) => g.clearLayers());

    // 1. Boundary (50 km)
    if (layers.boundary && groups.boundary && incident.probableOriginLat && incident.probableOriginLon) {
      L.circle([incident.probableOriginLat, incident.probableOriginLon], {
        radius: 50000,
        color: '#1F90DF',
        weight: 1.5,
        dashArray: '6,8',
        fillColor: '#1F90DF',
        fillOpacity: 0.05,
      }).addTo(groups.boundary);
    }

    // 2. Spill polygon
    if (layers.spill && groups.spill) {
      const spillCoords: [number, number][] = [
        [18.750, 72.965],
        [18.742, 72.975],
        [18.725, 72.955],
        [18.705, 72.930],
        [18.685, 72.905],
        [18.692, 72.890],
        [18.715, 72.915],
        [18.735, 72.945],
      ];
      L.polygon(spillCoords, {
        color: '#f43f5e',
        weight: 2,
        fillColor: '#e11d48',
        fillOpacity: 0.4,
      })
        .addTo(groups.spill)
        .bindPopup(`<b>Oil Spill</b><br>Area: ${incident.spillAreaKm2 || 0} km²<br>Confidence: ${incident.confidence || 0}%`);
    }

    // 3. Origin zone
    if (layers.origin && groups.origin && incident.probableOriginLat && incident.probableOriginLon) {
      L.circle([incident.probableOriginLat, incident.probableOriginLon], {
        radius: 4200,
        color: '#f59e0b',
        weight: 2,
        dashArray: '5,5',
        fillColor: '#fbbf24',
        fillOpacity: 0.15,
      }).addTo(groups.origin);
      L.marker([incident.probableOriginLat, incident.probableOriginLon], {
        icon: L.divIcon({
          className: 'origin-marker',
          html: `<div class="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      })
        .addTo(groups.origin)
        .bindPopup(`<b>Probable Origin</b><br>${incident.probableOriginLat}°N, ${incident.probableOriginLon}°E`);
    }

    // 4. Drift trajectories
    if (layers.drift && groups.drift) {
      if (highlightHindcast && hindcastTrajectory.length) {
        const hindcastPoints: [number, number][] = hindcastTrajectory.map((p) => [p.lat, p.lon]);
        L.polyline(hindcastPoints, {
          color: '#f59e0b',
          weight: 3,
          dashArray: '6,6',
          opacity: 0.8,
        })
          .addTo(groups.drift)
          .bindPopup('Backward Drift Hindcast');
      }
      if (showForecast && forecastIntervals.length) {
        const forecastPoints: [number, number][] = forecastIntervals.map((p) => [p.lat, p.lon]);
        L.polyline(forecastPoints, {
          color: '#a855f7',
          weight: 2.5,
          dashArray: '4,4',
          opacity: 0.7,
        })
          .addTo(groups.drift)
          .bindPopup('Forward Drift Forecast');
      }
    }

    // 5. Vessel trajectories
    if (layers.trajectories && groups.trajectories && vessels) {
      vessels.forEach((vessel) => {
        if (!vessel.trajectory || vessel.trajectory.length === 0) return;
        const isSelected = selectedVessel?.mmsi === vessel.mmsi;
        const color = isSelected
          ? '#1F90DF'
          : vessel.totalAssociationScore >= 85
          ? '#f43f5e'
          : vessel.isCandidate
          ? '#fb923c'
          : '#94a3b8';
        const latLngs: [number, number][] = vessel.trajectory
          .filter((t) => t.lat && t.lon)
          .map((t) => [t.lat, t.lon]);
        if (latLngs.length === 0) return;
        L.polyline(latLngs, {
          color,
          weight: isSelected ? 3.5 : vessel.isCandidate ? 2 : 1,
          opacity: isSelected ? 0.95 : vessel.isCandidate ? 0.6 : 0.3,
          dashArray: isSelected ? undefined : '4,4',
        }).addTo(groups.trajectories);
      });
    }

    // 6. Vessel markers
    if (layers.vessels && groups.vessels && vessels) {
      vessels.forEach((vessel) => {
        if (!vessel.currentLat || !vessel.currentLon) return;
        const isSelected = selectedVessel?.mmsi === vessel.mmsi;
        const markerColor =
          vessel.totalAssociationScore >= 85
            ? 'bg-rose-500 text-white'
            : vessel.isCandidate
            ? 'bg-amber-500 text-slate-950'
            : 'bg-slate-500 text-slate-300';
        const ring = isSelected ? 'ring-4 ring-[#1F90DF] ring-offset-2 ring-offset-[#EBE0DC]' : '';
        const icon = L.divIcon({
          className: 'ship-div-icon',
          html: `<div class="w-7 h-7 rounded-lg ${markerColor} ${ring} flex items-center justify-center shadow-lg" style="transform: rotate(${vessel.courseDeg || 0}deg);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([vessel.currentLat, vessel.currentLon], { icon }).addTo(groups.vessels);
        marker.bindPopup(`<b>${vessel.name}</b><br>MMSI: ${vessel.mmsi}<br>Score: ${vessel.totalAssociationScore || 0}%`);
        marker.on('click', () => onSelectVessel?.(vessel));
      });
    }

    // 7. Current vectors
    if (layers.current && groups.current && oceanCurrentGrid) {
      oceanCurrentGrid.forEach((c) => {
        if (!c.lat || !c.lon) return;
        const icon = L.divIcon({
          className: 'current-arrow',
          html: `<div style="transform: rotate(${c.directionDeg}deg);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F90DF" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([c.lat, c.lon], { icon }).addTo(groups.current);
      });
    }

    // 8. Wind vectors
    if (layers.wind && groups.wind && windVectorsGrid) {
      windVectorsGrid.forEach((w) => {
        if (!w.lat || !w.lon) return;
        const icon = L.divIcon({
          className: 'wind-arrow',
          html: `<div style="transform: rotate(${w.directionDeg}deg);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/></svg>
          </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker([w.lat, w.lon], { icon }).addTo(groups.wind);
      });
    }
  }, [incident, vessels, selectedVessel, layers, showForecast, forecastHour, highlightHindcast, onSelectVessel]);

  const resetView = () => mapInstanceRef.current?.flyTo(center, initialZoom, { duration: 1.2 });
  const focusOrigin = () => {
    if (incident.probableOriginLat && incident.probableOriginLon) {
      mapInstanceRef.current?.flyTo([incident.probableOriginLat, incident.probableOriginLon], 12, { duration: 1.2 });
    } else {
      resetView();
    }
  };

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-[#1F90DF]/30 bg-[#EBE0DC] shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-32px)]' : heightClass
      } ${className}`}
    >
      {/* Toolbar */}
      <div className="h-11 bg-white/80 backdrop-blur-md px-3 border-b border-[#1F90DF]/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-[#1F90DF]" />
          <span className="text-xs font-mono text-[#1A3A5C] hidden sm:inline">Tactical Geospatial</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EBE0DC] text-[#1A3A5C] border border-[#1F90DF]/20">
            {incident?.locationName || 'Unknown Location'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-white/80 p-0.5 rounded-lg border border-[#1F90DF]/20">
            <button
              onClick={() => setCurrentMapType('dark')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                currentMapType === 'dark' ? 'bg-[#1F90DF] text-white' : 'text-[#1A3A5C]'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setCurrentMapType('satellite')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                currentMapType === 'satellite' ? 'bg-[#1F90DF] text-white' : 'text-[#1A3A5C]'
              }`}
            >
              Sat
            </button>
          </div>
          <button onClick={focusOrigin} className="p-1.5 rounded-lg bg-white/80 hover:bg-[#1F90DF]/10 text-[#1A3A5C]">
            <Crosshair className="w-4 h-4 text-[#1F90DF]" />
          </button>
          <button onClick={resetView} className="p-1.5 rounded-lg bg-white/80 hover:bg-[#1F90DF]/10 text-[#1A3A5C]">
            <Compass className="w-4 h-4 text-[#1F90DF]" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/80 hover:bg-[#1F90DF]/10 text-[#1A3A5C]"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} className="w-full flex-1" />

      {/* Layers control */}
      <div className="absolute bottom-3 left-3 z-30 flex flex-wrap items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-[#1F90DF]/20 shadow-md text-[11px] font-mono pointer-events-auto">
        <span className="text-[#1A3A5C]/60 px-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-[#1F90DF]" /> LAYERS:
        </span>
        <button
          onClick={() => setLayers((prev) => ({ ...prev, spill: !prev.spill }))}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            layers.spill ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30' : 'bg-[#EBE0DC] text-[#1A3A5C]/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Slick
        </button>
        <button
          onClick={() => setLayers((prev) => ({ ...prev, origin: !prev.origin }))}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            layers.origin ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30' : 'bg-[#EBE0DC] text-[#1A3A5C]/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Origin
        </button>
        <button
          onClick={() => setLayers((prev) => ({ ...prev, vessels: !prev.vessels }))}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            layers.vessels ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30' : 'bg-[#EBE0DC] text-[#1A3A5C]/60'
          }`}
        >
          <Ship className="w-3 h-3" />AIS
        </button>
        <button
          onClick={() => setLayers((prev) => ({ ...prev, trajectories: !prev.trajectories }))}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            layers.trajectories ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30' : 'bg-[#EBE0DC] text-[#1A3A5C]/60'
          }`}
        >
          Tracks
        </button>
        <button
          onClick={() => setLayers((prev) => ({ ...prev, current: !prev.current }))}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            layers.current ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30' : 'bg-[#EBE0DC] text-[#1A3A5C]/60'
          }`}
        >
          <Waves className="w-3 h-3" />Current
        </button>
        <button
          onClick={() => setLayers((prev) => ({ ...prev, wind: !prev.wind }))}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            layers.wind ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30' : 'bg-[#EBE0DC] text-[#1A3A5C]/60'
          }`}
        >
          <Wind className="w-3 h-3" />Wind
        </button>
        <button
          onClick={() => setLayers((prev) => ({ ...prev, boundary: !prev.boundary }))}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            layers.boundary ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30' : 'bg-[#EBE0DC] text-[#1A3A5C]/60'
          }`}
        >
          50km
        </button>
      </div>
    </div>
  );
};

export default MapView;