import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { readingService } from '../../services/readingService';
import { useNoise } from '../../context/NoiseContext';

export default function LiveMicMeter() {
  const [isRecording, setIsRecording] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [targetZone, setTargetZone] = useState('RESIDENTIAL');
  const [saveStatus, setSaveStatus] = useState(null);
  const { stations, refreshData } = useNoise();

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const microphone = audioCtx.createMediaStreamSource(stream);
      microphone.connect(analyser);

      setIsRecording(true);
      setPeakDb(0);
      setSaveStatus(null);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute Root Mean Square (RMS) amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Map RMS (0 to 255) to realistic dB(A) scale (35 dB ambient room to 110 dB shout)
        let estimatedDb = 35 + (rms / 255) * 65;
        estimatedDb = Math.round(estimatedDb * 10) / 10;

        setDecibels(estimatedDb);
        setPeakDb((prev) => Math.max(prev, estimatedDb));

        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      alert(`Could not access microphone: ${err.message}. Please allow microphone permission.`);
    }
  };

  const stopMeter = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();

    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopMeter();
    };
  }, []);

  // Zone limit for current target zone
  const zoneLimits = {
    SILENT: 50.0,
    RESIDENTIAL: 55.0,
    COMMERCIAL: 65.0,
    INDUSTRIAL: 75.0,
  };
  const currentLimit = zoneLimits[targetZone] || 55.0;
  const isOverLimit = decibels > currentLimit;

  // Log current reading to backend
  const handleSaveToZone = async () => {
    const matchedStation = stations.find((s) => s.zone === targetZone) || stations[0];
    if (!matchedStation) return;

    try {
      setSaveStatus('saving');
      await readingService.ingest({
        station_id: matchedStation.id,
        decibel_value: decibels,
        leq: decibels,
        lmax: peakDb || decibels,
        lmin: Math.max(30, decibels - 8),
      });
      setSaveStatus('success');
      refreshData();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-5 shadow-glass space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-sky-400" />
            Check My Area Sound (Live Device Microphone)
          </h3>
          <p className="text-[11px] text-slate-400">
            Measures current ambient sound levels in real time directly using your device microphone.
          </p>
        </div>

        {/* Start/Stop Button */}
        {!isRecording ? (
          <button
            onClick={startMeter}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-glass-glow-blue transition self-start sm:self-auto"
          >
            <Mic className="w-3.5 h-3.5" /> Start Sound Meter
          </button>
        ) : (
          <button
            onClick={stopMeter}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-glass-glow-red transition self-start sm:self-auto"
          >
            <MicOff className="w-3.5 h-3.5" /> Stop Meter
          </button>
        )}
      </div>

      {/* Meter Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Real-time Decibel Number */}
        <div className="p-4 rounded-xl glass-pill text-center space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            Measured Decibels
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`text-4xl font-black tracking-tight ${
                isRecording
                  ? isOverLimit
                    ? 'text-rose-400 animate-pulse'
                    : 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              {isRecording ? decibels.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">dB(A)</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Peak: <strong className="text-white">{isRecording ? `${peakDb.toFixed(1)} dB` : '--'}</strong>
          </span>
        </div>

        {/* Visual Equalizer / Sound Bars */}
        <div className="p-4 rounded-xl glass-pill space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              Compare With My Area Type:
            </span>
            <select
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value)}
              className="glass-input rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="RESIDENTIAL" className="bg-slate-900">Residential (55 dB Limit)</option>
              <option value="COMMERCIAL" className="bg-slate-900">Commercial (65 dB Limit)</option>
              <option value="SILENT" className="bg-slate-900">Silent / Hospital (50 dB Limit)</option>
              <option value="INDUSTRIAL" className="bg-slate-900">Industrial (75 dB Limit)</option>
            </select>
          </div>

          {/* Sound Level Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-white/10 relative">
              {/* Threshold Marker line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                style={{ left: `${((currentLimit - 30) / (100 - 30)) * 100}%` }}
                title={`Allowed Limit: ${currentLimit} dB`}
              />
              <div
                className={`h-full transition-all duration-100 rounded-full ${
                  isOverLimit
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${isRecording ? Math.min(100, Math.max(5, ((decibels - 30) / (100 - 30)) * 100)) : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>30 dB (Quiet)</span>
              <span className="text-amber-400">Allowed: {currentLimit} dB</span>
              <span>100 dB (Loud)</span>
            </div>
          </div>

          {/* Action to log reading */}
          {isRecording && (
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-300 font-medium">
                {isOverLimit ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> High noise for {targetZone} area!
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sound is safe for {targetZone} area.
                  </span>
                )}
              </span>

              <button
                onClick={handleSaveToZone}
                className="px-3 py-1 rounded-lg text-xs font-semibold glass-pill glass-card-hover text-sky-300 hover:text-white transition"
              >
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'success'
                  ? 'Saved to Log!'
                  : 'Log This Reading'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

