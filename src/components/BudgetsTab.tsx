import React, { useState } from 'react';
import { CategoryBudget, ExpenseCategory } from '../types';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Volume2,
  Edit3,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { speechService } from '../services/speechEngine';

interface BudgetsTabProps {
  budgets: CategoryBudget[];
  onUpdateBudgetLimit: (category: ExpenseCategory, newLimit: number) => void;
}

export const BudgetsTab: React.FC<BudgetsTabProps> = ({
  budgets,
  onUpdateBudgetLimit,
}) => {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<string>('');

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPercent = Math.round((totalSpent / totalLimit) * 100);

  const handleSpeakBudget = (b: CategoryBudget) => {
    const percent = Math.round((b.spent / b.limit) * 100);
    const remaining = b.limit - b.spent;

    if (b.spent >= b.limit) {
      speechService.speak(
        `${b.category} budget poora ho gaya hai. Seema se ${b.spent - b.limit} rupaye jyada kharch ho chuka hai.`
      );
    } else if (percent >= 80) {
      speechService.speak(
        `Savdhaan! ${b.category} budget ${percent} pratishat kharch ho gaya hai. Kewal ${remaining} rupaye bache hain.`
      );
    } else {
      speechService.speak(
        `${b.category} budget mein ${remaining} rupaye bache hain.`
      );
    }
  };

  const handleSaveNewLimit = (cat: ExpenseCategory) => {
    const parsed = parseFloat(newLimitInput);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateBudgetLimit(cat, parsed);
    }
    setEditingCategory(null);
    setNewLimitInput('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Top Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Mahine Ka Budget (Monthly Budgets)
            </h2>
            <p className="text-slate-600 font-medium text-base mt-1">
              Category wise kharch aur bacha hua paisa
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-right">
              <span className="text-xs font-bold text-slate-500 block uppercase">
                Kul Budget
              </span>
              <span className="text-xl md:text-2xl font-black text-slate-900 font-mono">
                ₹{totalLimit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 text-right">
              <span className="text-xs font-bold text-emerald-800 block uppercase">
                Bacha Hua (Left)
              </span>
              <span className="text-xl md:text-2xl font-black text-emerald-950 font-mono">
                ₹{totalRemaining.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Overall progress indicator */}
        <div className="mt-5">
          <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-2">
            <span>Kul Kharch: ₹{totalSpent.toLocaleString('en-IN')}</span>
            <span className={overallPercent >= 80 ? 'text-amber-700' : 'text-emerald-700'}>
              {overallPercent}% Used
            </span>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                overallPercent >= 100
                  ? 'bg-red-600'
                  : overallPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const percentUsed = Math.round((b.spent / b.limit) * 100);
          const isExceeded = b.spent >= b.limit;
          const isWarning = percentUsed >= 80 && !isExceeded;
          const remaining = b.limit - b.spent;

          return (
            <div
              key={b.category}
              className={`bg-white rounded-3xl p-6 border-4 shadow-md transition-all ${
                isExceeded
                  ? 'border-red-600 bg-rose-50/40'
                  : isWarning
                  ? 'border-amber-500 bg-amber-50/40'
                  : 'border-slate-200 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-sm ${
                      isExceeded
                        ? 'bg-red-600'
                        : isWarning
                        ? 'bg-amber-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {isExceeded ? (
                      <AlertOctagon className="w-6 h-6" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <CheckCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {b.category}
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                      Limit: ₹{b.limit.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSpeakBudget(b)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Awaaz mein sunein"
                    aria-label={`${b.category} budget status awaaz mein sunein`}
                  >
                    <Volume2 className="w-5 h-5 text-emerald-700" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingCategory(b.category);
                      setNewLimitInput(b.limit.toString());
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title="Budget limit badlein"
                    aria-label="Edit budget limit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Edit Limit Inline Form */}
              {editingCategory === b.category && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-300 shadow-sm flex items-center gap-2">
                  <input
                    type="number"
                    value={newLimitInput}
                    onChange={(e) => setNewLimitInput(e.target.value)}
                    placeholder="New limit ₹"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-base font-bold text-slate-900"
                  />
                  <button
                    onClick={() => handleSaveNewLimit(b.category)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-4">
                {isExceeded ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-300 inline-flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-700" />
                    Budget Exceeded by ₹{(b.spent - b.limit).toLocaleString('en-IN')}
                  </span>
                ) : isWarning ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    80% Budget Used (Savdhaan)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    Surakshit (Under Budget)
                  </span>
                )}
              </div>

              {/* Thick 14px Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
                  <span>Spent: ₹{b.spent.toLocaleString('en-IN')}</span>
                  <span>{percentUsed}%</span>
                </div>
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-red-600'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
              </div>

              {/* Remaining Balance readout */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {isExceeded ? 'Zyaada Kharch:' : 'Bacha Hua Paisa:'}
                </span>
                <span
                  className={`text-2xl font-black font-mono ${
                    isExceeded
                      ? 'text-red-700'
                      : isWarning
                      ? 'text-amber-800'
                      : 'text-emerald-900'
                  }`}
                >
                  {isExceeded
                    ? `-₹${(b.spent - b.limit).toLocaleString('en-IN')}`
                    : `₹${remaining.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
