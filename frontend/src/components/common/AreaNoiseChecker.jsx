import React, { useState } from 'react';
import { Search, MapPin, ShieldAlert, ShieldCheck, AlertTriangle, Clock, Volume2, Info, HeartPulse } from 'lucide-react';
import { formatDecibels } from '../../utils/formatters';
import { getZoneThreshold, isDaytime } from '../../utils/thresholds';

const FALLBACK_STATION = {
  id: 1,
  name: "Periyar Bus Stand Terminal",
  zone: "COMMERCIAL",
  latest_decibel: 72.9,
  description: "Central transit hub & railway junction zone, Madurai"
};

export default function AreaNoiseChecker({ stations = [] }) {
  const [selectedStationId, setSelectedStationId] = useState(1);

  const selectedStation = (stations && stations.length > 0)
    ? (stations.find((s) => s.id === Number(selectedStationId)) || stations[0])
    : FALLBACK_STATION;
  const daytime = isDaytime();
  const currentDb = selectedStation?.latest_decibel ?? 65.0;
  const threshold = selectedStation ? getZoneThreshold(selectedStation.zone) : 65.0;
  const diff = currentDb - threshold;
  const isBreach = diff > 0;

  // Health and Advisory determination based on WHO & CPCB guidelines
  const getAdvisory = (db, zone) => {
    if (db < 55) {
      return {
        status: 'Peaceful & Safe',
        color: 'emerald',
        badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        ringColor: '#10b981',
        advice: 'Excellent sound environment. Safe for study, relaxation, sleep, and vulnerable individuals.',
        risk: 'Nil (Optimal acoustic comfort)',
      };
    } else if (db <= 70) {
      return {
        status: 'Moderate Noise',
        color: 'amber',
        badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        ringColor: '#f59e0b',
        advice: 'Typical urban daytime ambience. Tolerable for short periods; prolonged exposure may cause mild mental fatigue.',
        risk: 'Low to Mild stress over long hours',
      };
    } else if (db <= 85) {
      return {
        status: 'High Noise Pollution',
        color: 'rose',
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
        ringColor: '#f43f5e',
        advice: 'Exceeds standard human comfort levels. Annoyance, elevated heart rate, and speech interference likely.',
        risk: 'High risk of auditory fatigue & headache',
      };
    } else {
      return {
        status: 'Dangerous Decibel Spike',
        color: 'red',
        badgeClass: 'bg-red-600/20 text-red-300 border-red-500/50 animate-pulse',
        ringColor: '#ef4444',
        advice: 'Harmful sound level. Protective hearing equipment or immediate mitigation recommended.',
        risk: 'Potential temporary hearing threshold shift',
      };
    }
  };

  const advisory = getAdvisory(currentDb, selectedStation?.zone);

  // Percentage for the gauge meter (0 to 120 dB range)
  const gaugePercent = Math.min(100, Math.max(0, ((currentDb - 30) / (110 - 30)) * 100));

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-5 sm:p-6 shadow-glass relative overflow-hidden">
      {/* Dynamic ambient background glow based on decibels */}
      <div
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: advisory.ringColor }}
      />

      <div className="relative z-10 space-y-5">
        {/* Header & Area Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-sky-400" />
              Area Noise & Safety Checker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any Madurai neighborhood to check current acoustic levels, permissible limits, and safety status.
            </p>
          </div>

          {/* Location Dropdown */}
          <div className="relative min-w-[240px]">
            <MapPin className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedStation?.id || ''}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-white focus:outline-none cursor-pointer appearance-none"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id} className="bg-slate-900 text-slate-200">
                  {st.name} ({st.zone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Area Acoustic Spotlight */}
        {selectedStation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* 1. Decibel Gauge & Meter */}
            <div className="glass-pill p-5 rounded-2xl border border-white/10 text-center space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Sound Level
              </span>

              <div className="relative inline-flex items-center justify-center">
                {/* Visual Circular Gauge SVG */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke={advisory.ringColor}
                    strokeWidth="10"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * gaugePercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {currentDb.toFixed(1)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">dB(A)</span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${advisory.badgeClass}`}>
                  {advisory.status}
                </span>
              </div>
            </div>

            {/* 2. Regulatory Comparison & Area Details */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStation.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    {selectedStation.description || 'Madurai Municipal Corporation Area'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700">
                    {selectedStation.zone} ZONE
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold glass-pill text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    {daytime ? 'Day Window' : 'Night Window'}
                  </span>
                </div>
              </div>

              {/* Threshold Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Permissible Limit</span>
                  <span className="text-base font-extrabold text-slate-200">{threshold} dB(A)</span>
                  <span className="text-[10px] text-slate-400 block font-mono">CPCB Standard</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Variance / Gap</span>
                  <span
                    className={`text-base font-extrabold ${
                      isBreach ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isBreach ? `+${diff.toFixed(1)} dB` : `${diff.toFixed(1)} dB`}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isBreach ? 'Above Allowed Limit' : 'Within Allowed Limit'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Night Limit</span>
                  <span className="text-base font-extrabold text-indigo-300">
                    {selectedStation.zone === 'COMMERCIAL'
                      ? '55.0 dB'
                      : selectedStation.zone === 'RESIDENTIAL'
                      ? '45.0 dB'
                      : selectedStation.zone === 'SILENT'
                      ? '40.0 dB'
                      : '70.0 dB'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">22:00 to 06:00 hrs</span>
                </div>
              </div>

              {/* Health & Public Advisory Box */}
              <div className="p-3.5 rounded-xl glass-pill border border-white/10 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-slate-200">Public Health Advisory</p>
                  <p className="text-slate-300 leading-relaxed">{advisory.advice}</p>
                  <p className="text-[11px] text-slate-400 pt-0.5">
                    <strong>Health Impact:</strong> {advisory.risk}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

