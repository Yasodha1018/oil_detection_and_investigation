import React, { useState, useEffect } from 'react';
import { Clock, HelpCircle } from 'lucide-react';
import { PageId, NotificationItem } from '../types';

interface TopbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  notifications?: NotificationItem[];
  onToggleNotificationPanel?: () => void;
  onToggleGuide?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  onNavigate,
  onToggleGuide,
}) => {
  const [timeUtc, setTimeUtc] = useState('');
  const [dateUtc, setDateUtc] = useState('14 Sep 2026');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
      setDateUtc(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles: Record<PageId, string> = {
    landing: 'Mission Overview',
    dashboard: 'Live Command Center',
    satellite: 'Satellite SAR Analysis',
    drift: 'Ocean Drift & Hindcast',
    ais: 'AIS Vessel Intelligence',
    investigation: 'Forensic Evidence Fusion',
    reports: 'Classified Incident Report',
    about: 'Technical Architecture',
    settings: 'Sensor Feeds & Diagnostics',
  };

  return (
    <header className="h-14 border-b border-[#1F90DF]/20 flex items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-sm z-20 select-none">
      <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#1A3A5C]/60 uppercase tracking-wider font-mono">Active Investigation</span>
          <span className="text-sm font-mono text-[#1F90DF] font-bold tracking-wide">INV-2026-0147</span>
        </div>
        <div className="h-6 w-px bg-[#1F90DF]/20 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-rose-100 border border-rose-300 text-[10px] text-rose-700 font-bold tracking-wider">HIGH RISK</div>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#1A3A5C]/50 pl-2 border-l border-[#1F90DF]/20">
          <span className="font-mono">/</span>
          <span className="font-medium font-sans truncate">{pageTitles[currentPage]}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-[#1A3A5C]/60">{dateUtc}</div>
          <div className="text-xs text-[#1A3A5C]/40 font-mono">{timeUtc}</div>
        </div>
        {onToggleGuide && (
          <button
            onClick={onToggleGuide}
            className="px-3 py-1.5 rounded-lg bg-[#EBE0DC]/60 hover:bg-[#1F90DF]/10 text-[#1F90DF] text-xs font-mono border border-[#1F90DF]/20 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Guide</span>
          </button>
        )}
      </div>
    </header>
  );
};