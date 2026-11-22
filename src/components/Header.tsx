import React from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Type,
  Sun,
  Moon,
  Sparkles,
  Accessibility,
} from 'lucide-react';

interface HeaderProps {
  fontSizeLevel: 'normal' | 'large' | 'xl';
  isHighContrast: boolean;
  isMuted: boolean;
  onToggleFontSize: () => void;
  onToggleHighContrast: () => void;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fontSizeLevel,
  isHighContrast,
  isMuted,
  onToggleFontSize,
  onToggleHighContrast,
  onToggleMute,
}) => {
  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Accessible Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Mic className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
                Artha<span className="text-emerald-700">Voice</span>
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                अर्थवॉइस
              </span>
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">
              Speak your money. In your words. (बोलिए अपना हिसाब)
            </p>
          </div>
        </div>

        {/* Elder Accessibility Controls */}
        <div className="flex items-center gap-2">
          {/* Font Size Scaler */}
          <button
            onClick={onToggleFontSize}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm flex items-center gap-1.5 border border-slate-300 transition"
            title="Text Size Badlein (Font Size)"
            aria-label="Text Size Badlein"
          >
            <Type className="w-4 h-4 text-emerald-700" />
            <span className="font-mono">
              {fontSizeLevel === 'normal'
                ? 'A'
                : fontSizeLevel === 'large'
                ? 'A+'
                : 'A++'}
            </span>
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={onToggleHighContrast}
            className={`p-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 border transition ${
              isHighContrast
                ? 'bg-slate-900 text-white border-black'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            title="High Contrast Mode"
            aria-label="High Contrast Mode"
          >
            <Accessibility className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">
              {isHighContrast ? 'High Contrast ON' : 'Contrast'}
            </span>
          </button>

          {/* Voice Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 border transition ${
              isMuted
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            title={isMuted ? 'Awaaz chalu karein' : 'Awaaz band karein'}
            aria-label="Awaaz toggle"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            )}
            <span className="hidden sm:inline">
              {isMuted ? 'Muted' : 'Voice ON'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
