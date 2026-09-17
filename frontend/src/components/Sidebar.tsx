import React from 'react';
import {
  Satellite,
  Compass,
  Ship,
  FileSearch,
  FileText,
  Settings,
  LayoutDashboard,
  Waves,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, collapsed, onToggleCollapse }) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'satellite' as PageId, label: 'Satellite Analysis', icon: Satellite, badge: 'SAR' },
    { id: 'drift' as PageId, label: 'Drift Analysis', icon: Waves, badge: 'Hydro' },
    { id: 'ais' as PageId, label: 'AIS Vessels', icon: Ship, badge: '7 Cands' },
    { id: 'investigation' as PageId, label: 'Investigation', icon: FileSearch, badge: 'Fusion' },
    { id: 'reports' as PageId, label: 'Reports', icon: FileText, badge: 'PDF' },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-[#1F90DF]/30 bg-white/90 backdrop-blur-sm transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div
        className={`p-4 border-b border-[#1F90DF]/30 flex items-center justify-between ${
          collapsed ? 'justify-center p-3' : 'p-6'
        }`}
      >
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-3 text-left group overflow-hidden">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-white bg-[#1F90DF] shadow-[0_0_12px_rgba(31,144,223,0.4)] flex-shrink-0 group-hover:scale-105 transition-transform">
            M
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xl font-bold tracking-tight text-[#1F90DF] leading-none">MARITRACE</span>
              <p className="text-[10px] text-[#1F90DF]/60 mt-1 uppercase tracking-widest font-mono">Marine Intelligence</p>
            </div>
          )}
        </button>
        {!collapsed && (
          <button onClick={onToggleCollapse} className="p-1 rounded text-[#1A3A5C]/50 hover:text-[#1F90DF] hover:bg-[#1F90DF]/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2 border-b border-[#1F90DF]/20">
          <button onClick={onToggleCollapse} className="p-1 rounded text-[#1A3A5C]/50 hover:text-[#1F90DF]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <div className="bg-[#EBE0DC]/60 p-3 rounded-lg border border-[#1F90DF]/30 text-xs">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#1A3A5C]/60">
              <span>Active Investigation</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold border border-rose-300">HIGH RISK</span>
            </div>
            <div className="font-mono text-[#1F90DF] font-bold text-sm mt-1">INV-2026-0147</div>
            <div className="text-[11px] text-[#1A3A5C]/60 truncate mt-0.5">Mumbai Offshore Corridor</div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1F90DF]/10 text-[#1F90DF] border border-[#1F90DF]/30'
                  : 'text-[#1A3A5C]/60 hover:text-[#1A3A5C] hover:bg-[#EBE0DC]/50 border border-transparent'
              } ${collapsed ? 'justify-center px-0 py-2.5' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              {isActive ? (
                <div className="w-2 h-2 rounded-full bg-[#1F90DF] shadow-[0_0_8px_rgba(31,144,223,0.8)] flex-shrink-0"></div>
              ) : (
                <Icon className="w-4 h-4 text-[#1A3A5C]/50 flex-shrink-0" />
              )}
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-[#1F90DF]/20 text-[#1F90DF] border border-[#1F90DF]/30'
                        : 'bg-[#EBE0DC]/50 text-[#1A3A5C]/60 border border-[#1F90DF]/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1F90DF]/30 mt-auto">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="bg-[#EBE0DC]/60 p-3 rounded-lg border border-[#1F90DF]/30">
              <div className="text-[10px] text-[#1F90DF]/60 uppercase mb-2 tracking-widest font-mono font-bold">System Status</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1A3A5C]/70">AI Engine</span>
                <span className="text-emerald-600 font-mono font-semibold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-[#1A3A5C]/70">AIS Stream</span>
                <span className="text-emerald-600 font-mono font-semibold">ONLINE</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-[#1A3A5C]/50">
              <button onClick={() => onNavigate('landing')} className="hover:text-[#1F90DF] transition-colors flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#1F90DF]" /> Landing
              </button>
              <button onClick={() => onNavigate('about')} className="hover:text-[#1F90DF] transition-colors font-mono text-[10px] uppercase tracking-wider">
                Methodology →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]" title="System Online"></div>
            <button onClick={() => onNavigate('landing')} className="text-[#1A3A5C]/50 hover:text-[#1F90DF] text-xs mt-1">
              <Sparkles className="w-4 h-4 text-[#1F90DF]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};