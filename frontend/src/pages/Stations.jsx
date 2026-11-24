import React, { useState } from 'react';
import { Radio, Plus, MapPin, X, Pencil, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNoise } from '../context/NoiseContext';
import { stationService } from '../services/stationService';
import NoiseBadge from '../components/common/NoiseBadge';
import { formatDecibels, formatFullDate } from '../utils/formatters';

export default function Stations() {
  const { stations, refreshData } = useNoise();

  // Add Station Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    zone: 'COMMERCIAL',
    latitude: 9.9252,
    longitude: 78.1198,
    description: '',
  });
  const [addErrors, setAddErrors] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  // Edit Station Modal States
  const [editingStation, setEditingStation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    zone: 'COMMERCIAL',
    status: 'ACTIVE',
    latitude: '',
    longitude: '',
    description: '',
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Global Notification Banner (Success / Error)
  const [notification, setNotification] = useState(null);

  // Validation function
  const validateStationData = (data) => {
    const errors = {};
    if (!data.name || !data.name.trim()) {
      errors.name = 'Station name cannot be empty.';
    } else if (data.name.trim().length > 100) {
      errors.name = 'Station name cannot exceed 100 characters.';
    }

    const lat = parseFloat(data.latitude);
    if (data.latitude === '' || data.latitude === null || isNaN(lat)) {
      errors.latitude = 'Valid latitude is required.';
    } else if (lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90.';
    }

    const lng = parseFloat(data.longitude);
    if (data.longitude === '' || data.longitude === null || isNaN(lng)) {
      errors.longitude = 'Valid longitude is required.';
    } else if (lng < -180 || lng > 180) {
      errors.longitude = 'Longitude must be between -180 and 180.';
    }

    return errors;
  };

  // Open Edit Modal with selected station's existing details
  const handleOpenEditModal = (station) => {
    setEditingStation(station);
    setEditFormData({
      id: station.id,
      name: station.name || '',
      zone: station.zone || 'COMMERCIAL',
      status: station.status || 'ACTIVE',
      latitude: station.latitude !== undefined ? station.latitude : '',
      longitude: station.longitude !== undefined ? station.longitude : '',
      description: station.description || '',
    });
    setEditErrors({});
  };

  // Close Edit Modal
  const handleCloseEditModal = () => {
    setEditingStation(null);
    setEditErrors({});
    setIsUpdating(false);
  };

  // Handle Add Station Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = validateStationData(addFormData);
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setIsAdding(true);
    setAddErrors({});
    try {
      await stationService.create({
        name: addFormData.name.trim(),
        zone: addFormData.zone,
        latitude: parseFloat(addFormData.latitude),
        longitude: parseFloat(addFormData.longitude),
        description: addFormData.description ? addFormData.description.trim() : null,
      });
      setShowAddModal(false);
      setAddFormData({ name: '', zone: 'COMMERCIAL', latitude: 9.9252, longitude: 78.1198, description: '' });
      setNotification({
        type: 'success',
        message: `Monitoring station "${addFormData.name.trim()}" registered successfully!`,
      });
      await refreshData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create station.';
      setAddErrors({ api: msg });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Edit Station Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateStationData(editFormData);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsUpdating(true);
    setEditErrors({});
    try {
      await stationService.update(editingStation.id, {
        name: editFormData.name.trim(),
        zone: editFormData.zone,
        status: editFormData.status,
        latitude: parseFloat(editFormData.latitude),
        longitude: parseFloat(editFormData.longitude),
        description: editFormData.description ? editFormData.description.trim() : null,
      });

      const updatedName = editFormData.name.trim();
      handleCloseEditModal();
      setNotification({
        type: 'success',
        message: `Station "${updatedName}" updated successfully!`,
      });
      await refreshData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to update station.';
      setEditErrors({ api: msg });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-400" />
            Monitoring Stations Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Designated sound monitoring stations and regulatory CPCB zones across Madurai city.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setAddErrors({});
          }}
          className="glass-pill glass-card-hover flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-sky-300 hover:text-white border border-sky-500/30 shadow-glass-glow-blue transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Monitoring Station
        </button>
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold border transition-all animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-glass-glow-emerald'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Glassmorphic Table Container */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Station Details</th>
                <th className="px-6 py-4">Zone Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Latest Decibels</th>
                <th className="px-6 py-4">CPCB Compliance</th>
                <th className="px-6 py-4">GPS Coordinates</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {stations.map((st) => (
                <tr key={st.id} className="hover:bg-white/[0.04] transition-colors duration-150">
                  <td className="px-6 py-4.5 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">{st.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 font-normal">
                          ID: #{st.id} {st.description ? `• ${st.description}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/[0.06] text-slate-200 border border-white/10">
                      {st.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        st.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : st.status === 'MAINTENANCE'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-700/40 text-slate-400 border-slate-600/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          st.status === 'ACTIVE'
                            ? 'bg-emerald-400'
                            : st.status === 'MAINTENANCE'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      {st.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 font-mono font-bold text-sky-300 text-sm">
                    {formatDecibels(st.latest_decibel)}
                  </td>
                  <td className="px-6 py-4.5">
                    <NoiseBadge decibel={st.latest_decibel} zone={st.zone} />
                  </td>
                  <td className="px-6 py-4.5 text-xs font-mono text-slate-400">
                    {st.latitude?.toFixed ? st.latitude.toFixed(4) : st.latitude},{' '}
                    {st.longitude?.toFixed ? st.longitude.toFixed(4) : st.longitude}
                  </td>
                  <td className="px-6 py-4.5 text-xs text-slate-400">
                    {formatFullDate(st.created_at)}
                  </td>
                  <td className="px-6 py-4.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(st)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 hover:border-sky-500/50 transition-all cursor-pointer shadow-sm group"
                      title={`Edit monitoring station details for ${st.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* EDIT MONITORING STATION MODAL                                        */}
      {/* ==================================================================== */}
      {editingStation && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card rounded-2xl border border-white/20 max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Monitoring Station</h3>
                  <p className="text-[11px] text-slate-400">
                    Update location, regulatory zone, coordinates, or active status.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700">
                  Station ID: #{editingStation.id}
                </span>
                <button
                  onClick={handleCloseEditModal}
                  disabled={isUpdating}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Banner inside Modal */}
            {editErrors.api && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{editErrors.api}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Station Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Monitoring Station Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, name: e.target.value });
                    if (editErrors.name) setEditErrors({ ...editErrors, name: null });
                  }}
                  className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                    editErrors.name ? 'border-rose-500/70 focus:border-rose-500' : ''
                  }`}
                  placeholder="e.g. Periyar Bus Stand Terminal"
                />
                {editErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{editErrors.name}</p>
                )}
              </div>

              {/* Area Category / Zone & Monitoring Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Area Category (Zone) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={editFormData.zone}
                    onChange={(e) => setEditFormData({ ...editFormData, zone: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="COMMERCIAL" className="bg-slate-900 text-white">Commercial (65 dB Day / 55 dB Night)</option>
                    <option value="RESIDENTIAL" className="bg-slate-900 text-white">Residential (55 dB Day / 45 dB Night)</option>
                    <option value="SILENT" className="bg-slate-900 text-white">Silence Zone (50 dB Day / 40 dB Night)</option>
                    <option value="INDUSTRIAL" className="bg-slate-900 text-white">Industrial (75 dB Day / 70 dB Night)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Monitoring Status <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE" className="bg-slate-900 text-white">Active (Online & Monitored)</option>
                    <option value="INACTIVE" className="bg-slate-900 text-white">Inactive (Offline)</option>
                    <option value="MAINTENANCE" className="bg-slate-900 text-white">Maintenance (Under Calibration)</option>
                  </select>
                </div>
              </div>

              {/* GPS Coordinates (Latitude & Longitude) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Latitude (-90 to 90) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={editFormData.latitude}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, latitude: e.target.value });
                      if (editErrors.latitude) setEditErrors({ ...editErrors, latitude: null });
                    }}
                    className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono transition ${
                      editErrors.latitude ? 'border-rose-500/70 focus:border-rose-500' : ''
                    }`}
                    placeholder="e.g. 9.9158"
                  />
                  {editErrors.latitude && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium">{editErrors.latitude}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Longitude (-180 to 180) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={editFormData.longitude}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, longitude: e.target.value });
                      if (editErrors.longitude) setEditErrors({ ...editErrors, longitude: null });
                    }}
                    className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono transition ${
                      editErrors.longitude ? 'border-rose-500/70 focus:border-rose-500' : ''
                    }`}
                    placeholder="e.g. 78.1117"
                  />
                  {editErrors.longitude && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium">{editErrors.longitude}</p>
                  )}
                </div>
              </div>

              {/* Station Description / Location Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Station Description & Landmark Notes
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                  placeholder="e.g. Central transit hub & railway junction zone, Madurai"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={isUpdating}
                  className="glass-pill px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-glass-glow-blue transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Station...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Update Station</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* REGISTER NEW MONITORING NODE MODAL                                   */}
      {/* ==================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card rounded-2xl border border-white/20 max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                Register New Monitoring Node
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isAdding}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addErrors.api && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{addErrors.api}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Station Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addFormData.name}
                  onChange={(e) => {
                    setAddFormData({ ...addFormData, name: e.target.value });
                    if (addErrors.name) setAddErrors({ ...addErrors, name: null });
                  }}
                  className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none ${
                    addErrors.name ? 'border-rose-500/70' : ''
                  }`}
                  placeholder="e.g. Arapalayam Bus Stand Junction"
                />
                {addErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{addErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Zone Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={addFormData.zone}
                  onChange={(e) => setAddFormData({ ...addFormData, zone: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none cursor-pointer"
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
                    Latitude <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={addFormData.latitude}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, latitude: e.target.value });
                      if (addErrors.latitude) setAddErrors({ ...addErrors, latitude: null });
                    }}
                    className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono ${
                      addErrors.latitude ? 'border-rose-500/70' : ''
                    }`}
                  />
                  {addErrors.latitude && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium">{addErrors.latitude}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Longitude <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={addFormData.longitude}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, longitude: e.target.value });
                      if (addErrors.longitude) setAddErrors({ ...addErrors, longitude: null });
                    }}
                    className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono ${
                      addErrors.longitude ? 'border-rose-500/70' : ''
                    }`}
                  />
                  {addErrors.longitude && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium">{addErrors.longitude}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Location Notes
                </label>
                <textarea
                  rows={2}
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                  placeholder="Landmark or locality notes"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                  className="glass-pill px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-glass-glow-blue transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAdding ? 'Saving...' : 'Save Station'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
