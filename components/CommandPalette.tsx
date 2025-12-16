import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calculator, Wallet, Repeat, History, LayoutDashboard, 
  Sparkles, PiggyBank, Plus, Eye, EyeOff, Moon, Sun, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  toggleTheme: () => void;
  togglePrivacy: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, onClose, setActiveTab, onOpenQuickAdd, toggleTheme, togglePrivacy 
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { 
      id: 'add', 
      label: 'Add New Transaction', 
      icon: Plus, 
      action: () => onOpenQuickAdd() 
    },
    { 
      id: 'dashboard', 
      label: 'Go to Dashboard', 
      icon: LayoutDashboard, 
      action: () => setActiveTab('overview') 
    },
    { 
      id: 'history', 
      label: 'Go to History', 
      icon: History, 
      action: () => setActiveTab('history') 
    },
    { 
      id: 'budgets', 
      label: 'Go to Budgets', 
      icon: Wallet, 
      action: () => setActiveTab('budgets') 
    },
    { 
      id: 'savings', 
      label: 'Go to Savings', 
      icon: PiggyBank, 
      action: () => setActiveTab('savings') 
    },
    { 
      id: 'auto', 
      label: 'Go to Automation', 
      icon: Repeat, 
      action: () => setActiveTab('auto') 
    },
    { 
      id: 'tools', 
      label: 'Go to Tools', 
      icon: Calculator, 
      action: () => setActiveTab('tools') 
    },
    { 
      id: 'advisor', 
      label: 'Ask AI Advisor', 
      icon: Sparkles, 
      action: () => setActiveTab('advisor') 
    },
    { 
      id: 'theme', 
      label: 'Toggle Theme', 
      icon: Sun, 
      action: () => toggleTheme() 
    },
    { 
      id: 'privacy', 
      label: 'Toggle Privacy Mode', 
      icon: EyeOff, 
      action: () => togglePrivacy() 
    }
  ];

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="flex items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 gap-3">
              <Search className="text-slate-400" size={20} />
              <input 
                type="text"
                autoFocus
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
                className="flex-1 bg-transparent outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-500"
              />
              <button 
                onClick={onClose}
                className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-500"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
              {filteredActions.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  No results found.
                </div>
              ) : (
                filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => { action.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        index === selectedIndex 
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1 font-medium">{action.label}</span>
                      {index === selectedIndex && (
                        <span className="text-xs text-indigo-400">↵ Enter</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};