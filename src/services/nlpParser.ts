import {
  ExpenseCategory,
  ParsedExpenseItem,
  ParsedVoiceResult,
  VoiceIntent,
  Transaction,
  CategoryBudget,
} from '../types';

// Multilingual regional dictionary keywords (Latin + Devanagari + Gujarati script)
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
  'શાક',
  'શાકભાજી',
  'દૂધ',
  'રૂપિયા',
  'આપ્યા',
  'આપ્યું',
  'અને',
  'છે',
  'ખોટું',
  'બરાબર',
  'જમવાનું',
  'નાસ્તો',
  'રીક્ષા',
  'ઓટો',
  'દવા',
  'લાઈટ',
  'કરિયાણું',
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
  'साग',
  'हुकुम',
  'रूपिया',
  'भाड़ो',
];

const HINDI_MARKERS = [
  'aaj',
  'arre',
  'arrey',
  'sabzi',
  'sabji',
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
  'आज',
  'अरे',
  'सब्जी',
  'सब्ज़ी',
  'और',
  'का',
  'की',
  'के',
  'पे',
  'दिया',
  'खर्च',
  'रुपये',
  'रुपया',
  'भैया',
  'सही',
  'है',
  'बताओ',
  'खोलो',
  'दिखाओ',
  'सुनाओ',
  'दूध',
  'बिजली',
  'दवा',
];

// Fillers to automatically strip (Latin + Devanagari + Gujarati)
const FILLER_PATTERNS = [
  /\b(arre|arrey|are)\b/gi,
  /\b(umm|um|uh|uhh)\b/gi,
  /\b(haan bhai|arre bhai|bhaiya|bhai|yaar|arre yaar)\b/gi,
  /\b(matlab|matlab ki)\b/gi,
  /\b(suno|dekho|acha|achha)\b/gi,
  /\b(bas|to|to fir)\b/gi,
  /\b(haalo)\b/gi,
  // Devanagari fillers
  /(अरे|अर्रे|उम्म|हाँ\s*भाई|भैया|यार|मतलब|सुनो|देखो|अच्छा|बस|तो)/gi,
  // Gujarati fillers
  /(હાલો|અરે|ભઈ|જોવો|બસ)/gi,
];

// Devanagari and Gujarati numerals conversion maps
const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

const GUJARATI_DIGITS: Record<string, string> = {
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
  '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
};

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

  // Devanagari words
  सौ: 100,
  'डेढ़ सौ': 150,
  'दो सौ': 200,
  'ढाई सौ': 250,
  'तीन सौ': 300,
  'पांच सौ': 500,
  हजार: 1000,
  हज़ार: 1000,
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पांच: 5,
  पाँच: 5,
  छह: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  दस: 10,
  बीस: 20,
  पच्चीस: 25,
  तीस: 30,
  चालीस: 40,
  पचास: 50,
  साठ: 60,
  सत्तर: 70,
  अस्सी: 80,
  नब्बे: 90,

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
  સો: 100,
  'દોઢ સો': 150,
  'બે સો': 200,
  વીસ: 20,
  ત્રીસ: 30,
  ચાલીસ: 40,
  પચાસ: 50,
  સાઠ: 60,
  સીંતેર: 70,
  એંસી: 80,
  નેવું: 90,
};

