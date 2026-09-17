import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Ship,
  Satellite,
  Waves,
  Compass,
  ArrowLeft,
  Check,
  RefreshCw
} from 'lucide-react';
import { IncidentData, VesselData, PageId } from '../types';
import { api } from '../services/api';

interface ReportsProps {
  incident: IncidentData;
  vessels: VesselData[];
  onNavigate: (page: PageId) => void;
}

export const Reports: React.FC<ReportsProps> = ({ incident, vessels, onNavigate }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportCsvSuccess, setExportCsvSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleExportCSV = () => {
    setExportCsvSuccess(true);
    setTimeout(() => setExportCsvSuccess(false), 3000);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const blob = await api.generateReport(incident.id, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MARITRACE_Report_${incident.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      alert('Error generating report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto bg-[#EBE0DC] text-[#1A3A5C] min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1F90DF]/30">
        <div>
          <button onClick={() => onNavigate('investigation')} className="text-xs text-[#1F90DF] hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A3A5C] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1F90DF]" />
            Incident Report
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded bg-white/90 hover:bg-[#1F90DF]/10 text-[#1A3A5C] text-xs font-medium border border-[#1F90DF]/30 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1F90DF]" />
            {exportCsvSuccess ? '✓' : 'CSV'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded bg-white/90 hover:bg-[#1F90DF]/10 text-[#1A3A5C] text-xs font-medium border border-[#1F90DF]/30 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#1F90DF]" /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isLoading}
            className="px-4 py-1.5 rounded bg-[#1F90DF] hover:bg-[#1879C4] text-white text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloadSuccess ? '✓' : isLoading ? 'Generating…' : 'PDF'}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Report generated successfully.
        </div>
      )}

      {/* Report body – dynamic */}
      <div className="p-6 rounded-xl bg-white/90 border border-[#1F90DF]/30 shadow-sm space-y-6 text-sm">
        <div className="border-b border-[#1F90DF]/20 pb-4">
          <div className="text-xs font-mono text-[#1F90DF] uppercase">MARITRACE • Incident Dossier</div>
          <div className="text-xl font-bold text-[#1A3A5C]">{incident.id}</div>
          <div className="text-xs text-[#1A3A5C]/60">{incident.detectionTime} • {incident.locationName}</div>
        </div>

        <div>
          <h3 className="font-semibold text-[#1A3A5C]">Spill Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
            <div className="p-2 bg-[#EBE0DC] rounded border border-[#1F90DF]/20">
              <div className="text-[#1A3A5C]/60">Area</div>
              <div className="font-bold">{incident.spillAreaKm2} km²</div>
            </div>
            <div className="p-2 bg-[#EBE0DC] rounded border border-[#1F90DF]/20">
              <div className="text-[#1A3A5C]/60">Confidence</div>
              <div className="font-bold text-[#1F90DF]">{incident.confidence}%</div>
            </div>
            <div className="p-2 bg-[#EBE0DC] rounded border border-[#1F90DF]/20">
              <div className="text-[#1A3A5C]/60">Origin</div>
              <div className="font-bold">{incident.probableOriginLat}°N</div>
            </div>
            <div className="p-2 bg-[#EBE0DC] rounded border border-[#1F90DF]/20">
              <div className="text-[#1A3A5C]/60">Candidates</div>
              <div className="font-bold">{vessels.filter(v => v.isCandidate).length}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[#1A3A5C]">Top Candidates</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#EBE0DC] text-[#1A3A5C]">
                <tr><th className="p-2 text-left">Rank</th><th className="p-2 text-left">Vessel</th><th className="p-2 text-left">MMSI</th><th className="p-2 text-left">Distance</th><th className="p-2 text-left">Score</th></tr>
              </thead>
              <tbody>
                {vessels.slice(0, 5).map((v, i) => (
                  <tr key={v.mmsi} className="border-b border-[#1F90DF]/10">
                    <td className="p-2 font-bold text-[#1F90DF]">#{i+1}</td>
                    <td className="p-2">{v.name}</td>
                    <td className="p-2 font-mono text-[#1A3A5C]/70">{v.mmsi}</td>
                    <td className="p-2">{v.closestApproachDistanceKm} km</td>
                    <td className="p-2 font-bold text-[#1F90DF]">{v.totalAssociationScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-[10px] text-[#1A3A5C]/50 border-t border-[#1F90DF]/20 pt-3">
          This report is generated by MARITRACE AI • Evidence-based decision support only.
          {incident.status === 'UNDER_INVESTIGATION' && ' • Incident under active investigation.'}
        </div>
      </div>
    </div>
  );
};