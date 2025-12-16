import React, { useState, useMemo } from 'react';
import { Plus, Wallet, Edit2, AlertCircle } from 'lucide-react';
import { Transaction, Budget } from '../types';
import { formatCurrency } from '../utils/formatters';
import { motion } from 'framer-motion';
import { SetBudgetModal } from '../components/SetBudgetModal';

interface BudgetsProps {
  transactions: Transaction[];
  budgets: Budget[];
  onUpdate: () => void;
}

export const Budgets: React.FC<BudgetsProps> = ({ transactions, budgets, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate actual spent based on transactions for the current month
  const budgetsWithSpent = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets.map(b => {
      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' && 
                 t.category === b.category &&
                 tDate.getMonth() === currentMonth && 
                 tDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent };
    });
  }, [budgets, transactions]);

  const totalBudgeted = useMemo(() => budgetsWithSpent.reduce((acc, b) => acc + b.limit, 0), [budgetsWithSpent]);
  const totalSpent = useMemo(() => budgetsWithSpent.reduce((acc, b) => acc + b.spent, 0), [budgetsWithSpent]);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const totalProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const daysRemainingInMonth = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return endOfMonth.getDate() - now.getDate();
  }, []);

  const safeDailySpend = useMemo(() => {
    if (daysRemainingInMonth <= 0) return 0;
    return totalRemaining / daysRemainingInMonth;
  }, [totalRemaining, daysRemainingInMonth]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
               <Wallet className="text-indigo-600 dark:text-indigo-400" size={32} />
               Monthly Budgets
             </h2>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
             Set spending limits for specific categories to keep your finances on track.
           </p>
        </div>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden shadow-sm">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <p className="text-slate-500 dark:text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Total Budgeted</p>
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBudgeted)}</h3>
          </div>
          <div className="text-right">
             <p className="text-slate-500 dark:text-slate-500 text-xs font-bold tracking-wider uppercase mb-1">Remaining</p>
             <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mb-2 overflow-hidden border border-slate-200 dark:border-slate-700/50">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(totalProgress, 100)}%` }}
               className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full"
             />
          </div>
          <div className="flex justify-between items-center text-sm font-medium mb-4">
            <span className="text-slate-500 dark:text-slate-400">Spent: {formatCurrency(totalSpent)}</span>
            <span className="text-indigo-600 dark:text-indigo-400">{totalProgress.toFixed(1)}% used</span>
          </div>

          {/* Daily Insight */}
          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-3 flex items-start gap-3">
             <AlertCircle size={18} className="text-indigo-500 shrink-0 mt-0.5" />
             <div>
               <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium">Daily Safe Spend</p>
               <p className="text-xs text-indigo-700 dark:text-indigo-300">
                 You can spend <span className="font-bold">{formatCurrency(safeDailySpend)}</span> per day for the remaining {daysRemainingInMonth} days to stay on budget.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Budgets List / Empty State */}
      <div className="min-h-[400px]">
        {budgetsWithSpent.length === 0 ? (
          // Empty State
          <div className="w-full h-80 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30">
             <div className="w-16 h-16 bg-white dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 shadow-sm ring-1 ring-slate-200 dark:ring-white/5">
                <Wallet size={28} className="text-slate-400 dark:text-slate-500" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium">No budgets set. Click "Set Budget" to start tracking.</p>
          </div>
        ) : (
          // Grid List
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetsWithSpent.map((budget) => {
              const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
              const isOver = progress > 100;
              const remaining = Math.max(0, budget.limit - budget.spent);
              
              return (
                <div 
                    key={budget.id || budget.category} 
                    onClick={() => setIsModalOpen(true)} // In a real app, you'd pass the budget data to edit
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-colors group shadow-sm cursor-pointer relative"
                    title="Click to edit"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 size={16} className="text-slate-400" />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{budget.category}</h4>
                      <p className="text-sm text-slate-500">Limit: {formatCurrency(budget.limit)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${isOver ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500'}`}>
                      {isOver ? 'OVER' : 'ON TRACK'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-3">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{formatCurrency(budget.spent)} spent</span>
                    <span className={isOver ? 'text-rose-500 dark:text-rose-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                      Remaining: <span className={remaining > 0 ? 'text-emerald-500 font-semibold' : ''}>{formatCurrency(remaining)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SetBudgetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBudgetSet={onUpdate}
      />
    </div>
  );
};