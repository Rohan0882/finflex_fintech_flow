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
  Legend
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
  Info
} from 'lucide-react';
import { FinancialData, RiskCategory, RiskProfile } from '../types';
import { calculateEmi, formatCurrency } from '../utils/finance';
import { cn } from '../lib/utils';
import { 
  motion,
  AnimatePresence
} from 'motion/react';

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
      <tr className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
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
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50/30"
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
}

export function Dashboard({ data, profile, onReset }: DashboardProps) {
  const [sortBy, setSortBy] = React.useState<'rate' | 'emi'>('rate');
  const [filterType, setFilterType] = React.useState<'all' | 'safe'>('all');

  const currentEmi = calculateEmi(
    data.loanRequirement.amount,
    data.loanRequirement.interestRate,
    data.loanRequirement.tenureYears
  );

  const rawLenders = [
    { 
      name: 'Stan Chart (OG)', 
      rate: 7.99, 
      tenure: data.loanRequirement.tenureYears, 
      color: 'text-emerald-700',
      preApproved: profile.score > 750,
      details: { fees: '0.5%', prepayment: 'Nil foreclosure charges', eligibility: 'CIBIL > 750, Salaried' }
    },
    { 
      name: 'Axis Swift (Digital)', 
      rate: 8.45, 
      tenure: data.loanRequirement.tenureYears, 
      color: 'text-rose-700',
      preApproved: profile.score > 800,
      details: { fees: '1% + Tax', prepayment: '2% if closed within 1yr', eligibility: 'Min income ₹30k/mo' }
    },
    { 
      name: 'HDFC (No Cap)', 
      rate: 8.70, 
      tenure: data.loanRequirement.tenureYears, 
      color: 'text-blue-700',
      preApproved: profile.score > 700,
      details: { fees: '₹1,499 flat', prepayment: '1% of outstanding principal', eligibility: 'Min age 23' }
    },
    { 
      name: 'ICICI (Smart Flex)', 
      rate: 9.10, 
      tenure: data.loanRequirement.tenureYears, 
      color: 'text-orange-700',
      preApproved: profile.score > 720,
      details: { fees: 'Max 2.5%', prepayment: 'Nil after 6 EMIs', eligibility: 'Existing customer preferred' }
    },
    { 
      name: 'Bajaj (Fast Stacks)', 
      rate: 11.25, 
      tenure: data.loanRequirement.tenureYears, 
      color: 'text-blue-900',
      preApproved: profile.score > 650,
      details: { fees: '₹499 Processing', prepayment: 'Zero charges', eligibility: 'PAN & Aadhaar linked' }
    },
  ];

  const processedLenders = rawLenders
    .filter(l => {
      if (filterType === 'safe') {
        const emi = calculateEmi(data.loanRequirement.amount, l.rate, l.tenure);
        const totalIncome = data.monthlyIncome + (data.variableIncome / 12);
        return ((data.existingEmis + data.otherDebts + emi) / totalIncome) * 100 < 40;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rate') return a.rate - b.rate;
      const emiA = calculateEmi(data.loanRequirement.amount, a.rate, a.tenure);
      const emiB = calculateEmi(data.loanRequirement.amount, b.rate, b.tenure);
      return emiA - emiB;
    });

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
    <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
      {/* Left Column: Input Simulation & Primary Metrics */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            FinFlex Vibe Hub
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Requested Bread</label>
                <div className="text-xl font-mono font-bold text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  {formatCurrency(data.loanRequirement.amount)}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Interest Rate (PA)</label>
                <div className="text-xl font-mono font-bold text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  {data.loanRequirement.interestRate}%
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Tenure (Years)</label>
                <span className="font-mono font-bold text-blue-600">{data.loanRequirement.tenureYears} Years</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.loanRequirement.tenureYears / 20) * 100}%` }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-tight uppercase">Monthly Damage (EMI)</p>
              <p className="text-3xl font-mono font-black text-slate-800 tracking-tighter">{formatCurrency(currentEmi)}</p>
            </div>
            <div className="text-right">
              {profile.category !== RiskCategory.HIGH ? (
                <>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">✓ W Choice</p>
                  <p className="text-[11px] text-slate-500 leading-snug lg:max-w-[180px]">
                    Gucci! Well within your monthly surplus.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">⚠ Massive Red Flag</p>
                  <p className="text-[11px] text-slate-500 leading-snug lg:max-w-[180px]">
                    This is pushing it. The math ain't mathing.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DTI Health Meter</p>
              <Info className="w-3 h-3 text-slate-300" />
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-black text-slate-800">{profile.dti}%</span>
              <div className="flex flex-col mb-1.5">
                <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded", 
                  profile.dti < 35 ? "bg-emerald-100 text-emerald-700" : 
                  profile.dti < 50 ? "bg-orange-100 text-orange-700" : "bg-rose-100 text-rose-700"
                )}>
                  {profile.dti < 35 ? 'Safe' : profile.dti < 50 ? 'Fair' : 'Extreme'}
                </span>
              </div>
            </div>
            
            {/* Multi-segment DTI Bar */}
            <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-400 w-[35%] border-r border-white/50" />
              <div className="h-full bg-orange-400 w-[15%] border-r border-white/50" />
              <div className="h-full bg-rose-400 flex-1" />
              
              {/* Pointer */}
              <motion.div 
                initial={{ left: 0 }}
                animate={{ left: `${Math.min(profile.dti, 100)}%` }}
                className="absolute top-0 bottom-0 w-1 bg-slate-900 shadow-sm z-10"
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
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Max Monthly Liability</p>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-black text-slate-800">{formatCurrency((data.monthlyIncome + (data.variableIncome / 12)) * 0.4)}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Standard 40% threshold calculated</p>
          </div>
        </div>
      </div>

      {/* Right Column: Risk & Recommendations */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Financial Health Analysis</h3>
            <div className="flex items-center gap-6">
               <div className={cn("w-24 h-24 border-4 rounded-full flex flex-col items-center justify-center relative", profile.category === RiskCategory.LOW ? "border-blue-500" : "border-orange-500")}>
                  <span className="text-3xl font-black">{profile.score}</span>
                  <span className={cn("absolute -bottom-2 text-[8px] px-2 py-0.5 rounded font-black tracking-widest", getBgColor(profile.category))}>
                    {profile.category.toUpperCase()}
                  </span>
               </div>
               <div className="space-y-3">
                 <p className="text-xs text-slate-300 leading-relaxed italic">
                   {profile.category === RiskCategory.LOW 
                    ? "Low credit risk exposure detected. Your profile is optimized for approval."
                    : "Moderate risk detected. Consider reducing existing liabilities first."}
                 </p>
                 <div className="flex gap-2">
                   <span className={cn("text-[9px] px-2 py-1 rounded border font-bold uppercase", getRiskColor(profile.category))}>
                     {profile.category}
                   </span>
                   {profile.score > 70 && (
                     <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 font-bold uppercase tracking-tighter">High Liquidity</span>
                   )}
                 </div>
               </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center justify-between">
            Simulated Loan Offers
            <span className="text-[10px] text-blue-600 underline cursor-pointer">Live Rates</span>
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Home Loan Special', rate: 8.2, status: 'Prime Rate', color: 'slate' },
              { label: 'Personal Flexi', rate: 10.5, status: 'Best Match', color: 'blue' },
              { label: 'Vehicle Finance', rate: 9.0, status: 'Safe Choice', color: 'slate' },
            ].map((offer, idx) => (
              <div key={idx} className={cn("p-3 rounded-xl flex items-center justify-between border", offer.color === 'blue' ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100")}>
                <div>
                  <p className={cn("text-xs font-bold", offer.color === 'blue' ? "text-blue-900" : "text-slate-800")}>{offer.label}</p>
                  <p className={cn("text-[10px]", offer.color === 'blue' ? "text-blue-600" : "text-slate-500")}>{offer.rate}% Int • Personalized</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-black", offer.color === 'blue' ? "text-blue-900" : "text-slate-800")}>{formatCurrency(calculateEmi(data.loanRequirement.amount, offer.rate, data.loanRequirement.tenureYears))}</p>
                  <p className={cn("text-[9px] font-bold uppercase", offer.status === 'Best Match' ? "text-emerald-600" : "text-slate-400")}>{offer.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loan Comparison Table Section */}
        <div className="lg:col-span-12 glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Loan Comparison Engine
            </h3>
            <div className="flex flex-wrap gap-2">
               <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'rate' | 'emi')}
                className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 border-none rounded-lg px-3 py-2 cursor-pointer focus:ring-0"
               >
                  <option value="rate">Sort: Lowest Interest</option>
                  <option value="emi">Sort: Lowest EMI</option>
               </select>
               <button 
                onClick={() => setFilterType(filterType === 'all' ? 'safe' : 'all')}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-all border",
                  filterType === 'safe' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
                )}
               >
                 {filterType === 'safe' ? 'Showing Sustainable' : 'All Proposals'}
               </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lender</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1 cursor-help" title={`Lender's annual interest rate applied to your requested principal of ${formatCurrency(data.loanRequirement.amount)}.`}>
                      Interest Rate <Info className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenure</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1 cursor-help" title={`Monthly repayment for ${formatCurrency(data.loanRequirement.amount)} over ${data.loanRequirement.tenureYears} years using standard EMI amortization.`}>
                      Estimated EMI <Info className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Scenario Impact</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedLenders.map((lender, i) => {
                  const emi = calculateEmi(data.loanRequirement.amount, lender.rate, lender.tenure);
                  return (
                    <LoanRow 
                      key={`${lender.name}-${i}`}
                      lender={lender}
                      data={data}
                      emi={emi}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              * Note: These rates are indicative. Actual interest rates depend on your credit score (CIBIL) and documentation.
            </p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-lg flex-shrink-0 mt-1">!</div>
          <div className="space-y-1">
             <p className="text-xs font-bold text-orange-800 uppercase tracking-tight">The Tea ☕</p>
             <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
               {profile.recommendations[0] || "Your debt profile suggests you could save by consolidating existing debts into this new loan product."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
