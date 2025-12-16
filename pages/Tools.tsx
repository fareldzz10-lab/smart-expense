import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compound' | 'loan'>('compound');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
               <Calculator className="text-indigo-600 dark:text-indigo-400" size={32} />
               Financial Tools
             </h2>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
             Plan your future with these calculators.
           </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-900 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('compound')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'compound'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp size={16} /> Compound Interest
        </button>
        <button
          onClick={() => setActiveTab('loan')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'loan'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <DollarSign size={16} /> Loan Estimator
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        {activeTab === 'compound' ? <CompoundInterestCalculator /> : <LoanCalculator />}
      </div>
    </div>
  );
};

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(500000);

  const calculate = () => {
    let total = principal;
    for (let i = 0; i < years * 12; i++) {
      total = total * (1 + (rate / 100 / 12)) + monthlyContribution;
    }
    return total;
  };

  const finalAmount = calculate();
  const totalInvested = principal + (monthlyContribution * years * 12);
  const interestEarned = finalAmount - totalInvested;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Initial Investment</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Monthly Contribution</label>
          <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Time Period (Years)</label>
          <input type="range" min="1" max="50" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full" />
          <div className="text-right text-sm text-indigo-500 font-bold">{years} Years</div>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-2">Projected Total</h3>
        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 mb-4">
          {formatCurrency(finalAmount)}
        </p>
        <div className="w-full space-y-2 text-sm">
           <div className="flex justify-between">
             <span className="text-slate-500">Total Invested</span>
             <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalInvested)}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500">Interest Earned</span>
             <span className="font-bold text-emerald-500">+{formatCurrency(interestEarned)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const LoanCalculator = () => {
  const [amount, setAmount] = useState(100000000);
  const [rate, setRate] = useState(8);
  const [months, setMonths] = useState(24);

  const calculatePayment = () => {
    const monthlyRate = rate / 100 / 12;
    const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    return payment;
  };

  const monthlyPayment = calculatePayment();
  const totalRepayment = monthlyPayment * months;
  const totalInterest = totalRepayment - amount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Loan Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Loan Term (Months)</label>
          <input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white" />
        </div>
      </div>

       <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-2">Estimated Monthly Payment</h3>
        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-500 mb-4">
          {formatCurrency(monthlyPayment)}
        </p>
        <div className="w-full space-y-2 text-sm">
           <div className="flex justify-between">
             <span className="text-slate-500">Total Repayment</span>
             <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalRepayment)}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500">Total Interest</span>
             <span className="font-bold text-rose-500">+{formatCurrency(totalInterest)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};