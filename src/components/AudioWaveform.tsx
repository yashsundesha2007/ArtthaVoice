import React, { useEffect, useRef } from 'react';
import { speechService } from '../services/speechEngine';

interface AudioWaveformProps {
  isListening: boolean;
  voiceDetected: boolean;
  audioLevel: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isListening,
  voiceDetected,
  audioLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw Noise Suppression Threshold Line (VAD cutoff)
      ctx.beginPath();
      ctx.strokeStyle = '#CBD5E1';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.moveTo(0, centerY - 14);
      ctx.lineTo(width, centerY - 14);
      ctx.moveTo(0, centerY + 14);
      ctx.lineTo(width, centerY + 14);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline center line
      ctx.beginPath();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (isListening) {
        const analyser = speechService.getAnalyser();
        const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
        if (analyser && dataArray) {
          analyser.getByteTimeDomainData(dataArray);
        }

        // Draw multiple smoothed waveforms
        const numWaves = 3;
        for (let w = 0; w < numWaves; w++) {
          ctx.beginPath();
          const alpha = 0.85 - w * 0.25;
          ctx.strokeStyle = voiceDetected
            ? `rgba(5, 150, 105, ${alpha})` // Emerald active voice
            : `rgba(217, 119, 6, ${alpha * 0.6})`; // Amber for background filtered
          ctx.lineWidth = 3 - w * 0.8;

          const baseAmp = voiceDetected ? Math.max(audioLevel * 75, 18) : 5;
          const amp = baseAmp * (1 - w * 0.2);

          for (let x = 0; x < width; x += 3) {
            // Sine modulation combined with real audio frequency if present
            const freq = (x / width) * Math.PI * 4;
            const y =
              centerY +
              Math.sin(freq + phase + w * 1.2) * amp * Math.sin((x / width) * Math.PI);

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }

        phase += voiceDetected ? 0.12 : 0.04;
      } else {
        // Idle gentle pulse
        ctx.beginPath();
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x += 4) {
          const y = centerY + Math.sin((x / width) * Math.PI * 2 + phase) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        phase += 0.02;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, voiceDetected, audioLevel]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-md h-24 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={400}
          height={96}
          className="w-full h-full block"
        />

        {/* Real-time Noise Filtering Indicator overlay */}
        <div className="absolute top-2 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white shadow backdrop-blur-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              voiceDetected
                ? 'bg-emerald-400 animate-ping'
                : 'bg-amber-400'
            }`}
          />
          {voiceDetected ? 'Voice Isolated (Clear)' : 'Noise Filter Active'}
        </div>

        <div className="absolute bottom-1.5 left-2.5 text-[11px] font-medium text-slate-500">
          Street & Market Noise Suppressed (VAD + AGC)
        </div>
      </div>
    </div>
  );
};
