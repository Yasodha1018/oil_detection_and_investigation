import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle, ChevronRight, ShieldAlert, BellOff } from 'lucide-react';
import { NotificationItem, PageId } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (page: PageId) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const getCategoryStyles = (category: NotificationItem['category']) => {
    switch (category) {
      case 'HIGH PRIORITY': return { icon: AlertCircle, badge: 'bg-rose-950/80 text-rose-300 border-rose-700/60', dot: 'bg-rose-500', targetPage: 'satellite' as PageId };
      case 'INVESTIGATION': return { icon: AlertTriangle, badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60', dot: 'bg-amber-500', targetPage: 'ais' as PageId };
      case 'DRIFT UPDATE': return { icon: Info, badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60', dot: 'bg-yellow-400', targetPage: 'drift' as PageId };
      case 'ANALYSIS COMPLETE': return { icon: CheckCircle, badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60', dot: 'bg-emerald-400', targetPage: 'investigation' as PageId };
      default: return { icon: Info, badge: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400', targetPage: 'dashboard' as PageId };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#091122] border-l border-cyan-900/50 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-cyan-900/40 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-cyan-400" /><h2 className="font-bold text-white text-base tracking-wide">Operations Alert Feed</h2><span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">{notifications.length}</span></div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && <button onClick={onMarkAllAsRead} className="text-xs text-slate-400 hover:text-rose-300 hover:underline px-2 py-1">Clear all</button>}
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500"><BellOff className="w-10 h-10 mb-2 opacity-50" /><p className="text-sm font-medium">No active alerts</p><p className="text-xs text-slate-600 mt-1">All parameters within normal baselines</p></div>
          ) : (
            notifications.map((item) => {
              const { icon: Icon, badge, dot, targetPage } = getCategoryStyles(item.category);
              return (
                <div key={item.id} className="relative p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-800/60 transition-all group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${dot} animate-pulse`}></span><span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge}`}>{item.category}</span></div>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100 mt-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                    <button onClick={() => { onNavigate(targetPage); onClose(); }} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">Open module <ChevronRight className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onMarkAsRead(item.id)} className="text-[11px] text-slate-500 hover:text-slate-300">Dismiss</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="p-3 border-t border-cyan-900/30 bg-slate-950 text-[11px] text-slate-500 text-center font-mono">AUTOMATED INCIDENT TRIAGE ENGINE • SIH26143</div>
      </div>
    </div>
  );
};