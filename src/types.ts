export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Medical'
  | 'Bills'
  | 'Groceries'
  | 'Other';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  timestamp: number;
  rawVoiceTranscript?: string;
  languageDetected?: 'Hindi' | 'Hinglish' | 'Gujarati' | 'Rajasthani' | 'English';
  confidence?: number;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  limit: number;
  spent: number;
  icon: string;
  color: string; // Tailwind hex or class
  alertThreshold: number; // e.g. 0.8 (80%)
}

export interface ParsedExpenseItem {
  id: string;
  item: string;
  amount: number;
  category: ExpenseCategory;
  rawText: string;
  isCorrection?: boolean;
  previousAmount?: number;
}

export type VoiceIntent =
  | 'expense_log'
  | 'confirmation'
  | 'rejection_or_correction'
  | 'financial_query'
  | 'navigation'
  | 'read_report'
  | 'unknown';

export interface ParsedVoiceResult {
  intent: VoiceIntent;
  items: ParsedExpenseItem[];
  detectedLanguage: 'Hindi' | 'Hinglish' | 'Gujarati' | 'Rajasthani' | 'English';
  cleanedTranscript: string;
  rawTranscript: string;
  fillersRemoved: string[];
  midSentenceCorrections: {
    from: number;
    to: number;
    phrase: string;
  }[];
  queryAnswer?: {
    summary: string;
    voiceResponse: string;
    highlightTab?: 'home' | 'history' | 'budgets' | 'reports';
    category?: ExpenseCategory;
    amount?: number;
  };
  navigationTarget?: 'home' | 'history' | 'budgets' | 'reports';
}

export type ActiveTab = 'home' | 'history' | 'budgets' | 'reports';

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'confirming'
  | 'speaking';
