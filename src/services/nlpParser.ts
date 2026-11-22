import {
  ExpenseCategory,
  ParsedExpenseItem,
  ParsedVoiceResult,
  VoiceIntent,
  Transaction,
  CategoryBudget,
} from '../types';

// Multilingual regional dictionary keywords
const GUJARATI_MARKERS = [
  'aaje',
  'shaak',
  'shaakbhaaji',
  'aapya',
  'aapyu',
  'didha',
  'ane',
  'chhe',
  'khota',
  'barobar',
  'dudh',
  'jamvanu',
  'nasto',
  'kapda',
  'thayu',
  'ketla',
  'aapo',
];

const RAJASTHANI_MARKERS = [
  'saag',
  'ar',
  'haak',
  'hukum',
  'roopya',
  'roopiya',
  'bhaado',
  'mhane',
  'thaso',
  'deena',
  'kharchiyo',
];

const HINDI_MARKERS = [
  'aaj',
  'arre',
  'arrey',
  'sabzi',
  'aur',
  'pe',
  'ka',
  'ki',
  'ke',
  'diya',
  'kharch',
  'hua',
  'rupaye',
  'rupya',
  'bhaiya',
  'sahi',
  'hai',
  'batao',
  'kholo',
  'dikhao',
  'suna',
  'doodh',
  'bijli',
  'dawa',
];

// Fillers to automatically strip
const FILLER_PATTERNS = [
  /\b(arre|arrey|are)\b/gi,
  /\b(umm|um|uh|uhh)\b/gi,
  /\b(haan bhai|arre bhai|bhaiya|bhai|yaar|arre yaar)\b/gi,
  /\b(matlab|matlab ki)\b/gi,
  /\b(suno|dekho|acha|achha)\b/gi,
  /\b(bas|to|to fir)\b/gi,
  /\b(haalo)\b/gi,
];

// Indian Number word dictionary for parsing spoken numbers
const INDIAN_NUMBER_WORDS: Record<string, number> = {
  // Hindi / Hinglish
  sau: 100,
  so: 100,
  dedhsau: 150,
  'dedh sau': 150,
  'dedh so': 150,
  dosau: 200,
  'do sau': 200,
  'do so': 200,
  dhaisau: 250,
  'dhai sau': 250,
  'dhai so': 250,
  teensau: 300,
  'teen sau': 300,
  'paanch sau': 500,
  panchsau: 500,
  hazaar: 1000,
  hazar: 1000,
  hajaar: 1000,
  ek: 1,
  do: 2,
  teen: 3,
  chaar: 4,
  paanch: 5,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  gyarah: 11,
  barah: 12,
  pandrah: 15,
  bees: 20,
  pachees: 25,
  tees: 30,
  paintees: 35,
  chalis: 40,
  pachas: 50,
  saath: 60,
  sattar: 70,
  assi: 80,
  nabbe: 90,

  // Gujarati / Regional
  'be so': 200,
  'be sau': 200,
  'adhi so': 250,
  'tran so': 300,
  vis: 20,
  tris: 30,
  challis: 40,
  santh: 60,
  sitter: 70,
  ensi: 80,
  nevvo: 90,
};

