import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Bell, RefreshCw, MapPin, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNoise } from '../../context/NoiseContext';

export default function Navbar() {
  const { alerts, refreshData, loading } = useNoise();
  const [showDropdown, setShowDropdown] = useState(false);
  const [badgeDismissed, setBadgeDismissed] = useState(false);
  const dropdownRef = useRef(null);

  // Filter only recent critical alerts (max 3) for the notification bell
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && !a.is_resolved);
  const recentAlerts = alerts.slice(0, 4);
  const displayCount = badgeDismissed ? 0 : Math.min(criticalAlerts.length || alerts.length, 3);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismissBadge = () => {
    setBadgeDismissed(true);
  };

  return (
    <header className="h-16 shrink-0 z-40 bg-slate-900/80 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      {/* Brand Identity */}
      <Link to="/" className="flex items-center gap-3 group">
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
      </Link>

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
          className="glass-pill glass-card-hover px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition cursor-pointer"
          title="Sync with Backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Notifications Bell & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setShowDropdown(!showDropdown);
              setBadgeDismissed(true);
            }}
            className="glass-pill glass-card-hover p-2 rounded-xl text-slate-300 transition relative cursor-pointer"
            title="Acoustic Alerts"
          >
            <Bell className="w-4 h-4" />
            {displayCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-slate-900 shadow-glass-glow-red animate-pulse">
                {displayCount}
              </span>
            )}
          </button>

          {/* Glassmorphic Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-card border border-white/15 bg-slate-900/95 backdrop-blur-2xl p-4 shadow-2xl z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Breaches
                  </span>
                </div>
                <button
                  onClick={handleDismissBadge}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clear Badge
                </button>
              </div>

              {/* Alert items */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 hover:bg-white/[0.06] transition"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            alt.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {alt.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alt.actual_value} dB(A)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 line-clamp-2">
                        {alt.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No active alerts detected.</p>
                )}
              </div>

              {/* Footer View All Link */}
              <div className="pt-2 border-t border-white/10">
                <Link
                  to="/alerts"
                  onClick={() => setShowDropdown(false)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 flex items-center justify-center gap-1.5 transition"
                >
                  View Full Alerts Registry
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
