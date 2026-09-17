import React from 'react';
import { Ship, X, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VesselData } from '../types';

interface EvidencePanelProps {
  vessel: VesselData;
  onClose?: () => void;
  onNavigateToInvestigation?: () => void;
  isModal?: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  vessel,
  onClose,
  onNavigateToInvestigation,
  isModal = false,
}) => {
  const breakdownItems = [
    { label: 'Spatial Proximity (30%)', score: vessel.proximityScore, color: 'bg-rose-500' },
    { label: 'Temporal Correlation (25%)', score: vessel.timeScore, color: 'bg-amber-500' },
    { label: 'Trajectory Similarity (25%)', score: vessel.trajectoryScore, color: 'bg-cyan-500' },
    { label: 'Drift Consistency (10%)', score: vessel.driftScore, color: 'bg-blue-500' },
    { label: 'Behaviour Anomaly (10%)', score: vessel.anomalyScore, color: 'bg-emerald-500' },
  ];

  return (
    <div className={`rounded-xl border border-cyan-900/50 bg-[#091224]/95 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl ${isModal ? 'max-w-2xl w-full mx-auto' : 'w-full'}`}>
      <div className="p-4 border-b border-cyan-900/40 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Ship className="w-5 h-5" /></div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{vessel.name}</h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${vessel.totalAssociationScore >= 85 ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'}`}>
                {vessel.associationCategory.toUpperCase()}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">MMSI: <span className="text-cyan-300">{vessel.mmsi}</span> • Flag: {vessel.flag}</div>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>}
      </div>

      <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
        {/* Score Hero */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-cyan-950/60 border border-cyan-800/40 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Correlated Association Score</div>
            <div className="flex items-baseline gap-2 mt-1"><span className="text-4xl font-extrabold font-mono text-white tracking-tight">{vessel.totalAssociationScore}%</span><span className="text-xs text-slate-400 font-sans">(Empirical Multi-Criteria)</span></div>
          </div>
          <div className="text-right"><div className="text-xs text-slate-400 font-mono">Surveillance Status</div><div className="text-sm font-semibold text-rose-400 mt-0.5 flex items-center gap-1.5 justify-end"><AlertTriangle className="w-4 h-4 text-rose-400" /> Primary Candidate</div></div>
        </div>

        {/* Breakdown */}
        <div>
          <h4 className="text-xs uppercase font-mono font-bold text-slate-300 tracking-wider mb-3">Evidence Weight Breakdown</h4>
          <div className="space-y-3">
            {breakdownItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono"><span className="text-slate-300">{item.label}</span><span className="text-cyan-300 font-bold">{item.score}%</span></div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800"><div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.score}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Identity & Voyage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
            <div className="font-mono text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800 flex items-center gap-1.5"><Ship className="w-3.5 h-3.5 text-cyan-400" /> Vessel Identity</div>
            <div className="flex justify-between"><span className="text-slate-400">Name:</span><span className="font-semibold text-white">{vessel.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">MMSI / Call:</span><span className="font-mono text-cyan-300">{vessel.mmsi} / {vessel.callSign}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Type:</span><span className="text-slate-200">{vessel.type}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Dimensions:</span><span className="font-mono text-slate-200">{vessel.lengthMeters}m × {vessel.beamMeters}m</span></div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
            <div className="font-mono text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800 flex items-center gap-1.5">Voyage</div>
            <div className="flex justify-between"><span className="text-slate-400">Speed / Course:</span><span className="font-mono text-white">{vessel.speedKnots} kt / {vessel.courseDeg}°</span></div>
            <div className="flex justify-between"><span className="text-slate-400">First / Last Seen:</span><span className="font-mono text-slate-200">{vessel.firstSeen} / {vessel.lastSeen}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Closest Approach:</span><span className="font-mono font-bold text-rose-400">{vessel.closestApproachDistanceKm} km ({vessel.closestApproachTime})</span></div>
          </div>
        </div>

        {/* Evidence Items */}
        <div className="space-y-2">
          <div className="text-xs uppercase font-mono font-bold text-slate-300 tracking-wider">Corroborated Evidence</div>
          {vessel.evidenceItems.map((item, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /><span>{item}</span></div>
          ))}
          {vessel.anomaliesDetected.map((anom, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" /><span>{anom}</span></div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-cyan-300 font-mono">ATTRIBUTION NOTE: </span>
          The vessel was ranked highly because its historical AIS trajectory, timing, and spatial proximity are consistent with the reconstructed spill origin and drift corridor.
        </div>
      </div>

      <div className="p-4 border-t border-cyan-900/30 bg-slate-950 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 font-mono">EVIDENCE DOSSIER #EV-2026-0881</div>
        {onNavigateToInvestigation && (
          <button onClick={onNavigateToInvestigation} className="py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
            <span>View Full Investigation</span><ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};