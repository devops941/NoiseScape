import React, { useState } from 'react';
import { Radio, Plus, MapPin, X } from 'lucide-react';
import { useNoise } from '../context/NoiseContext';
import { stationService } from '../services/stationService';
import NoiseBadge from '../components/common/NoiseBadge';
import { formatDecibels, formatFullDate } from '../utils/formatters';

export default function Stations() {
  const { stations, refreshData } = useNoise();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    zone: 'COMMERCIAL',
    latitude: 9.9252,
    longitude: 78.1198,
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stationService.create({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      setShowModal(false);
      setFormData({ name: '', zone: 'COMMERCIAL', latitude: 9.9252, longitude: 78.1198, description: '' });
      refreshData();
    } catch (err) {
      alert(`Error creating station: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-400" />
            Monitoring Stations Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Designated sound monitoring stations and regulatory CPCB zones in Madurai.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="glass-pill glass-card-hover flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-sky-300 hover:text-white border border-sky-500/30 shadow-glass-glow-blue transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Monitoring Station
        </button>
      </div>

      {/* Glassmorphic Table Container */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Station Name</th>
                <th className="px-6 py-4">Zone Category</th>
                <th className="px-6 py-4">Latest Decibels</th>
                <th className="px-6 py-4">CPCB Status</th>
                <th className="px-6 py-4">GPS Coordinates</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {stations.map((st) => (
                <tr key={st.id} className="hover:bg-white/[0.04] transition-colors duration-150">
                  <td className="px-6 py-4.5 font-bold text-white flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    {st.name}
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/[0.06] text-slate-200 border border-white/10">
                      {st.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 font-mono font-bold text-sky-300 text-sm">
                    {formatDecibels(st.latest_decibel)}
                  </td>
                  <td className="px-6 py-4.5">
                    <NoiseBadge decibel={st.latest_decibel} zone={st.zone} />
                  </td>
                  <td className="px-6 py-4.5 text-xs font-mono text-slate-400">
                    {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-4.5 text-xs text-slate-400">
                    {formatFullDate(st.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Glassmorphic Add Station Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card rounded-2xl border border-white/20 max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                Register New Monitoring Node
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Station Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  placeholder="e.g. Arapalayam Bus Stand Junction"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Zone Category
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="COMMERCIAL" className="bg-slate-900 text-white">Commercial Zone (65 dB Day / 55 dB Night)</option>
                  <option value="RESIDENTIAL" className="bg-slate-900 text-white">Residential Zone (55 dB Day / 45 dB Night)</option>
                  <option value="SILENT" className="bg-slate-900 text-white">Silent Zone (50 dB Day / 40 dB Night)</option>
                  <option value="INDUSTRIAL" className="bg-slate-900 text-white">Industrial Zone (75 dB Day / 70 dB Night)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Location Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                  placeholder="Landmark or locality notes"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="glass-pill px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-glass-glow-blue transition"
                >
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
