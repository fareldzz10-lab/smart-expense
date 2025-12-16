import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { RecurringRule } from '../types';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/formatters';
import { AddRecurringModal } from '../components/AddRecurringModal';

export const Auto: React.FC = () => {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  const loadRules = async () => {
    const data = await storageService.getRecurringRules();
    setRules(data);
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleDelete = async (id?: string) => {
    if (id && window.confirm('Delete this automation rule?')) {
      await storageService.deleteRecurringRule(id);
      loadRules();
    }
  };

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const incomeRules = rules.filter(r => r.type === 'income');
  const expenseRules = rules.filter(r => r.type === 'expense');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
               <RefreshCw className="text-indigo-400" size={32} />
               Automation
             </h2>
           </div>
           <p className="text-slate-400 font-medium max-w-xl">
             Manage your fixed income and expenses. Rules automatically generate transactions when due.
           </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openModal('income')}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5"
          >
            <ArrowUpCircle size={18} />
            <span>Add Income</span>
          </button>
          <button 
            onClick={() => openModal('expense')}
            className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-900/20 transition-all transform hover:-translate-y-0.5"
          >
            <ArrowDownCircle size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Recurring Income Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
          <ArrowUpCircle size={20} />
          <h3>Recurring Income</h3>
        </div>
        
        {incomeRules.length === 0 ? (
          <div className="w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center bg-slate-900/30">
            <p className="text-slate-500 text-sm">No recurring income set.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeRules.map(rule => (
              <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-start group">
                <div>
                  <h4 className="font-semibold text-white">{rule.title}</h4>
                  <p className="text-emerald-500 font-bold mt-1">{formatCurrency(rule.amount)}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700 capitalize">{rule.frequency}</span>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">{rule.category}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
          <ArrowDownCircle size={20} />
          <h3>Recurring Expenses</h3>
        </div>
        
        {expenseRules.length === 0 ? (
          <div className="w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center bg-slate-900/30">
            <p className="text-slate-500 text-sm">No recurring expenses set.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseRules.map(rule => (
              <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-start group">
                <div>
                  <h4 className="font-semibold text-white">{rule.title}</h4>
                  <p className="text-rose-500 font-bold mt-1">{formatCurrency(rule.amount)}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700 capitalize">{rule.frequency}</span>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">{rule.category}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddRecurringModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRuleAdded={loadRules}
        defaultType={modalType}
      />
    </div>
  );
};
