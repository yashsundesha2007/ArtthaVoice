import React from 'react';
import { CategoryBudget } from '../types';
import { AlertTriangle, AlertOctagon, Volume2, X, ArrowRight } from 'lucide-react';
import { speechService } from '../services/speechEngine';

interface BudgetWarningBannerProps {
  budget: CategoryBudget;
  onDismiss: () => void;
  onViewBudgets: () => void;
}

export const BudgetWarningBanner: React.FC<BudgetWarningBannerProps> = ({
  budget,
  onDismiss,
  onViewBudgets,
}) => {
  const percentUsed = Math.round((budget.spent / budget.limit) * 100);
  const isExceeded = budget.spent >= budget.limit;
  const isWarning = percentUsed >= 80 && !isExceeded;
  const exceededBy = budget.spent - budget.limit;

  const handleReplayVoice = () => {
    if (isExceeded) {
      speechService.speak(
        `Chetavni! Aapka ${budget.category} budget poora ho chuka hai. Yeh seema se ${exceededBy} rupaye jyada kharch ho gaya hai.`
      );
    } else {
      speechService.speak(
        `Savdhaan! Aapka ${budget.category} budget ${percentUsed} pratishat kharch ho chuka hai.`
      );
    }
  };

  return (
    <div
      role="alert"
      className={`w-full max-w-4xl mx-auto rounded-3xl p-5 md:p-6 shadow-xl border-4 transition-all duration-300 animate-in slide-in-from-top-4 ${
        isExceeded
          ? 'bg-rose-50 border-red-600 shadow-danger-glow'
          : 'bg-amber-50 border-amber-600 shadow-warning-glow'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Icon & Title */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
              isExceeded ? 'bg-red-600' : 'bg-amber-600'
            }`}
          >
            {isExceeded ? (
              <AlertOctagon className="w-8 h-8 animate-bounce" />
            ) : (
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white ${
                  isExceeded ? 'bg-red-700' : 'bg-amber-700'
                }`}
              >
                {isExceeded ? '🚨 100% Budget Exceeded' : '⚠️ 80% Budget Used'}
              </span>
              <span className="text-sm font-bold text-slate-700">
                Category: {budget.category}
              </span>
            </div>

            <h3
              className={`text-2xl md:text-3xl font-black mt-1 ${
                isExceeded ? 'text-red-950' : 'text-amber-950'
              }`}
            >
              {isExceeded
                ? `Chetavni! ${budget.category} Budget Paar Ho Gaya!`
                : `Savdhaan! ${budget.category} Budget ${percentUsed}% Kharch Ho Chuka Hai`}
            </h3>

            <p
              className={`text-base md:text-lg font-bold mt-0.5 ${
                isExceeded ? 'text-red-800' : 'text-amber-800'
              }`}
            >
              {isExceeded
                ? `Limit: ₹${budget.limit.toLocaleString('en-IN')} | Spent: ₹${budget.spent.toLocaleString(
                    'en-IN'
                  )} (Extra ₹${exceededBy.toLocaleString('en-IN')} kharch hua)`
                : `Limit: ₹${budget.limit.toLocaleString('en-IN')} | Spent: ₹${budget.spent.toLocaleString(
                    'en-IN'
                  )} | Remaining: ₹${(budget.limit - budget.spent).toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleReplayVoice}
            className="p-3 rounded-2xl bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-800 flex items-center gap-2 font-bold transition shadow-sm"
            title="Awaaz dobara sunein"
            aria-label="Awaaz dobara sunein"
          >
            <Volume2 className="w-6 h-6 text-emerald-700" />
            <span className="hidden sm:inline text-sm">Sunayein</span>
          </button>

          <button
            onClick={onViewBudgets}
            className={`py-3 px-5 rounded-2xl text-white font-black text-base flex items-center gap-2 shadow-md transition ${
              isExceeded
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-amber-700 hover:bg-amber-800'
            }`}
          >
            <span>Budget Dekhein</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onDismiss}
            className="p-3 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            title="Dismiss notification"
            aria-label="Band karein"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
