import React from 'react';
import { Satellite, Waves, Ship, ArrowRight, Compass, FileSearch, Activity, Zap, Layers, Sparkles } from 'lucide-react';
import { PageId } from '../types';

interface LandingProps {
  onLaunch: () => void;
  onNavigate: (page: PageId) => void;
}

export const Landing: React.FC<LandingProps> = ({ onLaunch, onNavigate }) => {
  const handleLaunch = () => {
    console.log('🚀 Launch button clicked – navigating to Dashboard');
    onLaunch();
  };

  const handleExploreSAR = () => {
    console.log('🛰️ Explore SAR button clicked – navigating to Satellite Analysis');
    onNavigate('satellite');
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-[#1A3A5C] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-sky-300/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Waves className="w-6 h-6 text-[#38BDF8]" />
          <span className="font-bold text-xl tracking-tight text-[#0284C7]">MARITRACE</span>
        </div>
        <button
          onClick={handleLaunch}
          className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition flex items-center gap-2 shadow-sm"
        >
          Launch <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 max-w-4xl mx-auto">

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#0284C7]">Trace. Track. Protect </h1>
        <p className="mt-4 text-lg text-[#1A3A5C]/80 max-w-2xl">AI-powered maritime intelligence that detects oil spills from satellite imagery, reconstructs their drift, and correlates historical AIS data to identify potential source vessels.</p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleLaunch}
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition shadow-lg flex items-center gap-2"
          >
            <span>Launch Investigation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleExploreSAR}
            className="px-6 py-3 rounded-xl bg-white hover:bg-sky-50 text-[#1A3A5C] font-semibold border border-sky-300 transition"
          >
            <Satellite className="w-4 h-4 inline mr-2" /> Explore SAR
          </button>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-sm">
            <Satellite className="w-6 h-6 text-sky-500 mb-2" />
            <h3 className="font-semibold text-[#1A3A5C]">Satellite Intelligence</h3>
            <p className="text-xs text-[#1A3A5C]/70 mt-1">SAR-based oil spill detection and characterization with AI-powered confidence scoring.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-sm">
            <Waves className="w-6 h-6 text-sky-500 mb-2" />
            <h3 className="font-semibold text-[#1A3A5C]">Drift Reconstruction</h3>
            <p className="text-xs text-[#1A3A5C]/70 mt-1">Backward hindcast and forward trajectory modeling to estimate spill origin and future movement.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-sm">
            <Ship className="w-6 h-6 text-sky-500 mb-2" />
            <h3 className="font-semibold text-[#1A3A5C]">Vessel Attribution</h3>
            <p className="text-xs text-[#1A3A5C]/70 mt-1">Explainable AIS correlation and scoring to rank potential source vessels.</p>
          </div>
        </div>

        <div className="mt-8 text-xs text-[#1A3A5C]/50">
          MARITRACE • AI-Powered Marine Pollution Intelligence 
        </div>
      </main>
    </div>
  );
};