import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, VolumeX } from 'lucide-react';
import { formatFullDate } from '../../utils/formatters';

export default function AlertList({ alerts = [], onResolve }) {
  if (alerts.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-white/10 shadow-glass">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-90 drop-shadow-sm" />
        <p className="font-bold text-white text-sm">Zone Compliant</p>
        <p className="text-xs text-slate-400 mt-1">No active acoustic threshold violations recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isCritical = alert.severity === 'CRITICAL';
        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl glass-card border flex items-start justify-between gap-4 transition-all duration-300 ${
              isCritical
                ? 'border-rose-500/30 hover:border-rose-500/50 hover:shadow-glass-glow-red'
                : 'border-amber-500/30 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl shrink-0 backdrop-blur-md border ${
                  isCritical
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-glass-glow-red'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}
              >
                {isCritical ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{formatFullDate(alert.created_at)}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white leading-snug">{alert.message}</p>
                <div className="flex items-center gap-3 text-xs text-slate-300 pt-0.5">
                  <span className="font-mono text-slate-400">
                    Recorded: <strong className="text-white font-bold">{alert.actual_value} dB(A)</strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="font-mono text-slate-400">
                    Threshold: <strong className="text-slate-200">{alert.threshold_exceeded} dB(A)</strong>
                  </span>
                </div>
              </div>
            </div>

            {onResolve && !alert.is_resolved && (
              <button
                onClick={() => onResolve(alert.id)}
                className="glass-pill glass-card-hover text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-200 shrink-0 border border-white/10 hover:border-sky-400/50 hover:text-sky-300 transition"
              >
                Acknowledge
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