// Item to Category classification mappings
const CATEGORY_MAP: Record<string, ExpenseCategory> = {
  // Food
  sabzi: 'Food',
  sabji: 'Food',
  saag: 'Food',
  shaak: 'Food',
  shaakbhaaji: 'Food',
  vegetable: 'Food',
  vegetables: 'Food',
  tarkari: 'Food',
  doodh: 'Food',
  dudh: 'Food',
  milk: 'Food',
  khana: 'Food',
  jamvanu: 'Food',
  roti: 'Food',
  cha: 'Food',
  chai: 'Food',
  tea: 'Food',
  nashta: 'Food',
  nasto: 'Food',
  breakfast: 'Food',
  lunch: 'Food',
  dinner: 'Food',
  mithai: 'Food',
  sweets: 'Food',
  paneer: 'Food',
  dahi: 'Food',
  fruit: 'Food',
  fruits: 'Food',
  phal: 'Food',
  juice: 'Food',

  // Transport
  auto: 'Transport',
  riksha: 'Transport',
  rikshaw: 'Transport',
  rickshaw: 'Transport',
  autorickshaw: 'Transport',
  cab: 'Transport',
  taxi: 'Transport',
  uber: 'Transport',
  ola: 'Transport',
  metro: 'Transport',
  bus: 'Transport',
  bhadu: 'Transport',
  bhaado: 'Transport',
  petrol: 'Transport',
  diesel: 'Transport',
  fuel: 'Transport',
  scooter: 'Transport',

  // Medical
  dawa: 'Medical',
  dawai: 'Medical',
  dava: 'Medical',
  medicine: 'Medical',
  medicines: 'Medical',
  tablet: 'Medical',
  goli: 'Medical',
  doctor: 'Medical',
  hospital: 'Medical',
  clinic: 'Medical',
  bp: 'Medical',
  sugar: 'Medical',
  test: 'Medical',
  medical: 'Medical',
  chemist: 'Medical',
  injection: 'Medical',

  // Bills
  bijli: 'Bills',
  light: 'Bills',
  electricity: 'Bills',
  power: 'Bills',
  paani: 'Bills',
  water: 'Bills',
  cylinder: 'Bills',
  gas: 'Bills',
  lpg: 'Bills',
  recharge: 'Bills',
  mobile: 'Bills',
  wifi: 'Bills',
  phone: 'Bills',
  rent: 'Bills',
  kiraya: 'Bills',
  dth: 'Bills',

  // Groceries
  kirana: 'Groceries',
  rashan: 'Groceries',
  ration: 'Groceries',
  grocery: 'Groceries',
  groceries: 'Groceries',
  aata: 'Groceries',
  atta: 'Groceries',
  daal: 'Groceries',
  dal: 'Groceries',
  tel: 'Groceries',
  oil: 'Groceries',
  masala: 'Groceries',
  chawal: 'Groceries',
  rice: 'Groceries',
  soap: 'Groceries',
  surf: 'Groceries',

  // Other
  kapde: 'Other',
  kapda: 'Other',
  clothes: 'Other',
  shopping: 'Other',
  pooja: 'Other',
  mandir: 'Other',
  repair: 'Other',
};

