import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Filter } from 'lucide-react';
import { useNoise } from '../context/NoiseContext';
import { alertService } from '../services/alertService';
import AlertList from '../components/alerts/AlertList';

export default function Alerts() {
  const { alerts, refreshData } = useNoise();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING'

  const handleResolve = async (id) => {
    try {
      await alertService.resolve(id);
      refreshData();
    } catch (err) {
      alert(`Error resolving alert: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'WARNING') return a.severity === 'WARNING';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Active Threshold Violations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of decibel measurements exceeding permissible Day/Night limits across Madurai.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-pill self-start sm:self-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === 'ALL'
                ? 'bg-sky-500 text-white shadow-glass-glow-blue'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === 'CRITICAL'
                ? 'bg-rose-500 text-white shadow-glass-glow-red'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter('WARNING')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === 'WARNING'
                ? 'bg-amber-500 text-white'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            Warning
          </button>
        </div>
      </div>

      <AlertList alerts={filteredAlerts} onResolve={handleResolve} />
    </div>
  );
}
