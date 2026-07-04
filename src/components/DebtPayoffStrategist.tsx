import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Award, 
  Trash2, 
  Plus, 
  TrendingDown, 
  PiggyBank, 
  Coins, 
  Info, 
  CheckCircle, 
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip,
  Legend
} from 'recharts';
import { FinancialData, RiskProfile } from '../types';
import { formatCurrency } from '../utils/finance';

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

interface DebtPayoffStrategistProps {
  data: FinancialData;
  profile: RiskProfile;
}

export function DebtPayoffStrategist({ data, profile }: DebtPayoffStrategistProps) {
  // 1. Available monthly surplus from verified profile
  const originalSurplus = profile.disposableIncome > 0 ? profile.disposableIncome : 0;
  
  // State for surplus allocation percentage (0% to 100%)
  const [allocationPercent, setAllocationPercent] = useState<number>(100);
  const allocatedSurplus = Math.round(originalSurplus * (allocationPercent / 100));

  // 2. Active Strategy state ('snowball' | 'avalanche')
  const [activeStrategy, setActiveStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  // 3. Expandable detailed step guide
  const [isStepsExpanded, setIsStepsExpanded] = useState(true);

  // 4. Form states for adding / editing a debt
  const [debts, setDebts] = useState<Debt[]>(() => {
    // Seed initial debts based on user inputs
    const initialList: Debt[] = [];
    
    // If the user has other short term debts, add them
    if (data.otherDebts > 0) {
      initialList.push({
        id: 'credit_card',
        name: 'Credit Card Debt',
        balance: data.otherDebts,
        rate: 24, // Typical high CC interest rate
        minPayment: Math.max(1000, Math.round(data.otherDebts * 0.04)) // ~4% minimum payment
      });
    }

    // If the user has existing EMIs, represent them as a personal/car loan
    if (data.existingEmis > 0) {
      initialList.push({
        id: 'existing_loan',
        name: 'Personal/Car Loan',
        balance: data.existingEmis * 24, // Assumed 24 months tenure remaining
        rate: 11.5, // Standard interest rate
        minPayment: data.existingEmis
      });
    }

    // If no debts were specified, seed 3 standard educational sample debts
    if (initialList.length === 0) {
      initialList.push({
        id: 'seed_cc',
        name: 'Premium Credit Card',
        balance: 65000,
        rate: 36, // Credit card rate
        minPayment: 2600
      });
      initialList.push({
        id: 'seed_personal',
        name: 'Standard Personal Loan',
        balance: 150000,
        rate: 14.5,
        minPayment: 4800
      });
      initialList.push({
        id: 'seed_car',
        name: 'Pre-owned Car Loan',
        balance: 320000,
        rate: 9.2,
        minPayment: 8500
      });
    }

    return initialList;
  });

  // Adding new debt form states
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState<number | ''>('');
  const [newDebtRate, setNewDebtRate] = useState<number | ''>('');
  const [newDebtMin, setNewDebtMin] = useState<number | ''>('');
  const [formError, setFormError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Handlers for adding/removing debts
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtName || !newDebtBalance || !newDebtRate || !newDebtMin) {
      setFormError('Please fill out all fields with non-zero values.');
      return;
    }

    if (Number(newDebtMin) <= 0 || Number(newDebtBalance) <= 0 || Number(newDebtRate) <= 0) {
      setFormError('Values must be positive numbers.');
      return;
    }

    if (Number(newDebtMin) > Number(newDebtBalance)) {
      setFormError('Minimum payment cannot be larger than the outstanding balance.');
      return;
    }

    // CC Interest approximation check
    const monthlyInterest = (Number(newDebtBalance) * (Number(newDebtRate) / 100)) / 12;
    if (Number(newDebtMin) <= monthlyInterest) {
      setFormError(`Minimum payment must exceed monthly interest (${formatCurrency(Math.ceil(monthlyInterest))}) to avoid endless debt growth.`);
      return;
    }

    const newDebt: Debt = {
      id: Math.random().toString(),
      name: newDebtName,
      balance: Math.round(Number(newDebtBalance)),
      rate: Number(newDebtRate),
      minPayment: Math.round(Number(newDebtMin))
    };

    setDebts(prev => [...prev, newDebt]);
    setNewDebtName('');
    setNewDebtBalance('');
    setNewDebtRate('');
    setNewDebtMin('');
    setFormError('');
    setShowAddForm(false);
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  // 5. Repayment Simulation Engine (runs on each state update)
  const runSimulation = (
    debtList: Debt[],
    extraMonthly: number,
    strategy: 'snowball' | 'avalanche' | 'minimums'
  ) => {
    let activeDebts = debtList.map(d => ({ ...d }));
    const timeline: any[] = [];
    const debtPayoffMonths: Record<string, number> = {};
    const debtPayoffInterest: Record<string, number> = {};
    
    debtList.forEach(d => {
      debtPayoffMonths[d.id] = 0;
      debtPayoffInterest[d.id] = 0;
    });

    let totalInterestPaid = 0;
    let month = 0;
    const maxMonths = 360; // Max 30 years ceiling

    // Save starting total
    const totalStartingBalance = debtList.reduce((sum, d) => sum + d.balance, 0);

    // Initial snapshot
    const initialSnapshot: any = {
      month: 0,
      monthLabel: 'Start',
      total: totalStartingBalance,
    };
    debtList.forEach(d => {
      initialSnapshot[d.id] = d.balance;
    });
    timeline.push(initialSnapshot);

    while (month < maxMonths) {
      const currentOutstanding = activeDebts.reduce((sum, d) => sum + d.balance, 0);
      if (currentOutstanding <= 0.1) {
        break;
      }

      month++;

      // 1. Accrue Interest
      let interestThisMonth = 0;
      activeDebts.forEach(d => {
        if (d.balance > 0) {
          const monthlyRate = d.rate / 100 / 12;
          const interest = d.balance * monthlyRate;
          d.balance += interest;
          interestThisMonth += interest;
          totalInterestPaid += interest;
          debtPayoffInterest[d.id] = (debtPayoffInterest[d.id] || 0) + interest;
        }
      });

      // 2. Compute available budget (minimums + extra)
      const currentActiveMinsSum = activeDebts.reduce((sum, d) => d.balance > 0 ? sum + d.minPayment : sum, 0);
      let monthlyBudget = strategy === 'minimums' 
        ? currentActiveMinsSum 
        : currentActiveMinsSum + extraMonthly;

      // 3. Apply Minimum Payments
      let appliedPayments: Record<string, number> = {};
      activeDebts.forEach(d => {
        if (d.balance > 0) {
          const payment = Math.min(d.balance, d.minPayment);
          d.balance -= payment;
          monthlyBudget -= payment;
          appliedPayments[d.id] = payment;

          if (d.balance <= 0.1) {
            d.balance = 0;
            if (!debtPayoffMonths[d.id]) {
              debtPayoffMonths[d.id] = month;
            }
          }
        } else {
          appliedPayments[d.id] = 0;
        }
      });

      // 4. Apply extra surplus according to strategy
      if (strategy !== 'minimums' && monthlyBudget > 0) {
        let remainingTargets = activeDebts.filter(d => d.balance > 0);
        if (remainingTargets.length > 0) {
          if (strategy === 'snowball') {
            // Debt Snowball: smallest remaining balance first
            remainingTargets.sort((a, b) => a.balance - b.balance);
          } else if (strategy === 'avalanche') {
            // Debt Avalanche: highest interest rate first
            remainingTargets.sort((a, b) => b.rate - a.rate);
          }

          for (let target of remainingTargets) {
            if (monthlyBudget <= 0) break;
            const extraPay = Math.min(target.balance, monthlyBudget);
            target.balance -= extraPay;
            monthlyBudget -= extraPay;
            appliedPayments[target.id] = (appliedPayments[target.id] || 0) + extraPay;

            if (target.balance <= 0.1) {
              target.balance = 0;
              if (!debtPayoffMonths[target.id]) {
                debtPayoffMonths[target.id] = month;
              }
            }
          }
        }
      }

      // Record snapshot
      const snapshot: any = {
        month,
        monthLabel: `Mo ${month}`,
        total: Math.round(activeDebts.reduce((sum, d) => sum + d.balance, 0)),
      };
      activeDebts.forEach(d => {
        snapshot[d.id] = Math.round(d.balance);
      });
      timeline.push(snapshot);

      // Inf-loop check under minimum-only regime
      const postBalance = activeDebts.reduce((sum, d) => sum + d.balance, 0);
      if (postBalance >= currentOutstanding && extraMonthly === 0 && strategy === 'minimums') {
        if (month > 60) {
          return {
            timeline,
            totalInterestPaid: Math.round(totalInterestPaid),
            totalMonths: maxMonths,
            debtPayoffMonths,
            debtPayoffInterest,
            hasDefault: true
          };
        }
      }
    }

    // Catch payoff months for remaining debts that haven't cleared
    activeDebts.forEach(d => {
      if (d.balance > 0 && !debtPayoffMonths[d.id]) {
        debtPayoffMonths[d.id] = maxMonths;
      }
    });

    return {
      timeline,
      totalInterestPaid: Math.round(totalInterestPaid),
      totalMonths: month,
      debtPayoffMonths,
      debtPayoffInterest,
      hasDefault: month >= maxMonths
    };
  };

  // Run simulations for all three options: Minimums-Only, Snowball, and Avalanche
  const simMinimums = useMemo(() => runSimulation(debts, 0, 'minimums'), [debts]);
  const simSnowball = useMemo(() => runSimulation(debts, allocatedSurplus, 'snowball'), [debts, allocatedSurplus]);
  const simAvalanche = useMemo(() => runSimulation(debts, allocatedSurplus, 'avalanche'), [debts, allocatedSurplus]);

  // Selected strategy values
  const activeSimResult = activeStrategy === 'snowball' ? simSnowball : simAvalanche;

  // Comparison metrics calculations
  const totalDebtBalance = useMemo(() => debts.reduce((sum, d) => sum + d.balance, 0), [debts]);
  const totalMinPayments = useMemo(() => debts.reduce((sum, d) => sum + d.minPayment, 0), [debts]);

  const interestSaved = Math.max(0, simMinimums.totalInterestPaid - activeSimResult.totalInterestPaid);
  const monthsSaved = Math.max(0, simMinimums.totalMonths - activeSimResult.totalMonths);

  // Recommendations and logic summary
  const strategyRecommendation = useMemo(() => {
    if (debts.length <= 1) {
      return {
        strategy: 'avalanche',
        message: 'With only one active debt liability, repayment ordering is identical. Choose Avalanche to pay off high interest rates.',
        badge: 'Single Target'
      };
    }

    const interestDifference = simSnowball.totalInterestPaid - simAvalanche.totalInterestPaid;
    if (interestDifference > 2500) {
      return {
        strategy: 'avalanche',
        message: `Avalanche is highly recommended. It saves you an extra ${formatCurrency(interestDifference)} in interest by targeting high-rate liabilities first.`,
        badge: 'Financially Optimal'
      };
    } else {
      return {
        strategy: 'snowball',
        message: 'Snowball is recommended here. The interest difference is minimal, and Snowball knocks out your smallest balances first to build immediate motivational momentum.',
        badge: 'Psychological Momentum'
      };
    }
  }, [debts, simSnowball.totalInterestPaid, simAvalanche.totalInterestPaid]);

  // Payoff order list details
  const payoffOrderList = useMemo(() => {
    let sorted = [...debts];
    if (activeStrategy === 'snowball') {
      sorted.sort((a, b) => a.balance - b.balance);
    } else {
      sorted.sort((a, b) => b.rate - a.rate);
    }

    return sorted.map((debt, index) => {
      const payoffMonth = activeSimResult.debtPayoffMonths[debt.id] || 0;
      const interestPaid = Math.round(activeSimResult.debtPayoffInterest[debt.id] || 0);
      return {
        ...debt,
        payoffMonth,
        interestPaid,
        order: index + 1
      };
    }).sort((a, b) => a.payoffMonth - b.payoffMonth);
  }, [debts, activeStrategy, activeSimResult]);

  return (
    <div className="col-span-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-8 transition-colors duration-200"
      >
        {/* Header Title Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
              Liability Accelerator & Planner
            </span>
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
              Debt Payoff Strategist: Snowball vs. Avalanche
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Leverage your monthly cash surplus of <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{formatCurrency(originalSurplus)}</span> to retire active liabilities earlier. Compare strategies to save interest and pay off debts faster.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveStrategy('snowball')}
              className={`text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all border ${
                activeStrategy === 'snowball'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              🔵 Debt Snowball Method
            </button>
            <button
              onClick={() => setActiveStrategy('avalanche')}
              className={`text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all border ${
                activeStrategy === 'avalanche'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              ⚡ Debt Avalanche Method
            </button>
          </div>
        </div>

        {/* Dynamic Warning for Zero Surplus */}
        {originalSurplus <= 0 && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-black text-amber-800 dark:text-amber-450 uppercase tracking-tight">Zero Net Surplus Available for Accelerating Debts</h4>
              <p className="text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                You have no monthly cash surplus left over to speed up your debt payoff. Currently, you can only make the required minimum payments (₹{totalMinPayments.toLocaleString('en-IN')}/mo) listed below. Consolidating debts or cutting expenses could free up surplus for faster repayment.
              </p>
            </div>
          </div>
        )}

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): Debt List + Surplus Allocation + Charts */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Interactive Debt Manager */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-slate-500" />
                  Active Debt Portfolio ({debts.length} Accounts)
                </h4>
                
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> {showAddForm ? 'Cancel Add' : 'Add Custom Debt'}
                </button>
              </div>

              {/* Add Custom Debt Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddDebt}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Debt Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Credit Card B"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                          value={newDebtName}
                          onChange={e => setNewDebtName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Balance (INR)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 50000"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                          value={newDebtBalance}
                          onChange={e => setNewDebtBalance(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Interest Rate (% p.a.)</label>
                        <input
                          type="number"
                          required
                          step="0.1"
                          placeholder="e.g. 18"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                          value={newDebtRate}
                          onChange={e => setNewDebtRate(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Min. Payment (INR)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 2000"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                          value={newDebtMin}
                          onChange={e => setNewDebtMin(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {formError && (
                      <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {formError}
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowAddForm(false); setFormError(''); }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Add Debt
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Debt Cards list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {debts.map((debt, index) => (
                  <motion.div
                    key={debt.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 hover:border-slate-250 dark:hover:border-slate-700 transition-all group flex flex-col justify-between h-40"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-150 uppercase tracking-tight truncate max-w-[120px]">
                          {debt.name}
                        </p>
                        <button
                          onClick={() => handleRemoveDebt(debt.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          title="Remove Debt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Balance</p>
                        <p className="text-xl font-mono font-black text-slate-800 dark:text-white">
                          {formatCurrency(debt.balance)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3 text-[10px]">
                      <div>
                        <span className="text-slate-400 uppercase font-medium">Interest</span>
                        <p className="font-mono font-bold text-amber-600 dark:text-amber-450">{debt.rate}% p.a.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 uppercase font-medium">Min. Pay</span>
                        <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(debt.minPayment)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 2. Interactive Surplus Slider */}
            {originalSurplus > 0 && (
              <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-slate-950/40 border border-indigo-100/50 dark:border-slate-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      Accelerated Payment Roll Allocator
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Control how much of your monthly surplus to inject as extra payoff budget.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                      {allocationPercent}% Allocation
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-indigo-400">
                      +{formatCurrency(allocatedSurplus)}/mo
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Conservative (0%)</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer"
                    value={allocationPercent}
                    onChange={e => setAllocationPercent(Number(e.target.value))}
                  />
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase font-bold">Aggressive (100%)</span>
                </div>
              </div>
            )}

            {/* 3. Payoff melting trajectory chart */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-slate-500" />
                  Debt Melting Balance Projections
                </h4>
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-wider font-black">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
                    <span className="text-slate-400">Minimums Only</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span>
                    <span className="text-indigo-500 font-bold">{activeStrategy === 'snowball' ? 'Snowball Pro' : 'Avalanche Pro'}</span>
                  </div>
                </div>
              </div>

              {debts.length === 0 ? (
                <div className="h-60 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  Add at least one debt liability above to simulate the melting curves.
                </div>
              ) : (
                <div className="h-64 w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.10}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.20}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis 
                        dataKey="monthLabel" 
                        allowDuplicatedCategory={false}
                        stroke="#94a3b8" 
                        fontSize={9} 
                        fontWeight="bold"
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        fontWeight="bold"
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => `₹${val / 1000}k`}
                      />
                      <ReTooltip 
                        formatter={(value) => [formatCurrency(value as number), 'Outstanding Balance']}
                        contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                        labelStyle={{ color: "#94a3b8", fontSize: "10px", marginBottom: "4px" }}
                        labelFormatter={(label) => `Month Timeline: ${label}`}
                      />
                      <Area 
                        data={simMinimums.timeline}
                        name="Minimum Payments"
                        type="monotone" 
                        dataKey="total" 
                        stroke="#ef4444" 
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fillOpacity={1} 
                        fill="url(#minGrad)" 
                      />
                      <Area 
                        data={activeSimResult.timeline}
                        name={`${activeStrategy === 'snowball' ? 'Snowball' : 'Avalanche'} (${allocationPercent}% Surplus)`}
                        type="monotone" 
                        dataKey="total" 
                        stroke="#6366f1" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#activeGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (4 cols): Comparison Bento + Payoff Order Checklist */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Decision Recommendation card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                  Expert AI Advice
                </span>
                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-900">
                  {strategyRecommendation.badge}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-350">
                {strategyRecommendation.message}
              </p>
              
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase block">Strategy Selected</span>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-200">
                    {activeStrategy} Method
                  </p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-[9px] text-slate-400 uppercase block">Total Outstanding</span>
                  <p className="text-xs font-mono font-bold text-slate-200">
                    {formatCurrency(totalDebtBalance)}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Interactive comparative KPIs */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-slate-950/40 border border-indigo-100/50 dark:border-slate-800/80">
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">Accelerated Velocity</span>
                <p className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {activeSimResult.totalMonths} Months
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-450 font-bold mt-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Debt-free {monthsSaved} months earlier!</span>
                </div>
                <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1">Compared to minimum-only payoff of {simMinimums.totalMonths} months.</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-slate-950/40 border border-amber-100/50 dark:border-slate-800/80">
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-450 uppercase tracking-widest block mb-1">Accrued Interest Saved</span>
                <p className="text-2xl font-mono font-black text-amber-600 dark:text-amber-450">
                  {formatCurrency(interestSaved)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-tight">
                  Your interest falls from <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(simMinimums.totalInterestPaid)}</span> to <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(activeSimResult.totalInterestPaid)}</span>.
                </p>
              </div>
            </div>

            {/* 3. Step-by-Step Order Checklist */}
            <div className="space-y-3">
              <div 
                onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                className="flex justify-between items-center cursor-pointer select-none border-b border-slate-100 dark:border-slate-800 pb-2"
              >
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-500" />
                  Your Active Payoff Playbook
                </h4>
                {isStepsExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              <AnimatePresence initial={false}>
                {isStepsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {payoffOrderList.map((debt, index) => (
                      <motion.div
                        key={debt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl flex gap-3 items-center"
                      >
                        <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-450 font-mono font-black text-xs rounded-lg flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-900/30">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate">
                            {debt.name}
                          </p>
                          <div className="flex justify-between items-center mt-1 text-[9px] text-slate-400 font-bold">
                            <span>Interest Paid: {formatCurrency(debt.interestPaid)}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 uppercase">Paid in Mo {debt.payoffMonth}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

        {/* Informative footer tabs for Snowball vs Avalanche explanations */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/60 pb-3 md:pb-0 md:pr-4">
            <h5 className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <span>🔵</span> The Debt Snowball Method
            </h5>
            <p>
              Snowball focuses on **behavioral psychology**. By paying off your smallest balance first, you achieve rapid, visible "wins" that boost motivation. When a debt is retired, its minimum payment rolled over expands the payload on the next debt. Great for users who struggle to maintain focus or want quick successes.
            </p>
          </div>
          <div className="space-y-1.5">
            <h5 className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <span>⚡</span> The Debt Avalanche Method
            </h5>
            <p>
              Avalanche is **mathematically optimal**. By targeting your highest interest rate first, you minimize total interest accrued across all liabilities. It saves the most real cash and guarantees you pay off debt in the shortest possible time. Recommended for disciplined builders who prioritize pure financial savings.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
