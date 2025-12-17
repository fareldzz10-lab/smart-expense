import React, { useState, useEffect, Suspense } from "react";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { Login } from "./pages/Login";
import { QuickAddModal } from "./components/QuickAddModal";
import { CommandPalette } from "./components/CommandPalette";
import { storageService } from "./services/storageService";
import { Transaction, Budget } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { InteractiveBackground } from "./components/InteractiveBackground";
import { usePrivacy } from "./context/PrivacyContext";
import { Loader2 } from "lucide-react";

// Lazy Load Pages to improve performance (Code Splitting)
const Dashboard = React.lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const History = React.lazy(() =>
  import("./pages/History").then((module) => ({ default: module.History }))
);
const Budgets = React.lazy(() =>
  import("./pages/Budgets").then((module) => ({ default: module.Budgets }))
);
const Auto = React.lazy(() =>
  import("./pages/Auto").then((module) => ({ default: module.Auto }))
);
const Savings = React.lazy(() =>
  import("./pages/Savings").then((module) => ({ default: module.Savings }))
);
const Advisor = React.lazy(() =>
  import("./pages/Advisor").then((module) => ({ default: module.Advisor }))
);
const Tools = React.lazy(() =>
  import("./pages/Tools").then((module) => ({ default: module.Tools }))
);

const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
    <Loader2 className="animate-spin text-indigo-500" size={32} />
  </div>
);

const App: React.FC = () => {
  const { togglePrivacyMode } = usePrivacy();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Initialize Auth from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("smart_expense_auth") === "true";
      const uid = localStorage.getItem("smart_expense_uid");

      if (auth && uid) {
        setIsAuthenticated(true);
        setCurrentUserId(uid);
        storageService.setUserId(uid); // Important: Set ID in service
      }
    }
  }, []);

  // User Profile State
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userName") || "Farel";
    }
    return "Farel";
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleUpdateName = (name: string) => {
    setUserName(name);
    localStorage.setItem("userName", name);
  };

  const loadData = async () => {
    const txs = await storageService.getTransactions();
    const bdgs = await storageService.getBudgets();
    setTransactions(txs);
    setBudgets(bdgs);
  };

  useEffect(() => {
    if (isAuthenticated && currentUserId) {
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
  }, [isAuthenticated, currentUserId]);

  const handleLogin = (uid: string, name: string) => {
    setIsAuthenticated(true);
    setCurrentUserId(uid);
    setUserName(name);

    // Persist
    localStorage.setItem("smart_expense_auth", "true");
    localStorage.setItem("smart_expense_uid", uid);
    localStorage.setItem("userName", name);

    // Set Service ID
    storageService.setUserId(uid);
    loadData(); // Load data for this new user immediately
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserId("");
    localStorage.removeItem("smart_expense_auth");
    localStorage.removeItem("smart_expense_uid");
    // We don't remove userName so it remembers the last user for convenience, or you can remove it.
    setActiveTab("overview");
  };

  // If not authenticated, show Login Page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Define unique animations for each tab
  const getPageVariants = (tab: string) => {
    const defaultEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

    switch (tab) {
      case "overview":
        return {
          variants: {
            initial: { opacity: 0, scale: 0.96 },
            in: { opacity: 1, scale: 1 },
            out: { opacity: 0, scale: 1.02 },
          },
          transition: { duration: 0.4, ease: defaultEase },
        };

      default:
        return {
          variants: {
            initial: { opacity: 0 },
            in: { opacity: 1 },
            out: { opacity: 0 },
          },
          transition: { duration: 0.25 },
        };
    }
  };

  const renderContent = () => {
    let content;
    switch (activeTab) {
      case "overview":
        content = (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            userName={userName}
          />
        );
        break;
      case "history":
        content = (
          <History
            transactions={transactions}
            onUpdate={loadData}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        );
        break;
      case "budgets":
        content = (
          <Budgets
            transactions={transactions}
            budgets={budgets}
            onUpdate={loadData}
          />
        );
        break;
      case "auto":
        content = <Auto />;
        break;
      case "savings":
        content = <Savings />;
        break;
      case "tools":
        content = <Tools />;
        break;
      case "advisor":
        content = <Advisor transactions={transactions} />;
        break;
      default:
        content = (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            userName={userName}
          />
        );
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
        <Suspense fallback={<LoadingFallback />}>{content}</Suspense>
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

      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen pb-32 md:pb-8 overflow-x-hidden relative z-10 perspective-1000">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
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
