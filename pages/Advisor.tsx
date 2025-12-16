import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Transaction } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvisorProps {
  transactions: Transaction[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const Advisor: React.FC<AdvisorProps> = ({ transactions }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  // Helper to construct context from transactions
  const getTransactionContext = () => {
    if (transactions.length === 0) return "No transactions available yet.";

    const recentTransactions = transactions.slice(0, 15).map(t => 
      `${t.date.split('T')[0]}: ${t.title} (${t.amount}) [${t.type}] - ${t.category}`
    ).join('\n');
    
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a,b) => a+b.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a,b) => a+b.amount, 0);
    
    return `
      Financial Summary:
      Total Income: ${totalIncome}
      Total Expense: ${totalExpense}
      Net Balance: ${totalIncome - totalExpense}

      Recent Transactions (Last 15):
      ${recentTransactions}
    `;
  };

  const handleGenerateInsights = async () => {
    setHasStarted(true);
    setIsLoading(true);

    const context = getTransactionContext();
    const prompt = "Analyze my transaction history. Provide a brief summary of my spending habits, identify my biggest expense category, and give me 3 short, actionable tips to save money. Be friendly and encouraging.";

    const response = await geminiService.getFinancialAdvice(context, prompt);
    
    setMessages([
      { role: 'model', text: response || "I've analyzed your data, but I couldn't generate a specific insight right now. How can I help you?" }
    ]);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const context = getTransactionContext();
    const response = await geminiService.getFinancialAdvice(context, userMsg);
    
    setMessages(prev => [...prev, { role: 'model', text: response || "Sorry, I couldn't process that." }]);
    setIsLoading(false);
  };

  // 1. Landing View (Matches Screenshot)
  if (!hasStarted) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 rotate-3">
              <Sparkles className="text-white w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            AI Financial Advisor
          </h1>
          
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Unlock insights into your spending habits. Our AI analyzes your transaction history to provide personalized budgeting tips and identify saving opportunities.
          </p>

          <button
            onClick={handleGenerateInsights}
            className="group relative inline-flex items-center justify-center gap-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/40"
          >
            <Sparkles size={20} className="animate-pulse" />
            <span>Generate Insights</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. Chat Interface (Shown after clicking Generate)
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 h-[calc(100vh-140px)] flex flex-col overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={18} /> 
          <span>Financial Assistant</span>
        </h2>
        <button onClick={() => setHasStarted(false)} className="text-xs text-slate-500 hover:text-white transition-colors">
          Reset Session
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-indigo-400'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                </div>
                
                <div className={`p-4 rounded-2xl text-sm leading-7 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={`mb-2 last:mb-0 ${line.trim().startsWith('-') ? 'pl-2' : ''}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-start"
           >
             <div className="flex items-start gap-3 max-w-[80%]">
               <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                 <Loader2 size={16} className="text-indigo-400 animate-spin" />
               </div>
               <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                 <span className="text-slate-400 text-xs font-medium">Analyzing your finances...</span>
               </div>
             </div>
           </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
            className="flex-1 bg-slate-800 text-white rounded-xl px-5 py-4 pl-5 pr-14 border border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500 disabled:opacity-50"
          />
          <div className="absolute right-2 top-2 bottom-2">
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-full aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-all flex items-center justify-center shadow-lg shadow-indigo-900/20"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-3">
          AI advice is for informational purposes only.
        </p>
      </div>
    </motion.div>
  );
};