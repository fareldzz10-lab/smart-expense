import React, { useState } from 'react';
import { X, Check, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';

interface AddSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalAdded: () => void;
}

export const AddSavingsGoalModal: React.FC<AddSavingsGoalModalProps> = ({ isOpen, onClose, onGoalAdded }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('emerald');

  const handleSave = async () => {
    if (!name || !targetAmount || !deadline) return;

    await storageService.addSavingsGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline: new Date(deadline).toISOString(),
      color
    });
    
    setName('');
    setTargetAmount('');
    setDeadline('');
    onGoalAdded();
    onClose();
  };

  const colors = [
    { id: 'emerald', class: 'bg-emerald-500' },
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'rose', class: 'bg-rose-500' },
    { id: 'amber', class: 'bg-amber-500' },
  ];

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
                <Target size={20} />
                <h3 className="font-semibold text-white">Create New Goal</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Laptop"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Target Amount (IDR)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 15000000"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Color Tag</label>
                <div className="flex gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                        color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                 <button
                  onClick={handleSave}
                  disabled={!name || !targetAmount || !deadline}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                  Create Goal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
