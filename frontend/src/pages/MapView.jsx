import React from 'react';
import { Navigation } from 'lucide-react';
import { useNoise } from '../context/NoiseContext';
import NoiseMap from '../components/map/NoiseMap';
import NoiseBadge from '../components/common/NoiseBadge';
import { formatDecibels } from '../utils/formatters';

export default function MapView() {
  const { stations } = useNoise();

  return (
    <div className="space-y-3.5">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Navigation className="w-4 h-4 text-sky-400" />
            Madurai Urban Noise GIS Map
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Geographic information system visualizing acoustic wave radiuses across Periyar, Mattuthavani, Anna Nagar, Kalavasal & GRH.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="glass-pill px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300">
            6 Nodes Plotted
          </span>
        </div>
      </div>

      {/* Screen-Optimized Map Container */}
      <div className="h-[390px] sm:h-[410px]">
        <NoiseMap stations={stations} />
      </div>

      {/* Station Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {stations.map((s) => (
          <div key={s.id} className="glass-card glass-card-hover p-3 rounded-xl space-y-1.5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {s.zone}
              </span>
              <NoiseBadge decibel={s.latest_decibel} zone={s.zone} />
            </div>
            <p className="font-bold text-white text-xs truncate" title={s.name}>{s.name}</p>
            <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
              <span className="text-[10px] text-slate-400">Current</span>
              <span className="text-sm font-extrabold text-sky-400">{formatDecibels(s.latest_decibel)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
