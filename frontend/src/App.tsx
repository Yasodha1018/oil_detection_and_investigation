// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { PageId, VesselData, IncidentData, NotificationItem } from './types';
import { initialNotifications } from './data/incidents';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { NotificationPanel } from './components/NotificationPanel';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { SatelliteAnalysis } from './pages/SatelliteAnalysis';
import { DriftAnalysis } from './pages/DriftAnalysis';
import { AISIntelligence } from './pages/AISIntelligence';
import { Investigation } from './pages/Investigation';
import { Reports } from './pages/Reports';
import { About } from './pages/About';
import { api } from './services/api';
import { ArrowRight, HelpCircle, X, Loader2 } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data state
  const [currentIncident, setCurrentIncident] = useState<IncidentData | null>(null);
  const [currentVessels, setCurrentVessels] = useState<VesselData[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Step 1: Health check
        const health = await api.health();
        setIsLive(health.mode === 'live');

        // Step 2: Get incidents
        const incidents = await api.getIncidents();
        if (incidents && incidents.length > 0) {
          const incident = incidents[0];
          setCurrentIncident(incident);

          // Step 3: Get vessels for this incident
          const vessels = await api.getVessels(incident.id);
          setCurrentVessels(vessels);
          setSelectedVessel(vessels[0] || null);
        } else {
          setLoadError('No incidents found. Please seed the database with historical data.');
          setCurrentIncident(null);
          setCurrentVessels([]);
          setSelectedVessel(null);
          setIsLive(false);
        }
      } catch (error) {
        console.error('Load error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        setLoadError(`Could not load data: ${message}. Please check backend.`);
        setCurrentIncident(null);
        setCurrentVessels([]);
        setSelectedVessel(null);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [retryCount]); // Re‑fetch when retryCount changes

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleLocationChange = async (incident: IncidentData) => {
    setCurrentIncident(incident);
    try {
      const vessels = await api.getVessels(incident.id);
      setCurrentVessels(vessels);
      setSelectedVessel(vessels[0] || null);
    } catch (error) {
      console.error('Failed to fetch vessels for location:', error);
      setCurrentVessels([]);
      setSelectedVessel(null);
    }
  };

  // Notification handlers
  const handleToggleNotificationPanel = () => setNotificationPanelOpen(prev => !prev);
  const handleMarkAsRead = (id: string) =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  const handleMarkAllAsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // Workflow steps
  const workflowSteps = [
    { title: '1. Landing', page: 'landing' as PageId, desc: 'Overview' },
    { title: '2. Dashboard', page: 'dashboard' as PageId, desc: 'Command center' },
    { title: '3. SAR Analysis', page: 'satellite' as PageId, desc: 'Spill detection' },
    { title: '4. Drift', page: 'drift' as PageId, desc: 'Origin & forecast' },
    { title: '5. AIS', page: 'ais' as PageId, desc: 'Vessel correlation' },
    { title: '6. Investigation', page: 'investigation' as PageId, desc: 'Evidence fusion' },
    { title: '7. Reports', page: 'reports' as PageId, desc: 'Dossier' },
    { title: '8. About', page: 'about' as PageId, desc: 'Architecture' },
  ];
  const currentStepIndex = workflowSteps.findIndex(s => s.page === currentPage);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EBE0DC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1F90DF] animate-spin mx-auto" />
          <p className="mt-4 text-[#1A3A5C] font-mono">Loading MARITRACE...</p>
          <p className="text-xs text-[#1A3A5C]/60 mt-1">Connecting to backend</p>
        </div>
      </div>
    );
  }

  // Landing page
  if (currentPage === 'landing') {
    return (
      <Landing
        onLaunch={() => setCurrentPage('dashboard')}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  // Error state with retry button
  if (!currentIncident || loadError) {
    return (
      <div className="min-h-screen bg-[#EBE0DC] flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-xl p-6 max-w-md text-center border border-[#1F90DF]/30 shadow-sm">
          <p className="text-[#1A3A5C] font-semibold">{loadError || 'No incident data available'}</p>
          <p className="text-xs text-[#1A3A5C]/60 mt-1">
            {loadError?.includes('backend') ? 'Make sure the backend is running on port 8000.' : 'Please seed the database with historical data.'}
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-[#1F90DF] text-white rounded-lg text-sm hover:bg-[#1879C4] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- Main Layout ----
  return (
    <div className="flex flex-1 min-h-screen bg-[#EBE0DC] text-[#1A3A5C]">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-[#EBE0DC]">
        <Topbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          notifications={notifications}
          onToggleNotificationPanel={handleToggleNotificationPanel}
          onToggleGuide={() => setGuideOpen(prev => !prev)}
        />
        <NotificationPanel
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNavigate={(page) => {
            setNotificationPanelOpen(false);
            setCurrentPage(page);
          }}
        />

        {/* Error banner (if any) */}
        {loadError && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
            <span>⚠️ {loadError}</span>
            <button
              onClick={handleRetry}
              className="text-amber-600 hover:underline font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pipeline bar */}
        <div className="bg-[#EBE0DC]/80 border-b border-[#1F90DF]/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#1A3A5C]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="uppercase tracking-widest text-[10px] text-[#1A3A5C]/60">Pipeline:</span>
            <span className="font-bold">Step {currentStepIndex + 1} of {workflowSteps.length}</span>
            <span className="hidden sm:inline text-[#1A3A5C]/60">— {workflowSteps[currentStepIndex]?.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isLive ? 'LIVE' : 'DEMO'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={() => setCurrentPage(workflowSteps[currentStepIndex - 1].page)}
                className="px-3 py-1 rounded bg-white/80 hover:bg-[#1F90DF]/10 text-[#1A3A5C] text-[11px] border border-[#1F90DF]/20 transition"
              >
                ← Previous
              </button>
            )}
            {currentStepIndex < workflowSteps.length - 1 && (
              <button
                onClick={() => setCurrentPage(workflowSteps[currentStepIndex + 1].page)}
                className="px-3 py-1 rounded bg-[#1F90DF] hover:bg-[#1879C4] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
              >
                Next: {workflowSteps[currentStepIndex + 1].title.split('. ')[1]}{' '}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setGuideOpen(prev => !prev)}
              className="px-2 py-1 rounded bg-white/80 hover:bg-[#1F90DF]/10 text-[#1A3A5C] text-[11px] border border-[#1F90DF]/20 flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3 h-3 text-[#1F90DF]" /> Guide
            </button>
          </div>
        </div>

        {/* Guide modal */}
        {guideOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-xl bg-white/90 border border-[#1F90DF]/30 p-6 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F90DF]/20">
                <h3 className="font-bold text-[#1A3A5C]">MARITRACE Workflow</h3>
                <button onClick={() => setGuideOpen(false)} className="p-1 rounded hover:bg-[#EBE0DC]"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-[#1A3A5C]/70 mt-2">Follow the numbered sequence:</p>
              <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                {workflowSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentPage(step.page); setGuideOpen(false); }}
                    className={`w-full p-2 rounded border text-left flex items-center justify-between text-sm ${
                      currentPage === step.page ? 'bg-[#1F90DF] text-white border-[#1F90DF]' : 'bg-white border-[#1F90DF]/20 text-[#1A3A5C] hover:bg-[#EBE0DC]'
                    }`}
                  >
                    <span>{step.title}</span>
                    {currentPage === step.page && <span className="text-xs font-bold">●</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <Dashboard
              incident={currentIncident}
              vessels={currentVessels}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onNavigate={setCurrentPage}
              onLocationChange={handleLocationChange}
            />
          )}
          {currentPage === 'satellite' && (
            <SatelliteAnalysis incident={currentIncident} onNavigate={setCurrentPage} />
          )}
          {currentPage === 'drift' && (
            <DriftAnalysis
              incident={currentIncident}
              vessels={currentVessels}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onNavigate={setCurrentPage}
              onLocationChange={handleLocationChange}
            />
          )}
          {currentPage === 'ais' && (
            <AISIntelligence
              incident={currentIncident}
              vessels={currentVessels}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onNavigate={setCurrentPage}
              onLocationChange={handleLocationChange}
            />
          )}
          {currentPage === 'investigation' && (
            <Investigation
              incident={currentIncident}
              vessels={currentVessels}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage === 'reports' && (
            <Reports incident={currentIncident} vessels={currentVessels} onNavigate={setCurrentPage} />
          )}
          {currentPage === 'about' && <About onNavigate={setCurrentPage} />}
        </main>
      </div>
    </div>
  );
}