import React, { useState } from 'react';
import { Sparkles, BrainCircuit, MapPin, Clock, Gauge, AlertTriangle, ShieldCheck, HeartPulse, ChevronRight } from 'lucide-react';
import { predictionService } from '../../services/predictionService';
import { Line } from 'react-chartjs-2';

const POPULAR_MADURAI_AREAS = [
  { name: 'Simmakkal Junction', zone: 'COMMERCIAL', traffic: 'HIGH' },
  { name: 'Arapalayam Bus Terminus', zone: 'COMMERCIAL', traffic: 'HIGH' },
  { name: 'K.K. Nagar Residential Colony', zone: 'RESIDENTIAL', traffic: 'NORMAL' },
  { name: 'Teppakulam Vandiyur Lake Road', zone: 'RESIDENTIAL', traffic: 'NORMAL' },
  { name: 'Sellur Vaigai North Bank', zone: 'RESIDENTIAL', traffic: 'NORMAL' },
  { name: 'Meenakshi Mission Hospital Zone', zone: 'SILENT', traffic: 'LOW' },
  { name: 'Madurai High Court Bench Zone', zone: 'SILENT', traffic: 'LOW' },
  { name: 'Villapuram Housing Board', zone: 'RESIDENTIAL', traffic: 'NORMAL' },
];

export default function RandomAreaPredictor() {
  const [areaName, setAreaName] = useState('Simmakkal Junction');
  const [zone, setZone] = useState('COMMERCIAL');
  const [hour, setHour] = useState(18); // Default 6:00 PM evening peak
  const [trafficLevel, setTrafficLevel] = useState('HIGH');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await predictionService.predictNoise({
        area_name: areaName || 'Custom Location',
        zone: zone,
        hour: parseInt(hour),
        traffic_level: trafficLevel,
      });
      setPrediction(res);
    } catch (err) {
      alert(`ML Prediction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (place) => {
    setAreaName(place.name);
    setZone(place.zone);
    setTrafficLevel(place.traffic);
  };

  // Forecast chart data
  const forecastData = prediction ? {
    labels: prediction.hourly_forecast.map((f) => f.hour),
    datasets: [
      {
        label: 'Predicted Noise dB(A)',
        data: prediction.hourly_forecast.map((f) => f.predicted_db),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
      },
      {
        label: 'CPCB Permissible Limit',
        data: prediction.hourly_forecast.map((f) => f.limit),
        borderColor: '#f43f5e',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 35,
        max: 95,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.02)' },
        ticks: { color: '#94a3b8', maxTicksLimit: 8, font: { size: 10 } },
      },
    },
    plugins: {
      legend: {
        labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 10 } },
      },
    },
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-5 sm:p-6 shadow-glass space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              Machine Learning Noise Predictor (Any Area)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Random Forest Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predict sound levels (dB(A)) and regulatory compliance for any neighborhood in Madurai using historical machine learning patterns.
          </p>
        </div>
      </div>

      {/* Quick Select Popular Madurai Neighborhoods */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Select Madurai Areas (or type any custom location below):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_MADURAI_AREAS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleQuickSelect(p)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${areaName === p.name
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-glass-glow-blue'
                  : 'glass-pill text-slate-300 hover:text-white hover:bg-white/[0.08] border-white/10'
                }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Input Form */}
      <form onSubmit={handlePredict} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
        <div>
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
            Area / Street Name
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="e.g. Simmakkal, Arapalayam, K.K. Nagar"
              className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
            Designated Zone Type
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="COMMERCIAL" className="bg-slate-900">Commercial (65 dB Day / 55 dB Night)</option>
            <option value="RESIDENTIAL" className="bg-slate-900">Residential (55 dB Day / 45 dB Night)</option>
            <option value="SILENT" className="bg-slate-900">Silent / Hospital (50 dB Day / 40 dB Night)</option>
            <option value="INDUSTRIAL" className="bg-slate-900">Industrial (75 dB Day / 70 dB Night)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
            Target Time of Day
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value={9} className="bg-slate-900">09:00 AM (Morning Rush Hour)</option>
              <option value={14} className="bg-slate-900">02:00 PM (Afternoon Midday)</option>
              <option value={18} className="bg-slate-900">06:00 PM (Evening Rush Peak)</option>
              <option value={20} className="bg-slate-900">08:00 PM (Dinner / Traffic Market)</option>
              <option value={23} className="bg-slate-900">11:00 PM (Late Night Silent)</option>
              <option value={3} className="bg-slate-900">03:00 AM (Early Dawn Quiet)</option>
            </select>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-glass-glow-blue transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'Running ML Model...' : 'Predict Noise Level'}
          </button>
        </div>
      </form>

      {/* Prediction Output Spotlight */}
      {prediction && (
        <div className="pt-3 border-t border-white/10 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Decibel Metric Card */}
            <div className="p-4 rounded-xl glass-pill border border-white/10 text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                ML Predicted Sound Pressure
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className={`text-4xl font-black ${prediction.is_breach ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                >
                  {prediction.predicted_decibels}
                </span>
                <span className="text-xs text-slate-400 font-mono">dB(A)</span>
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold border ${prediction.is_breach
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                >
                  {prediction.severity === 'CRITICAL'
                    ? 'Critical CPCB Violation'
                    : prediction.is_breach
                      ? 'Warning: Exceeds Limit'
                      : 'Normal: Within Limit'}
                </span>
              </div>
            </div>

            {/* Threshold & Comparison Details */}
            <div className="p-4 rounded-xl glass-pill border border-white/10 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  {prediction.area_name}
                </h4>
                <span className="text-xs font-mono font-bold text-sky-300">
                  {prediction.target_hour} Forecast
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-slate-400 text-[10px] block">Zone Type</span>
                  <strong className="text-white">{prediction.zone}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-slate-400 text-[10px] block">Permissible Limit</span>
                  <strong className="text-white">{prediction.permissible_limit} dB(A)</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.04] col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block">Estimated Leq</span>
                  <strong className="text-sky-300">{prediction.predicted_leq} dB(A)</strong>
                </div>
              </div>

              {/* Health Advisory */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/10 flex items-start gap-2.5 text-xs">
                <HeartPulse className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  <strong>AI Acoustic Assessment:</strong> {prediction.health_advisory}
                </p>
              </div>
            </div>
          </div>

          {/* 24-Hour Forecast Curve for the selected area */}
          <div className="p-4 rounded-xl glass-pill border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                24-Hour Predictive Noise Curve for {prediction.area_name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Red dashed line = CPCB Day/Night Threshold
              </span>
            </div>
            <div className="h-44">
              {forecastData && <Line data={forecastData} options={chartOptions} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

