import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { Category } from '../types';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ isOpen, onClose, onUpdate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    const data = await storageService.getCategories();
    setCategories(data);
  };

  const handleAdd = async () => {
    if (!newCatName) return;
    await storageService.addCategory({
      name: newCatName,
      type: newCatType,
      color: newCatColor
    });
    setNewCatName('');
    await loadCategories();
    onUpdate();
  };

  const handleDelete = async (id?: string) => {
    if (id && window.confirm('Delete this category?')) {
      await storageService.deleteCategory(id);
      await loadCategories();
      onUpdate();
    }
  };

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag size={18} /> Manage Categories
              </h3>
              <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-900 dark:hover:text-white" /></button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Add New Category</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  placeholder="Category Name" 
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <select 
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm outline-none dark:text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <button 
                  onClick={handleAdd}
                  disabled={!newCatName}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {colors.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setNewCatColor(c)} 
                    className={`w-6 h-6 rounded-full shrink-0 transition-transform ${newCatColor === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 ring-slate-400' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-500 uppercase mb-2">Income Categories</h4>
                  <div className="space-y-2">
                    {categories.filter(c => c.type === 'income').map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.name}</span>
                        </div>
                        <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-rose-500 uppercase mb-2">Expense Categories</h4>
                  <div className="space-y-2">
                    {categories.filter(c => c.type === 'expense').map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.name}</span>
                        </div>
                        <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
