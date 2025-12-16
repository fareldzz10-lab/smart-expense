import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Budgets } from './pages/Budgets';
import { Auto } from './pages/Auto';
import { Savings } from './pages/Savings';
import { Advisor } from './pages/Advisor';
import { Tools } from './pages/Tools';
import { Login } from './pages/Login';
import { QuickAddModal } from './components/QuickAddModal';
import { CommandPalette } from './components/CommandPalette';
import { storageService } from './services/storageService';
import { Transaction, Budget } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { InteractiveBackground } from './components/InteractiveBackground';
import { usePrivacy } from './context/PrivacyContext';

const App: React.FC = () => {
  const { togglePrivacyMode } = usePrivacy();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('smart_expense_auth') === 'true';
    }
    return false;
  });

  // User Profile State
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userName') || 'Farel';
    }
    return 'Farel';
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleUpdateName = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  const loadData = async () => {
    const txs = await storageService.getTransactions();
    const bdgs = await storageService.getBudgets();
    setTransactions(txs);
    setBudgets(bdgs);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      // Check for recurring transactions to process
      const runAutomation = async () => {
          const processed = await storageService.processRecurringRules();
          if (processed > 0) {
              await loadData(); // Reload if any new transaction was generated
          }
      };
      runAutomation();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('smart_expense_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('smart_expense_auth');
    setActiveTab('overview');
  };

  // If not authenticated, show Login Page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Define unique animations for each tab
  const getPageVariants = (tab: string) => {
    const defaultEase: [number, number, number, number] = [0.22, 1, 0.36, 1]; 

    switch (tab) {
      case 'overview': 
        return {
          variants: {
            initial: { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
            in: { opacity: 1, scale: 1, filter: 'blur(0px)' },
            out: { opacity: 0, scale: 1.02, filter: 'blur(2px)' }
          },
          transition: { duration: 0.5, ease: defaultEase }
        };
      
      case 'history': 
        return {
          variants: {
            initial: { opacity: 0, y: 40 },
            in: { opacity: 1, y: 0 },
            out: { opacity: 0, y: -20 }
          },
          transition: { duration: 0.4, ease: "circOut" as const }
        };

      case 'budgets': 
        return {
          variants: {
            initial: { opacity: 0, x: 40 },
            in: { opacity: 1, x: 0 },
            out: { opacity: 0, x: -40 }
          },
          transition: { duration: 0.4, ease: "circOut" as const }
        };

      case 'auto':
      case 'savings': 
      case 'tools':
        return {
          variants: {
            initial: { opacity: 0, rotateX: 10, y: 20 },
            in: { opacity: 1, rotateX: 0, y: 0 },
            out: { opacity: 0, rotateX: -10, y: -20 }
          },
          transition: { duration: 0.5, ease: "backOut" as const }
        };

      case 'advisor': 
        return {
          variants: {
            initial: { opacity: 0, filter: 'blur(15px)', scale: 1.1 },
            in: { opacity: 1, filter: 'blur(0px)', scale: 1 },
            out: { opacity: 0, filter: 'blur(10px)', scale: 0.95 }
          },
          transition: { duration: 0.7, ease: "easeInOut" as const }
        };

      default: 
        return {
          variants: {
            initial: { opacity: 0 },
            in: { opacity: 1 },
            out: { opacity: 0 }
          },
          transition: { duration: 0.3 }
        };
    }
  };

  const renderContent = () => {
    let content;
    switch (activeTab) {
      case 'overview':
        content = <Dashboard transactions={transactions} budgets={budgets} userName={userName} />;
        break;
      case 'history':
        content = <History transactions={transactions} onUpdate={loadData} onOpenQuickAdd={() => setIsQuickAddOpen(true)} />;
        break;
      case 'budgets':
        content = <Budgets transactions={transactions} budgets={budgets} onUpdate={loadData} />;
        break;
      case 'auto':
        content = <Auto />;
        break;
      case 'savings':
        content = <Savings />;
        break;
      case 'tools':
        content = <Tools />;
        break;
      case 'advisor':
        content = <Advisor transactions={transactions} />;
        break;
      default:
        content = <Dashboard transactions={transactions} budgets={budgets} userName={userName} />;
    }

    const { variants, transition } = getPageVariants(activeTab);

    return (
      <motion.div
        key={activeTab}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={transition}
        className="h-full origin-top"
      >
        {content}
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300 relative">
      <InteractiveBackground />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenQuickAdd={() => setIsQuickAddOpen(true)} 
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        userName={userName}
        onUpdateName={handleUpdateName}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen pb-28 md:pb-8 overflow-x-hidden relative z-10 perspective-1000">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>
      
      <MobileNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)}
        onTransactionAdded={loadData}
      />

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        toggleTheme={toggleTheme}
        togglePrivacy={togglePrivacyMode}
      />
    </div>
  );
};

export default App;