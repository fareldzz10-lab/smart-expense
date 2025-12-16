import React, { useState } from 'react';
import { X, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleAdded: () => void;
  defaultType: 'income' | 'expense';
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({ isOpen, onClose, onRuleAdded, defaultType }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  const handleSave = async () => {
    if (!title || !amount || !category) return;

    await storageService.addRecurringRule({
      title,
      amount: parseFloat(amount),
      type: defaultType,
      category,
      frequency: frequency as any,
      nextDueDate: new Date().toISOString() // Simply defaults to today for demo
    });
    
    setTitle('');
    setAmount('');
    setCategory('');
    onRuleAdded();
    onClose();
  };

  const categories = defaultType === 'income' 
    ? ['Salary', 'Freelance', 'Investments', 'Other'] 
    : ['Housing', 'Food', 'Transport', 'Utilities', 'Subscription', 'Debt', 'Other'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <RefreshCw size={20} />
                <h3 className="font-semibold text-white">Add Recurring {defaultType === 'income' ? 'Income' : 'Expense'}</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Salary"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Amount (IDR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="" disabled>Select</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Frequency</label>
                  <select 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                 <button
                  onClick={handleSave}
                  disabled={!title || !amount || !category}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    defaultType === 'income' 
                      ? 'bg-emerald-600 hover:bg-emerald-500' 
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  <Check size={18} />
                  Save Rule
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
