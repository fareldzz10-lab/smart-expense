import React from 'react';
import { LayoutDashboard, History, PiggyBank, Repeat, Wallet, Sparkles, Plus, LogOut, Sun, Moon, Edit2, Calculator, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivacy } from '../context/PrivacyContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  theme: string;
  toggleTheme: () => void;
  onLogout?: () => void;
  userName: string;
  onUpdateName: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenQuickAdd, 
  theme, 
  toggleTheme, 
  onLogout,
  userName,
  onUpdateName
}) => {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'auto', label: 'Auto', icon: Repeat },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'tools', label: 'Tools', icon: Calculator }, // New
    { id: 'advisor', label: 'Advisor', icon: Sparkles },
  ];

  const handleEditName = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt("What should we call you?", userName);
    if (newName && newName.trim()) {
      onUpdateName(newName.trim());
    }
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 hidden md:flex z-50 transition-colors duration-300">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20 p-2 transform hover:scale-105 transition-transform duration-300">
           <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Smart Expense
          </h1>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            Personal Finance
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? 'text-blue-600 dark:text-white' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <span className="relative z-10 flex items-center gap-3">
                 <Icon 
                  size={20} 
                  className={`transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} 
                />
                <span className="font-medium text-sm">{item.label}</span>
              </span>
              
              {isActive && (
                 <motion.div 
                    layoutId="activeGlow"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                 />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto space-y-6">
        {/* Quick Add */}
        <button 
          onClick={onOpenQuickAdd}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-purple-900/30 hover:shadow-purple-500/20 transition-all transform hover:-translate-y-0.5 hover:scale-[1.02] flex items-center justify-center gap-2 group"
        >
          <div className="bg-white/20 p-0.5 rounded-full group-hover:rotate-90 transition-transform duration-300">
            <Plus size={16} className="text-white" />
          </div>
          <span className="text-sm">Quick Add</span>
        </button>

        {/* User Profile & Actions */}
        <div 
          onClick={handleEditName}
          className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer group"
          title="Click to edit name"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-white dark:ring-slate-900 group-hover:ring-indigo-500/30 transition-all">
              {userName.substring(0,2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white leading-none flex items-center gap-2">
                {userName}
                <Edit2 size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-0.5">
             <button 
                onClick={(e) => { e.stopPropagation(); togglePrivacyMode(); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title={isPrivacyMode ? "Show Balances" : "Hide Balances"}
             >
               {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
               {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
             <button 
                onClick={(e) => { e.stopPropagation(); onLogout && onLogout(); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                title="Logout"
             >
               <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};