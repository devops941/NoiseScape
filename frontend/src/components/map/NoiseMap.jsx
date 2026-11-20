import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatDecibels } from '../../utils/formatters';
import { getNoiseSeverity, getZoneThreshold } from '../../utils/thresholds';

// Leaflet default pin fix
if (typeof window !== 'undefined' && L?.Icon?.Default?.prototype) {
  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch (e) {
    // Ignore in non-standard environments
  }
}

const severityColors = {
  safe: '#10b981',
  warning: '#f59e0b',
  critical: '#f43f5e',
};

// Auto-resizer helper component to ensure tiles fill the container without gray areas
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function NoiseMap({ stations = [] }) {
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'standard'

  // Default center: Madurai City, Tamil Nadu
  const defaultCenter = [9.9252, 78.1198];
  const center = stations.length > 0 && stations[0].latitude
    ? [stations[0].latitude, stations[0].longitude]
    : defaultCenter;

  return (
    <div className={`relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden glass-card border border-white/10 shadow-glass ${mapTheme === 'dark' ? 'osm-dark-tiles' : ''}`}>
      {/* Map Header Overlay Controls */}
      <div className="absolute top-2.5 right-2.5 z-[400] flex items-center space-x-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 shadow-lg text-[11px]">
        <span className="text-slate-400 font-medium">Mode:</span>
        <button
          type="button"
          onClick={() => setMapTheme('dark')}
          className={`px-2 py-0.5 rounded-lg transition-all ${
            mapTheme === 'dark'
              ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🌙 Dark
        </button>
        <button
          type="button"
          onClick={() => setMapTheme('standard')}
          className={`px-2 py-0.5 rounded-lg transition-all ${
            mapTheme === 'standard'
              ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🗺️ Streets
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapResizer />

        {/* 100% Free OpenStreetMap with zero API keys required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {stations.filter((st) => st && st.latitude && st.longitude).map((st) => {
          const severity = getNoiseSeverity(st.latest_decibel, st.zone);
          const color = severityColors[severity];
          const threshold = getZoneThreshold(st.zone);

          return (
            <React.Fragment key={st.id}>
              {/* Outer acoustic wave boundary */}
              <Circle
                center={[st.latitude, st.longitude]}
                radius={450}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.18,
                  color: color,
                  weight: 1.5,
                  dashArray: '4, 6',
                }}
              />
              {/* Core acoustic concentration */}
              <Circle
                center={[st.latitude, st.longitude]}
                radius={200}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.35,
                  color: color,
                  weight: 2,
                }}
              />
              <Marker position={[st.latitude, st.longitude]}>
                <Popup className="glass-popup">
                  <div className="p-1 space-y-1.5 text-xs text-slate-100 font-sans">
                    <p className="font-extrabold text-sm text-sky-400">{st.name}</p>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Zone:</span>
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {st.zone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Current Level:</span>
                      <span className="font-bold text-white text-sm">{formatDecibels(st.latest_decibel)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>CPCB Limit:</span>
                      <span className="font-medium text-slate-400">{threshold} dB(A)</span>
                    </div>
                    <div className="pt-1 border-t border-slate-700 flex items-center justify-between">
                      <span>Status:</span>
                      <span
                        className="font-bold uppercase tracking-wider text-[10px]"
                        style={{ color: color }}
                      >
                        {severity}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
