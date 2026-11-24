import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Transaction,
  CategoryBudget,
  ActiveTab,
  VoiceState,
  ParsedVoiceResult,
  ExpenseCategory,
} from './types';
import { INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from './data/initialData';
import { speechService } from './services/speechEngine';
import { nlpParser } from './services/nlpParser';
import { Header } from './components/Header';
import { JudgeQuickTestBar } from './components/JudgeQuickTestBar';
import { VoiceHomeTab } from './components/VoiceHomeTab';
import { ExpenseHistoryTab } from './components/ExpenseHistoryTab';
import { BudgetsTab } from './components/BudgetsTab';
import { ReportsTab } from './components/ReportsTab';
import { BudgetWarningBanner } from './components/BudgetWarningBanner';
import {
  Mic,
  Clock,
  Wallet,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const App: React.FC = () => {
  // App state
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('Hindi');
  const [selectedSpeechLang, setSelectedSpeechLang] = useState('hi-IN');
  const [fillersRemoved, setFillersRemoved] = useState<string[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<ParsedVoiceResult | null>(null);
  const [activeBudgetWarning, setActiveBudgetWarning] = useState<CategoryBudget | null>(null);
  const [queryAnswer, setQueryAnswer] = useState<{
    summary: string;
    voiceResponse: string;
    highlightTab?: string;
  } | null>(null);
  const [autoStartReportNarration, setAutoStartReportNarration] = useState(false);

  // Accessibility settings
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xl'>('normal');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const pendingConfirmationRef = useRef<ParsedVoiceResult | null>(null);
  pendingConfirmationRef.current = pendingConfirmation;

  const currentTranscriptRef = useRef<string>('');
  const silenceTimeoutRef = useRef<any>(null);

  // Initialize Web Audio pipeline on first mount
  useEffect(() => {
    speechService.onVolumeChange((vol, isVoice) => {
      setAudioLevel(vol);
      setVoiceDetected(isVoice);
    });

    return () => {
      speechService.cleanup();
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  // Update root element classes when accessibility settings change
  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === 'normal') {
      root.style.fontSize = '18px';
    } else if (fontSizeLevel === 'large') {
      root.style.fontSize = '21px';
    } else {
      root.style.fontSize = '24px';
    }

    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [fontSizeLevel, isHighContrast]);

  // Proactive Budget Check Engine
  const checkBudgetThresholds = (
    currentBudgets: CategoryBudget[],
    updatedCategories: ExpenseCategory[]
  ) => {
    for (const cat of updatedCategories) {
      const b = currentBudgets.find((item) => item.category === cat);
      if (!b) continue;

      const percent = (b.spent / b.limit) * 100;
      if (percent >= 100) {
        setActiveBudgetWarning(b);
        speechService.playAlertChime();
        if (!isMuted) {
          speechService.speak(
            `Chetavni! Aapka ${b.category} budget poora ho chuka hai.`
          );
        }
        break;
      } else if (percent >= 80) {
        setActiveBudgetWarning(b);
        speechService.playAlertChime();
        if (!isMuted) {
          speechService.speak(
            `Savdhaan! Aapka ${b.category} budget 80 pratishat kharch ho chuka hai.`
          );
        }
        break;
      }
    }
  };

  // Commit pending confirmation items into ledger & update budgets
  const handleCommitConfirmedExpenses = (parsedResult: ParsedVoiceResult) => {
    const now = Date.now();
    const newTxList: Transaction[] = parsedResult.items.map((item, idx) => ({
      id: `tx-user-${now}-${idx}`,
      description: item.item,
      amount: item.amount,
      category: item.category,
      date: 'Today, Just now',
      timestamp: now,
      rawVoiceTranscript: parsedResult.rawTranscript,
      languageDetected: parsedResult.detectedLanguage,
      confidence: 0.99,
    }));

    setTransactions((prev) => [...newTxList, ...prev]);

    const affectedCategories: ExpenseCategory[] = [];
    const updatedBudgets = budgets.map((b) => {
      const addedForCategory = parsedResult.items
        .filter((item) => item.category === b.category)
        .reduce((sum, item) => sum + item.amount, 0);

      if (addedForCategory > 0) {
        affectedCategories.push(b.category);
        return {
          ...b,
          spent: b.spent + addedForCategory,
        };
      }
      return b;
    });

    setBudgets(updatedBudgets);

    speechService.playSuccessChime();
    if (!isMuted) {
      speechService.speak('Save ho gaya.');
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // Confetti fallback
    }

    // Stop listening after successful voice commit
    stopListeningSession();
    setPendingConfirmation(null);
    setVoiceState('idle');
    setLiveTranscript('');
    currentTranscriptRef.current = '';

    setTimeout(() => {
      checkBudgetThresholds(updatedBudgets, affectedCategories);
    }, 600);
  };

  // Process incoming speech text through the NLP and Intent pipeline
  const processTranscript = (rawText: string) => {
    if (!rawText.trim()) return;
    setLiveTranscript(rawText);

    const pending = pendingConfirmationRef.current;
    const result = nlpParser.processVoiceInput(rawText, {
      pendingConfirmation: Boolean(pending),
      transactions,
      budgets,
    });

    setDetectedLanguage(result.detectedLanguage);
    setFillersRemoved(result.fillersRemoved);

    // Case 1: Pending confirmation exists and user said "Haan / Save / Sahi Hai" (Voice Commit)
    if (pending && result.intent === 'confirmation') {
      handleCommitConfirmedExpenses(pending);
      return;
    }

    // Case 2: Pending confirmation exists and user corrected an amount aloud or said No
    if (pending && result.intent === 'rejection_or_correction') {
      if (result.items.length > 0) {
        const updatedItems = pending.items.map((existing) => {
          const match = result.items.find(
            (r) => r.category === existing.category || r.item === existing.item
          );
          if (match) {
            return {
              ...existing,
              amount: match.amount,
              isCorrection: true,
              previousAmount: existing.amount,
            };
          }
          return existing;
        });

        const updatedResult: ParsedVoiceResult = {
          ...pending,
          items: updatedItems,
          rawTranscript: rawText,
        };

        setPendingConfirmation(updatedResult);

        // Assistant repeats updated amount concisely: "[new text], sahi hai?"
        const spokenPhrase = result.cleanedTranscript || `${updatedItems[0].amount} ka ${updatedItems[0].item}`;
        const confirmationSpeech = `${spokenPhrase}, sahi hai?`;

        setVoiceState('confirming');
        if (!isMuted) {
          speechService.speak(confirmationSpeech, () => {
            setTimeout(() => {
              startListeningSession();
            }, 350);
          });
        } else {
          setTimeout(() => {
            startListeningSession();
          }, 350);
        }
        return;
      } else {
        // User said "No" / "Nooo" / "Nahi" without a new amount yet -> Ask user what to change!
        const askSpeech = 'Kya badalna hai? Dobara bolein.';
        setVoiceState('confirming');
        if (!isMuted) {
          speechService.speak(askSpeech, () => {
            // AUTOMATICALLY listen for what the user wants to change!
            setTimeout(() => {
              startListeningSession();
            }, 350);
          });
        } else {
          setTimeout(() => {
            startListeningSession();
          }, 350);
        }
        return;
      }
    }

    // Case 3: Hands-Free Voice Navigation Command
    if (result.intent === 'navigation' && result.navigationTarget) {
      stopListeningSession();
      setActiveTab(result.navigationTarget);
      speechService.playSuccessChime();
      if (!isMuted) {
        speechService.speak(`${result.navigationTarget} khol diya hai.`);
      }
      setVoiceState('idle');
      return;
    }

    // Case 4: "Report dikhao aur suna do"
    if (result.intent === 'read_report') {
      stopListeningSession();
      setActiveTab('reports');
      setAutoStartReportNarration(true);
      setVoiceState('idle');
      return;
    }

    // Case 5: Conversational Financial Query
    if (result.intent === 'financial_query' && result.queryAnswer) {
      stopListeningSession();
      setQueryAnswer(result.queryAnswer);
      speechService.playSuccessChime();
      if (!isMuted) {
        speechService.speak(result.queryAnswer.voiceResponse);
      }
      setVoiceState('idle');
      return;
    }

    // Case 6: Multi-Item Voice Expense Logging (e.g. "500 ka patrol, sahi hai?")
    if (result.items.length > 0) {
      setPendingConfirmation(result);
      setVoiceState('confirming');

      // Short & concise confirmation: "[User's text], sahi hai?"
      const userSpokenText = result.cleanedTranscript || result.rawTranscript;
      const confirmationSpeech = `${userSpokenText}, sahi hai?`;

      if (!isMuted) {
        speechService.speak(confirmationSpeech, () => {
          // AUTOMATICALLY open the microphone so user can say "Yes" / "Haan" to save, or "No" to change!
          setTimeout(() => {
            startListeningSession();
          }, 350);
        });
      } else {
        setTimeout(() => {
          startListeningSession();
        }, 350);
      }
    }
  };

  // Start continuous speech session
  const startListeningSession = async () => {
    await speechService.initAudioPipeline();
    setIsListening(true);
    setVoiceState('listening');
    currentTranscriptRef.current = '';

    speechService.startListening(
      (transcript, isFinal) => {
        currentTranscriptRef.current = transcript;
        setLiveTranscript(transcript);

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        if (isFinal) {
          processTranscript(transcript);
        } else {
          silenceTimeoutRef.current = setTimeout(() => {
            if (currentTranscriptRef.current.trim() && isListening) {
              processTranscript(currentTranscriptRef.current);
            }
          }, 1400);
        }
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setVoiceState('idle');
      },
      () => {
        setIsListening(false);
        // If confirmation is still waiting for voice reply ("Haan"), restart listening automatically
        if (pendingConfirmationRef.current && !isListening) {
          setTimeout(() => {
            if (pendingConfirmationRef.current) startListeningSession();
          }, 600);
        } else if (isHandsFree && !pendingConfirmationRef.current) {
          setTimeout(() => {
            if (isHandsFree) startListeningSession();
          }, 800);
        }
      }
    );
  };

  // Stop listening
  const stopListeningSession = () => {
    speechService.stopListening();
    setIsListening(false);
    setVoiceState('idle');
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    if (currentTranscriptRef.current.trim() && !pendingConfirmationRef.current) {
      processTranscript(currentTranscriptRef.current);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListeningSession();
    } else {
      startListeningSession();
    }
  };

  const handleSpeechLangChange = (lang: string) => {
    setSelectedSpeechLang(lang);
    speechService.setLanguage(lang);
    if (isListening) {
      stopListeningSession();
      setTimeout(() => startListeningSession(), 300);
    }
  };

  const handleDirectSubmitTranscript = (text: string) => {
    currentTranscriptRef.current = text;
    processTranscript(text);
  };

  const handleRunPresetTest = (transcript: string, note?: string) => {
    currentTranscriptRef.current = transcript;
    setLiveTranscript(transcript);
    processTranscript(transcript);
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setPendingConfirmation(null);
    setActiveBudgetWarning(null);
    setQueryAnswer(null);
    speechService.speak('Data reset ho gaya hai.');
  };

  const handleUpdateItemAmount = (id: string, newAmount: number) => {
    if (!pendingConfirmation) return;
    const updated = {
      ...pendingConfirmation,
      items: pendingConfirmation.items.map((item) =>
        item.id === id ? { ...item, amount: newAmount } : item
      ),
    };
    setPendingConfirmation(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setBudgets((prev) =>
        prev.map((b) =>
          b.category === tx.category
            ? { ...b, spent: Math.max(0, b.spent - tx.amount) }
            : b
        )
      );
      speechService.playSuccessChime();
    }
  };

  const handleUpdateBudgetLimit = (cat: ExpenseCategory, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === cat ? { ...b, limit: newLimit } : b))
    );
    speechService.playSuccessChime();
    speechService.speak(`${cat} budget limit ₹${newLimit} set ho gaya.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200">
      {/* 1. Judge Quick-Test Bar */}
      <JudgeQuickTestBar
        onRunTest={handleRunPresetTest}
        onResetData={handleResetData}
        isPendingConfirmation={Boolean(pendingConfirmation)}
      />

      {/* 2. Accessible Header with Elder Accessibility Controls */}
      <Header
        fontSizeLevel={fontSizeLevel}
        isHighContrast={isHighContrast}
        isMuted={isMuted}
        onToggleFontSize={() => {
          if (fontSizeLevel === 'normal') setFontSizeLevel('large');
          else if (fontSizeLevel === 'large') setFontSizeLevel('xl');
          else setFontSizeLevel('normal');
        }}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        onToggleMute={() => {
          if (!isMuted) speechService.stopSpeaking();
          setIsMuted(!isMuted);
        }}
      />

      {/* 3. Proactive Budget Warning Banner */}
      {activeBudgetWarning && (
        <div className="px-4 pt-4">
          <BudgetWarningBanner
            budget={activeBudgetWarning}
            onDismiss={() => setActiveBudgetWarning(null)}
            onViewBudgets={() => {
              setActiveBudgetWarning(null);
              setActiveTab('budgets');
            }}
          />
        </div>
      )}

      {/* 4. Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <VoiceHomeTab
            voiceState={voiceState}
            isListening={isListening}
            voiceDetected={voiceDetected}
            audioLevel={audioLevel}
            liveTranscript={liveTranscript}
            detectedLanguage={detectedLanguage}
            selectedSpeechLang={selectedSpeechLang}
            onChangeSpeechLang={handleSpeechLangChange}
            fillersRemoved={fillersRemoved}
            pendingConfirmation={pendingConfirmation}
            todayTransactions={transactions.filter((t) => t.date.includes('Today'))}
            isHandsFree={isHandsFree}
            onToggleListening={handleToggleListening}
            onToggleHandsFree={() => setIsHandsFree(!isHandsFree)}
            onConfirmExpense={() => {
              if (pendingConfirmation) {
                handleCommitConfirmedExpenses(pendingConfirmation);
              }
            }}
            onRejectOrModifyExpense={() => {
              stopListeningSession();
              setPendingConfirmation(null);
              setVoiceState('idle');
              speechService.speak('Kripya naya kharch bolein.');
            }}
            onUpdateItemAmount={handleUpdateItemAmount}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onDirectSubmitTranscript={handleDirectSubmitTranscript}
            queryAnswer={queryAnswer}
          />
        )}

        {activeTab === 'history' && (
          <ExpenseHistoryTab
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsTab
            budgets={budgets}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            budgets={budgets}
            transactions={transactions}
            autoStartNarration={autoStartReportNarration}
          />
        )}
      </main>

      {/* 5. Sticky Bottom Accessible 4-Tab Navigation Bar */}
      <nav
        role="navigation"
        aria-label="App Navigation"
        className="sticky bottom-0 z-30 bg-white border-t-2 border-slate-200 shadow-2xl pb-safe"
      >
        <div className="max-w-xl mx-auto px-4 py-2 flex items-center justify-between gap-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition ${
              activeTab === 'home'
                ? 'bg-emerald-100 text-emerald-950 font-black'
                : 'text-slate-600 hover:bg-slate-100 font-bold'
            }`}
            aria-label="Voice Home Tab"
          >
            <div className="relative">
              <Mic
                className={`w-7 h-7 ${
                  activeTab === 'home' ? 'text-emerald-700' : 'text-slate-500'
                }`}
              />
              {isListening && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span className="text-xs mt-1">Voice Home</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition ${
              activeTab === 'history'
                ? 'bg-emerald-100 text-emerald-950 font-black'
                : 'text-slate-600 hover:bg-slate-100 font-bold'
            }`}
            aria-label="Expense History Tab"
          >
            <Clock
              className={`w-7 h-7 ${
                activeTab === 'history' ? 'text-emerald-700' : 'text-slate-500'
              }`}
            />
            <span className="text-xs mt-1">History</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition relative ${
              activeTab === 'budgets'
                ? 'bg-emerald-100 text-emerald-950 font-black'
                : 'text-slate-600 hover:bg-slate-100 font-bold'
            }`}
            aria-label="Budgets Tab"
          >
            <Wallet
              className={`w-7 h-7 ${
                activeTab === 'budgets' ? 'text-emerald-700' : 'text-slate-500'
              }`}
            />
            <span className="text-xs mt-1">Budgets</span>
          </button>

          <button
            onClick={() => {
              setAutoStartReportNarration(false);
              setActiveTab('reports');
            }}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition ${
              activeTab === 'reports'
                ? 'bg-emerald-100 text-emerald-950 font-black'
                : 'text-slate-600 hover:bg-slate-100 font-bold'
            }`}
            aria-label="Reports & Analytics Tab"
          >
            <BarChart3
              className={`w-7 h-7 ${
                activeTab === 'reports' ? 'text-emerald-700' : 'text-slate-500'
              }`}
            />
            <span className="text-xs mt-1">Reports</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
