import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Volume2,
  AlertTriangle,
  PieChart,
  HelpCircle,
  CheckCircle,
  Mic,
} from 'lucide-react';

interface JudgeQuickTestBarProps {
  onRunTest: (transcript: string, note?: string) => void;
  onResetData: () => void;
  isPendingConfirmation?: boolean;
}

export const JudgeQuickTestBar: React.FC<JudgeQuickTestBarProps> = ({
  onRunTest,
  onResetData,
  isPendingConfirmation = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const testCases = [
    {
      id: 'patrol-test',
      label: '⛽ 500 ka patrol',
      sublabel: 'Petrol ₹500',
      speech: '500 ka patrol',
      badge: 'User Scenario',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'hindi-multi',
      label: '1. Hindi Multi-Item',
      sublabel: 'Sabzi ₹120 + Auto ₹60',
      speech: 'Arre aaj sabzi pe 120 aur auto ka 60 diya',
      badge: 'Hindi/Hinglish',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'gujarati-multi',
      label: '2. Gujarati Regional',
      sublabel: 'Shaak ₹120 + Auto ₹60',
      speech: 'Aaje shaak na 120 ane auto na 60 aapya',
      badge: 'Gujarati Auto-Detect',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'rajasthani-multi',
      label: '3. Rajasthani Regional',
      sublabel: 'Saag ₹120 + Auto ₹60',
      speech: 'Aaj saag ra 120 ar auto ra 60 diya',
      badge: 'Marwari / Rajasthani',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'noisy-correction',
      label: '4. Self-Correction & Market Noise',
      sublabel: '120... nahi nahi 150',
      speech: 'Bhaiya 120... nahi nahi 150 sabzi ka likho',
      badge: 'Disfluency Cleanup',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      id: 'budget-warning',
      label: '5. Trigger 80% & 100% Alert',
      sublabel: 'Crosses Food ₹4,000 threshold',
      speech: 'Aaj dinner aur party ka khana 950 rupaye',
      badge: 'Proactive Alert',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'financial-query',
      label: '6. Conversational Query',
      sublabel: '"Food budget kitna bacha hai?"',
      speech: 'Food budget kitna bacha hai?',
      badge: 'Voice Query AI',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    },
    {
      id: 'report-readout',
      label: '7. Report Suna Do',
      sublabel: 'Navigate + Aloud TTS',
      speech: 'Report dikhao aur suna do',
      badge: 'Hands-Free Nav',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
  ];

  return (
    <div className="w-full bg-slate-900 text-slate-100 border-b-4 border-emerald-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-sm tracking-wide text-emerald-400 uppercase">
              Judge Quick-Test Bar
            </span>
            <span className="hidden md:inline text-xs text-slate-400">
              (One-click speech simulation &amp; voice confirmation scenarios)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
              title="Reset initial demo data (78% Food budget, Indian household expenses)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-white transition"
              aria-label={isExpanded ? 'Collapse test bar' : 'Expand test bar'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-800">
            {/* If confirmation is pending, highlight Voice Confirmation Responses */}
            {isPendingConfirmation && (
              <div className="mb-2.5 p-2 rounded-xl bg-emerald-950/80 border-2 border-emerald-500 flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold text-emerald-300">
                    Voice Response Listening (Say or 1-Click Test):
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRunTest('Yes', 'Voice Confirmation')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow transition flex items-center gap-1"
                  >
                    <span>✓ Say "Yes / Haan" (Save by Voice)</span>
                  </button>
                  <button
                    onClick={() => onRunTest('Nooo', 'Voice Rejection / Ask to change')}
                    className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-black shadow transition flex items-center gap-1"
                  >
                    <span>✗ Say "Nooo / Nahi" (Ask what to change)</span>
                  </button>
                  <button
                    onClick={() => onRunTest('400 ka petrol', 'Voice Amount Correction')}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow transition flex items-center gap-1"
                  >
                    <span>✎ Say "400 ka petrol" (Voice Correct)</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {testCases.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => onRunTest(tc.speech, tc.label)}
                  className="flex flex-col text-left p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 hover:border-emerald-400 transition-all group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tc.badgeColor}`}
                    >
                      {tc.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 leading-snug">
                    {tc.label}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    "{tc.speech}"
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
