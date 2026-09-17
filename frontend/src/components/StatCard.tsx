import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue';
  badge?: string;
  trend?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  color = 'cyan',
  badge,
  trend,
  className = '',
  onClick,
}) => {
  const colorMap = {
    cyan: { border: 'border-cyan-500/30 hover:border-cyan-500/50', bgIcon: 'bg-cyan-500/10 text-cyan-400', glow: 'from-cyan-500/5 to-transparent', accent: 'text-cyan-400' },
    emerald: { border: 'border-emerald-500/30 hover:border-emerald-500/50', bgIcon: 'bg-emerald-500/10 text-emerald-400', glow: 'from-emerald-500/5 to-transparent', accent: 'text-emerald-400' },
    amber: { border: 'border-amber-500/30 hover:border-amber-500/50', bgIcon: 'bg-amber-500/10 text-amber-400', glow: 'from-amber-500/5 to-transparent', accent: 'text-amber-400' },
    rose: { border: 'border-rose-500/30 hover:border-rose-500/50', bgIcon: 'bg-rose-500/10 text-rose-400', glow: 'from-rose-500/5 to-transparent', accent: 'text-rose-400' },
    blue: { border: 'border-blue-500/30 hover:border-blue-500/50', bgIcon: 'bg-blue-500/10 text-blue-400', glow: 'from-blue-500/5 to-transparent', accent: 'text-blue-400' },
  };
  const scheme = colorMap[color];
  return (
    <div onClick={onClick} className={`relative overflow-hidden rounded-lg bg-black/60 backdrop-blur-xl border border-cyan-900/50 p-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:-translate-y-0.5' : ''} ${className}`}>
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${scheme.glow} blur-xl pointer-events-none`}></div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">{label}</span>
        <div className={`p-1.5 rounded-md ${scheme.bgIcon}`}><Icon className="w-3.5 h-3.5" /></div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-xl font-bold tracking-tight text-white font-mono">{value}</div>
        {subValue && <span className="text-xs text-slate-500 font-sans font-normal truncate">{subValue}</span>}
      </div>
      {(badge || trend) && (
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-cyan-950/80 text-[10px] font-mono">
          {badge && <span className="text-slate-500 truncate">{badge}</span>}
          {trend && <span className={`font-semibold ${scheme.accent}`}>{trend}</span>}
        </div>
      )}
    </div>
  );
};