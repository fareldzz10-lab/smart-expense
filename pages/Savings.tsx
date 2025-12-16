import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Target, Trash2, Edit2 } from 'lucide-react';
import { SavingsGoal } from '../types';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/formatters';
import { AddSavingsGoalModal } from '../components/AddSavingsGoalModal';
import { AddFundsModal } from '../components/AddFundsModal';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const Savings: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const loadGoals = async () => {
    const data = await storageService.getSavingsGoals();
    setGoals(data);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // Check for completed goals and trigger confetti
  useEffect(() => {
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);
    if (completedGoals.length > 0) {
       // Optional: only trigger if this is a "new" completion in a real app state management
       // For now, simple trigger on load if any are complete adds a nice effect
    }
  }, [goals]);

  const handleDelete = async (id?: string) => {
    if (id && window.confirm('Delete this savings goal?')) {
      await storageService.deleteSavingsGoal(id);
      loadGoals();
    }
  };

  const openFundsModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsFundsModalOpen(true);
  };

  const handleGoalCompletion = () => {
     confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
     });
     loadGoals();
  };

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  // Color map for icons
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  };

   const barColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
               <PiggyBank className="text-indigo-400" size={32} />
               Savings Goals
             </h2>
           </div>
           <p className="text-slate-400 font-medium max-w-xl">
             Track your progress towards financial targets. Set deadlines and watch your savings grow.
           </p>
        </div>
        <div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Existing Goals */}
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const iconStyle = colorMap[goal.color] || colorMap.emerald;
          const barStyle = barColorMap[goal.color] || barColorMap.emerald;
          const isComplete = goal.currentAmount >= goal.targetAmount;
          
          return (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={isComplete ? { scale: 1.02, rotate: 1 } : {}}
              className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between group h-full transition-all ${isComplete ? 'shadow-[0_0_30px_rgba(16,185,129,0.2)] border-emerald-500/30' : ''}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconStyle}`}>
                      <Target size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white capitalize">{goal.name}</h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                         <span className="text-slate-400">📅 {getDaysLeft(goal.deadline)} days left</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                   <div className="flex justify-between items-end mb-2">
                     <span className={`text-2xl font-bold ${isComplete ? 'text-emerald-500' : 'text-white'}`}>
                       {formatCurrency(goal.currentAmount)}
                     </span>
                     <span className="text-xs text-slate-500 mb-1">of {formatCurrency(goal.targetAmount)}</span>
                   </div>
                   
                   <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        className={`h-full rounded-full ${barStyle} ${isComplete ? 'animate-pulse' : ''}`}
                      />
                   </div>
                   <div className="mt-1 flex justify-between">
                     <span className="text-xs text-slate-500 font-medium">{progress.toFixed(1)}%</span>
                     {isComplete && <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Completed! 🎉</span>}
                   </div>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => openFundsModal(goal)}
                  className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Funds
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Create New Goal Placeholder Card */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-full min-h-[250px] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-slate-900/50 transition-all group"
        >
           <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-800 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all">
             <Plus size={32} />
           </div>
           <span className="font-medium">Create New Goal</span>
        </button>

      </div>

      <AddSavingsGoalModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGoalAdded={loadGoals}
      />

      <AddFundsModal
        isOpen={isFundsModalOpen}
        onClose={() => setIsFundsModalOpen(false)}
        goal={selectedGoal}
        onFundsAdded={handleGoalCompletion}
      />
    </div>
  );
};