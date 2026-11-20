import React from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  ArrowRight,
  Navigation,
  Activity,
} from 'lucide-react';
import AcousticWaveVisualizer from '../components/common/AcousticWaveVisualizer';

export default function LandingPage() {
  return (
    <div className="h-full flex flex-col justify-between py-1 sm:py-2">
      {/* HERO SECTION - SCREEN-FITTED HERO CARD */}
      <section className="relative overflow-hidden rounded-3xl glass-card border border-white/10 px-6 py-5 sm:px-10 sm:py-6 lg:px-12 lg:py-7 shadow-2xl text-center space-y-3 sm:space-y-4 my-auto max-w-5xl mx-auto w-full">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-sky-500/20 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 sm:space-y-3">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-sky-400/30 text-[11px] font-semibold text-sky-300 shadow-glass-glow-blue animate-float">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            AI-Driven Urban Acoustic Intelligence Platform
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-snug">
            <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
              NoiseScape
            </span>{' '}
            – Urban Sound Pollution Mapping &amp; Exposure Intelligence
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            AI-powered environmental sound pollution monitoring, predictive noise exposure analysis, and CPCB regulatory compliance for Madurai city.
          </p>

          {/* Futuristic Acoustic Soundwave Equalizer Animation */}
          <AcousticWaveVisualizer />

          {/* Direct Page Jump Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-glass-glow-blue transition-all duration-300 flex items-center gap-2 group cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Launch Live Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/map"
              className="glass-pill glass-card-hover px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white border border-white/15 transition flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              Full-Screen GIS Map
            </Link>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-white">6</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Madurai Key Sectors</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-sky-400">1,008+</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Acoustic Records</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">CPCB</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Schedule IV Compliant</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-xl sm:text-2xl font-black text-indigo-400">Random Forest</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">ML Prediction Model</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-2 flex items-center justify-center text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-bold text-slate-300">NoiseScape</span>
          <span className="text-slate-400 font-mono tracking-wider ml-1">@2026</span>
        </div>
      </footer>
    </div>
  );
}
