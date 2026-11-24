import React, { useState } from 'react';
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
  Edit2,
  Send,
  Languages,
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
  selectedSpeechLang: string;
  onChangeSpeechLang: (lang: string) => void;
  onToggleListening: () => void;
  onToggleHandsFree: () => void;
  onConfirmExpense: () => void;
  onRejectOrModifyExpense: () => void;
  onUpdateItemAmount: (id: string, newAmount: number) => void;
  onNavigateTab: (tab: 'home' | 'history' | 'budgets' | 'reports') => void;
  onDirectSubmitTranscript: (text: string) => void;
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
  selectedSpeechLang,
  onChangeSpeechLang,
  onToggleListening,
  onToggleHandsFree,
  onConfirmExpense,
  onRejectOrModifyExpense,
  onUpdateItemAmount,
  onNavigateTab,
  onDirectSubmitTranscript,
  queryAnswer,
}) => {
  const [manualText, setManualText] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  const todayTotal = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  const quickPhrases = [
    { label: '⛽ 500 ka patrol', text: '500 ka patrol' },
    { label: '🥒 Sabzi 120 + Auto 60', text: 'Arre aaj sabzi pe 120 aur auto ka 60 diya' },
    { label: '🥛 Taza Doodh 60', text: 'Aaj doodh ka 60 rupaye diya' },
    { label: '💊 BP Dawa 320', text: 'Dawa 320 rupaye' },
    { label: '⚡ Bijli Bill 1450', text: 'Bijli ka bill 1450' },
    { label: '❓ Food Budget Query', text: 'Food budget kitna bacha hai?' },
  ];

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (manualText.trim()) {
      onDirectSubmitTranscript(manualText.trim());
      setManualText('');
      setIsEditingTranscript(false);
    }
  };

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
          {/* Speech Engine & Language Mode Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Languages className="w-4 h-4 text-emerald-700" />
              Mic Mode:
            </span>
            <button
              onClick={() => onChangeSpeechLang('hi-IN')}
              className={`px-3 py-1 rounded-full text-xs font-extrabold border transition ${
                selectedSpeechLang === 'hi-IN'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              🇮🇳 Hindi / Devanagari (hi-IN)
            </button>

            <button
              onClick={() => onChangeSpeechLang('en-IN')}
              className={`px-3 py-1 rounded-full text-xs font-extrabold border transition ${
                selectedSpeechLang === 'en-IN'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              🌐 Hinglish / Indian English (en-IN)
            </button>

            <button
              onClick={() => onChangeSpeechLang('gu-IN')}
              className={`px-3 py-1 rounded-full text-xs font-extrabold border transition ${
                selectedSpeechLang === 'gu-IN'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              🦁 Gujarati (gu-IN)
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              Auto Noise Suppression &bull; VAD Floor: Active
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
            "Arre aaj sabzi pe 120 aur auto ka 60 diya" ya Hindi/English/Gujarati mein bolein.
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
                  ? 'Recording band karein aur parse karein'
                  : 'Boliye: Mic shuru karein'
              }
            >
              {isListening ? (
                <>
                  <MicOff className="w-12 h-12 md:w-14 md:h-14 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider mt-1">
                    Stop / Done
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
          <div className="mt-3 flex items-center justify-center gap-3">
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

          {/* Live Transcript Preview Box & Instant Voice-Text Editor */}
          {liveTranscript && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border-2 border-emerald-300 max-w-xl mx-auto text-left shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>WHAT THE MIC HEARD (LIVE TRANSCRIPT):</span>
                <span className="text-emerald-700 font-extrabold">
                  {detectedLanguage} Auto-Detected
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 leading-snug">
                "{liveTranscript}"
              </p>

              {fillersRemoved.length > 0 && (
                <div className="mt-2 text-xs text-blue-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Cleaned fillers: {fillersRemoved.join(', ')}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Mis-heard or noisy? You can edit or submit directly:
                </span>
                <button
                  onClick={() => {
                    setManualText(liveTranscript);
                    setIsEditingTranscript(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit / Fix</span>
                </button>
              </div>
            </div>
          )}

          {/* Manual Text Fallback & Direct Voice Input */}
          <div className="mt-6 max-w-xl mx-auto">
            <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Or type here (e.g. Sabzi 120 aur auto 60)..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-300 text-base font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 transition"
              />
              <button
                type="submit"
                className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition shadow"
              >
                <span>Process</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Voice Phrase Chips for instant testing */}
          <div className="mt-5 max-w-xl mx-auto">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quick Voice Test Chips:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {quickPhrases.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => onDirectSubmitTranscript(qp.text)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 text-xs font-bold border border-slate-200 hover:border-emerald-400 transition"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

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
              Clear Speech Tips for Elders (साफ आवाज के लिए):
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                1. Language Mode:
              </strong>
              If speaking English/Hinglish, tap "Hinglish (en-IN)" above.
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                2. Natural Speech:
              </strong>
              "Sabzi pe 120 aur auto ka 60 diya"
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                3. When Done:
              </strong>
              Tap "Stop / Done" or pause to trigger instant confirmation!
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-slate-800 font-medium">
              <strong className="text-emerald-800 block text-xs uppercase">
                4. Voice Query:
              </strong>
              "Food budget kitna bacha hai?"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
