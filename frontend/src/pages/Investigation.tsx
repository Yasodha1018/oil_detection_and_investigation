import React, { useState } from 'react';
import {
  FileSearch,
  Clock,
  Ship,
  Satellite,
  Waves,
  ShieldCheck,
  FileText,
  ArrowRight,
  ChevronRight,
  Award,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  Calendar,
  Navigation,
  Anchor,
  Wind,
  Droplets,
  Activity,
  BarChart3,
  Target,
  Eye,
  Info,
} from 'lucide-react';
import { IncidentData, VesselData, PageId } from '../types';
import { MapView } from '../components/MapView';

interface InvestigationProps {
  incident: IncidentData;
  vessels: VesselData[];
  selectedVessel: VesselData | null;
  onSelectVessel: (vessel: VesselData) => void;
  onNavigate: (page: PageId) => void;
}

export const Investigation: React.FC<InvestigationProps> = ({
  incident,
  vessels,
  selectedVessel,
  onSelectVessel,
  onNavigate,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  const sortedVessels = [...vessels].sort((a, b) => b.totalAssociationScore - a.totalAssociationScore);
  const candidates = sortedVessels.filter(v => v.isCandidate);
  const topCandidate = candidates[0] || sortedVessels[0];

  const scoreBreakdown = topCandidate ? [
    { label: 'Spatial Proximity', value: topCandidate.proximityScore || 0, weight: '30%', color: '#1F90DF' },
    { label: 'Temporal Correlation', value: topCandidate.timeScore || 0, weight: '25%', color: '#0EA5E9' },
    { label: 'Trajectory Similarity', value: topCandidate.trajectoryScore || 0, weight: '25%', color: '#06B6D4' },
    { label: 'Drift Consistency', value: topCandidate.driftScore || 0, weight: '10%', color: '#8B5CF6' },
    { label: 'Behaviour Anomaly', value: topCandidate.anomalyScore || 0, weight: '10%', color: '#F59E0B' },
  ] : [];

  const timelineEvents = [
    {
      time: new Date(incident.detectionTime),
      title: 'Satellite Detection',
      description: `${incident.satellitePlatform} acquired SAR image`,
      details: `Spill area: ${incident.spillAreaKm2} km² • Confidence: ${incident.confidence}%`,
      icon: Satellite,
      color: 'text-rose-500 bg-rose-50 border-rose-200',
    },
    {
      time: new Date(incident.estimatedSpillTime || incident.detectionTime),
      title: 'Estimated Spill Origin',
      description: `Origin localized at ${incident.probableOriginLat}°N, ${incident.probableOriginLon}°E`,
      details: `Method: Lagrangian drift hindcast • Confidence: ${incident.originConfidence}%`,
      icon: MapPin,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
    },
    ...candidates.slice(0, 3).map((v) => ({
      time: new Date(v.closestApproachTime || incident.detectionTime),
      title: `Vessel ${v.name} in Origin Zone`,
      description: `Closest approach: ${v.closestApproachDistanceKm} km`,
      details: `Score: ${v.totalAssociationScore}% • Speed: ${v.speedKnots} kt`,
      icon: Ship,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    })),
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  const isMSCELSA = incident.id === 'MR-2025-027';
  const realIncidentNote = isMSCELSA
    ? 'This investigation is based on real data: ISRO EOS-4 SAR detected oil spill on 27 May 2025, following the capsizing of MSC ELSA 3 off the Kerala coast. Detection confirmed by ISRO IIRS Science Portal and Sentinel Asia emergency observation.'
    : '';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto bg-[#EBE0DC] text-[#1A3A5C] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1F90DF]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F90DF]/10 flex items-center justify-center border border-[#1F90DF]/30">
            <FileSearch className="w-5 h-5 text-[#1F90DF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A3A5C] tracking-tight">Investigation</h1>
            <p className="text-xs text-[#1A3A5C]/60 flex items-center gap-2">
              <span className="font-mono bg-[#1F90DF]/10 px-2 py-0.5 rounded text-[#1F90DF]">{incident.id}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F90DF]"></span>
              {incident.locationName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            HIGH RISK
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 rounded-lg bg-[#1F90DF] hover:bg-[#1879C4] text-white text-xs font-medium shadow-sm transition flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {realIncidentNote && (
        <div className="p-3 rounded-xl bg-[#1F90DF]/5 border border-[#1F90DF]/20 text-xs text-[#1A3A5C]/80 flex items-start gap-2">
          <Info className="w-4 h-4 text-[#1F90DF] flex-shrink-0 mt-0.5" />
          <span>{realIncidentNote}</span>
        </div>
      )}

      {/* Three-Step Progress Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1F90DF]/10 border border-[#1F90DF]/30 flex items-center justify-center text-[#1F90DF] font-bold text-sm">1</div>
            <div>
              <div className="text-xs font-medium text-[#1F90DF]">INCIDENT</div>
              <div className="text-sm font-semibold text-[#1A3A5C]">Spill Detected</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-[#EBE0DC] pt-3">
            <div><span className="text-[#1A3A5C]/60">Area</span> <span className="font-semibold text-[#1F90DF]">{incident.spillAreaKm2} km²</span></div>
            <div><span className="text-[#1A3A5C]/60">Confidence</span> <span className="font-semibold text-emerald-600">{incident.confidence}%</span></div>
            <div className="col-span-2"><span className="text-[#1A3A5C]/60">Satellite</span> <span className="font-semibold">{incident.satellitePlatform}</span></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-sm">2</div>
            <div>
              <div className="text-xs font-medium text-amber-500">HINDCAST</div>
              <div className="text-sm font-semibold text-[#1A3A5C]">Origin Reconstructed</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-[#EBE0DC] pt-3">
            <div><span className="text-[#1A3A5C]/60">Latitude</span> <span className="font-semibold">{incident.probableOriginLat}°N</span></div>
            <div><span className="text-[#1A3A5C]/60">Longitude</span> <span className="font-semibold">{incident.probableOriginLon}°E</span></div>
            <div className="col-span-2"><span className="text-[#1A3A5C]/60">Time</span> <span className="font-semibold">{new Date(incident.estimatedSpillTime || '').toLocaleString()}</span></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-sm">3</div>
            <div>
              <div className="text-xs font-medium text-emerald-500">AIS</div>
              <div className="text-sm font-semibold text-[#1A3A5C]">Vessels Correlated</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-[#EBE0DC] pt-3">
            <div><span className="text-[#1A3A5C]/60">Vessels Found</span> <span className="font-semibold">{vessels.length}</span></div>
            <div><span className="text-[#1A3A5C]/60">Candidates</span> <span className="font-semibold text-[#1F90DF]">{candidates.length}</span></div>
            <div className="col-span-2"><span className="text-[#1A3A5C]/60">Search Radius</span> <span className="font-semibold">50 km</span></div>
          </div>
        </div>
      </div>

      {/* Top Candidate Card */}
      {topCandidate && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-[#1F90DF]/10 via-white/90 to-white/90 border border-[#1F90DF]/30 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-[#1F90DF] uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" />
                Primary Candidate
              </div>
              <div className="text-xl font-bold text-[#1A3A5C] mt-1">{topCandidate.name}</div>
              <div className="text-xs text-[#1A3A5C]/60 flex flex-wrap gap-3 mt-1">
                <span>MMSI: {topCandidate.mmsi}</span>
                <span className="w-px h-3 bg-[#1A3A5C]/20"></span>
                <span>{topCandidate.type}</span>
                <span className="w-px h-3 bg-[#1A3A5C]/20"></span>
                <span>Flag: {topCandidate.flag}</span>
                {isMSCELSA && (
                  <span className="text-rose-500 font-medium">⚠️ SUNK</span>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#1A3A5C]/60">Association Score</div>
              <div className="text-4xl font-bold text-[#1F90DF]">{topCandidate.totalAssociationScore}%</div>
              <div className="text-[10px] text-[#1A3A5C]/60">{topCandidate.associationCategory}</div>
            </div>
            <button
              onClick={() => {
                setSelectedCandidate(topCandidate);
                setShowEvidenceModal(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#1F90DF]/10 hover:bg-[#1F90DF]/20 text-[#1F90DF] text-xs font-medium border border-[#1F90DF]/20 transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              View Evidence
            </button>
          </div>

          {/* Score Breakdown */}
          <div className="mt-4 pt-3 border-t border-[#1F90DF]/20">
            <div className="text-xs font-medium text-[#1A3A5C]/60 mb-2">Evidence Breakdown</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {scoreBreakdown.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/50 border border-[#EBE0DC]">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#1A3A5C]/60">{item.label}</span>
                    <span className="font-bold text-[#1F90DF]">{item.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EBE0DC] rounded mt-1">
                    <div className="h-full rounded" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                  <div className="text-[9px] text-[#1A3A5C]/40 mt-0.5">Weight: {item.weight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div>
        <div className="flex justify-between text-xs text-[#1A3A5C]/60 mb-2">
          <span className="font-medium flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-[#1F90DF]" /> Investigation Map</span>
          <span>Showing spill, origin, drift, and vessel tracks</span>
        </div>
        <MapView
          incident={incident}
          vessels={vessels}
          selectedVessel={selectedVessel}
          onSelectVessel={(v) => { onSelectVessel(v); }}
          heightClass="h-[400px]"
          mapType="satellite"
        />
      </div>

      {/* Timeline */}
      <div className="p-5 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#1F90DF]" />
          <span className="font-semibold text-[#1A3A5C] text-sm">Investigation Timeline</span>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1F90DF] via-[#0EA5E9] to-emerald-400"></div>
          <div className="space-y-4 ml-10">
            {timelineEvents.map((event, idx) => {
              const Icon = event.icon;
              return (
                <div key={idx} className="relative">
                  <div className={`absolute -left-8 w-5 h-5 rounded-full border-2 ${event.color} flex items-center justify-center bg-white`}>
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8F6F2] border border-[#EBE0DC] hover:border-[#1F90DF]/20 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[#1A3A5C]">{event.title}</span>
                      <span className="text-[10px] font-mono text-[#1A3A5C]/50">{event.time.toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs text-[#1A3A5C]/70">{event.description}</div>
                    <div className="text-[10px] text-[#1A3A5C]/50 mt-0.5">{event.details}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="p-5 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-[#1F90DF]" />
          <span className="font-semibold text-[#1A3A5C] text-sm">Vessel Ranking</span>
          <span className="text-xs text-[#1A3A5C]/50 ml-2">({vessels.length} vessels analyzed)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#EBE0DC] text-[#1A3A5C]/60">
                <th className="p-2.5 text-left font-medium">#</th>
                <th className="p-2.5 text-left font-medium">Vessel</th>
                <th className="p-2.5 text-left font-medium">MMSI</th>
                <th className="p-2.5 text-left font-medium">Distance</th>
                <th className="p-2.5 text-left font-medium">Score</th>
                <th className="p-2.5 text-left font-medium">Status</th>
                <th className="p-2.5 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedVessels.map((vessel, idx) => (
                <tr key={vessel.mmsi} className="border-b border-[#EBE0DC] hover:bg-[#F8F6F2] transition">
                  <td className="p-2.5 font-bold text-[#1F90DF]">#{idx + 1}</td>
                  <td className="p-2.5">
                    <div className="font-semibold text-[#1A3A5C]">{vessel.name}</div>
                    <div className="text-[10px] text-[#1A3A5C]/50">{vessel.type}</div>
                  </td>
                  <td className="p-2.5 font-mono text-[#1A3A5C]/60">{vessel.mmsi}</td>
                  <td className="p-2.5 font-medium">{vessel.closestApproachDistanceKm} km</td>
                  <td className="p-2.5">
                    <span className="font-bold text-[#1F90DF]">{vessel.totalAssociationScore}%</span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      vessel.associationCategory === 'High Association' ? 'bg-rose-100 text-rose-700' :
                      vessel.associationCategory === 'Medium Association' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {vessel.associationCategory}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <button
                      onClick={() => {
                        setSelectedCandidate(vessel);
                        setShowEvidenceModal(true);
                      }}
                      className="px-3 py-1 rounded bg-[#1F90DF]/10 hover:bg-[#1F90DF]/20 text-[#1F90DF] text-[10px] font-medium transition"
                    >
                      Evidence →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Modal */}
      {showEvidenceModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[#1F90DF]/30 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE0DC]">
              <div>
                <h3 className="font-bold text-lg text-[#1A3A5C]">{selectedCandidate.name}</h3>
                <p className="text-xs text-[#1A3A5C]/60">MMSI: {selectedCandidate.mmsi} • {selectedCandidate.type}</p>
              </div>
              <button onClick={() => setShowEvidenceModal(false)} className="p-1.5 rounded-lg hover:bg-[#EBE0DC] transition">
                <X className="w-5 h-5 text-[#1A3A5C]/60" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#1F90DF]/5 border border-[#1F90DF]/10">
                  <div className="text-xs text-[#1A3A5C]/60">Total Score</div>
                  <div className="text-3xl font-bold text-[#1F90DF]">{selectedCandidate.totalAssociationScore}%</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs text-[#1A3A5C]/60">Category</div>
                  <div className="text-lg font-semibold text-emerald-700">{selectedCandidate.associationCategory}</div>
                </div>
              </div>

              {selectedCandidate.evidenceItems && selectedCandidate.evidenceItems.map((item: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#1A3A5C]">{item}</span>
                </div>
              ))}

              {selectedCandidate.anomaliesDetected && selectedCandidate.anomaliesDetected.map((item: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/50 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#1A3A5C]">{item}</span>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#EBE0DC] text-xs text-[#1A3A5C]/70">
                <span className="font-semibold text-[#1F90DF]">ATTRIBUTION NOTE:</span> The vessel was ranked highly because its historical AIS trajectory, timing, and spatial proximity are consistent with the reconstructed spill origin and drift corridor.
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#EBE0DC] flex justify-end gap-2">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="px-4 py-2 rounded-lg bg-[#EBE0DC] hover:bg-[#D5C8C0] text-[#1A3A5C] text-xs font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowEvidenceModal(false);
                  onNavigate('reports');
                }}
                className="px-4 py-2 rounded-lg bg-[#1F90DF] hover:bg-[#1879C4] text-white text-xs font-medium transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1F90DF]/5 to-emerald-500/5 border border-[#1F90DF]/30 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-medium text-[#1A3A5C]">Investigation Complete</div>
            <div className="text-xs text-[#1A3A5C]/60">
              {topCandidate ? `Top candidate: ${topCandidate.name} (${topCandidate.totalAssociationScore}%)` : 'No candidates identified'}
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('reports')}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#1F90DF] to-[#0EA5E9] hover:from-[#1879C4] hover:to-[#0C8ABF] text-white font-medium text-sm shadow-sm transition flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Generate Official Report
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};