import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatDateTime } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function NoiseTrendChart({ readings = [], title = 'Real-time Sound Pressure Level (dB)' }) {
  const sorted = [...readings].reverse();
  const labels = sorted.map((r) => formatDateTime(r.recorded_at));
  const dataPoints = sorted.map((r) => r.decibel_value);

  const data = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [
      {
        label: 'Sound Level dB(A)',
        data: dataPoints.length ? dataPoints : [0],
        borderColor: '#38bdf8',
        backgroundColor: (context) => {
          const ctx = context.chart?.ctx;
          if (!ctx) return 'rgba(56, 189, 248, 0.15)';
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
          gradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.05)');
          gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 30,
        max: 110,
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', maxTicksLimit: 7, font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        titleColor: '#f8fafc',
        bodyColor: '#38bdf8',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Sound Level: ${context.parsed.y.toFixed(1)} dB(A)`,
        },
      },
    },
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</h3>
        <span className="flex items-center gap-1.5 text-[11px] text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Acoustic Wave
        </span>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
