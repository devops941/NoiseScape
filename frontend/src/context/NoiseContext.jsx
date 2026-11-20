import React, { createContext, useContext, useState, useEffect } from 'react';
import { stationService } from '../services/stationService';
import { readingService } from '../services/readingService';
import { alertService } from '../services/alertService';

// Fallback baseline Madurai stations so UI never renders blank even before API connects
const DEFAULT_MADURAI_STATIONS = [
  { id: 1, name: "Periyar Bus Stand Terminal", zone: "COMMERCIAL", latitude: 9.9158, longitude: 78.1117, latest_decibel: 72.9, description: "Central transit hub & railway junction zone, Madurai" },
  { id: 2, name: "Mattuthavani Integrated Bus Terminus (MIBT)", zone: "COMMERCIAL", latitude: 9.9439, longitude: 78.1561, latest_decibel: 71.3, description: "M.G.R. Bus Stand & vegetable market commercial area, Madurai" },
  { id: 3, name: "Anna Nagar Residential Sector", zone: "RESIDENTIAL", latitude: 9.9263, longitude: 78.1500, latest_decibel: 53.7, description: "Anna Nagar 80 Feet Road & residential layout, Madurai" },
  { id: 4, name: "Kalavasal Junction", zone: "COMMERCIAL", latitude: 9.9303, longitude: 78.0955, latest_decibel: 72.9, description: "Theni Main Road & bypass junction high-traffic zone, Madurai" },
  { id: 5, name: "Government Rajaji Hospital (GRH)", zone: "SILENT", latitude: 9.9288, longitude: 78.1292, latest_decibel: 52.7, description: "Goripalayam medical college & hospital silent zone, Madurai" },
  { id: 6, name: "Kappalur Industrial Estate", zone: "INDUSTRIAL", latitude: 9.8450, longitude: 78.0560, latest_decibel: 75.9, description: "SIDCO Industrial estate manufacturing boundary, Madurai" },
];

const DEFAULT_SUMMARY = {
  total_stations: 6,
  active_stations: 6,
  total_readings_logged: 1008,
  active_alerts_count: 767,
  average_ambient_db: 64.5,
  latest_reading_time: new Date().toISOString(),
};

const NoiseContext = createContext(null);

export function NoiseProvider({ children }) {
  const [stations, setStations] = useState(DEFAULT_MADURAI_STATIONS);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = async () => {
    try {
      const [stationList, summaryData, alertList] = await Promise.all([
        stationService.getAll().catch(() => null),
        readingService.getSummary().catch(() => null),
        alertService.getAlerts({ is_resolved: false }).catch(() => null),
      ]);

      if (stationList && stationList.length > 0) {
        setStations(stationList);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      if (alertList && alertList.length > 0) {
        setAlerts(alertList);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, Number(import.meta.env.VITE_REFRESH_INTERVAL_MS) || 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NoiseContext.Provider value={{ stations, summary, alerts, loading, error, refreshData }}>
      {children}
    </NoiseContext.Provider>
  );
}

export function useNoise() {
  const context = useContext(NoiseContext);
  if (!context) {
    throw new Error('useNoise must be used within a NoiseProvider');
  }
  return context;
}
