import React from 'react';
import { getNoiseSeverity } from '../../utils/thresholds';

export default function NoiseBadge({ decibel, zone }) {
  const severity = getNoiseSeverity(decibel, zone);

  const styleMap = {
    safe: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    critical: 'bg-rose-500/15 text-rose-300 border-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
  };

  const labelMap = {
    safe: 'Normal',
    warning: 'Warning',
    critical: 'Critical Breach',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${styleMap[severity]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          severity === 'safe'
            ? 'bg-emerald-400'
            : severity === 'warning'
            ? 'bg-amber-400 animate-pulse'
            : 'bg-rose-400 animate-ping'
        }`}
      />
      {labelMap[severity]}
    </span>
  );
}
