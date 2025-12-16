import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { SavingsGoal } from '../types';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onFundsAdded: () => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ isOpen, onClose, goal, onFundsAdded }) => {
  const [amount, setAmount] = useState('');

  const handleSave = async () => {
    if (!amount || !goal) return;

    const addedAmount = parseFloat(amount);
    const updatedGoal = {
        ...goal,
        currentAmount: goal.currentAmount + addedAmount
    };

    await storageService.updateSavingsGoal(updatedGoal);
    
    // Optionally create a transaction record for this savings allocation if desired,
    // but for now we just update the goal itself.
    
    setAmount('');
    onFundsAdded();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && goal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white">Add Funds to "{goal.name}"</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Amount to Add (IDR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="pt-2">
                 <button
                  onClick={handleSave}
                  disabled={!amount}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Add Funds
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
