import React from 'react';
import {
  Satellite,
  CheckCircle2,
  Waves,
  MapPin,
  Ship,
  Award,
  Clock
} from 'lucide-react';

interface TimelineEvent {
  time: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  completed: boolean;
}

export const Timeline: React.FC = () => {
  const events: TimelineEvent[] = [
    {
      time: '14:20 UTC',
      title: 'Satellite Detection',
      subtitle: 'Sentinel-1B SAR pass',
      description: 'Acquisition of Level-1 IW ground-range detected radar image.',
      icon: Satellite,
      color: 'text-sky-600 bg-sky-100 border-sky-300',
      completed: true,
    },
    {
      time: '14:35 UTC',
      title: 'Spill Confirmed',
      subtitle: 'Neural segmentation',
      description: '42.7 km² dark anomaly classified as crude oil with 94.2% confidence.',
      icon: CheckCircle2,
      color: 'text-rose-500 bg-rose-100 border-rose-300',
      completed: true,
    },
    {
      time: '15:10 UTC',
      title: 'Drift Hindcast',
      subtitle: 'Reverse hydrodynamic modeling',
      description: 'Coupled current (1.4 kts NE) and wind (14.5 kts) reverse simulation.',
      icon: Waves,
      color: 'text-cyan-600 bg-cyan-100 border-cyan-300',
      completed: true,
    },
    {
      time: '15:40 UTC',
      title: 'Origin Zone Identified',
      subtitle: 'Release point reconstruction',
      description: 'Spill point localized at 18.642° N, 72.841° E for release window 11:30-12:00 UTC.',
      icon: MapPin,
      color: 'text-amber-600 bg-amber-100 border-amber-300',
      completed: true,
    },
    {
      time: '16:00 UTC',
      title: 'Historical AIS Search',
      subtitle: '50 km spatial-temporal buffer',
      description: 'Ingested 10 vessel tracks; identified 7 candidate vessels.',
      icon: Ship,
      color: 'text-indigo-600 bg-indigo-100 border-indigo-300',
      completed: true,
    },
    {
      time: '16:20 UTC',
      title: 'Vessel Ranking Complete',
      subtitle: 'Multi-criteria attribution',
      description: 'Top candidate MV Ocean Star scored 91% association.',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-100 border-emerald-300',
      completed: true,
    },
  ];

  return (
    <div className="rounded-xl border border-sky-200 bg-white/90 backdrop-blur-sm p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          <h3 className="font-bold text-[#1A3A5C] text-base tracking-wide">
            Incident Chronology
          </h3>
        </div>
        <span className="text-xs font-mono text-sky-600 px-2 py-0.5 rounded bg-sky-100 border border-sky-200">
          CHRONO-FLOW • COMPLETED
        </span>
      </div>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-sky-400 before:via-blue-400 before:to-emerald-400">
        {events.map((event, idx) => {
          const Icon = event.icon;
          return (
            <div key={idx} className="relative group">
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center ${event.color} shadow-sm transition-transform group-hover:scale-110`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="p-3.5 rounded-lg bg-white/80 border border-sky-200 group-hover:border-sky-400 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="font-bold text-sm text-[#1A3A5C] flex items-center gap-2">
                    <span>{event.title}</span>
                  </div>
                  <span className="font-mono text-xs text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {event.time}
                  </span>
                </div>
                <div className="text-xs text-[#1A3A5C]/60 font-mono mt-0.5">
                  {event.subtitle}
                </div>
                <p className="text-xs text-[#1A3A5C]/80 mt-2 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};