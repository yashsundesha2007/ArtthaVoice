import React from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { VoiceConfirmationCard } from './VoiceConfirmationCard';
import {
  ParsedVoiceResult,
  Transaction,
  VoiceState,
} from '../types';

interface VoiceHomeTabProps {
  voiceState: VoiceState;
  isListening: boolean;
  voiceDetected: boolean;
  audioLevel: number;
  liveTranscript: string;
  detectedLanguage: string;
  fillersRemoved: string[];
  pendingConfirmation: ParsedVoiceResult | null;
  todayTransactions: Transaction[];
  isHandsFree: boolean;
  onToggleListening: () => void;
  onToggleHandsFree: () => void;
  onConfirmExpense: () => void;
  onRejectOrModifyExpense: () => void;
  onUpdateItemAmount: (id: string, newAmount: number) => void;
  onNavigateTab: (tab: 'home' | 'history' | 'budgets' | 'reports') => void;
  queryAnswer: {
    summary: string;
    voiceResponse: string;
    highlightTab?: string;
  } | null;
}

export const VoiceHomeTab: React.FC<VoiceHomeTabProps> = ({
  voiceState,
  isListening,
  voiceDetected,
  audioLevel,
  liveTranscript,
  detectedLanguage,
  fillersRemoved,
  pendingConfirmation,
  todayTransactions,
  isHandsFree,
  onToggleListening,
  onToggleHandsFree,
  onConfirmExpense,
  onRejectOrModifyExpense,
  onUpdateItemAmount,
  onNavigateTab,
  queryAnswer,
}) => {
  const todayTotal = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Pending Confirmation View */}
      {pendingConfirmation ? (
        <div className="py-2">
          <VoiceConfirmationCard
            parsedResult={pendingConfirmation}
            onConfirm={onConfirmExpense}
            onRejectOrModify={onRejectOrModifyExpense}
            onUpdateItemAmount={onUpdateItemAmount}
            isConfirmingAloud={voiceState === 'confirming'}
          />
        </div>
      ) : (
        /* Normal Voice Capture Centerpiece */
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 md:p-10 text-center relative overflow-hidden">
          {/* Noise Resilience & Language status pill bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Auto-Detect: Hindi &bull; Hinglish &bull; Gujarati &bull; Rajasthani
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-sm">
              <Radio className="w-4 h-4 text-blue-600" />
              Noise Filter Active (Auto / Mandi Suppressed)
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {isListening ? (
              <span className="text-emerald-700 animate-pulse">
                🎙️ Sun rahe hain... Boliye!
              </span>
            ) : (
              'Apna kharch bol kar likhein'
            )}
          </h2>

          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto mt-2 font-medium">
            "Arre aaj sabzi pe 120 aur auto ka 60 diya" ya Gujarati/Rajasthani mein bolein.
          </p>

          {/* Real-time Audio Waveform Visualizer */}
          <div className="my-6">
            <AudioWaveform
              isListening={isListening}
              voiceDetected={voiceDetected}
              audioLevel={audioLevel}
            />
          </div>

          {/* Central Pulsing Mic Button */}
          <div className="relative inline-flex items-center justify-center my-4">
            {isListening && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="absolute w-36 h-36 rounded-full bg-emerald-500/30 animate-pulse" />
              </>
            )}

            <button
              onClick={onToggleListening}
              className={`relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center text-white transition-all transform active:scale-95 shadow-2xl ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-danger-glow ring-8 ring-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-mic-glow ring-8 ring-emerald-100 hover:ring-emerald-200'
              }`}
              aria-label={
                isListening
                  ? 'Recording band karein'
                  : 'Boliye: Mic shuru karein'
              }
            >
              {isListening ? (
                <>
                  <MicOff className="w-12 h-12 md:w-14 md:h-14 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider mt-1">
                    Stop
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12 md:w-14 md:h-14" />
                  <span className="text-xs font-extrabold uppercase tracking-wider mt-1">
                    Boliye
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Hands-free mode toggle button */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={onToggleHandsFree}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border transition ${
                isHandsFree
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Radio
                className={`w-4 h-4 ${
                  isHandsFree ? 'text-emerald-600 animate-spin' : 'text-slate-400'
                }`}
              />
              <span>
                Hands-Free Mode: {isHandsFree ? 'ON (Continuous)' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Live Transcript Preview Box */}
          {liveTranscript && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border-2 border-emerald-300 max-w-lg mx-auto text-left shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>LIVE TRANSCRIPT</span>
                <span className="text-emerald-700">
                  {detectedLanguage} Auto-Detected
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 leading-snug">
                "{liveTranscript}"
              </p>

              {fillersRemoved.length > 0 && (
                <div className="mt-2 text-xs text-blue-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-cleaning filler words: {fillersRemoved.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Financial Query Response Banner if answered */}
          {queryAnswer && (
            <div className="mt-6 p-5 rounded-2xl bg-cyan-50 border-2 border-cyan-300 max-w-xl mx-auto text-left shadow-md animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-200 text-cyan-900">
                  💬 Financial Query Answer
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  Voice Answer Spoken
                </span>
              </div>
              <p className="text-lg md:text-xl font-black text-slate-900">
                {queryAnswer.summary}
              </p>
              {queryAnswer.highlightTab && (
                <button
                  onClick={() => onNavigateTab(queryAnswer.highlightTab as any)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-cyan-800 hover:text-cyan-950 underline"
                >
                  <span>{queryAnswer.highlightTab.toUpperCase()} Tab Dekhein</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Today's Summary & Recent Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Spent Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Aaj Ka Kharch (Today's Total)
            </span>
            <div className="text-3xl md:text-4xl font-black text-slate-900 mt-2 font-mono">
              ₹{todayTotal.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {todayTransactions.length} entries recorded today
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('history')}
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>History Dekhein</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Voice Prompt Helper Card for Elders */}
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-extrabold text-emerald-950">
              Aap Yeh Sab Bol Sakte Hain (Try Speaking):
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                Multi-Item Log:
              </strong>
              "Sabzi pe 120 aur auto ka 60 diya"
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                Regional Gujarati:
              </strong>
              "Aaje shaak na 120 ane auto na 60 aapya"
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                Budget Query:
              </strong>
              "Food budget kitna bacha hai?"
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                Voice Navigation:
              </strong>
              "Report dikhao aur suna do"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
