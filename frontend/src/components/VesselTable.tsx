import React, { useState } from 'react';
import { Ship, Filter, Search } from 'lucide-react';
import { VesselData } from '../types';

interface VesselTableProps {
  vessels: VesselData[];
  selectedVessel?: VesselData | null;
  onSelectVessel: (vessel: VesselData) => void;
  onInspectEvidence?: (vessel: VesselData) => void;
}

export const VesselTable: React.FC<VesselTableProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  onInspectEvidence,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [onlyCandidates, setOnlyCandidates] = useState(false);

  const filtered = vessels.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.mmsi.includes(searchTerm) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType =
      filterType === 'ALL' ||
      (filterType === 'TANKER' && v.type.toLowerCase().includes('tanker')) ||
      (filterType === 'CARGO' && v.type.toLowerCase().includes('cargo')) ||
      (filterType === 'BULK' && v.type.toLowerCase().includes('bulk')) ||
      (filterType === 'CONTAINER' && v.type.toLowerCase().includes('container'));
    const matchCandidate = !onlyCandidates || v.isCandidate;
    return matchSearch && matchType && matchCandidate;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-sky-100 text-sky-700 border-sky-300';
    if (score >= 70) return 'bg-sky-50 text-sky-600 border-sky-200';
    if (score >= 50) return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  return (
    <div className="rounded-xl border border-sky-200 bg-white/90 backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-sky-200 flex flex-wrap items-center justify-between gap-3 bg-sky-50/60">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-sky-500" />
          <h3 className="font-bold text-[#1A3A5C] text-base">Correlated AIS Vessel Ranking</h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
            {filtered.length} vessels
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-sky-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, MMSI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-sky-200 text-xs text-[#1A3A5C] placeholder-sky-300 focus:outline-none focus:border-sky-400 w-44 sm:w-56"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-sky-200 text-xs text-[#1A3A5C] focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Ship Types</option>
            <option value="TANKER">Tankers</option>
            <option value="CONTAINER">Container</option>
            <option value="BULK">Bulk</option>
            <option value="CARGO">Cargo</option>
          </select>
          <button
            onClick={() => setOnlyCandidates(!onlyCandidates)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              onlyCandidates
                ? 'bg-sky-100 text-sky-700 border-sky-300'
                : 'bg-white text-[#1A3A5C]/60 border-sky-200 hover:bg-sky-50'
            }`}
          >
            <Filter className="w-3 h-3" /> Candidates Only
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-sky-200 bg-sky-50/80 text-[#1A3A5C]/70 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 w-14 text-center">Rank</th>
              <th className="py-3 px-3">Vessel</th>
              <th className="py-3 px-3">MMSI</th>
              <th className="py-3 px-3">Distance</th>
              <th className="py-3 px-3">Time Match</th>
              <th className="py-3 px-3">Trajectory</th>
              <th className="py-3 px-3">Score</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100 font-sans">
            {filtered.map((vessel, idx) => {
              const isSelected = selectedVessel?.mmsi === vessel.mmsi;
              return (
                <tr
                  key={vessel.mmsi}
                  onClick={() => onSelectVessel(vessel)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-100/60 border-l-4 border-l-sky-400'
                      : 'hover:bg-sky-50/50'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 px-3 text-center font-mono">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        idx === 0
                          ? 'bg-sky-500 text-white shadow-sm shadow-sky-300'
                          : idx === 1
                          ? 'bg-sky-400 text-white'
                          : idx === 2
                          ? 'bg-sky-300 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  {/* Vessel */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#1A3A5C] flex items-center gap-1.5">
                      {vessel.name}
                      {idx === 0 && (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                          TOP
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#1A3A5C]/60 flex items-center gap-2 mt-0.5">
                      <span>{vessel.type}</span>
                      <span>•</span>
                      <span className="text-[#1A3A5C]/40">{vessel.flag}</span>
                    </div>
                  </td>

                  {/* MMSI */}
                  <td className="py-3 px-3 font-mono text-[#1A3A5C]/80">{vessel.mmsi}</td>

                  {/* Distance */}
                  <td className="py-3 px-3 font-mono font-medium">
                    <span
                      className={
                        vessel.closestApproachDistanceKm <= 10
                          ? 'text-rose-500 font-bold'
                          : vessel.closestApproachDistanceKm <= 20
                          ? 'text-amber-500'
                          : 'text-[#1A3A5C]'
                      }
                    >
                      {vessel.closestApproachDistanceKm} km
                    </span>
                  </td>

                  {/* Time Match */}
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-sky-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-400 rounded-full"
                          style={{ width: `${vessel.timeScore}%` }}
                        />
                      </div>
                      <span className="text-[#1A3A5C]">{vessel.timeScore}%</span>
                    </div>
                  </td>

                  {/* Trajectory */}
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-sky-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${vessel.trajectoryScore}%` }}
                        />
                      </div>
                      <span className="text-[#1A3A5C]">{vessel.trajectoryScore}%</span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-3 font-mono font-bold">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getScoreBadge(
                        vessel.totalAssociationScore
                      )}`}
                    >
                      {vessel.totalAssociationScore}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVessel(vessel);
                        if (onInspectEvidence) onInspectEvidence(vessel);
                      }}
                      className="px-3 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-700 hover:text-sky-800 transition-colors text-[11px] font-medium border border-sky-200"
                    >
                      Evidence →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sky-200 bg-sky-50/60 text-[11px] text-[#1A3A5C]/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          Scoring: 30% Spatial + 25% Temporal + 25% Trajectory + 10% Drift + 10% Anomaly
        </div>
        <div className="font-mono text-[#1A3A5C]/40">Radius 50 km / 24h Window</div>
      </div>
    </div>
  );
};