import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calculator, 
  TrendingDown, 
  Info, 
  Coins, 
  Percent, 
  Calendar, 
  ArrowUpRight, 
  Sparkles, 
  Check, 
  ArrowRightLeft 
} from 'lucide-react';
import { calculateEmi, formatCurrency } from '../utils/finance';
import { cn } from '../lib/utils';

interface QuickEmiModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLoan?: {
    amount: number;
    interestRate: number;
    tenureYears: number;
  } | null;
  onApply?: (amount: number, interestRate: number, tenureYears: number) => void;
}

export function QuickEmiModal({ isOpen, onClose, activeLoan, onApply }: QuickEmiModalProps) {
  // Local state initialized to active loan details if present, otherwise default values
  const [amount, setAmount] = useState<number>(5000000); // 50 Lakhs default
  const [rate, setRate] = useState<number>(8.5); // 8.5% default
  const [tenure, setTenure] = useState<number>(15); // 15 years default

  // Sync state when activeLoan changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeLoan) {
        setAmount(activeLoan.amount);
        setRate(activeLoan.interestRate);
        setTenure(activeLoan.tenureYears);
      } else {
        setAmount(5000000);
        setRate(8.5);
        setTenure(15);
      }
    }
  }, [isOpen, activeLoan]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculations
  const emi = calculateEmi(amount, rate, tenure);
  const totalMonths = tenure * 12;
  const totalPayment = emi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - amount);

  // Interest vs Principal percentage
  const interestRatio = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const principalRatio = totalPayment > 0 ? (amount / totalPayment) * 100 : 0;

  // Comparative calculations against original loan (if available)
  const compareActive = activeLoan ? (() => {
    const activeEmi = calculateEmi(activeLoan.amount, activeLoan.interestRate, activeLoan.tenureYears);
    const activeTotalPayment = activeEmi * (activeLoan.tenureYears * 12);
    const activeTotalInterest = Math.max(0, activeTotalPayment - activeLoan.amount);

    const emiDiff = emi - activeEmi;
    const interestDiff = totalInterest - activeTotalInterest;
    
    return {
      activeEmi,
      activeTotalInterest,
      emiDiff,
      interestDiff,
      hasChanged: amount !== activeLoan.amount || rate !== activeLoan.interestRate || tenure !== activeLoan.tenureYears
    };
  })() : null;

  // Handlers for quick amount adjustments (in INR Lakhs)
  const adjustAmount = (diffLakhs: number) => {
    setAmount(prev => {
      const next = prev + (diffLakhs * 100000);
      return Math.max(100000, Math.min(100000000, next)); // Min 1L, Max 10Cr
    });
  };

  const adjustRate = (diff: number) => {
    setRate(prev => {
      const next = Math.round((prev + diff) * 100) / 100;
      return Math.max(1, Math.min(25, next)); // Min 1%, Max 25%
    });
  };

  const adjustTenure = (diff: number) => {
    setTenure(prev => {
      const next = prev + diff;
      return Math.max(1, Math.min(30, next)); // Min 1 year, Max 30 years
    });
  };

  const handleApply = () => {
    if (onApply) {
      onApply(amount, rate, tenure);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl">
                  <Calculator className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    Quick EMI Calculator
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                      Sandbox Mode
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Adjust rates and tenures on the fly to preview direct cost updates.
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Close Calculator"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Interactive Inputs */}
              <div className="space-y-6">
                
                {/* 1. Loan Amount */}
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-indigo-500" />
                      Loan Principal
                    </label>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <span className="text-slate-400 text-xs font-bold font-mono">₹</span>
                      <input 
                        type="number"
                        min="100000"
                        max="100000000"
                        className="w-28 text-right bg-transparent text-slate-800 dark:text-white font-mono font-black text-sm focus:outline-none"
                        value={amount}
                        onChange={(e) => setAmount(Math.max(100000, Math.min(100000000, Number(e.target.value) || 0)))}
                      />
                    </div>
                  </div>

                  <input
                    type="range"
                    min="100000"
                    max="30000000" // 3 Crore slider limit
                    step="50000"
                    className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer"
                    value={amount > 30000000 ? 30000000 : amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />

                  {/* Quick modifiers */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => adjustAmount(-10)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      -10L
                    </button>
                    <button onClick={() => adjustAmount(-1)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      -1L
                    </button>
                    <button onClick={() => adjustAmount(1)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      +1L
                    </button>
                    <button onClick={() => adjustAmount(10)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      +10L
                    </button>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium ml-auto flex items-center">
                      ({formatCurrency(amount)})
                    </span>
                  </div>
                </div>

                {/* 2. Interest Rate */}
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-indigo-500" />
                      Interest Rate (p.a.)
                    </label>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <input 
                        type="number"
                        min="1"
                        max="25"
                        step="0.1"
                        className="w-16 text-right bg-transparent text-slate-800 dark:text-white font-mono font-black text-sm focus:outline-none"
                        value={rate}
                        onChange={(e) => setRate(Math.max(1, Math.min(25, Number(e.target.value) || 0)))}
                      />
                      <span className="text-slate-400 text-xs font-bold">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="0.05"
                    className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                  />

                  {/* Quick modifiers */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => adjustRate(-0.5)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      -0.5%
                    </button>
                    <button onClick={() => adjustRate(-0.1)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      -0.1%
                    </button>
                    <button onClick={() => adjustRate(0.1)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      +0.1%
                    </button>
                    <button onClick={() => adjustRate(0.5)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      +0.5%
                    </button>
                  </div>
                </div>

                {/* 3. Loan Tenure */}
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Loan Tenure
                    </label>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <input 
                        type="number"
                        min="1"
                        max="30"
                        className="w-12 text-right bg-transparent text-slate-800 dark:text-white font-mono font-black text-sm focus:outline-none"
                        value={tenure}
                        onChange={(e) => setTenure(Math.max(1, Math.min(30, Number(e.target.value) || 0)))}
                      />
                      <span className="text-slate-400 text-xs font-bold">Yrs</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                  />

                  {/* Quick modifiers */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => adjustTenure(-5)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      -5 Yrs
                    </button>
                    <button onClick={() => adjustTenure(-1)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      -1 Yr
                    </button>
                    <button onClick={() => adjustTenure(1)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      +1 Yr
                    </button>
                    <button onClick={() => adjustTenure(5)} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      +5 Yrs
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Calculations & Comparison */}
              <div className="flex flex-col justify-between space-y-6">
                
                {/* Visual results cards */}
                <div className="space-y-4">
                  
                  {/* Primary EMI Value Display */}
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 rotate-45 pointer-events-none" />
                    
                    <span className="text-[10px] font-black uppercase text-indigo-100 tracking-widest block mb-1">Estimated Monthly EMI</span>
                    <p className="text-4xl font-mono font-black tracking-tight">{formatCurrency(emi)}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-indigo-100">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-indigo-200 block">Total Interest</span>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">{formatCurrency(totalInterest)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-indigo-200 block">Total Repayment</span>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">{formatCurrency(totalPayment)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Principal vs Interest Segmented horizontal bar */}
                  <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                      <span>Breakdown of Total Cost</span>
                      <span>Principal vs Interest</span>
                    </div>
                    {/* Visual Segmented Bar */}
                    <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${principalRatio}%` }}
                        title={`Principal: ${principalRatio.toFixed(1)}%`}
                      />
                      <div 
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${interestRatio}%` }}
                        title={`Interest: ${interestRatio.toFixed(1)}%`}
                      />
                    </div>
                    {/* Legend */}
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>Principal ({principalRatio.toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Interest ({interestRatio.toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side comparison against Active Session */}
                  {compareActive && compareActive.hasChanged ? (
                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Compare Against Wizard Baseline</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">EMI Delta</span>
                          <span className={cn(
                            "font-mono font-black text-sm",
                            compareActive.emiDiff > 0 ? "text-rose-500" : compareActive.emiDiff < 0 ? "text-emerald-500" : "text-slate-600"
                          )}>
                            {compareActive.emiDiff > 0 ? '+' : ''}
                            {formatCurrency(compareActive.emiDiff)}/mo
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Interest Savings</span>
                          <span className={cn(
                            "font-mono font-black text-sm",
                            compareActive.interestDiff < 0 ? "text-emerald-500 animate-pulse" : compareActive.interestDiff > 0 ? "text-rose-500" : "text-slate-600"
                          )}>
                            {compareActive.interestDiff < 0 ? 'Saved ' : 'Cost +'}
                            {formatCurrency(Math.abs(compareActive.interestDiff))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : activeLoan ? (
                    <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 flex gap-2.5 items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Matching the current active wizard session loan details perfectly.</span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex gap-2.5 items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Complete the main wizard to compare results against your profile assessment.</span>
                    </div>
                  )}

                </div>

                {/* Footer apply buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all font-black text-xs uppercase tracking-wider"
                  >
                    Close
                  </button>

                  {onApply && activeLoan && (
                    <button
                      onClick={handleApply}
                      disabled={compareActive ? !compareActive.hasChanged : true}
                      className={cn(
                        "flex-1 py-2.5 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2",
                        compareActive && compareActive.hasChanged
                          ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer active:scale-95"
                          : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Update Session</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
