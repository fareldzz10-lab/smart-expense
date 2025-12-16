import React, { useState, useEffect } from 'react';
import { X, Check, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { Category } from '../types';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetSet: () => void;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({ isOpen, onClose, onBudgetSet }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isOpen) {
        const loadCats = async () => {
            const cats = await storageService.getCategories();
            // Typically budgets are for expenses
            setAvailableCategories(cats.filter(c => c.type === 'expense'));
        }
        loadCats();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!category || !amount) return;

    await storageService.updateBudget({
      category,
      limit: parseFloat(amount),
      spent: 0 
    });
    
    setCategory('');
    setAmount('');
    onBudgetSet();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Wallet size={20} />
                <h3 className="font-semibold text-slate-900 dark:text-white">Set Monthly Budget</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="" disabled>Select a category</option>
                    {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Limit (IDR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2000000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>

              <div className="pt-2">
                 <button
                  onClick={handleSave}
                  disabled={!category || !amount}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                  Save Budget
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};