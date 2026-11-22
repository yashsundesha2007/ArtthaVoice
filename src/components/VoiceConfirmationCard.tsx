import React from 'react';
import { ParsedExpenseItem, ParsedVoiceResult } from '../types';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit2,
} from 'lucide-react';
import { speechService } from '../services/speechEngine';

interface VoiceConfirmationCardProps {
  parsedResult: ParsedVoiceResult;
  onConfirm: () => void;
  onRejectOrModify: () => void;
  onUpdateItemAmount: (id: string, newAmount: number) => void;
  isConfirmingAloud?: boolean;
}

export const VoiceConfirmationCard: React.FC<VoiceConfirmationCardProps> = ({
  parsedResult,
  onConfirm,
  onRejectOrModify,
  onUpdateItemAmount,
  isConfirmingAloud = false,
}) => {
  const { items, detectedLanguage, fillersRemoved, midSentenceCorrections, rawTranscript } =
    parsedResult;

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleReadAloudAgain = () => {
    const speechSummary =
      items.map((i) => `${i.item}, ${i.amount} rupaye`).join('. ') + '. Sahi hai?';
    speechService.speak(speechSummary);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border-4 border-emerald-500 shadow-2xl p-5 md:p-7 animate-in fade-in zoom-in-95 duration-200">
      {/* Header bar with confirmation status and language badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
            ✓
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
              Aapka Kharch (Confirm & Save)
            </h3>
            <p className="text-sm font-semibold text-emerald-700">
              {isConfirmingAloud ? '🎙️ Sun rahe hain: "Haan" ya "Nahi" bolein...' : 'Bol kar ya tap karke save karein'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            🌐 {detectedLanguage} Auto-Detected
          </span>
          <button
            onClick={handleReadAloudAgain}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Read aloud again"
            aria-label="Dobara sunayein"
          >
            <Volume2 className="w-5 h-5 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Raw Spoken vs Cleaned Banner */}
      <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          Aapne Bola (Spoken Speech):
        </div>
        <div className="text-slate-800 font-medium italic text-base">
          "{rawTranscript}"
        </div>

        {/* Cleaned Fillers Tag */}
        {fillersRemoved.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Cleaned Fillers:
            </span>
            {fillersRemoved.map((f, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono line-through"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Mid-sentence correction notice */}
        {midSentenceCorrections.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Auto-corrected slip:</strong> Resolved "
              {midSentenceCorrections[0].phrase}" ➔ ₹{midSentenceCorrections[0].to}
            </span>
          </div>
        )}
      </div>

      {/* Parsed Transactions List */}
      <div className="space-y-3 my-4">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200 transition hover:border-emerald-400"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-lg font-bold text-emerald-800 shadow-sm">
                {idx + 1}
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-slate-900">
                  {item.item}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-200 text-emerald-900">
                    Category: {item.category}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Date: Today
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-900 font-mono">
                ₹{item.amount.toLocaleString('en-IN')}
              </div>
              <button
                onClick={() => {
                  const val = prompt(
                    `Naya amount likho for ${item.item}:`,
                    item.amount.toString()
                  );
                  if (val && !isNaN(Number(val))) {
                    onUpdateItemAmount(item.id, Number(val));
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 underline mt-0.5"
              >
                <Edit2 className="w-3 h-3" />
                Change ₹
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total row */}
      {items.length > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl mb-4 font-bold text-slate-800">
          <span>Kul Yog (Total):</span>
          <span className="text-2xl text-slate-900 font-mono">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {/* Voice Prompt Text */}
      <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-center mb-5">
        <div className="text-sm md:text-base font-bold text-emerald-900">
          🗣️ Bol kar confirm karein:
        </div>
        <div className="text-xs md:text-sm text-emerald-800 font-medium mt-0.5">
          "Haan / Yes" ➔ Save karein &bull; "Nahi, sabzi 150 tha" ➔ Badlein
        </div>
      </div>

      {/* Action Buttons for Easy Touch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onConfirm}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition"
          aria-label="Haan sahi hai, save karein"
        >
          <CheckCircle2 className="w-7 h-7" />
          <span>Haan, Sahi Hai (Save)</span>
        </button>

        <button
          onClick={onRejectOrModify}
          className="w-full py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-lg border-2 border-slate-300 flex items-center justify-center gap-2 transition"
          aria-label="Nahi, galat hai ya badalna hai"
        >
          <XCircle className="w-6 h-6 text-rose-600" />
          <span>Nahi, Sudharo</span>
        </button>
      </div>
    </div>
  );
};