// Item to Category classification mappings (Latin, Devanagari, Gujarati, & common phonetic typos)
const CATEGORY_MAP: Record<string, ExpenseCategory> = {
  // Food
  sabzi: 'Food',
  sabji: 'Food',
  subzi: 'Food',
  subji: 'Food',
  saag: 'Food',
  shaak: 'Food',
  shaakbhaaji: 'Food',
  vegetable: 'Food',
  vegetables: 'Food',
  tarkari: 'Food',
  doodh: 'Food',
  dudh: 'Food',
  dhoodh: 'Food',
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
  सब्जी: 'Food',
  सब्ज़ी: 'Food',
  भाजी: 'Food',
  शाक: 'Food',
  शाकभाजी: 'Food',
  साग: 'Food',
  दूध: 'Food',
  खाना: 'Food',
  रोटी: 'Food',
  चाय: 'Food',
  नाश्ता: 'Food',
  मिठाई: 'Food',
  पनीर: 'Food',
  दही: 'Food',
  फल: 'Food',
  શાક: 'Food',
  શાકભાજી: 'Food',
  દૂધ: 'Food',
  જમવાનું: 'Food',
  ચા: 'Food',
  નાસ્તો: 'Food',

  // Transport
  auto: 'Transport',
  otto: 'Transport',
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
  patrol: 'Transport',
  pitrol: 'Transport',
  diesel: 'Transport',
  fuel: 'Transport',
  scooter: 'Transport',
  ऑटो: 'Transport',
  रिक्शा: 'Transport',
  टैक्सी: 'Transport',
  पेट्रोल: 'Transport',
  पैट्रोल: 'Transport',
  डीजल: 'Transport',
  भाड़ा: 'Transport',
  રીક્ષા: 'Transport',
  ઓટો: 'Transport',
  ભાડું: 'Transport',

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
  दवा: 'Medical',
  दवाई: 'Medical',
  गोली: 'Medical',
  डॉक्टर: 'Medical',
  अस्पताल: 'Medical',
  દવા: 'Medical',
  દવાઓ: 'Medical',
  ડોક્ટર: 'Medical',

  // Bills
  bijli: 'Bills',
  bijlee: 'Bills',
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
  बिजली: 'Bills',
  लाइट: 'Bills',
  बिल: 'Bills',
  सिलेंडर: 'Bills',
  गैस: 'Bills',
  रिचार्ज: 'Bills',
  मोबाइल: 'Bills',
  किराया: 'Bills',
  લાઈટ: 'Bills',
  'લાઈટ બિલ': 'Bills',
  વીજળી: 'Bills',
  ગેસ: 'Bills',
  રીચાર્જ: 'Bills',

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
  किराना: 'Groceries',
  राशन: 'Groceries',
  आटा: 'Groceries',
  दाल: 'Groceries',
  तेल: 'Groceries',
  चावल: 'Groceries',
  करियाणूं: 'Groceries',
  રાશન: 'Groceries',
  લોટ: 'Groceries',
  તેલ: 'Groceries',
  દાળ: 'Groceries',

  // Other
  kapde: 'Other',
  kapda: 'Other',
  clothes: 'Other',
  shopping: 'Other',
  pooja: 'Other',
  mandir: 'Other',
  repair: 'Other',
  कपड़े: 'Other',
  कपड़ा: 'Other',
  पूजा: 'Other',
  मंदिर: 'Other',
  કપડાં: 'Other',
};

export class MultilingualNLPParser {
  /**
   * Convert native Devanagari and Gujarati digits (e.g. १२०, ૧૨૦) to standard digits (120)
   */
  public normalizeNativeDigits(text: string): string {
    let result = text;
    for (const [dev, lat] of Object.entries(DEVANAGARI_DIGITS)) {
      result = result.replace(new RegExp(dev, 'g'), lat);
    }
    for (const [guj, lat] of Object.entries(GUJARATI_DIGITS)) {
      result = result.replace(new RegExp(guj, 'g'), lat);
    }
    return result;
  }