export class MultilingualNLPParser {
  /**
   * Zero Manual Language Toggle: detects whether user is speaking
   * Hindi, Hinglish, Gujarati, Rajasthani, or Indian English
   */
  public detectLanguage(
    text: string
  ): 'Hindi' | 'Hinglish' | 'Gujarati' | 'Rajasthani' | 'English' {
    const lower = text.toLowerCase();

    let gujaratiScore = 0;
    for (const marker of GUJARATI_MARKERS) {
      if (new RegExp(`\\b${marker}\\b`, 'i').test(lower)) {
        gujaratiScore += 2;
      }
    }

    let rajasthaniScore = 0;
    for (const marker of RAJASTHANI_MARKERS) {
      if (new RegExp(`\\b${marker}\\b`, 'i').test(lower)) {
        rajasthaniScore += 2;
      }
    }

    let hindiScore = 0;
    for (const marker of HINDI_MARKERS) {
      if (new RegExp(`\\b${marker}\\b`, 'i').test(lower)) {
        hindiScore++;
      }
    }

    let englishScore = 0;
    const englishWords = ['expense', 'spent', 'report', 'history', 'budget', 'save', 'today', 'milk', 'electricity', 'bill'];
    for (const word of englishWords) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
        englishScore++;
      }
    }

    if (gujaratiScore > 0 && gujaratiScore >= rajasthaniScore && gujaratiScore >= hindiScore) return 'Gujarati';
    if (rajasthaniScore > 0 && rajasthaniScore > gujaratiScore && rajasthaniScore >= hindiScore) return 'Rajasthani';
    if (hindiScore > 0 && englishScore > 0) return 'Hinglish';
    if (hindiScore > 0) return 'Hindi';
    if (englishScore > 0) return 'English';

    return 'Hindi'; // default friendly Indian voice
  }

  /**
   * Smart Filler & Disfluency Cleanup
   * Extracts stripped filler tokens so the UI can highlight what was cleaned
   */
  public cleanFillers(text: string): { cleaned: string; removed: string[] } {
    let cleaned = text;
    const removed: string[] = [];

    for (const pattern of FILLER_PATTERNS) {
      const matches = cleaned.match(pattern);
      if (matches) {
        matches.forEach((m) => {
          if (!removed.includes(m.trim().toLowerCase())) {
            removed.push(m.trim().toLowerCase());
          }
        });
        cleaned = cleaned.replace(pattern, ' ');
      }
    }

    // Tidy extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return { cleaned, removed };
  }

  /**
   * Mid-Sentence Self-Correction Resolver
   * Handles patterns like "120... nahi nahi 150", "120 nahi 150", "sau nahi dedh sau"
   */
  public resolveMidSentenceCorrections(text: string): {
    resolvedText: string;
    corrections: { from: number; to: number; phrase: string }[];
  } {
    const corrections: { from: number; to: number; phrase: string }[] = [];
    let resolvedText = text;

    // Pattern: (\d+)\s*(?:\.{2,}|\,)?\s*(?:nahi\s+nahi|nahi\s+re|nahi|galat|khota|no|not)\s*(\d+)
    const correctionRegex =
      /(\d+)\s*(?:\.{2,}|\,)?\s*(?:nahi\s+nahi|nahi\s+re|nahi|na\s+na|galat|khota|no|not)\s*(\d+)/gi;

    let match;
    while ((match = correctionRegex.exec(text)) !== null) {
      const fromVal = parseInt(match[1], 10);
      const toVal = parseInt(match[2], 10);
      corrections.push({
        from: fromVal,
        to: toVal,
        phrase: match[0],
      });
      // Replace the correction phrase with just the target number
      resolvedText = resolvedText.replace(match[0], match[2]);
    }

    // Word-based corrections e.g., "120... nahi 150 sabzi ka"
    const wordPattern =
      /(?:ek|sau|dedh sau|do sau|\d+)\s*(?:\.{2,}|\,)?\s*(?:nahi\s+nahi|nahi\s+re|nahi)\s*(\d+)/gi;
    resolvedText = resolvedText.replace(wordPattern, '$1');

    return { resolvedText, corrections };
  }

  /**
   * Convert number words or symbols to digits
   */
  private normalizeNumbers(text: string): string {
    let result = text;
    for (const [word, num] of Object.entries(INDIAN_NUMBER_WORDS)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, num.toString());
    }
    return result;
  }

  /**
   * Detect User Intent (expense log, confirmation, correction, query, navigation)
   */
  public detectIntent(
    text: string,
    pendingConfirmation: boolean = false
  ): VoiceIntent {
    const lower = text.toLowerCase();

    // If confirmation is pending, check yes/no first
    if (pendingConfirmation) {
      const confirmWords = [
        'haan',
        'ha',
        'yes',
        'save',
        'sahi',
        'sahi hai',
        'barobar',
        'barobar chhe',
        'theek hai',
        'thik hai',
        'kar do',
        'hukum',
        'okay',
        'ok',
      ];
      for (const w of confirmWords) {
        if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) {
          return 'confirmation';
        }
      }

      const rejectWords = [
        'nahi',
        'na',
        'no',
        'galat',
        'khota',
        'badlo',
        'ruko',
        'change',
        'tha',
      ];
      for (const w of rejectWords) {
        if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) {
          return 'rejection_or_correction';
        }
      }
    }

    // Check Navigation intents
    if (
      /budget\s*(kholo|dikhao|batao|open|dekhna)/i.test(lower) ||
      /budget\s*pe\s*jao/i.test(lower)
    ) {
      return 'navigation';
    }

    if (
      /(history|itihaas|purana|kharch)\s*(kholo|dikhao|batao|list|open)/i.test(lower) ||
      /sab\s*kharch\s*dikhao/i.test(lower)
    ) {
      return 'navigation';
    }

    if (
      /(report|chart|graphs?)\s*(dikhao|kholo|suna|suna do|batao|open)/i.test(lower) ||
      /report\s*suna\s*do/i.test(lower)
    ) {
      return 'read_report';
    }

    if (
      /(home|ghar|naya\s*kharch|mic|dashboard)/i.test(lower)
    ) {
      return 'navigation';
    }

    // Check Financial Queries
    if (
      /kitna\s*kharch\s*hua/i.test(lower) ||
      /kitna\s*bacha/i.test(lower) ||
      /last\s*\d*\s*expenses?/i.test(lower) ||
      /pichle\s*kharch/i.test(lower) ||
      /budget\s*kitna\s*bacha/i.test(lower) ||
      /is\s*hafte/i.test(lower) ||
      /aaj\s*kitna/i.test(lower) ||
      /kisme\s*sabse\s*jyada/i.test(lower) ||
      /highest\s*spending/i.test(lower)
    ) {
      return 'financial_query';
    }

    // Check single modification like "Nahi, sabzi 150 tha"
    if (/nahi|galat|tha|karo/i.test(lower) && /\d+/.test(lower)) {
      return 'rejection_or_correction';
    }

    // If it contains a number and item, it's an expense log
    if (/\d+/.test(this.normalizeNumbers(lower))) {
      return 'expense_log';
    }

    return 'unknown';
  }

  /**
   * Multi-Item Voice Expense Parser
   * Parses clauses like:
   * "aaj sabzi pe 120 aur auto ka 60 diya"
   * "Aaje shaak na 120 ane auto na 60 aapya"
   * "Aaj saag ra 120 ar auto ra 60 diya"
   */
  public parseExpenseItems(text: string): ParsedExpenseItem[] {
    const normalized = this.normalizeNumbers(text.toLowerCase());
    const items: ParsedExpenseItem[] = [];

    // Split on conjunctions: aur, ane, ar, tatha, and, comma, plus
    const clauses = normalized.split(/\b(?:aur|ane|ar|tatha|and|\,)\b/gi);

    for (const clause of clauses) {
      const trimmed = clause.trim();
      if (!trimmed) continue;

      // Extract amount (\d+)
      const amountMatch = trimmed.match(/(\d+(?:\.\d{1,2})?)/);
      if (!amountMatch) continue;

      const amount = parseFloat(amountMatch[1]);
      if (isNaN(amount) || amount <= 0) continue;

      // Identify category & item name
      let detectedCategory: ExpenseCategory = 'Other';
      let itemName = '';

      for (const [word, cat] of Object.entries(CATEGORY_MAP)) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(trimmed)) {
          detectedCategory = cat;
          // Capitalize friendly label
          if (word === 'sabzi' || word === 'saag' || word === 'shaak' || word === 'shaakbhaaji') {
            itemName = 'Sabzi (Vegetables)';
          } else if (word === 'auto' || word === 'riksha' || word === 'rikshaw' || word === 'autorickshaw') {
            itemName = 'Auto Rickshaw';
          } else if (word === 'doodh' || word === 'dudh' || word === 'milk') {
            itemName = 'Taza Doodh (Milk)';
          } else if (word === 'dawa' || word === 'dawai' || word === 'dava' || word === 'medicine') {
            itemName = 'Dawa (Medicine)';
          } else if (word === 'bijli' || word === 'light' || word === 'electricity') {
            itemName = 'Bijli Bill';
          } else if (word === 'kirana' || word === 'rashan') {
            itemName = 'Kirana Ration';
          } else {
            itemName = word.charAt(0).toUpperCase() + word.slice(1);
          }
          break;
        }
      }

      // If no dictionary keyword matched, try extracting neighboring word
      if (!itemName) {
        const words = trimmed
          .replace(/(\d+)/g, '')
          .replace(/\b(pe|ka|ki|ke|ko|na|nu|ne|ra|ro|re|aaj|aaje|diya|aapya|aapyu|kharch|hua|rupaye|rupya|roopya)\b/gi, '')
          .trim()
          .split(/\s+/);
        itemName = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Expense';
      }

      items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        item: itemName,
        amount,
        category: detectedCategory,
        rawText: trimmed,
      });
    }

    return items;
  }

  /**
   * Process Financial Queries against app state (transactions + budgets)
   */
  public answerFinancialQuery(
    text: string,
    transactions: Transaction[],
    budgets: CategoryBudget[]
  ): {
    summary: string;
    voiceResponse: string;
    highlightTab: 'home' | 'history' | 'budgets' | 'reports';
    category?: ExpenseCategory;
    amount?: number;
  } {
    const lower = text.toLowerCase();

    // Query 1: "Food budget kitna bacha hai?"
    if (/food|khana|sabzi/i.test(lower) && /budget|bacha/i.test(lower)) {
      const foodBudget = budgets.find((b) => b.category === 'Food');
      const limit = foodBudget ? foodBudget.limit : 4000;
      const spent = foodBudget ? foodBudget.spent : 3100;
      const remaining = Math.max(0, limit - spent);

      return {
        summary: `Food Budget: ₹${remaining.toLocaleString('en-IN')} bacha hai (Limit ₹${limit.toLocaleString('en-IN')}, Spent ₹${spent.toLocaleString('en-IN')})`,
        voiceResponse: `Aapka Food budget mein ${remaining} rupaye bache hain. Kul budget ${limit} rupaye tha aur ${spent} rupaye kharch hue hain.`,
        highlightTab: 'budgets',
        category: 'Food',
        amount: remaining,
      };
    }

    // Query 2: "Is hafte kitna kharch hua?"
    if (/hafte|week|kitna\s*kharch\s*hua/i.test(lower)) {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekTotal = transactions
        .filter((t) => t.timestamp >= oneWeekAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        summary: `Is hafte ka kul kharch: ₹${weekTotal.toLocaleString('en-IN')}`,
        voiceResponse: `Is hafte aapka kul kharch ${weekTotal} rupaye hua hai. Sabse jyada kharch Food aur Bills par hua.`,
        highlightTab: 'reports',
        amount: weekTotal,
      };
    }

    // Query 3: "Last 5 expenses batao" or "Pichle kharch batao"
    if (/last|pichle|pichhla/i.test(lower) || /recent/i.test(lower)) {
      const last5 = transactions.slice(0, 5);
      const itemsList = last5.map((t) => `${t.description} ${t.amount} rupaye`).join(', ');

      return {
        summary: `Aapke pichle 5 kharch: ${last5.map((t) => `${t.description} (₹${t.amount})`).join(', ')}`,
        voiceResponse: `Aapke aakhiri kharch hain: ${itemsList}.`,
        highlightTab: 'history',
      };
    }

    // Query 4: "Highest spending kisme hui?" / "Sabse jyada kharch"
    if (/highest|sabse\s*jyada|jyada\s*kharch/i.test(lower)) {
      // Find category with highest spent
      const sorted = [...budgets].sort((a, b) => b.spent - a.spent);
      const top = sorted[0];

      return {
        summary: `Sabse jyada kharch: ${top.category} (₹${top.spent.toLocaleString('en-IN')})`,
        voiceResponse: `Sabse jyada kharch ${top.category} mein hua hai, kul ${top.spent} rupaye.`,
        highlightTab: 'reports',
        category: top.category,
        amount: top.spent,
      };
    }

    // Default general query answer
    const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    return {
      summary: `Kul kharch: ₹${totalSpent.toLocaleString('en-IN')}`,
      voiceResponse: `Aapka kul kharch ${totalSpent} rupaye hai. Aap Reports ya History tab mein sabhi kharch dekh sakte hain.`,
      highlightTab: 'reports',
      amount: totalSpent,
    };
  }

  /**
   * Full Voice Processing Pipeline
   */
  public processVoiceInput(
    rawSpeech: string,
    options: {
      pendingConfirmation?: boolean;
      transactions?: Transaction[];
      budgets?: CategoryBudget[];
    } = {}
  ): ParsedVoiceResult {
    const rawTranscript = rawSpeech.trim();
    const detectedLanguage = this.detectLanguage(rawTranscript);

    // 1. Strip fillers
    const { cleaned: fillerCleaned, removed: fillersRemoved } =
      this.cleanFillers(rawTranscript);

    // 2. Resolve mid-sentence self-corrections
    const { resolvedText, corrections: midSentenceCorrections } =
      this.resolveMidSentenceCorrections(fillerCleaned);

    // 3. Determine Intent
    const intent = this.detectIntent(resolvedText, options.pendingConfirmation);

    const result: ParsedVoiceResult = {
      intent,
      items: [],
      detectedLanguage,
      cleanedTranscript: resolvedText,
      rawTranscript,
      fillersRemoved,
      midSentenceCorrections,
    };

    // 4. Handle navigation intents
    if (intent === 'navigation') {
      const lower = resolvedText.toLowerCase();
      if (/budget/i.test(lower)) result.navigationTarget = 'budgets';
      else if (/history|kharch/i.test(lower)) result.navigationTarget = 'history';
      else if (/report|chart/i.test(lower)) result.navigationTarget = 'reports';
      else result.navigationTarget = 'home';
    } else if (intent === 'read_report') {
      result.navigationTarget = 'reports';
    }

    // 5. Handle financial queries
    if (intent === 'financial_query' && options.transactions && options.budgets) {
      result.queryAnswer = this.answerFinancialQuery(
        resolvedText,
        options.transactions,
        options.budgets
      );
    }

    // 6. Handle expense logging or correction
    if (intent === 'expense_log' || intent === 'rejection_or_correction') {
      result.items = this.parseExpenseItems(resolvedText);
    }

    return result;
  }
}

export const nlpParser = new MultilingualNLPParser();
