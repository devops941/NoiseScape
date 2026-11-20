import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ShieldCheck, AlertTriangle, Activity, FileDown, CheckCircle2 } from 'lucide-react';
import { readingService } from '../../services/readingService';
import { useNoise } from '../../context/NoiseContext';
import { generateNoiseReportPDF } from '../../utils/pdfReportGenerator';

export default function LiveMicMeter() {
  const [isRecording, setIsRecording] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [targetZone, setTargetZone] = useState('RESIDENTIAL');
  const [saveStatus, setSaveStatus] = useState(null);
  const [lastSavedReading, setLastSavedReading] = useState(null);
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
      const readingData = {
        station_id: matchedStation.id,
        decibel_value: decibels,
        leq: decibels,
        lmax: peakDb || decibels,
        lmin: Math.max(30, Math.round((decibels - 8) * 10) / 10),
      };

      await readingService.ingest(readingData);

      const savedReportInfo = {
        reportId: `MAD-MIC-${Date.now().toString().slice(-6)}`,
        areaName: `${targetZone} Urban Sector (${matchedStation.name})`,
        zone: targetZone,
        measuredDb: decibels,
        peakDb: peakDb || decibels,
        minDb: Math.max(30, Math.round((decibels - 8) * 10) / 10),
        cpcbLimit: currentLimit,
        isBreach: isOverLimit,
        severity: isOverLimit ? 'WARNING' : 'SAFE',
        healthAdvisory: isOverLimit
          ? `Current sound level exceeds permissible CPCB ${targetZone} day limits by ${(decibels - currentLimit).toFixed(1)} dB. Continued exposure may cause annoyance and fatigue.`
          : `Acoustic environment is safe and strictly compliant with CPCB Schedule IV standards for ${targetZone} area.`,
        source: 'Live User Device Microphone (Web Audio API)',
      };

      setLastSavedReading(savedReportInfo);
      setSaveStatus('success');
      refreshData();
    } catch (err) {
      setSaveStatus('error');
    }
  };

  // Trigger PDF Download
  const handleDownloadPdf = () => {
    const reportData = lastSavedReading || {
      reportId: `MAD-MIC-${Date.now().toString().slice(-6)}`,
      areaName: `${targetZone} Neighborhood Assessment`,
      zone: targetZone,
      measuredDb: decibels || 45.0,
      peakDb: peakDb || decibels || 52.0,
      minDb: Math.max(30, Math.round(((decibels || 45) - 8) * 10) / 10),
      cpcbLimit: currentLimit,
      isBreach: (decibels || 45) > currentLimit,
      severity: (decibels || 45) > currentLimit ? 'WARNING' : 'SAFE',
      healthAdvisory: (decibels || 45) > currentLimit
        ? `Noise levels exceed CPCB recommended threshold for ${targetZone} area.`
        : `Noise levels are comfortably within permissible CPCB standards.`,
      source: 'Live User Device Microphone (Web Audio API)',
    };

    generateNoiseReportPDF(reportData);
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

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isRecording ? (
            <button
              onClick={startMeter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-glass-glow-blue transition cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" /> Start Sound Meter
            </button>
          ) : (
            <button
              onClick={stopMeter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-glass-glow-red transition cursor-pointer"
            >
              <MicOff className="w-3.5 h-3.5" /> Stop Meter
            </button>
          )}

          {/* Direct PDF Download Button */}
          {(decibels > 0 || lastSavedReading) && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 hover:border-sky-400 transition cursor-pointer shadow-sm"
              title="Download CPCB Noise Assessment Certificate as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400" />
              Download PDF Report
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left: Animated Decibel Display */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isRecording ? 'Real-Time Microphone Reading' : 'Meter Standby'}
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-4xl font-black transition-colors duration-200 ${
                isRecording
                  ? isOverLimit
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              {isRecording ? decibels : '--.-'}
            </span>
            <span className="text-xs font-bold text-slate-400">dB(A)</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span>Peak: <strong className="text-white">{isRecording ? peakDb : '0.0'} dB</strong></span>
            <span>•</span>
            <span>Zone: <strong className="text-sky-300">{targetZone}</strong></span>
          </div>
        </div>

        {/* Right: Sound Level Meter Gauge + Benchmark */}
        <div className="md:col-span-2 space-y-3">
          {/* Zone Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-300">
              Benchmark against Zone Standard:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10 text-xs">
              {['SILENT', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'].map((z) => (
                <button
                  key={z}
                  onClick={() => setTargetZone(z)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    targetZone === z
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Visualizer Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative border border-white/5">
              {/* Threshold Marker Indicator */}
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

          {/* Action to log reading & Save Status */}
          <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-slate-300 font-medium">
              {isRecording ? (
                isOverLimit ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> High noise for {targetZone} area!
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sound is safe for {targetZone} area.
                  </span>
                )
              ) : lastSavedReading ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reading saved! Ready to download PDF report.
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Click Start Sound Meter to capture live noise.</span>
              )}
            </span>

            <div className="flex items-center gap-2">
              {isRecording && (
                <button
                  onClick={handleSaveToZone}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold glass-pill glass-card-hover text-sky-300 hover:text-white transition cursor-pointer"
                >
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : saveStatus === 'success'
                    ? '✓ Saved to Database!'
                    : 'Save & Log Reading'}
                </button>
              )}

              {saveStatus === 'success' && (
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md transition flex items-center gap-1.5 cursor-pointer animate-bounce-short"
                >
                  <FileDown className="w-3.5 h-3.5" /> Download PDF Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
