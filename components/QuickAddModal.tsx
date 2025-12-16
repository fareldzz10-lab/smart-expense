import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Check, ArrowDownCircle, ArrowUpCircle, Calendar, Tag, AlignLeft, Paperclip, Target, Upload, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { SavingsGoal, Transaction, Category } from '../types';
import { ManageCategoriesModal } from './ManageCategoriesModal';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
  initialData?: Transaction | null;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onTransactionAdded, initialData }) => {
  // Form State
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [attachment, setAttachment] = useState<string | null>(null);
  
  // Data State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load goals and categories
  const loadData = async () => {
    const goals = await storageService.getSavingsGoals();
    const cats = await storageService.getCategories();
    setSavingsGoals(goals);
    setAvailableCategories(cats);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setDate(initialData.date.split('T')[0]);
        setTitle(initialData.title);
        setSelectedGoalId(initialData.savingsGoalId || '');
        setAttachment(initialData.attachment || null);
      } else {
        setType('expense');
        setAmount('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setTitle('');
        setAiInput('');
        setSelectedGoalId('');
        setAttachment(null);
      }
    }
  }, [isOpen, initialData]);

  const handleAiAnalyze = async () => {
    if (!aiInput.trim()) return;
    setIsAiProcessing(true);
    const result = await geminiService.parseTransactionWithAI(aiInput);
    if (result) {
        if (result.type) setType(result.type as 'income' | 'expense');
        if (result.amount) setAmount(result.amount.toString());
        if (result.category) setCategory(result.category);
        if (result.date) setDate(result.date.split('T')[0]);
        if (result.title) setTitle(result.title);
    }
    setIsAiProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title || !amount || !category) return;

    const numAmount = parseFloat(amount);
    const transactionData: Transaction = {
      id: initialData?.id,
      title,
      amount: numAmount,
      type,
      category,
      date: new Date(date).toISOString(),
      savingsGoalId: selectedGoalId || undefined,
      attachment: attachment || undefined,
      notes: title 
    };

    if (initialData?.id) {
        await storageService.updateTransaction(transactionData);
    } else {
        await storageService.addTransaction(transactionData);
        if (selectedGoalId) {
            const goal = savingsGoals.find(g => g.id === selectedGoalId);
            if (goal) {
                await storageService.updateSavingsGoal({
                  ...goal,
                  currentAmount: goal.currentAmount + numAmount
                });
            }
        }
    }

    onTransactionAdded();
    onClose();
  };

  const filteredCategories = availableCategories.filter(c => c.type === type);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl overflow-hidden bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#0f172a] z-10">
                <h3 className="text-xl font-bold text-white">
                  {initialData ? 'Edit Transaction' : 'New Transaction'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                
                {/* AI Input */}
                {!initialData && (
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          {isAiProcessing ? <Loader2 size={16} className="text-indigo-400 animate-spin" /> : <Sparkles size={16} className="text-indigo-400" />}
                      </div>
                      <input
                          type="text"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiAnalyze()}
                          placeholder="AI Assist: 'Spent 50k on Coffee' (Press Enter)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                  </div>
                )}

                {/* Amount & Type Row */}
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setType('expense')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                type === 'expense' 
                                    ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500/50' 
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setType('income')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                type === 'income' 
                                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500/50' 
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            Income
                        </button>
                      </div>
                   </div>
                   <div className="flex-[1.5]">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                          <input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0"
                              className="w-full bg-slate-900 border border-slate-700 text-white text-xl font-bold rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-700"
                          />
                      </div>
                   </div>
                </div>

                {/* Category & Date Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                        <button onClick={() => setIsManageCatsOpen(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                          <Settings2 size={10} /> Manage
                        </button>
                      </div>
                      <div className="relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 appearance-none focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                          >
                              <option value="" disabled>Select...</option>
                              {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
                      <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:ring-indigo-500 outline-none text-sm [color-scheme:dark]"
                          />
                      </div>
                  </div>
                </div>

                {/* Link to Savings Goal */}
                {!initialData && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Link to Savings Goal (Optional)</label>
                      <div className="relative">
                          <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <select
                              value={selectedGoalId}
                              onChange={(e) => setSelectedGoalId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 appearance-none focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                          >
                              <option value="">None</option>
                              {savingsGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                      </div>
                      {selectedGoalId && (
                      <p className="text-[10px] text-emerald-500 mt-1.5 ml-1 flex items-center gap-1">
                          <Check size={10} />
                          Amount will be ADDED to the selected savings goal.
                      </p>
                      )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <div className="relative">
                      <AlignLeft className="absolute left-3 top-4 text-slate-500" size={16} />
                      <textarea
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Add notes..."
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:ring-indigo-500 outline-none text-sm placeholder:text-slate-600 resize-none"
                      />
                  </div>
                </div>

                {/* Receipt / Attachment */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Receipt / Attachment</label>
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-900 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group"
                   >
                      <input 
                         type="file" 
                         ref={fileInputRef} 
                         className="hidden" 
                         accept="image/*,.pdf"
                         onChange={handleFileChange}
                      />
                      {attachment ? (
                         <div className="flex flex-col items-center text-emerald-500">
                            <Check size={24} className="mb-1" />
                            <span className="text-xs font-medium">File Attached</span>
                            <span className="text-[10px] text-slate-500 mt-1">Click to replace</span>
                         </div>
                      ) : (
                         <div className="flex flex-col items-center text-slate-500 group-hover:text-slate-400">
                            <Paperclip size={20} className="mb-2" />
                            <span className="text-xs font-medium">Click to attach receipt</span>
                         </div>
                      )}
                   </div>
                </div>

              </div>

              {/* Footer / Save Button */}
              <div className="p-6 pt-0 border-t border-transparent">
                <button
                  onClick={handleSave}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                    type === 'income' 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' 
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
                  }`}
                >
                  <Check size={20} />
                  {initialData ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ManageCategoriesModal 
        isOpen={isManageCatsOpen} 
        onClose={() => setIsManageCatsOpen(false)} 
        onUpdate={loadData}
      />
    </>
  );
};