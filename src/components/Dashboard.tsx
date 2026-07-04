import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ReTooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  RefreshCcw,
  Zap,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Layers,
  Info,
  PiggyBank,
  Coins,
  ArrowUpRight
} from 'lucide-react';
import { FinancialData, RiskCategory, RiskProfile } from '../types';
import { calculateEmi, formatCurrency, calculateAmortization } from '../utils/finance';
import { cn } from '../lib/utils';
import { 
  motion,
  AnimatePresence
} from 'motion/react';
import { DebtPayoffStrategist } from './DebtPayoffStrategist';

interface LoanRowProps {
  key?: string;
  lender: any;
  data: FinancialData;
  emi: number;
}

function LoanRow({ lender, data, emi }: LoanRowProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Calculate local impact
  const totalIncome = data.monthlyIncome + (data.variableIncome / 12);
  const newDti = ((data.existingEmis + data.otherDebts + emi) / totalIncome) * 100;
  const impactCategory = newDti < 35 ? 'Positive' : newDti < 50 ? 'Neutral' : 'High Risk';
  const ImpactIcon = newDti < 35 ? CheckCircle2 : newDti < 50 ? AlertTriangle : XCircle;
  const impactColor = newDti < 35 ? 'text-emerald-500' : newDti < 50 ? 'text-orange-500' : 'text-rose-500';

  return (
    <React.Fragment>
      {/* Desktop Row */}
      <tr className="hidden md:table-row hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4 text-sm font-bold text-slate-800">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ArrowRight className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")} />
              {lender.name}
            </div>
            {lender.preApproved && (
              <div className="ml-5 flex items-center gap-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[8px] font-black uppercase text-blue-600 tracking-tighter">Pre-Approved</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={cn("text-sm font-mono font-bold", lender.color)}>{lender.rate}% p.a.</span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{lender.tenure} Years</td>
        <td className="px-6 py-4 font-mono font-black text-slate-800">{formatCurrency(emi)}</td>
        <td className="px-6 py-4">
          <div className={cn("flex flex-col items-center gap-1", impactColor)}>
            <ImpactIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">{impactCategory}</span>
            <span className="text-[9px] opacity-70 font-bold whitespace-nowrap">{newDti.toFixed(1)}% DTI</span>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); alert(`Redirecting to ${lender.name} detailed product page...`); }}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all shadow-sm"
            >
              Learn More
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); alert(`Redirecting to ${lender.name} application portal...`); }}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
            >
              Apply Now
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Card */}
      <div className={cn(
        "md:hidden p-4 border-b border-slate-100 space-y-4",
        isExpanded ? "bg-slate-50" : "bg-white"
      )}>
        <div className="flex justify-between items-start" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{lender.name}</span>
              <ArrowRight className={cn("w-3 h-3 transition-transform text-slate-400", isExpanded && "rotate-90")} />
            </div>
            {lender.preApproved && (
              <div className="flex items-center gap-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[8px] font-black uppercase text-blue-600 tracking-tighter">Pre-Approved</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-mono font-bold", lender.color)}>{lender.rate}%</p>
            <p className="text-sm font-mono font-black text-slate-800">{formatCurrency(emi)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 border border-slate-100 rounded-lg p-2 bg-white">
            <ImpactIcon className={cn("w-4 h-4", impactColor)} />
            <div className="flex flex-col">
              <span className={cn("text-[8px] font-black uppercase tracking-tighter", impactColor)}>{impactCategory}</span>
              <span className="text-[9px] text-slate-500 font-bold">{newDti.toFixed(1)}% DTI</span>
            </div>
          </div>
          <div className="flex items-center justify-center border border-slate-100 rounded-lg p-2 bg-white">
            <span className="text-xs text-slate-600 font-bold">{lender.tenure} Years</span>
          </div>
        </div>

        {isExpanded && (
           <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2"
           >
              <div className="grid grid-cols-2 gap-4 text-[10px]">
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-tighter">Fees</p>
                  <p className="text-slate-700">{lender.details.fees}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-tighter">Prepayment</p>
                  <p className="text-slate-700">{lender.details.prepayment}</p>
                </div>
              </div>
              <div className="space-y-1 text-[10px]">
                <p className="font-bold text-slate-400 uppercase tracking-tighter">Eligibility</p>
                <p className="text-slate-700">{lender.details.eligibility}</p>
              </div>
           </motion.div>
        )}

        <div className="flex gap-2 pt-2">
            <button 
              onClick={(e) => { e.stopPropagation(); alert(`Redirecting to ${lender.name} detailed product page...`); }}
              className="flex-1 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all shadow-sm"
            >
              Learn More
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); alert(`Redirecting to ${lender.name} application portal...`); }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
            >
              Apply Now
            </button>
        </div>
      </div>

      {/* Desktop Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="hidden md:table-row bg-slate-50/30"
          >
            <td colSpan={6} className="px-6 py-4">
              <div className="grid grid-cols-3 gap-8 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-tighter">Processing Fees</p>
                  <p className="text-slate-700 font-medium">{lender.details.fees}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-tighter">Foreclosure / Prepayment</p>
                  <p className="text-slate-700 font-medium">{lender.details.prepayment}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-tighter">Lender Eligibility</p>
                  <p className="text-slate-700 font-medium">{lender.details.eligibility}</p>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}

interface DashboardProps {
  data: FinancialData;
  profile: RiskProfile;
  onReset: () => void;
  viewMode?: 'dashboard' | 'insights' | 'risk';
  onNavigate?: (view: 'wizard' | 'dashboard' | 'insights' | 'risk' | 'customer') => void;
}

export function Dashboard({ data, profile, onReset, viewMode = 'dashboard', onNavigate }: DashboardProps) {
  const [sortBy, setSortBy] = React.useState<'rate' | 'emi'>('rate');
  const [filterType, setFilterType] = React.useState<'all' | 'safe'>('all');

  // Sliders state for 'insights' mode
  const [simulatedAmount, setSimulatedAmount] = React.useState<number>(data.loanRequirement.amount);
  const [simulatedTenure, setSimulatedTenure] = React.useState<number>(data.loanRequirement.tenureYears);

  // Stress-testing scenario state for 'risk' mode
  const [stressScenario, setStressScenario] = React.useState<'baseline' | 'rate' | 'income' | 'liability'>('baseline');

  const currentEmi = calculateEmi(
    data.loanRequirement.amount,
    data.loanRequirement.interestRate,
    data.loanRequirement.tenureYears
  );

  const rawLenders = [
    { 
      name: 'Standard Chartered', 
      rate: 7.99, 
      tenure: simulatedTenure, 
      color: 'text-emerald-700',
      preApproved: profile.score > 750,
      details: { fees: '0.5%', prepayment: 'Nil foreclosure charges', eligibility: 'CIBIL > 750, Salaried' }
    },
    { 
      name: 'Axis Digital Finance', 
      rate: 8.45, 
      tenure: simulatedTenure, 
      color: 'text-rose-700',
      preApproved: profile.score > 800,
      details: { fees: '1% + Tax', prepayment: '2% if closed within 1yr', eligibility: 'Min income ₹30k/mo' }
    },
    { 
      name: 'HDFC Instant Loan', 
      rate: 8.70, 
      tenure: simulatedTenure, 
      color: 'text-blue-700',
      preApproved: profile.score > 700,
      details: { fees: '₹1,499 flat', prepayment: '1% of outstanding principal', eligibility: 'Min age 23' }
    },
    { 
      name: 'ICICI Smart Borrow', 
      rate: 9.10, 
      tenure: simulatedTenure, 
      color: 'text-orange-700',
      preApproved: profile.score > 720,
      details: { fees: 'Max 2.5%', prepayment: 'Nil after 6 EMIs', eligibility: 'Existing customer preferred' }
    },
    { 
      name: 'Bajaj Finserv Plus', 
      rate: 11.25, 
      tenure: simulatedTenure, 
      color: 'text-blue-900',
      preApproved: profile.score > 650,
      details: { fees: '₹499 Processing', prepayment: 'Zero charges', eligibility: 'PAN & Aadhaar linked' }
    },
  ];

  // Helper values
  const totalIncome = data.monthlyIncome + (data.variableIncome / 12);
  const totalExpenses = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalLiabilities = data.existingEmis + data.otherDebts;

  // Processed Lenders based on simulated sliders
  const processedLenders = rawLenders
    .filter(l => {
      if (filterType === 'safe') {
        const emi = calculateEmi(simulatedAmount, l.rate, l.tenure);
        return ((totalLiabilities + emi) / totalIncome) * 100 < 40;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rate') return a.rate - b.rate;
      const emiA = calculateEmi(simulatedAmount, a.rate, a.tenure);
      const emiB = calculateEmi(simulatedAmount, b.rate, b.tenure);
      return emiA - emiB;
    });

  // Calculate dynamic average EMI based on the current lenders list
  const averageRate = processedLenders.reduce((sum, l) => sum + l.rate, 0) / (processedLenders.length || 1);
  const averageEmi = calculateEmi(simulatedAmount, averageRate, simulatedTenure);
  const totalInterestPayable = Math.max(0, (averageEmi * simulatedTenure * 12) - simulatedAmount);

  // Amortization schedule for trend visualization
  const amortizationData = React.useMemo(() => {
    const rateToUse = isNaN(averageRate) || averageRate <= 0 ? 8.5 : averageRate;
    return calculateAmortization(simulatedAmount, rateToUse, simulatedTenure);
  }, [simulatedAmount, averageRate, simulatedTenure]);

  // Savings growth projection dataset based on Surplus
  const savingsProjectionData = React.useMemo(() => {
    const surplusVal = profile.disposableIncome > 0 ? profile.disposableIncome : 0;
    const monthlyRate = 0.06 / 12; // 6% annual rate
    const list = [];
    let cashSum = 0;
    let investedSum = 0;
    
    list.push({
      name: 'Start',
      month: 0,
      cash: 0,
      invested: 0
    });

    for (let m = 1; m <= 12; m++) {
      cashSum += surplusVal;
      investedSum = (investedSum + surplusVal) * (1 + monthlyRate);
      list.push({
        name: `Mo ${m}`,
        month: m,
        cash: Math.round(cashSum),
        invested: Math.round(investedSum),
      });
    }
    return list;
  }, [profile.disposableIncome]);

  // Scenario Math for 'risk' tab
  const getStressScenarioMetrics = () => {
    switch (stressScenario) {
      case 'rate': {
        const rateEmi = calculateEmi(data.loanRequirement.amount, data.loanRequirement.interestRate + 2.5, data.loanRequirement.tenureYears);
        const dtiVal = ((totalLiabilities + rateEmi) / totalIncome) * 100;
        const surplusVal = totalIncome - totalExpenses - totalLiabilities - rateEmi;
        const scoreVal = Math.max(15, profile.score - 15);
        const cat = dtiVal > 50 ? RiskCategory.HIGH : dtiVal > 35 ? RiskCategory.MODERATE : RiskCategory.LOW;
        return { emi: rateEmi, dti: Math.round(dtiVal * 10) / 10, surplus: Math.round(surplusVal), score: scoreVal, category: cat, label: 'Interest Rate Shock (+2.5% Rate)' };
      }
      case 'income': {
        const shockIncome = totalIncome * 0.8;
        const dtiVal = ((totalLiabilities + currentEmi) / shockIncome) * 100;
        const surplusVal = shockIncome - totalExpenses - totalLiabilities - currentEmi;
        const scoreVal = Math.max(15, profile.score - 25);
        const cat = dtiVal > 50 ? RiskCategory.HIGH : dtiVal > 35 ? RiskCategory.MODERATE : RiskCategory.LOW;
        return { emi: currentEmi, dti: Math.round(dtiVal * 10) / 10, surplus: Math.round(surplusVal), score: scoreVal, category: cat, label: 'Income Squeeze (-20% Income)' };
      }
      case 'liability': {
        const shockLiabilities = totalLiabilities + 15000;
        const dtiVal = ((shockLiabilities + currentEmi) / totalIncome) * 100;
        const surplusVal = totalIncome - totalExpenses - shockLiabilities - currentEmi;
        const scoreVal = Math.max(15, profile.score - 20);
        const cat = dtiVal > 50 ? RiskCategory.HIGH : dtiVal > 35 ? RiskCategory.MODERATE : RiskCategory.LOW;
        return { emi: currentEmi, dti: Math.round(dtiVal * 10) / 10, surplus: Math.round(surplusVal), score: scoreVal, category: cat, label: 'Emergency Expense (+₹15,000 EMIs)' };
      }
      case 'baseline':
      default:
        return { emi: currentEmi, dti: profile.dti, surplus: profile.disposableIncome, score: profile.score, category: profile.category, label: 'Baseline (Current Verified Profile)' };
    }
  };

  const activeScenario = getStressScenarioMetrics();

  // Surplus stress testing dataset
  const baselineSurplus = profile.disposableIncome;
  const rateShockSurplus = Math.round(totalIncome - totalExpenses - totalLiabilities - calculateEmi(data.loanRequirement.amount, data.loanRequirement.interestRate + 2.5, data.loanRequirement.tenureYears));
  const incomeSqueezeSurplus = Math.round((totalIncome * 0.8) - totalExpenses - totalLiabilities - currentEmi);
  const emergencySurplus = Math.round(totalIncome - totalExpenses - (totalLiabilities + 15000) - currentEmi);

  const stressChartData = [
    { name: 'Baseline', Surplus: baselineSurplus, fill: baselineSurplus > 0 ? '#10b981' : '#f43f5e' },
    { name: 'Rate Shock', Surplus: rateShockSurplus, fill: rateShockSurplus > 0 ? '#10b981' : '#f43f5e' },
    { name: 'Income Squeeze', Surplus: incomeSqueezeSurplus, fill: incomeSqueezeSurplus > 0 ? '#10b981' : '#f43f5e' },
    { name: 'Emergency Bill', Surplus: emergencySurplus, fill: emergencySurplus > 0 ? '#10b981' : '#f43f5e' },
  ];

  // Allocation pie chart dataset for Lead Dashboard
  const allocationData = [
    { name: 'Surplus Cash', value: Math.max(0, profile.disposableIncome), color: '#3b82f6' },
    { name: 'Core Expenses', value: totalExpenses, color: '#f59e0b' },
    { name: 'Debt Payments', value: totalLiabilities, color: '#ec4899' },
  ];

  const getRiskColor = (cat: RiskCategory) => {
    switch (cat) {
      case RiskCategory.LOW: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case RiskCategory.MODERATE: return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case RiskCategory.HIGH: return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getBgColor = (cat: RiskCategory) => {
    switch (cat) {
      case RiskCategory.LOW: return 'bg-emerald-600';
      case RiskCategory.MODERATE: return 'bg-orange-500';
      case RiskCategory.HIGH: return 'bg-rose-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* RENDER MODE 1: EXECUTIVE LEAD DASHBOARD */}
      {viewMode === 'dashboard' && (
        <div className="grid grid-cols-12 gap-6">
          
          {/* Top Welcome & Navigation Quick Cards */}
          <div className="col-span-12">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">Executive Summary</span>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Active Portfolio: {data.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lead portfolio generated. Verification checks complete. Select below to drill down.</p>
                </div>
                <button 
                  onClick={onReset}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Re-run Wizard
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div 
                  onClick={() => onNavigate?.('customer')}
                  className="bg-slate-50/50 hover:bg-blue-50/50 dark:bg-slate-950/40 dark:hover:bg-blue-950/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 cursor-pointer transition-all flex items-center gap-4 group hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:text-white transition-all">
                    05
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Experience</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Open Interactive Portal →</p>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigate?.('insights')}
                  className="bg-slate-50/50 hover:bg-indigo-50/50 dark:bg-slate-950/40 dark:hover:bg-indigo-950/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 cursor-pointer transition-all flex items-center gap-4 group hover:border-indigo-200 dark:hover:border-indigo-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white transition-all">
                    03
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Simulated Proposals</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Compare {rawLenders.length} Offers & rates →</p>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigate?.('risk')}
                  className="bg-slate-50/50 hover:bg-rose-50/50 dark:bg-slate-950/40 dark:hover:bg-rose-950/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 cursor-pointer transition-all flex items-center gap-4 group hover:border-rose-200 dark:hover:border-rose-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:text-white transition-all">
                    04
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resilience Check</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400">Stress-Test Macro Shocks →</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Left Panel: Primary Budget & DTI details */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                Income Allocation Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Allocation Pie Chart */}
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {allocationData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gross Income</span>
                    <span className="text-md font-mono font-black text-slate-800">{formatCurrency(totalIncome)}</span>
                  </div>
                </div>

                {/* Key indicators side summary */}
                <div className="space-y-4">
                  {allocationData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-xs font-mono font-black text-slate-800">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DTI and Max Liability metrics side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DTI Health Meter</p>
                  <Info className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-3xl lg:text-4xl font-black text-slate-800">{profile.dti}%</span>
                  <div className="flex flex-col mb-1.5">
                    <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded", 
                      profile.dti < 35 ? "bg-emerald-100 text-emerald-700" : 
                      profile.dti < 50 ? "bg-orange-100 text-orange-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {profile.dti < 35 ? 'Safe' : profile.dti < 50 ? 'Fair' : 'Extreme'}
                    </span>
                  </div>
                </div>
                
                <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400 w-[35%] border-r border-white/50" />
                  <div className="h-full bg-orange-400 w-[15%] border-r border-white/50" />
                  <div className="h-full bg-rose-400 flex-1" />
                  <motion.div 
                    initial={{ left: 0 }}
                    animate={{ left: `${Math.min(profile.dti, 100)}%` }}
                    className="absolute top-0 bottom-0 w-1.5 bg-slate-900 shadow-sm z-10"
                  />
                </div>
                <div className="flex justify-between mt-2 text-[8px] font-black text-slate-400 uppercase">
                  <span>0%</span>
                  <span>35%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Max Monthly Liability</p>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl lg:text-4xl font-black text-slate-800">{formatCurrency(totalIncome * 0.4)}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Standard 40% regulatory threshold calculated</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Scoring Gauge & Advisor Insight */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Financial Credit Rating</h3>
                <div className="flex items-center gap-6">
                   <div className={cn("w-24 h-24 border-4 rounded-full flex flex-col items-center justify-center relative shrink-0", profile.category === RiskCategory.LOW ? "border-emerald-500" : "border-orange-500")}>
                      <span className="text-3.5xl font-mono font-black">{profile.score}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-bold">score</span>
                      <span className={cn("absolute -bottom-2 text-[8px] px-2 py-0.5 rounded font-black tracking-widest text-white whitespace-nowrap", getBgColor(profile.category))}>
                        {profile.category.toUpperCase()}
                      </span>
                   </div>
                   <div className="space-y-3">
                     <p className="text-xs text-slate-300 leading-relaxed italic font-medium">
                       {profile.category === RiskCategory.LOW 
                        ? "Optimal liquidity buffer. The profile is fully prepared to handle secondary debt facilities."
                        : "Moderate financial leverage detected. Consider reducing existing debts to lower overall DTI risk."}
                     </p>
                     <div className="flex gap-2">
                       <span className={cn("text-[9px] px-2 py-1 rounded border font-bold uppercase", getRiskColor(profile.category))}>
                         {profile.category}
                       </span>
                     </div>
                   </div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>

            {/* AI Advisor Prompt Box */}
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-lg font-black flex-shrink-0 mt-0.5">!</div>
              <div className="space-y-1">
                 <p className="text-xs font-black text-orange-800 dark:text-orange-350 uppercase tracking-tight">AI Advisor Insight</p>
                 <p className="text-[10.5px] text-orange-700 dark:text-orange-300 leading-relaxed font-medium">
                   {profile.recommendations[0] || "Your debt profile suggests you could save by consolidating existing debts into this new loan product."}
                 </p>
              </div>
            </div>
          </div>

          {/* Projected Savings & Wealth Accumulation over 12 Months */}
          <div className="col-span-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors duration-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                    Wealth Accelerator Projections
                  </span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-indigo-500" />
                    12-Month Projected Savings & Investment Growth
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Based on your verified monthly cash surplus of{" "}
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      {formatCurrency(profile.disposableIncome)}
                    </span>
                    . See how your net surplus compounds over 12 months.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                    <span className="text-slate-500 dark:text-slate-400">Standard Cash Savings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
                    <span className="text-slate-500 dark:text-slate-400">High-Yield Wealth Plan (6.0% p.a.)</span>
                  </div>
                </div>
              </div>

              {profile.disposableIncome <= 0 ? (
                <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="text-sm font-black text-rose-800 dark:text-rose-300">Negative or Zero Surplus Detected</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400 max-w-lg mx-auto">
                    Your current expenses and debt liabilities exceed or consume your gross monthly income, leaving no remaining surplus. Reduce non-essential expenses or consolidate debts to establish a healthy savings trajectory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Chart section */}
                  <div className="lg:col-span-8">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={savingsProjectionData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                            </linearGradient>
                            <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            fontWeight="bold"
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            fontWeight="bold"
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(val) => formatCurrency(val)}
                          />
                          <ReTooltip 
                            formatter={(value, name) => [formatCurrency(value as number), name]}
                            contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                            labelStyle={{ color: "#94a3b8", fontSize: "10px", marginBottom: "4px" }}
                            labelFormatter={(label) => `Projection: ${label}`}
                          />
                          <Area 
                            name="Cash Savings"
                            type="monotone" 
                            dataKey="cash" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#cashGrad)" 
                          />
                          <Area 
                            name="Wealth Investment (6.0% p.a.)"
                            type="monotone" 
                            dataKey="invested" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#investedGrad)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Bento Stats section */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-950/50 border border-blue-100/50 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Accumulated Cash</span>
                      </div>
                      <p className="text-xl font-mono font-black text-slate-800 dark:text-slate-100">
                        {formatCurrency(12 * profile.disposableIncome)}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Simple linear sum without compounding interest</p>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-950/50 border border-indigo-100/50 dark:border-slate-800/80 relative overflow-hidden">
                      <div className="absolute top-2 right-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Invested Wealth</span>
                      </div>
                      <p className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(savingsProjectionData[savingsProjectionData.length - 1]?.invested || 0)}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Compounded monthly at conservative 6.0% p.a.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-slate-950/50 border border-emerald-100/50 dark:border-slate-800/80">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Incremental Gained Wealth</span>
                      <p className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(
                          (savingsProjectionData[savingsProjectionData.length - 1]?.invested || 0) - (12 * profile.disposableIncome)
                        )}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Extra wealth unlocked by active investing</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Optimal Debt Repayment Strategy Tool */}
          <DebtPayoffStrategist data={data} profile={profile} />

        </div>
      )}

      {/* RENDER MODE 2: PERSONALIZED LOAN RESULTS ENGINE */}
      {viewMode === 'insights' && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Proposal Matcher</span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Interactive Loan Results Model</h2>
              <p className="text-sm text-slate-500 mt-1">Adjust the sliders in real-time to compute the exact EMIs and check eligibility against major financial institutions.</p>
            </div>
          </div>

          {/* Interactive Calculator Simulator Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="glass-card p-6 bg-slate-900 text-white border-none shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                Dynamic Modeler
              </h3>
              
              <div className="space-y-6">
                {/* Slider 1: Loan Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Principal Amount</label>
                    <span className="font-mono font-black text-indigo-400 text-sm">{formatCurrency(simulatedAmount)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="5000000" 
                    step="50000" 
                    value={simulatedAmount}
                    onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                    <span>₹50K</span>
                    <span>₹25L</span>
                    <span>₹50L</span>
                  </div>
                </div>

                {/* Slider 2: Tenure Years */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Repayment Period</label>
                    <span className="font-mono font-black text-indigo-400 text-sm">{simulatedTenure} Years</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    step="1" 
                    value={simulatedTenure}
                    onChange={(e) => setSimulatedTenure(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                    <span>1 Year</span>
                    <span>8 Years</span>
                    <span>15 Years</span>
                  </div>
                </div>
              </div>

              {/* Recalculated Indicators Box */}
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Recalculated Average EMI</p>
                  <p className="text-3xl font-mono font-black text-white tracking-tighter">{formatCurrency(averageEmi)}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">Based on simulated inputs</p>
                </div>
              </div>
            </div>

            {/* Interest vs Principal Amortization Chart */}
            <div className="glass-card p-6 bg-white">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Interest vs Principal Allocation</h4>
              <div className="h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Principal Amount', value: simulatedAmount, color: '#6366f1' },
                        { name: 'Interest Cost', value: totalInterestPayable, color: '#cbd5e1' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill="#6366f1" />
                      <Cell key="cell-1" fill="#cbd5e1" />
                    </Pie>
                    <ReTooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4 text-[10px] font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Principal</span>
                  <span className="font-mono text-slate-800">{formatCurrency(simulatedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interest Cost</span>
                  <span className="font-mono text-indigo-600">{formatCurrency(totalInterestPayable)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table & Trend Chart Panel */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Repayment Timeline & Principal Reduction Trend Chart */}
            <div className="glass-card p-6 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-md font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Repayment Trajectory & Balance Melting Curve
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    See how your outstanding principal of {formatCurrency(simulatedAmount)} reduces to zero over the {simulatedTenure}-year repayment timeline.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-[10px] font-black uppercase">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
                    <span className="text-slate-500">Remaining Principal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                    <span className="text-slate-500">Cumulative Interest</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={amortizationData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      fontWeight="bold"
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      fontWeight="bold"
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => formatCurrency(val)}
                    />
                    <ReTooltip 
                      formatter={(value, name) => [formatCurrency(value as number), name]}
                      contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                      labelStyle={{ color: "#94a3b8", fontSize: "10px", marginBottom: "4px" }}
                      labelFormatter={(label) => `Timeline Step: ${label}`}
                    />
                    <Area 
                      name="Outstanding Principal"
                      type="monotone" 
                      dataKey="remainingPrincipal" 
                      stroke="#6366f1" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#principalGrad)" 
                    />
                    <Area 
                      name="Cumulative Interest Paid"
                      type="monotone" 
                      dataKey="cumulativeInterestPaid" 
                      stroke="#f59e0b" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fillOpacity={1} 
                      fill="url(#interestGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Simulated Proposals
                </h3>
                <div className="flex flex-wrap gap-2">
                   <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as 'rate' | 'emi')}
                    className="text-[10px] font-black uppercase tracking-widest bg-slate-100 border-none rounded-lg px-3 py-2 cursor-pointer focus:ring-0"
                   >
                      <option value="rate">Sort: Lowest Interest</option>
                      <option value="emi">Sort: Lowest EMI</option>
                   </select>
                   <button 
                    onClick={() => setFilterType(filterType === 'all' ? 'safe' : 'all')}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all border",
                      filterType === 'safe' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"
                    )}
                   >
                     {filterType === 'safe' ? 'Showing Sustainable' : 'All Proposals'}
                   </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 hidden md:table-header-group">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lender</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interest Rate</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenure</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly EMI</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Scenario Impact</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 flex flex-col md:table-row-group">
                    {processedLenders.map((lender, i) => {
                      const emi = calculateEmi(simulatedAmount, lender.rate, lender.tenure);
                      return (
                        <LoanRow 
                          key={`${lender.name}-${i}`}
                          lender={lender}
                          data={{
                            ...data,
                            loanRequirement: {
                              amount: simulatedAmount,
                              tenureYears: simulatedTenure,
                              interestRate: lender.rate
                            }
                          }}
                          emi={emi}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  * Dynamic EMI simulated in real-time. Lender approval subject to financial validation checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER MODE 3: FINANCIAL RISK MAP & SCENARIO STRESS TESTING */}
      {viewMode === 'risk' && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">Stress Diagnostics</span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Macroeconomic Stress-Testing</h2>
              <p className="text-sm text-slate-500 mt-1">Simulate credit rating shifts and buffer liquidities against unexpected structural and market shocks.</p>
            </div>
          </div>

          {/* Scenario Selector & Core Shock Dashboard */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                Select Stress Shock
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: 'baseline', label: 'Baseline', desc: 'Current verified financial state', icon: '🟢' },
                  { id: 'rate', label: 'Rate Shock (+2.5% Rate)', desc: 'Macro interest rate hikes on floating EMI', icon: '⚡' },
                  { id: 'income', label: 'Income Squeeze (-20% Income)', desc: 'Temporary corporate wage slowdown', icon: '📉' },
                  { id: 'liability', label: 'Emergency Expense (+₹15K EMIs)', desc: 'Unforeseen home repair or health debt', icon: '🚨' }
                ].map((scen) => (
                  <div 
                    key={scen.id}
                    onClick={() => setStressScenario(scen.id as any)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all flex gap-4 items-center",
                      stressScenario === scen.id 
                        ? "bg-rose-50 border-rose-200" 
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                    )}
                  >
                    <span className="text-xl shrink-0">{scen.icon}</span>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-800 tracking-tight">{scen.label}</p>
                      <p className="text-[10px] font-medium text-slate-500">{scen.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Results under selected Stress Scenario */}
            <div className="glass-card p-6 bg-slate-900 text-white border-none relative overflow-hidden">
              <span className="text-[9px] font-black uppercase text-rose-400 tracking-widest block mb-1">Active Scenario Impact</span>
              <h4 className="text-lg font-black tracking-tight mb-6 text-white uppercase">{activeScenario.label}</h4>
              
              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Computed DTI</p>
                  <p className="text-2xl font-mono font-black text-rose-300">{activeScenario.dti}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Surplus</p>
                  <p className={cn("text-2xl font-mono font-black", activeScenario.surplus > 0 ? "text-emerald-400" : "text-rose-400")}>
                    {formatCurrency(activeScenario.surplus)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stress Score</p>
                  <p className="text-2xl font-mono font-black text-amber-400">{activeScenario.score} / 100</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rating Category</p>
                  <p className="text-md font-bold uppercase tracking-wider text-slate-200 mt-1">{activeScenario.category}</p>
                </div>
              </div>

              {/* Stress evaluation message */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                {activeScenario.surplus > 0 ? (
                  <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-3 text-[11px] text-emerald-400 font-bold">
                    🟢 RESILIENT BUFFER: Your portfolio remains solvent with {formatCurrency(activeScenario.surplus)} liquid surplus remaining under this stress shock. Safe to proceed.
                  </div>
                ) : (
                  <div className="bg-rose-950/50 border border-rose-900 rounded-xl p-3 text-[11px] text-rose-400 font-bold">
                    ⚠ CORE DEFAULT RISK: Under this stress shock, your financial buffer defaults into a negative surplus of {formatCurrency(activeScenario.surplus)}. We recommend lowering your loan requirement.
                  </div>
                )}
              </div>
              <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Scenario Comparison Chart & Recommendations */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                Liquidity Buffer Comparison (Monthly Surplus)
              </h3>
              
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stressChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }} formatter={(v) => `₹${v/1000}k`} />
                    <ReTooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="Surplus">
                      {stressChartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold text-center mt-4 uppercase tracking-wider">
                * Green indicates liquid financial health; red indicates deficit risk.
              </p>
            </div>

            {/* Recommendations List */}
            <div className="glass-card p-6 bg-white space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Action-oriented Portfolio Corrections
              </h3>
              
              <div className="space-y-3">
                {[
                  { title: 'Setup automated EMI repayments', desc: 'Can yield immediate credit scoring improvements by eliminating late payment risk vectors.', icon: '⚡' },
                  { title: 'Prepay highest interest rate liability first', desc: 'Consolidating and closing high interest lines instantly collapses your baseline DTI.', icon: '📉' },
                  { title: 'Maintain emergency fund equivalent to 6-months EMIs', desc: 'Secures your family buffer against temporary wage/income squeezes without default risk.', icon: '🛡️' }
                ].map((rec, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-lg shrink-0 mt-0.5">{rec.icon}</span>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{rec.title}</p>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">{rec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

