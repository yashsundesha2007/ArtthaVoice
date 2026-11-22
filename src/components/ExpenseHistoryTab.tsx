import React, { useState } from 'react';
import { Transaction, ExpenseCategory } from '../types';
import {
  Search,
  Volume2,
  Trash2,
  Utensils,
  Car,
  HeartPulse,
  Receipt,
  ShoppingBag,
  MoreHorizontal,
  Calendar,
  Filter,
} from 'lucide-react';
import { speechService } from '../services/speechEngine';

interface ExpenseHistoryTabProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  Food: <Utensils className="w-6 h-6 text-emerald-700" />,
  Transport: <Car className="w-6 h-6 text-sky-700" />,
  Medical: <HeartPulse className="w-6 h-6 text-purple-700" />,
  Bills: <Receipt className="w-6 h-6 text-amber-700" />,
  Groceries: <ShoppingBag className="w-6 h-6 text-teal-700" />,
  Other: <MoreHorizontal className="w-6 h-6 text-slate-700" />,
};

const CATEGORIES: ('All' | ExpenseCategory)[] = [
  'All',
  'Food',
  'Transport',
  'Medical',
  'Bills',
  'Groceries',
  'Other',
];

export const ExpenseHistoryTab: React.FC<ExpenseHistoryTabProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExpenseCategory>('All');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm);
    const matchesCategory =
      selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFiltered = filtered.reduce((acc, t) => acc + t.amount, 0);

  const handleSpeakItem = (t: Transaction) => {
    speechService.speak(`${t.description}, ${t.amount} rupaye, category ${t.category}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner and Search Controls */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Kharch Ki History (All Expenses)
            </h2>
            <p className="text-slate-600 font-medium text-base mt-1">
              Aapke sabhi voice aur logged transactions ki soochi
            </p>
          </div>

          <div className="bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-200 text-right">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Filtered Total
            </span>
            <span className="text-2xl md:text-3xl font-black text-emerald-950 font-mono">
              ₹{totalFiltered.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Search input with large touch area */}
        <div className="mt-5 relative">
          <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, or amount (e.g. Sabzi, Auto, 120)..."
            className="w-full pl-13 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-300 text-lg font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-5 h-5 text-slate-500 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'Sabhi (All)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 text-center text-slate-500">
            <p className="text-xl font-bold">Koi kharch nahi mila</p>
            <p className="text-sm mt-1">Search badal kar dekhein ya Mic daba kar naya kharch bolein</p>
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-400 p-4 md:p-5 shadow-sm flex items-center justify-between gap-4 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
                  {CATEGORY_ICONS[tx.category] || (
                    <MoreHorizontal className="w-6 h-6 text-slate-700" />
                  )}
                </div>

                <div>
                  <div className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                    {tx.description}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {tx.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {tx.date}
                    </span>

                    {tx.languageDetected && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        🎙️ {tx.languageDetected}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-black text-slate-900 font-mono">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Text-to-Speech button for elder reading */}
                <button
                  onClick={() => handleSpeakItem(tx)}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition"
                  title="Awaaz mein sunein"
                  aria-label={`${tx.description} awaaz mein sunein`}
                >
                  <Volume2 className="w-5 h-5 text-emerald-700" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => {
                    if (confirm(`Kya aap "${tx.description}" delete karna chahte hain?`)) {
                      onDeleteTransaction(tx.id);
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 transition"
                  title="Kharch mitayein"
                  aria-label="Delete transaction"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
