import React, { useState, useEffect } from 'react';
import {
  Waves,
  Clock,
  Sliders,
  Play,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { IncidentData, VesselData, PageId, DriftSimulationConditions } from '../types';
import { MapView } from '../components/MapView';
import { baselineDriftConditions } from '../data/drift';
import { coastalLocations } from '../data/locations';
import { api } from '../services/api';

interface DriftAnalysisProps {
  incident: IncidentData;
  vessels: VesselData[];
  selectedVessel: VesselData | null;
  onSelectVessel: (vessel: VesselData) => void;
  onNavigate: (page: PageId) => void;
  onLocationChange: (incident: IncidentData) => void;
}

export const DriftAnalysis: React.FC<DriftAnalysisProps> = ({
  incident: initialIncident,
  vessels,
  selectedVessel,
  onSelectVessel,
  onNavigate,
  onLocationChange,
}) => {
  // State for tabs
  const [activeTab, setActiveTab] = useState<'hindcast' | 'forecast' | 'simulation'>('hindcast');
  const [forecastHour, setForecastHour] = useState<number>(24);

  // Incident state (can be changed by dropdown)
  const [incident, setIncident] = useState<IncidentData>(initialIncident);

  // Simulation parameters (sliders)
  const [simConditions, setSimConditions] = useState<DriftSimulationConditions>({
    currentSpeedKnots: baselineDriftConditions.currentSpeedKnots,
    currentDirectionDeg: baselineDriftConditions.currentDirectionDeg,
    windSpeedKnots: baselineDriftConditions.windSpeedKnots,
    windDirectionDeg: baselineDriftConditions.windDirectionDeg,
    simulationHours: 24,
  });

  // Live data state
  const [liveData, setLiveData] = useState<{
    wind_speed_kts: number;
    wind_direction_deg: number;
    current_speed_kts: number;
    current_direction_deg: number;
    temperature?: number;
    timestamp?: string;
  } | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<{ lat: number; lon: number }[] | null>(null);

  // Fetch live drift conditions for the current location
  const fetchDriftConditions = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      const data = await api.getDriftConditions(lat, lon);
      setLiveData(data);
      // Update simulation sliders with live values
      setSimConditions((prev) => ({
        ...prev,
        currentSpeedKnots: data.current_speed_kts,
        currentDirectionDeg: data.current_direction_deg,
        windSpeedKnots: data.wind_speed_kts,
        windDirectionDeg: data.wind_direction_deg,
      }));
      const health = await api.health();
      setIsLive(health.mode === 'live');
    } catch (error) {
      console.error('Failed to fetch live drift conditions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch when incident changes
  useEffect(() => {
    if (incident?.latitude && incident?.longitude) {
      fetchDriftConditions(incident.latitude, incident.longitude);
    }
  }, [incident]);

  // Handle location change from dropdown
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = coastalLocations.find((loc) => loc.id === e.target.value);
    if (selected) {
      const fullIncident: IncidentData = {
        id: selected.id,
        name: selected.name || selected.locationName,
        status: selected.status as any,
        severity: selected.severity as any,
        detectionTime: selected.detectionTime || new Date().toISOString(),
        satellitePlatform: selected.satellitePlatform || 'Sentinel-1B',
        sensor: selected.sensor || 'C-Band IW',
        resolutionMeters: selected.resolutionMeters || 10,
        latitude: selected.latitude,
        longitude: selected.longitude,
        locationName: selected.locationName,
        spillAreaKm2: selected.spillAreaKm2,
        spillLengthKm: selected.spillLengthKm || 0,
        spillMaxWidthKm: selected.spillMaxWidthKm || 0,
        orientation: selected.orientation || '',
        confidence: selected.confidence,
        oilProbability: selected.oilProbability || selected.confidence,
        lookalikeProbability: selected.lookalikeProbability || 0,
        noOilProbability: selected.noOilProbability || 0,
        probableOriginLat: selected.probableOriginLat,
        probableOriginLon: selected.probableOriginLon,
        originConfidence: selected.originConfidence || 0,
        estimatedSpillTime: selected.estimatedSpillTime,
        candidateVesselsCount: 7,
      };
      setIncident(fullIncident);
      onLocationChange(fullIncident);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    if (incident?.latitude && incident?.longitude) {
      fetchDriftConditions(incident.latitude, incident.longitude);
    }
  };

  // Run simulation
  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const current = {
        speed: simConditions.currentSpeedKnots,
        direction: simConditions.currentDirectionDeg,
      };
      const wind = {
        speed: simConditions.windSpeedKnots,
        direction: simConditions.windDirectionDeg,
      };
      const result = await api.forecastDrift(
        incident.probableOriginLat,
        incident.probableOriginLon,
        simConditions.simulationHours,
        current,
        wind
      );
      setSimulationResult(result.trajectory);
      console.log('✅ Simulation complete:', result);
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      alert('Simulation failed. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto bg-[#EBE0DC] text-[#1A3A5C] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1F90DF]/30">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A3A5C] tracking-tight flex items-center gap-2">
            <Waves className="w-5 h-5 text-[#1F90DF]" />
            Drift Analysis
          </h1>
          <div className="relative">
            <select
              value={incident?.id || ''}
              onChange={handleLocationChange}
              className="bg-white border border-[#1F90DF]/30 rounded-lg px-3 py-1.5 text-sm text-[#1A3A5C] focus:outline-none focus:border-[#1F90DF] cursor-pointer shadow-sm"
            >
              {coastalLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-mono ${isLive ? 'text-emerald-600' : 'text-amber-600'}`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isLive ? 'Live' : 'Demo'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white/80 hover:bg-[#1F90DF]/10 text-[#1A3A5C] border border-[#1F90DF]/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#1F90DF] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <button
          onClick={() => onNavigate('ais')}
          className="px-4 py-2 rounded-lg bg-[#1F90DF] hover:bg-[#1879C4] text-white text-xs font-medium shadow transition flex items-center gap-2"
        >
          <span>AIS Correlation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1F90DF]/20 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('hindcast')}
          className={`px-3 py-1 rounded-t-lg transition ${
            activeTab === 'hindcast'
              ? 'bg-[#1F90DF] text-white'
              : 'bg-white/80 text-[#1A3A5C]/70 hover:bg-[#1F90DF]/10 border border-[#1F90DF]/20'
          }`}
        >
          <RotateCcw className="w-3 h-3 inline mr-1" /> Hindcast
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-3 py-1 rounded-t-lg transition ${
            activeTab === 'forecast'
              ? 'bg-[#1F90DF] text-white'
              : 'bg-white/80 text-[#1A3A5C]/70 hover:bg-[#1F90DF]/10 border border-[#1F90DF]/20'
          }`}
        >
          <Clock className="w-3 h-3 inline mr-1" /> Forecast
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`px-3 py-1 rounded-t-lg transition ${
            activeTab === 'simulation'
              ? 'bg-[#1F90DF] text-white'
              : 'bg-white/80 text-[#1A3A5C]/70 hover:bg-[#1F90DF]/10 border border-[#1F90DF]/20'
          }`}
        >
          <Sliders className="w-3 h-3 inline mr-1" /> Simulation
        </button>
      </div>

      {/* Context banner – SAFE with optional chaining and fallbacks */}
      {activeTab === 'hindcast' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-[#1A3A5C] flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-semibold">Origin:</span>{' '}
            {incident?.probableOriginLat?.toFixed(3) ?? 'N/A'}°N,{' '}
            {incident?.probableOriginLon?.toFixed(3) ?? 'N/A'}°E
            <span className="ml-2 text-xs text-[#1A3A5C]/60">
              (Confidence: {incident?.originConfidence ?? 0}%)
            </span>
            {isLive && liveData && (
              <span className="ml-3 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ● Live: wind {liveData.wind_speed_kts} kt @ {liveData.wind_direction_deg}°
              </span>
            )}
          </div>
          <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-[#1F90DF]/20">
            {incident?.estimatedSpillTime?.slice(11, 16) || '11:45'} UTC
          </span>
        </div>
      )}

      {/* Map */}
      <MapView
        key={incident?.id || 'drift-map'}
        incident={incident}
        vessels={vessels}
        selectedVessel={selectedVessel}
        onSelectVessel={onSelectVessel}
        showForecast={activeTab === 'forecast' || activeTab === 'simulation'}
        forecastHour={forecastHour}
        highlightHindcast={activeTab === 'hindcast'}
        heightClass="h-[440px]"
        initialCenter={[incident?.latitude ?? 18.68, incident?.longitude ?? 72.82]}
        initialZoom={10}
      />

      {/* Forecast controls */}
      {activeTab === 'forecast' && (
        <div className="p-3 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-medium text-[#1A3A5C]">Horizon:</span>
            {[6, 12, 24, 48].map((hr) => (
              <button
                key={hr}
                onClick={() => setForecastHour(hr)}
                className={`px-3 py-1 rounded ${
                  forecastHour === hr
                    ? 'bg-[#1F90DF] text-white'
                    : 'bg-[#EBE0DC] text-[#1A3A5C] hover:bg-[#1F90DF]/10'
                }`}
              >
                +{hr}h
              </button>
            ))}
          </div>
          <input
            type="range"
            min="0"
            max="48"
            step="6"
            value={forecastHour}
            onChange={(e) => setForecastHour(Number(e.target.value))}
            className="w-full h-1.5 bg-[#EBE0DC] rounded appearance-none accent-[#1F90DF] mt-2"
          />
        </div>
      )}

      {/* Simulation controls */}
      {activeTab === 'simulation' && (
        <div className="p-3 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[#1A3A5C]/60">Current Speed</label>
              <input
                type="range"
                min="0.2"
                max="3.5"
                step="0.1"
                value={simConditions.currentSpeedKnots}
                onChange={(e) =>
                  setSimConditions((prev) => ({
                    ...prev,
                    currentSpeedKnots: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-[#1F90DF]"
              />
              <span className="font-bold text-[#1F90DF]">{simConditions.currentSpeedKnots} kts</span>
              {isLive && liveData && (
                <span className="text-[10px] text-emerald-500 ml-1">live</span>
              )}
            </div>
            <div>
              <label className="text-[#1A3A5C]/60">Wind Speed</label>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={simConditions.windSpeedKnots}
                onChange={(e) =>
                  setSimConditions((prev) => ({
                    ...prev,
                    windSpeedKnots: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-[#1F90DF]"
              />
              <span className="font-bold text-[#1F90DF]">{simConditions.windSpeedKnots} kts</span>
              {isLive && liveData && (
                <span className="text-[10px] text-emerald-500 ml-1">live</span>
              )}
            </div>
            <div>
              <label className="text-[#1A3A5C]/60">Wind Direction</label>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={simConditions.windDirectionDeg}
                onChange={(e) =>
                  setSimConditions((prev) => ({
                    ...prev,
                    windDirectionDeg: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-[#1F90DF]"
              />
              <span className="font-bold text-[#1F90DF]">{simConditions.windDirectionDeg}°</span>
              {isLive && liveData && (
                <span className="text-[10px] text-emerald-500 ml-1">live</span>
              )}
            </div>
            <div>
              <label className="text-[#1A3A5C]/60">Duration</label>
              <input
                type="range"
                min="6"
                max="72"
                step="6"
                value={simConditions.simulationHours}
                onChange={(e) =>
                  setSimConditions((prev) => ({
                    ...prev,
                    simulationHours: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-[#1F90DF]"
              />
              <span className="font-bold text-[#1F90DF]">{simConditions.simulationHours}h</span>
            </div>
          </div>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="mt-2 px-4 py-1.5 rounded bg-[#1F90DF] hover:bg-[#1879C4] text-white text-xs font-medium transition disabled:opacity-50"
          >
            {isSimulating ? (
              <RefreshCw className="w-3.5 h-3.5 inline mr-1 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 inline mr-1 fill-white" />
            )}
            {isSimulating ? 'Running...' : 'Run Simulation'}
          </button>
          {simulationResult && simulationResult.length > 0 && (
            <div className="mt-2 p-2 bg-[#EBE0DC] rounded text-xs text-[#1A3A5C]/80">
              ✅ Simulation complete – {simulationResult.length} points calculated.
              <button
                onClick={() => setSimulationResult(null)}
                className="ml-2 text-[#1F90DF] hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Next step */}
      <div className="p-3 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#1A3A5C]/80">Origin zone localized. Proceed to AIS correlation.</span>
        <button
          onClick={() => onNavigate('ais')}
          className="px-4 py-1.5 rounded bg-[#1F90DF] hover:bg-[#1879C4] text-white font-medium text-xs transition flex items-center gap-1.5"
        >
          <span>AIS Analysis</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};