import React, { useState, useRef } from 'react';
import { 
  Satellite, 
  Upload, 
  Play, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { IncidentData, PageId } from '../types';
import { ClassificationPieChart } from '../components/Charts';
import { sampleSARImageData } from '../data/incidents';
import { api } from '../services/api';

interface SatelliteAnalysisProps {
  incident: IncidentData;
  onNavigate: (page: PageId) => void;
}

export const SatelliteAnalysis: React.FC<SatelliteAnalysisProps> = ({ incident, onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'split' | 'processed' | 'original'>('split');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    setAnalysisComplete(false);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setAnalysisComplete(false);
    try {
      const response = await api.analyzeSatelliteImage(selectedFile);
      setResult(response);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadDemo = () => {
    fetch('/demo/sample_sar.png')
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'sample_sar.png', { type: 'image/png' });
        handleFileSelect(file);
        setTimeout(() => handleAnalyze(), 500);
      })
      .catch(() => alert('Demo image not found. Please upload your own.'));
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto bg-[#F0F8FF] text-[#1A3A5C] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-sky-300/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0284C7] tracking-tight flex items-center gap-2">
            <Satellite className="w-5 h-5 text-[#38BDF8]" />
            SAR Analysis
          </h1>
          <p className="text-xs text-[#1A3A5C]/70">Oil spill detection from satellite imagery</p>
        </div>
        <button
          onClick={() => onNavigate('drift')}
          className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow transition flex items-center gap-2"
        >
          <span>Trace Origin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Upload & Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left panel */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-xl bg-white/90 border border-sky-200 shadow-sm">
            <h3 className="text-xs font-semibold text-[#1A3A5C] uppercase tracking-wider mb-2">Input</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-sky-300 rounded-lg p-6 text-center cursor-pointer hover:border-sky-500 transition bg-sky-50/50"
            >
              <Upload className="w-8 h-8 mx-auto text-sky-400" />
              <p className="text-xs text-[#1A3A5C]/70 mt-1">Drop SAR image or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              />
            </div>
            {selectedFile && (
              <div className="mt-2 text-xs text-[#1A3A5C]/70 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="ml-auto">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleLoadDemo}
                disabled={analyzing}
                className="flex-1 py-2 px-3 rounded bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-medium transition flex items-center justify-center gap-1.5 border border-sky-200"
              >
                <Sparkles className="w-3.5 h-3.5" /> Demo
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || analyzing}
                className="flex-1 py-2 px-3 rounded bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                {analyzing ? 'Processing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Results summary */}
          {analysisComplete && result && (
            <div className="p-4 rounded-xl bg-white/90 border border-sky-200 shadow-sm space-y-2">
              <h3 className="text-xs font-semibold text-[#1A3A5C] uppercase tracking-wider">Results</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-sky-50 rounded border border-sky-200">
                  <div className="text-[#1A3A5C]/60">Confidence</div>
                  <div className="font-bold text-sky-600">{result.confidence}%</div>
                </div>
                <div className="p-2 bg-sky-50 rounded border border-sky-200">
                  <div className="text-[#1A3A5C]/60">Area</div>
                  <div className="font-bold text-[#1A3A5C]">{result.area_km2} km²</div>
                </div>
                <div className="p-2 bg-sky-50 rounded border border-sky-200 col-span-2">
                  <div className="text-[#1A3A5C]/60">Classification</div>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-medium">Oil: {result.oil_probability}%</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">Look-alike: {result.lookalike_probability}%</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium">Clean: {result.no_oil_probability}%</span>
                  </div>
                </div>
              </div>
              {result.mode === 'demo' && (
                <div className="text-[10px] text-amber-600 bg-amber-50 p-1.5 rounded border border-amber-200">Demo mode – model not loaded</div>
              )}
            </div>
          )}
        </div>

        {/* Right panel – image display */}
        <div className="lg:col-span-8">
          <div className="rounded-xl bg-white/90 border border-sky-200 overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="h-10 px-3 bg-sky-50/60 border-b border-sky-200 flex items-center justify-between text-xs">
              <span className="font-medium text-[#1A3A5C]">
                {previewUrl ? 'SAR Image' : 'Upload or load demo'}
              </span>
              {previewUrl && (
                <div className="flex gap-1">
                  <button onClick={() => setViewMode('original')} className={`px-2 py-0.5 rounded ${viewMode === 'original' ? 'bg-sky-500 text-white' : 'bg-white text-[#1A3A5C]'}`}>Original</button>
                  <button onClick={() => setViewMode('processed')} className={`px-2 py-0.5 rounded ${viewMode === 'processed' ? 'bg-sky-500 text-white' : 'bg-white text-[#1A3A5C]'}`}>Mask</button>
                  <button onClick={() => setViewMode('split')} className={`px-2 py-0.5 rounded ${viewMode === 'split' ? 'bg-sky-500 text-white' : 'bg-white text-[#1A3A5C]'}`}>Split</button>
                </div>
              )}
            </div>

            {/* Image canvas */}
            <div className="p-4 min-h-[360px] bg-[#F0F8FF]/50 flex items-center justify-center">
              {previewUrl ? (
                <div className="w-full relative">
                  {viewMode === 'split' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <img src={previewUrl} alt="Original" className="w-full rounded border border-sky-200" />
                        <div className="absolute bottom-1 left-1 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">Original</div>
                      </div>
                      <div className="relative">
                        {analysisComplete && result?.mask ? (
                          <canvas ref={(canvas) => {
                            if (!canvas) return;
                            // simplified mask overlay
                          }} className="w-full border border-sky-200 rounded" />
                        ) : (
                          <div className="w-full h-full min-h-[200px] flex items-center justify-center text-[#1A3A5C]/50 border border-sky-200 rounded">
                            <span className="text-xs">Analyze to see mask</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">AI Detection</div>
                      </div>
                    </div>
                  ) : (
                    <img src={previewUrl} alt="SAR" className="w-full rounded border border-sky-200" />
                  )}
                </div>
              ) : (
                <div className="text-center text-[#1A3A5C]/50">
                  <Satellite className="w-12 h-12 mx-auto text-sky-300" />
                  <p className="text-sm mt-2">No image loaded</p>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div className="p-2 border-t border-sky-200 bg-sky-50/60 text-[10px] text-[#1A3A5C]/70 flex flex-wrap items-center justify-between gap-1">
              <span>{previewUrl ? 'Image ready' : 'Waiting for input'}</span>
              {analysisComplete && result && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Analysis complete – {result.confidence}% confidence
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spill metrics */}
      {analysisComplete && result && (
        <div className="p-4 rounded-xl bg-white/90 border border-sky-200 shadow-sm">
          <h3 className="text-xs font-semibold text-[#1A3A5C] uppercase tracking-wider mb-2">Spill Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2 bg-sky-50 rounded border border-sky-200 text-center">
              <div className="text-[#1A3A5C]/60">Area</div>
              <div className="font-bold text-[#1A3A5C]">{result.area_km2} km²</div>
            </div>
            <div className="p-2 bg-sky-50 rounded border border-sky-200 text-center">
              <div className="text-[#1A3A5C]/60">Length</div>
              <div className="font-bold text-[#1A3A5C]">{result.length_km || '—'} km</div>
            </div>
            <div className="p-2 bg-sky-50 rounded border border-sky-200 text-center">
              <div className="text-[#1A3A5C]/60">Width</div>
              <div className="font-bold text-[#1A3A5C]">{result.width_km || '—'} km</div>
            </div>
            <div className="p-2 bg-sky-50 rounded border border-sky-200 text-center">
              <div className="text-[#1A3A5C]/60">Confidence</div>
              <div className="font-bold text-sky-600">{result.confidence}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Next step */}
      <div className="p-3 rounded-xl bg-white/90 border border-sky-200 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#1A3A5C]/80">Spill detected. Proceed to drift analysis to trace origin.</span>
        <button
          onClick={() => onNavigate('drift')}
          className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition flex items-center gap-1.5"
        >
          <span>Trace Origin</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};