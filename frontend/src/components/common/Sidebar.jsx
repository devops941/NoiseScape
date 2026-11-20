import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Map, Radio, BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Live Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Live Map', to: '/map', icon: Map },
  { label: 'Stations', to: '/stations', icon: Radio },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Alerts', to: '/alerts', icon: AlertTriangle },
];

export default function Sidebar() {
  return (
    <aside className="w-60 lg:w-64 h-full shrink-0 flex flex-col justify-between p-4 bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 overflow-y-auto">
      {/* Navigation List */}
      <nav className="space-y-2">
        <div className="px-3 pt-1 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Main Navigation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent text-sky-300 border border-sky-400/40 shadow-glass-glow-blue translate-x-1'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-sky-400/90" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Glassmorphic Regulatory Info Card */}
      <div className="glass-card p-3.5 rounded-2xl space-y-2 border border-white/10 mt-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>CPCB Standards</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Madurai acoustic limits enforced across Commercial, Residential & Silence zones.
        </p>
        <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Day: 06:00-22:00</span>
          <span>Night: 22:00-06:00</span>
        </div>
      </div>
    </aside>
  );
}
