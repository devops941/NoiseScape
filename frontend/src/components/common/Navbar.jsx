import React from 'react';
import { Volume2, Bell, RefreshCw, Radio, MapPin } from 'lucide-react';
import { useNoise } from '../../context/NoiseContext';

export default function Navbar() {
  const { alerts, refreshData, loading } = useNoise();

  return (
    <header className="h-16 sticky top-0 z-40 bg-slate-900/70 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      {/* Brand Identity */}
      <a href="/" className="flex items-center gap-3 group">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition animate-pulse-slow" />
          <div className="relative p-2.5 bg-slate-900/90 border border-white/20 rounded-xl text-sky-400">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              NoiseScape
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              v1.0 Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
            Madurai District Acoustic Network
          </p>
        </div>
      </a>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Network Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-pill text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300">6 Sectors Monitored</span>
        </div>

        {/* Sync Button */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="glass-pill glass-card-hover px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
          title="Sync with Backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="glass-pill glass-card-hover p-2 rounded-xl text-slate-300 transition relative">
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-slate-900 shadow-glass-glow-red animate-pulse">
                {alerts.length > 99 ? '99+' : alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
