import React from 'react';
import { Cpu, Satellite, Waves, Ship, BookOpen, ArrowRight, Award } from 'lucide-react';
import { PageId } from '../types';

interface AboutProps {
  onNavigate: (page: PageId) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto bg-[#EADBD4] text-[#2A5360] min-h-screen">
      <div className="flex items-center gap-2 pb-3 border-b border-[#51A5A9]/30">
        <BookOpen className="w-5 h-5 text-[#04757B]" />
        <h1 className="text-xl sm:text-2xl font-bold text-[#2A5360]">Technical Architecture</h1>
      </div>

      <div className="p-4 rounded-xl bg-[#F5EDE9] border border-[#51A5A9]/25 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-[#04757B] uppercase"><Award className="w-4 h-4" /> SIH26143</div>
        <p className="text-sm mt-1">Leveraging satellite imagery and AIS to detect oil spills and identify associated vessels.</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[#F5EDE9] border border-[#51A5A9]/25 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#2A5360]"><Satellite className="w-4 h-4 text-[#04757B]" /> SAR Pipeline</div>
          <ul className="text-xs text-[#2A5360]/70 mt-2 space-y-1 list-disc pl-4">
            <li>Radiometric calibration & speckle suppression</li>
            <li>Adaptive thresholding for dark patch detection</li>
            <li>U‑Net segmentation for oil vs look‑alike</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#F5EDE9] border border-[#51A5A9]/25 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#2A5360]"><Waves className="w-4 h-4 text-[#04757B]" /> Drift Model</div>
          <ul className="text-xs text-[#2A5360]/70 mt-2 space-y-1 list-disc pl-4">
            <li>Lagrangian particle tracking with current + wind</li>
            <li>Backward hindcast to localize origin</li>
            <li>Forward forecast with uncertainty</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#F5EDE9] border border-[#51A5A9]/25 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#2A5360]"><Ship className="w-4 h-4 text-[#04757B]" /> AIS Attribution</div>
          <ul className="text-xs text-[#2A5360]/70 mt-2 space-y-1 list-disc pl-4">
            <li>Multi‑criteria scoring (proximity, time, trajectory, drift, anomaly)</li>
            <li>Explainable evidence breakdown</li>
            <li>Ranking for coast guard dispatch</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#F5EDE9] border border-[#51A5A9]/25 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#2A5360]"><Cpu className="w-4 h-4 text-[#04757B]" /> Deployment</div>
          <ul className="text-xs text-[#2A5360]/70 mt-2 space-y-1 list-disc pl-4">
            <li>FastAPI backend + React frontend</li>
            <li>PyTorch U‑Net inference</li>
            <li>Demo / live mode toggle</li>
          </ul>
        </div>
      </div>

      <button onClick={() => onNavigate('dashboard')} className="px-4 py-2 rounded-lg bg-[#04757B] hover:bg-[#2A5360] text-white text-sm font-medium transition inline-flex items-center gap-2">
        <ArrowRight className="w-4 h-4" /> Return to Dashboard
      </button>
    </div>
  );
};