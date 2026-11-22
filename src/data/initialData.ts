import { Transaction, CategoryBudget } from '../types';

export const INITIAL_BUDGETS: CategoryBudget[] = [
  {
    category: 'Food',
    limit: 4000,
    spent: 3100, // 77.5% — adding ₹120 immediately triggers 80.5% warning!
    icon: 'Utensils',
    color: '#059669', // Emerald
    alertThreshold: 0.8,
  },
  {
    category: 'Transport',
    limit: 2000,
    spent: 850,
    icon: 'Car',
    color: '#0284C7', // Sky Blue
    alertThreshold: 0.8,
  },
  {
    category: 'Medical',
    limit: 3000,
    spent: 1250,
    icon: 'HeartPulse',
    color: '#8B5CF6', // Purple
    alertThreshold: 0.8,
  },
  {
    category: 'Bills',
    limit: 5000,
    spent: 3450,
    icon: 'Receipt',
    color: '#F59E0B', // Amber
    alertThreshold: 0.8,
  },
  {
    category: 'Groceries',
    limit: 6000,
    spent: 3700,
    icon: 'ShoppingBag',
    color: '#10B981', // Emerald
    alertThreshold: 0.8,
  },
  {
    category: 'Other',
    limit: 2000,
    spent: 600,
    icon: 'MoreHorizontal',
    color: '#64748B', // Slate
    alertThreshold: 0.8,
  },
];

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Taza Doodh (Fresh Milk)',
    amount: 60,
    category: 'Food',
    date: 'Today, 7:15 AM',
    timestamp: now - 8 * 60 * 60 * 1000,
    rawVoiceTranscript: 'Doodh 60 rupaye',
    languageDetected: 'Hindi',
    confidence: 0.98,
  },
  {
    id: 'tx-2',
    description: 'Bijli Bill (Electricity Bill)',
    amount: 1450,
    category: 'Bills',
    date: 'Today, 11:20 AM',
    timestamp: now - 4 * 60 * 60 * 1000,
    rawVoiceTranscript: 'Bijli ka bill 1450 bhara',
    languageDetected: 'Hinglish',
    confidence: 0.96,
  },
  {
    id: 'tx-3',
    description: 'BP ki Dawa (Blood Pressure Medicine)',
    amount: 320,
    category: 'Medical',
    date: 'Yesterday, 5:30 PM',
    timestamp: now - oneDayMs - 2 * 60 * 60 * 1000,
    rawVoiceTranscript: 'Medical store se dawa 320 rupya',
    languageDetected: 'Hindi',
    confidence: 0.97,
  },
  {
    id: 'tx-4',
    description: 'Auto Rickshaw (Market Roundtrip)',
    amount: 80,
    category: 'Transport',
    date: 'Yesterday, 10:15 AM',
    timestamp: now - oneDayMs - 6 * 60 * 60 * 1000,
    rawVoiceTranscript: 'Auto ka 80 diya',
    languageDetected: 'Hindi',
    confidence: 0.99,
  },
  {
    id: 'tx-5',
    description: 'Taaza Sabzi (Mandi Fresh Vegetables)',
    amount: 140,
    category: 'Food',
    date: '2 Days ago',
    timestamp: now - 2 * oneDayMs,
    rawVoiceTranscript: 'Mandi se sabzi 140 ki aayi',
    languageDetected: 'Hindi',
    confidence: 0.95,
  },
  {
    id: 'tx-6',
    description: 'Aata aur Dal (Monthly Ration)',
    amount: 1850,
    category: 'Groceries',
    date: '3 Days ago',
    timestamp: now - 3 * oneDayMs,
    rawVoiceTranscript: 'Kirana dukan aashirvaad aata aur daal 1850',
    languageDetected: 'Hinglish',
    confidence: 0.94,
  },
  {
    id: 'tx-7',
    description: 'Gas Cylinder Booking',
    amount: 980,
    category: 'Bills',
    date: '4 Days ago',
    timestamp: now - 4 * oneDayMs,
    rawVoiceTranscript: 'Bharat gas cylinder 980 diya',
    languageDetected: 'Hindi',
    confidence: 0.98,
  },
  {
    id: 'tx-8',
    description: 'Chai aur Nashta (Evening Tea & Snacks)',
    amount: 70,
    category: 'Food',
    date: '5 Days ago',
    timestamp: now - 5 * oneDayMs,
    rawVoiceTranscript: 'Chai biscuit 70',
    languageDetected: 'Hindi',
    confidence: 0.99,
  },
];
