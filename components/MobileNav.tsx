import React from 'react';
import { LayoutDashboard, History, Wallet, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, onOpenQuickAdd }) => {
  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Home' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'add', icon: Plus, label: 'Add', isAction: true },
    { id: 'budgets', icon: Wallet, label: 'Budget' },
    { id: 'advisor', icon: Sparkles, label: 'Advisor' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 px-4 py-3">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isAction) {
              return (
                <div key={item.id} className="relative -top-8">
                  <button
                    onClick={onOpenQuickAdd}
                    className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform active:scale-95"
                  >
                    <Plus size={28} strokeWidth={2.5} />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-1 min-w-[3.5rem]"
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                }`}>
                    {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};