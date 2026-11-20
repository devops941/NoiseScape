import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NoiseProvider } from './context/NoiseContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Stations from './pages/Stations';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';

export default function App() {
  return (
    <NoiseProvider>
      <Router>
        <div className="relative h-screen flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden selection:bg-sky-500/30 selection:text-sky-200">
          {/* Ambient Glassmorphic Glow Orbs */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-[128px] pointer-events-none -z-10 animate-float" />
          <div className="fixed top-1/3 -right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed -bottom-20 left-1/3 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
          <div className="fixed top-3/4 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* Sticky Frosted Header */}
          <Navbar />

          <div className="flex-1 flex overflow-hidden">
            {/* Frosted Sidebar */}
            <Sidebar />

            {/* Main Dynamic Viewport */}
            <main className="flex-1 h-full overflow-y-auto p-3 sm:p-4 lg:p-5">
              <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                <Routes>
                  {/* Web Application opens with Landing Page first */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/stations" element={<Stations />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </NoiseProvider>
  );
}
