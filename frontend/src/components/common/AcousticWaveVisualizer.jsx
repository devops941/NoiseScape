import React from 'react';

export default function AcousticWaveVisualizer() {
  // Harmonic frequency spectrum distribution for 30 bars
  const bars = [
    { height: 12, duration: 1.1, delay: 0.1 },
    { height: 18, duration: 0.9, delay: 0.2 },
    { height: 15, duration: 1.3, delay: 0.05 },
    { height: 24, duration: 0.8, delay: 0.3 },
    { height: 16, duration: 1.0, delay: 0.15 },
    { height: 26, duration: 0.85, delay: 0.25 },
    { height: 20, duration: 1.2, delay: 0.08 },
    { height: 32, duration: 0.95, delay: 0.35 },
    { height: 24, duration: 1.05, delay: 0.12 },
    { height: 36, duration: 0.75, delay: 0.18 },
    { height: 30, duration: 1.15, delay: 0.22 },
    { height: 40, duration: 0.8, delay: 0.05 },
    { height: 34, duration: 1.0, delay: 0.3 },
    { height: 44, duration: 0.7, delay: 0.15 },
    { height: 38, duration: 0.9, delay: 0.28 },
    // Symmetric center reflection
    { height: 38, duration: 0.9, delay: 0.28 },
    { height: 44, duration: 0.7, delay: 0.15 },
    { height: 34, duration: 1.0, delay: 0.3 },
    { height: 40, duration: 0.8, delay: 0.05 },
    { height: 30, duration: 1.15, delay: 0.22 },
    { height: 36, duration: 0.75, delay: 0.18 },
    { height: 24, duration: 1.05, delay: 0.12 },
    { height: 32, duration: 0.95, delay: 0.35 },
    { height: 20, duration: 1.2, delay: 0.08 },
    { height: 26, duration: 0.85, delay: 0.25 },
    { height: 16, duration: 1.0, delay: 0.15 },
    { height: 24, duration: 0.8, delay: 0.3 },
    { height: 15, duration: 1.3, delay: 0.05 },
    { height: 18, duration: 0.9, delay: 0.2 },
    { height: 12, duration: 1.1, delay: 0.1 },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-1 my-0.5">
      {/* Soundwave equalizer bars container */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-11 px-3">
        {bars.map((bar, i) => (
          <span
            key={i}
            className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-sky-500 via-blue-400 to-indigo-300 shadow-[0_0_8px_rgba(56,189,248,0.45)]"
            style={{
              height: `${bar.height}px`,
              transformOrigin: 'center',
              animation: `soundwavePulse ${bar.duration}s ease-in-out infinite alternate`,
              animationDelay: `${bar.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle Live Audio Pulse Badge */}
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900/60 border border-white/5 text-[10px] font-mono text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-slate-300 font-medium">ACOUSTIC FREQUENCY SPECTRUM</span>
        <span className="text-sky-400 font-bold">• 20Hz - 20kHz</span>
      </div>
    </div>
  );
}