  /**
   * Zero Manual Language Toggle: detects whether user is speaking
   * Hindi, Hinglish, Gujarati, Rajasthani, or Indian English
   */
  public detectLanguage(
    text: string
  ): 'Hindi' | 'Hinglish' | 'Gujarati' | 'Rajasthani' | 'English' {
    const lower = text.toLowerCase();

    // Check Gujarati markers & script
    let gujaratiScore = 0;
    for (const marker of GUJARATI_MARKERS) {
      if (new RegExp(`\\b${marker}\\b|${marker}`, 'i').test(lower)) {
        gujaratiScore += 2;
      }
    }

    // Check Rajasthani markers
    let rajasthaniScore = 0;
    for (const marker of RAJASTHANI_MARKERS) {
      if (new RegExp(`\\b${marker}\\b|${marker}`, 'i').test(lower)) {
        rajasthaniScore += 2;
      }
    }

    // Check Hindi markers
    let hindiScore = 0;
    for (const marker of HINDI_MARKERS) {
      if (new RegExp(`\\b${marker}\\b|${marker}`, 'i').test(lower)) {
        hindiScore++;
      }
    }

    // Check English words
    let englishScore = 0;
    const englishWords = [
      'expense', 'spent', 'report', 'history', 'budget', 'save', 'today',
      'milk', 'electricity', 'bill', 'vegetables', 'medicine', 'auto'
    ];
    for (const word of englishWords) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
        englishScore++;
      }
    }

    if (gujaratiScore > 0 && gujaratiScore >= rajasthaniScore && gujaratiScore >= hindiScore) {
      return 'Gujarati';
    }
    if (rajasthaniScore > 0 && rajasthaniScore > gujaratiScore && rajasthaniScore >= hindiScore) {
      return 'Rajasthani';
    }
    if (hindiScore > 0 && englishScore > 0) return 'Hinglish';
    if (hindiScore > 0) return 'Hindi';
    if (englishScore > 0) return 'English';

    return 'Hindi';
  }

  /**
   * Smart Filler & Disfluency Cleanup
   */
  public cleanFillers(text: string): { cleaned: string; removed: string[] } {
    let cleaned = text;
    const removed: string[] = [];

    for (const pattern of FILLER_PATTERNS) {
      const matches = cleaned.match(pattern);
      if (matches) {
        matches.forEach((m) => {
          const val = m.trim().toLowerCase();
          if (!removed.includes(val)) {
            removed.push(val);
          }
        });
        cleaned = cleaned.replace(pattern, ' ');
      }
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return { cleaned, removed };
  }

  /**
   * Mid-Sentence Self-Correction Resolver
   */
  public resolveMidSentenceCorrections(text: string): {
    resolvedText: string;
    corrections: { from: number; to: number; phrase: string }[];
  } {
    const corrections: { from: number; to: number; phrase: string }[] = [];
    let resolvedText = text;

    // Pattern: (\d+)\s*(?:\.{2,}|\,)?\s*(?:nahi\s+nahi|nahi\s+re|nahi|नहीं\s*नहीं|नहीं|ना|galat|गलत|no)\s*(\d+)
    const correctionRegex =
      /(\d+)\s*(?:\.{2,}|\,)?\s*(?:nahi\s+nahi|nahi\s+re|nahi|na\s+na|नहीं\s*नहीं|नहीं|ना|galat|गलत|khota|खोतुं|no|not)\s*(\d+)/gi;

    let match;
    while ((match = correctionRegex.exec(text)) !== null) {
      const fromVal = parseInt(match[1], 10);
      const toVal = parseInt(match[2], 10);
      corrections.push({
        from: fromVal,
        to: toVal,
        phrase: match[0],
      });
      resolvedText = resolvedText.replace(match[0], match[2]);
    }

    return { resolvedText, corrections };
  }

  /**
   * Convert number words or symbols to digits
   */
  private normalizeNumbers(text: string): string {
    let result = this.normalizeNativeDigits(text);
    for (const [word, num] of Object.entries(INDIAN_NUMBER_WORDS)) {
      const regex = new RegExp(`\\b${word}\\b|${word}`, 'gi');
      result = result.replace(regex, num.toString());
    }
    return result;
  }

  /**
   * Detect User Intent
   */
  public detectIntent(
    text: string,
    pendingConfirmation: boolean = false
  ): VoiceIntent {
    const lower = text.toLowerCase();

    if (pendingConfirmation) {
      const confirmWords = [
        'haan', 'ha', 'yes', 'save', 'sahi', 'sahi hai', 'barobar', 'barobar chhe',
        'theek hai', 'thik hai', 'kar do', 'hukum', 'okay', 'ok', 'yep', 'yup', 'sure', 'done',
        'हाँ', 'हा', 'सही', 'सही है', 'ठीक है', 'सेव', 'હા', 'બરાબર'
      ];
      for (const w of confirmWords) {
        if (new RegExp(`\\b${w}\\b|${w}`, 'i').test(lower)) {
          return 'confirmation';
        }
      }

      const rejectWords = [
        'nahi', 'na', 'no', 'nooo', 'noo', 'galat', 'khota', 'badlo', 'ruko', 'change', 'tha', 'wrong', 'nope',
        'नहीं', 'ना', 'गलत', 'खोता', 'बदलो', 'ના', 'ખોટું'
      ];
      for (const w of rejectWords) {
        if (new RegExp(`\\b${w}\\b|${w}`, 'i').test(lower)) {
          return 'rejection_or_correction';
        }
      }
    }

    // Navigation intents
    if (
      /budget\s*(kholo|dikhao|batao|open|dekhna)|बजट|બજેટ/i.test(lower) ||
      /budget\s*pe\s*jao/i.test(lower)
    ) {
      return 'navigation';
    }

    if (
      /(history|itihaas|purana|kharch)\s*(kholo|dikhao|batao|list|open)|इतिहास|હિસ્ટ્રી/i.test(lower) ||
      /sab\s*kharch\s*dikhao/i.test(lower)
    ) {
      return 'navigation';
    }

    if (
      /(report|chart|graphs?)\s*(dikhao|kholo|suna|suna do|batao|open)|रिपोर्ट|ચાર્ટ/i.test(lower) ||
      /report\s*suna\s*do|रिपोर्ट\s*सुनाओ/i.test(lower)
    ) {
      return 'read_report';
    }

    if (/(home|ghar|naya\s*kharch|mic|dashboard|घर)/i.test(lower)) {
      return 'navigation';
    }

    // Financial queries
    if (
      /kitna\s*kharch\s*hua|kitna\s*bacha|कितना\s*खर्च|કેટલો\s*ખર્ચ/i.test(lower) ||
      /last\s*\d*\s*expenses?|pichle\s*kharch|पिछला\s*खर्च/i.test(lower) ||
      /budget\s*kitna\s*bacha|बजट\s*कितना/i.test(lower) ||
      /is\s*hafte|इस\s*हफ्ते|aaj\s*kitna|आज\s*कितना/i.test(lower) ||
      /kisme\s*sabse\s*jyada|highest\s*spending|सबसे\s*ज्यादा/i.test(lower)
    ) {
      return 'financial_query';
    }

    // Rejection with number: "Nahi sabzi 150 tha"
    if ((/nahi|galat|tha|नहीं|गलत/i.test(lower) && /\d+/.test(lower)) || (pendingConfirmation && /\d+/.test(lower))) {
      return 'rejection_or_correction';
    }

    // Expense log
    if (/\d+/.test(this.normalizeNumbers(lower))) {
      return 'expense_log';
    }

    return 'unknown';
  }

  /**
   * Multi-Item Voice Expense Parser
   */
  public parseExpenseItems(text: string): ParsedExpenseItem[] {
    const normalized = this.normalizeNumbers(text.toLowerCase());
    const items: ParsedExpenseItem[] = [];

    // Split on conjunctions: aur, ane, ar, tatha, and, और, तथा, अने, comma
    const clauses = normalized.split(/\b(?:aur|ane|ar|tatha|and|\,)\b|और|तथा|अने|અને|\,/gi);

    for (const clause of clauses) {
      const trimmed = clause.trim();
      if (!trimmed) continue;

      const amountMatch = trimmed.match(/(\d+(?:\.\d{1,2})?)/);
      if (!amountMatch) continue;

      const amount = parseFloat(amountMatch[1]);
      if (isNaN(amount) || amount <= 0) continue;

      let detectedCategory: ExpenseCategory = 'Other';
      let itemName = '';

      for (const [word, cat] of Object.entries(CATEGORY_MAP)) {
        if (new RegExp(`\\b${word}\\b|${word}`, 'i').test(trimmed)) {
          detectedCategory = cat;
          if (['sabzi', 'sabji', 'subzi', 'saag', 'shaak', 'सब्जी', 'सब्ज़ी', 'शाक'].includes(word)) {
            itemName = 'Sabzi (Vegetables)';
          } else if (['auto', 'otto', 'riksha', 'rikshaw', 'rickshaw', 'ऑटो', 'રીક્ષા'].includes(word)) {
            itemName = 'Auto Rickshaw';
          } else if (['petrol', 'patrol', 'pitrol', 'पेट्रोल', 'पैट्रोल'].includes(word)) {
            itemName = 'Petrol';
          } else if (['doodh', 'dudh', 'milk', 'दूध', 'દૂધ'].includes(word)) {
            itemName = 'Taza Doodh (Milk)';
          } else if (['dawa', 'dawai', 'dava', 'medicine', 'दवा', 'दवाई', 'દવા'].includes(word)) {
            itemName = 'Dawa (Medicine)';
          } else if (['bijli', 'bijlee', 'light', 'electricity', 'बिजली', 'લાઈટ'].includes(word)) {
            itemName = 'Bijli Bill';
          } else if (['kirana', 'rashan', 'ration', 'किराना', 'राशन', 'કરિયાણું'].includes(word)) {
            itemName = 'Kirana Ration';
          } else {
            itemName = word.charAt(0).toUpperCase() + word.slice(1);
          }
          break;
        }
      }

      if (!itemName) {
        const words = trimmed
          .replace(/(\d+)/g, '')
          .replace(/\b(pe|ka|ki|ke|ko|na|nu|ne|ra|ro|re|aaj|aaje|diya|aapya|aapyu|kharch|hua|rupaye|rupya|roopya|का|की|के|पे|दिया|रुपये|रुपया)\b/gi, '')
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
   * Process Financial Queries
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

    if (/food|khana|sabzi|खाना|सब्जी/i.test(lower) && /budget|bacha|बजट|बचा/i.test(lower)) {
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

    if (/hafte|week|kitna\s*kharch\s*hua|हफ्ते|खर्च/i.test(lower)) {
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

    if (/last|pichle|pichhla|recent|पिछला/i.test(lower)) {
      const last5 = transactions.slice(0, 5);
      const itemsList = last5.map((t) => `${t.description} ${t.amount} rupaye`).join(', ');

      return {
        summary: `Aapke pichle 5 kharch: ${last5.map((t) => `${t.description} (₹${t.amount})`).join(', ')}`,
        voiceResponse: `Aapke aakhiri kharch hain: ${itemsList}.`,
        highlightTab: 'history',
      };
    }

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

    const { cleaned: fillerCleaned, removed: fillersRemoved } =
      this.cleanFillers(rawTranscript);

    const { resolvedText, corrections: midSentenceCorrections } =
      this.resolveMidSentenceCorrections(fillerCleaned);

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

    if (intent === 'navigation') {
      const lower = resolvedText.toLowerCase();
      if (/budget|बजट/i.test(lower)) result.navigationTarget = 'budgets';
      else if (/history|kharch|इतिहास/i.test(lower)) result.navigationTarget = 'history';
      else if (/report|chart|रिपोर्ट/i.test(lower)) result.navigationTarget = 'reports';
      else result.navigationTarget = 'home';
    } else if (intent === 'read_report') {
      result.navigationTarget = 'reports';
    }

    if (intent === 'financial_query' && options.transactions && options.budgets) {
      result.queryAnswer = this.answerFinancialQuery(
        resolvedText,
        options.transactions,
        options.budgets
      );
    }

    if (intent === 'expense_log' || intent === 'rejection_or_correction') {
      result.items = this.parseExpenseItems(resolvedText);
    }

    return result;
  }
}

export const nlpParser = new MultilingualNLPParser();
