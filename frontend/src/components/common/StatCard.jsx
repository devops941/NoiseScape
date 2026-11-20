import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    blue: {
      glow: 'from-sky-500/20 to-blue-600/5',
      border: 'border-sky-500/30',
      iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-glass-glow-blue',
      badge: 'text-sky-400',
    },
    emerald: {
      glow: 'from-emerald-500/20 to-teal-600/5',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glass-glow-emerald',
      badge: 'text-emerald-400',
    },
    amber: {
      glow: 'from-amber-500/20 to-orange-600/5',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      badge: 'text-amber-400',
    },
    red: {
      glow: 'from-rose-500/20 to-red-600/5',
      border: 'border-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-glass-glow-red',
      badge: 'text-rose-400',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="relative group overflow-hidden rounded-2xl glass-card glass-card-hover p-5 border border-white/10">
      {/* Dynamic corner ambient glow */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${scheme.glow} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {value ?? '--'}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
          {trend && <p className="text-[11px] text-slate-400 mt-2.5 font-medium flex items-center gap-1.5">{trend}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} transition-transform group-hover:scale-110 duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
