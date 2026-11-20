import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ZoneBarChart({ zoneData = [] }) {
  const labels = zoneData.map((z) => z.zone);
  const avgDb = zoneData.map((z) => z.average_db);
  const compliance = zoneData.map((z) => z.compliance_percentage);

  const data = {
    labels: labels.length ? labels : ['Silent', 'Residential', 'Commercial', 'Industrial'],
    datasets: [
      {
        label: 'Average Decibels dB(A)',
        data: avgDb.length ? avgDb : [0, 0, 0, 0],
        backgroundColor: 'rgba(56, 189, 248, 0.75)',
        borderColor: '#38bdf8',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Compliance Rate (%)',
        data: compliance.length ? compliance : [100, 100, 100, 100],
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          boxWidth: 12,
          font: { size: 11, weight: 'bold' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        titleColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Zone Compliance & Average Levels</h3>
        <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          CPCB Targets
        </span>
      </div>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
