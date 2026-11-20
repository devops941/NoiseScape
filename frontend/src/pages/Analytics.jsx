import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { readingService } from '../services/readingService';
import ZoneBarChart from '../components/charts/ZoneBarChart';
import NoiseTrendChart from '../components/charts/NoiseTrendChart';

export default function Analytics() {
  const [zoneData, setZoneData] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      readingService.getZoneCompliance().catch(() => ({ zones: [] })),
      readingService.getReadings({ limit: 50 }).catch(() => []),
    ]).then(([complianceRes, readingsRes]) => {
      setZoneData(complianceRes.zones || []);
      setReadings(readingsRes || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            Environmental Noise Compliance Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statistical distribution, decibel averages, and CPCB regulatory compliance across Madurai zones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="glass-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 border border-emerald-500/20">
            CPCB Schedule IV Benchmark
          </span>
        </div>
      </div>

      {/* Visual Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZoneBarChart zoneData={zoneData} />
        <NoiseTrendChart readings={readings} title="Historical Acoustic Profile (dB)" />
      </div>

      {/* Glassmorphic Compliance Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-glass">
        <div className="p-4 sm:px-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Zone Regulatory Audit Breakdown
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">1,008 Audited Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Zone Type</th>
                <th className="px-6 py-4">Total Samples</th>
                <th className="px-6 py-4">Compliant</th>
                <th className="px-6 py-4">Breaches</th>
                <th className="px-6 py-4">Average Sound Level</th>
                <th className="px-6 py-4">Compliance Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {zoneData.map((row) => (
                <tr key={row.zone} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-4.5 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    {row.zone}
                  </td>
                  <td className="px-6 py-4.5 font-mono">{row.total_readings}</td>
                  <td className="px-6 py-4.5 font-mono font-bold text-emerald-400">{row.compliant_readings}</td>
                  <td className="px-6 py-4.5 font-mono font-bold text-rose-400">{row.breach_readings}</td>
                  <td className="px-6 py-4.5 font-mono font-bold text-sky-300">{row.average_db} dB(A)</td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            row.compliance_percentage >= 70
                              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                              : row.compliance_percentage >= 40
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                              : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                          }`}
                          style={{ width: `${Math.max(5, row.compliance_percentage)}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          row.compliance_percentage >= 70
                            ? 'text-emerald-400'
                            : row.compliance_percentage >= 40
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {row.compliance_percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
