import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const ClassificationPieChart: React.FC<{ oilProb: number; lookalikeProb: number; noOilProb: number }> = ({ oilProb, lookalikeProb, noOilProb }) => {
  const data = [
    { name: 'Oil Spill', value: oilProb, color: '#f43f5e' },
    { name: 'Natural Look-alike', value: lookalikeProb, color: '#fbbf24' },
    { name: 'Clean Sea Surface', value: noOilProb, color: '#06b6d4' },
  ];
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">{data.map((entry, idx) => <Cell key={idx} fill={entry.color} stroke="#091224" strokeWidth={2} />)}</Pie>
        <Tooltip contentStyle={{ backgroundColor: '#091224', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }} formatter={(v: number) => [`${v}%`, 'Probability']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SpillGrowthAreaChart: React.FC = () => {
  const data = [
    { time: 'T-0h', area: 42.7, label: 'Detected' },
    { time: '+6h', area: 56.4, label: 'Forecast' },
    { time: '+12h', area: 74.1, label: 'Forecast' },
    { time: '+24h', area: 108.5, label: 'Alibaug Alert' },
    { time: '+48h', area: 162.0, label: 'Mumbai Ent.' },
  ];
  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs><linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient></defs>
          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ backgroundColor: '#091224', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }} formatter={(v: number) => [`${v} km²`, 'Surface Area']} />
          <Area type="monotone" dataKey="area" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const EvidenceRadarChart: React.FC = () => {
  const data = [
    { subject: 'Satellite SAR', value: 94, fullMark: 100 },
    { subject: 'AIS Trajectory', value: 91, fullMark: 100 },
    { subject: 'Drift Hindcast', value: 87, fullMark: 100 },
    { subject: 'Weather Match', value: 84, fullMark: 100 },
    { subject: 'Speed Anomaly', value: 74, fullMark: 100 },
  ];
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
          <Radar name="Evidence Fusion Confidence" dataKey="value" stroke="#06b6d4" fill="#0891b2" fillOpacity={0.5} />
          <Tooltip contentStyle={{ backgroundColor: '#091224', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }} formatter={(v: number) => [`${v}%`, 'Confidence']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopCandidatesBarChart: React.FC<{ vessels: Array<{ name: string; totalAssociationScore: number }> }> = ({ vessels }) => {
  const data = vessels.slice(0, 5).map(v => ({ name: v.name.replace('MV ', ''), score: v.totalAssociationScore }));
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, left: 15, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11, fill: '#cbd5e1' }} width={80} />
          <Tooltip contentStyle={{ backgroundColor: '#091224', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }} formatter={(v: number) => [`${v}%`, 'Association Score']} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, idx) => <Cell key={idx} fill={entry.score >= 85 ? '#f43f5e' : entry.score >= 70 ? '#fb923c' : '#eab308'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};