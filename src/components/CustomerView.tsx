import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  History, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Download,
  AlertCircle,
  Award,
  Sparkles,
  Heart,
  Palette,
  Trophy,
  Target,
  Star,
  Gem,
  Crown,
  Zap,
  Activity,
  Flower2,
  X
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { FinancialData, RiskProfile } from '../types';

interface CustomerViewProps {
  data: FinancialData | null;
  profile: RiskProfile | null;
}

export function CustomerView({ data, profile }: CustomerViewProps) {
  const [selectedIconId, setSelectedIconId] = React.useState<string | null>(null);
  const [isIconModalOpen, setIsIconModalOpen] = React.useState(false);
  const [topUpState, setTopUpState] = React.useState<{
    isOpen: boolean;
    status: 'idle' | 'submitting' | 'result';
    amount: number;
    isApproved: boolean;
  }>({ isOpen: false, status: 'idle', amount: 200000, isApproved: false });

  // If no data, show placeholder or prompt
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">No active session found</p>
        <p className="text-xs">Complete the EMI Engine wizard first.</p>
      </div>
    );
  }

  const isMale = data.gender === 'male';
  const isFemale = data.gender === 'female';
  
  const activeLoan = {
    lender: 'HDFC Bank',
    loanType: 'Personal Loan',
    principal: 500000,
    outstanding: 345000,
    emi: 12500,
    tenure: 48,
    paidMonths: 14,
    interestRate: 10.5,
    nextEmiDate: '05 June 2026',
    status: profile?.score && profile.score > 750 ? 'In Form' : 'Pending'
  };

  const handleApplyTopUp = () => {
    setTopUpState(prev => ({ ...prev, status: 'submitting' }));
    
    // Simulate approval process with realistic factors
    setTimeout(() => {
      const creditScore = profile?.score || 0;
      const dti = profile?.dti || 0;
      
      // Calculate pseudo-utilization / financial stress
      const totalMonthlyObligations = data.existingEmis + (data.otherDebts / 12);
      const monthlyIncome = data.monthlyIncome + (data.variableIncome / 12);
      const financialStress = (totalMonthlyObligations / (monthlyIncome || 1)) * 100;

      // Approval criteria:
      // 1. High Credit Score (>715)
      // 2. Healthy DTI ratio (<40%)
      // 3. Low Financial Stress (<45%)
      const approved = creditScore > 715 && dti < 40 && financialStress < 45;
      
      setTopUpState(prev => ({ ...prev, status: 'result', isApproved: approved }));
    }, 2500);
  };

  const getMatchStatus = (status: string) => {
    if (isMale) {
      return status === 'In Form' ? 'Batting Strong' : 'Ready to Bowl';
    }
    if (isFemale) {
      return status === 'In Form' ? 'Princess Level' : 'Magical Quest';
    }
    return status;
  };

  const personaIcons = {
    male: [
      { id: 'trophy', icon: Trophy, label: 'Trophy' },
      { id: 'target', icon: Target, label: 'Target' },
      { id: 'award', icon: Award, label: 'Award' },
      { id: 'zap', icon: Zap, label: 'Power' },
      { id: 'shield', icon: ShieldCheck, label: 'Defense' },
      { id: 'activity', icon: Activity, label: 'Stats' },
    ],
    female: [
      { id: 'sparkles', icon: Sparkles, label: 'Sparkle' },
      { id: 'heart', icon: Heart, label: 'Heart' },
      { id: 'star', icon: Star, label: 'Star' },
      { id: 'gem', icon: Gem, label: 'Gem' },
      { id: 'crown', icon: Crown, label: 'Crown' },
      { id: 'flower', icon: Flower2, label: 'Flower' },
    ]
  };

  const getCurrentIcon = () => {
    const palette = isMale ? personaIcons.male : personaIcons.female;
    if (selectedIconId) {
      return palette.find(i => i.id === selectedIconId)?.icon || (isMale ? Trophy : Sparkles);
    }
    return isMale ? (activeLoan.status === 'In Form' ? Trophy : Target) : isFemale ? Sparkles : ShieldCheck;
  };

  const CurrentThemeIcon = getCurrentIcon();

  const progressPercentage = (activeLoan.paidMonths / activeLoan.tenure) * 100;

  // Theme Config
  const theme = {
    primary: isMale ? (activeLoan.status === 'In Form' ? 'bg-emerald-800' : 'bg-blue-800') : isFemale ? 'bg-pink-400' : 'bg-slate-900',
    secondary: isMale ? (activeLoan.status === 'In Form' ? 'bg-emerald-900' : 'bg-blue-900') : isFemale ? 'bg-pink-500' : 'bg-slate-800',
    accent: isMale ? 'text-yellow-400' : isFemale ? 'text-white' : 'text-blue-400',
    border: isMale ? (activeLoan.status === 'In Form' ? 'border-emerald-700' : 'border-blue-700') : isFemale ? 'border-pink-300' : 'border-slate-700',
    text: isMale ? 'text-emerald-50' : isFemale ? 'text-pink-50' : 'text-slate-50',
    statusColor: isMale ? (activeLoan.status === 'In Form' ? 'bg-yellow-400 text-emerald-950' : 'bg-blue-400 text-white') : 'bg-white text-pink-500',
    icon: CurrentThemeIcon,
    label1: isMale ? 'Current Score (Outstanding)' : isFemale ? 'Magic Balance' : 'Outstanding',
    label2: isMale ? 'Required Run Rate (EMI)' : isFemale ? 'Sparkle Payment' : 'Monthly EMI',
    label3: isMale ? 'Pitch Progress' : isFemale ? 'Royal Journey' : 'Repayment Progress',
    cardClass: isMale ? 'rounded-none border-4 border-emerald-950' : isFemale ? 'rounded-[3rem] border-4 border-white' : 'rounded-2xl border border-slate-700',
    headingFont: isMale ? 'font-serif' : isFemale ? 'font-sans' : 'font-sans'
  };

  return (
    <div className={cn(
      "max-w-7xl mx-auto space-y-8 p-4 md:p-8 min-h-screen transition-colors duration-500",
      isMale ? "bg-emerald-50/50" : isFemale ? "bg-pink-50" : "bg-slate-50"
    )}>
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            {isMale && <div className="p-2 bg-emerald-600 text-white rounded-full"><Trophy className="w-5 h-5"/></div>}
            {isFemale && <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />}
            <h2 className={cn("text-4xl font-black tracking-tighter", isMale ? "text-emerald-900 uppercase italic" : isFemale ? "text-pink-600" : "text-slate-800")}>
              {isMale ? "Match Day Center" : isFemale ? "My Princess Dashboard" : "Active Loan Dashboard"}
            </h2>
            <button 
              onClick={() => setIsIconModalOpen(true)}
              className={cn(
                "p-1.5 rounded-full transition-all hover:rotate-12",
                isMale ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : 
                isFemale ? "bg-pink-100 text-pink-500 hover:bg-pink-200" : 
                "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
              title="Personalize Theme Icon"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
          <p className={cn("text-sm font-bold", isMale ? "text-emerald-700" : isFemale ? "text-pink-400" : "text-slate-500")}>
            Welcome back, {data.name}. {isMale ? "You're batting strongly on this pitch!" : isFemale ? "Your kingdom's treasury is looking magical!" : "Your repayments are up to date."}
          </p>
        </motion.div>
        
        <div className="flex gap-3">
          <button className={cn(
            "px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-all",
            isMale ? "bg-white border-2 border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white" : 
            isFemale ? "bg-pink-200 text-pink-700 rounded-full hover:bg-pink-300 shadow-lg shadow-pink-200" : 
            "btn-secondary"
          )}>
            Statement
          </button>
          <button className={cn(
            "px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-all",
            isMale ? "bg-yellow-400 text-emerald-950 border-2 border-emerald-950 hover:bg-emerald-950 hover:text-yellow-400" : 
            isFemale ? "bg-pink-500 text-white rounded-full hover:scale-105 shadow-xl shadow-pink-300" : 
            "btn-primary"
          )}>
            {isMale ? "Hit a Six (Prepay)" : isFemale ? "Add Magic (Prepay)" : "Prepay Loan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Gamified Card */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className={cn("p-10 relative overflow-hidden shadow-2xl", theme.primary, theme.text, theme.cardClass)}
          >
            {/* Theme Specific Decorative Elements */}
            {isMale && (
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-64 h-64 rotate-12" />
              </div>
            )}
            {isFemale && (
              <div className="absolute top-0 right-0 p-8">
                <Heart className="w-12 h-12 text-pink-300 fill-pink-300 animate-bounce" />
              </div>
            )}

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Primary Sponsor</p>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl", isMale ? "bg-emerald-950 text-yellow-400" : isFemale ? "bg-white text-pink-500" : "bg-white text-slate-800")}>H</div>
                    <div>
                      <span className="text-2xl font-black block leading-none">{activeLoan.lender}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{activeLoan.loanType}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{theme.label1}</p>
                    <p className={cn("text-3xl font-black", theme.accent)}>{formatCurrency(activeLoan.outstanding)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{theme.label2}</p>
                    <p className="text-3xl font-black">{formatCurrency(activeLoan.emi)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{theme.label3}</p>
                    <span className="text-[10px] font-mono font-bold">{activeLoan.paidMonths}/{activeLoan.tenure} {isMale ? "Overs" : isFemale ? "Steps" : "Months"}</span>
                  </div>
                  <div className={cn("relative h-6 group/progress flex items-center gap-[1px]", theme.secondary, "rounded-lg p-1 overflow-visible")}>
                    {Array.from({ length: activeLoan.tenure }).map((_, i) => {
                      const isPaid = i < activeLoan.paidMonths;
                      const cumulativePaid = (i + 1) * activeLoan.emi;
                      
                      return (
                        <div 
                          key={i}
                          className={cn(
                            "h-full flex-1 first:rounded-l-sm last:rounded-r-sm transition-all duration-300 relative group/segment",
                            isPaid 
                              ? (isMale ? "bg-yellow-400" : isFemale ? "bg-white" : "bg-blue-500") 
                              : "bg-white/10 hover:bg-white/20"
                          )}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover/segment:opacity-100 transition-opacity z-50">
                            <div className={cn(
                              "px-3 py-1.5 rounded-lg text-[9px] font-black whitespace-nowrap shadow-xl border",
                              isMale ? "bg-emerald-950 text-yellow-400 border-emerald-800" : 
                              isFemale ? "bg-pink-500 text-white border-pink-400" : 
                              "bg-slate-900 text-white border-slate-800"
                            )}>
                              <p className="uppercase tracking-tighter opacity-70">
                                {isPaid ? (isMale ? "Run Scored" : "Magic Gained") : (isMale ? "Target Run" : "Dream Cost")}
                              </p>
                              <p className="text-sm">{formatCurrency(activeLoan.emi)}</p>
                              {isPaid && (
                                <p className="mt-1 pt-1 border-t border-white/10 text-[8px] opacity-60">
                                  Total: {formatCurrency(cumulativePaid)}
                                </p>
                              )}
                            </div>
                            <div className={cn(
                              "w-2 h-2 rotate-45 mx-auto -mt-1 border-r border-b",
                              isMale ? "bg-emerald-950 border-emerald-800" : 
                              isFemale ? "bg-pink-500 border-pink-400" : 
                              "bg-slate-900 border-slate-800"
                            )}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={cn("rounded-3xl p-8 border flex flex-col justify-between", isMale ? "bg-emerald-950 border-emerald-800" : isFemale ? "bg-white/20 border-white/30 backdrop-blur-md" : "bg-white/5 border-white/10")}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-black flex items-center gap-2 uppercase">
                      <Clock className={cn("w-5 h-5", isMale ? "text-yellow-400" : isFemale ? "text-pink-100" : "text-orange-400")} /> 
                      {isMale ? "Next Over" : isFemale ? "Royal Ball" : "Next Payment"}
                    </h4>
                    <span className={cn("text-[10px] px-3 py-1 rounded-full font-black uppercase", isMale ? "bg-yellow-400 text-emerald-950" : isFemale ? "bg-white text-pink-500" : "bg-emerald-500 text-white")}>
                      Automated
                    </span>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">{activeLoan.nextEmiDate}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn("text-[10px] px-3 py-1 rounded-full font-black uppercase", theme.statusColor)}>
                      {getMatchStatus(activeLoan.status)}
                    </span>
                  </div>
                </div>
                <button className={cn(
                  "w-full mt-8 py-4 font-black text-sm uppercase tracking-widest transition-all shadow-2xl",
                  isMale ? "bg-emerald-600 hover:bg-emerald-500 text-white rounded-none" : 
                  isFemale ? "bg-white text-pink-500 rounded-full hover:scale-95" : 
                  "bg-blue-600 rounded-xl"
                )}>
                  {isMale ? "Reschedule Match" : isFemale ? "Change Ball Date" : "Reschedule"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Gamified History */}
          <div className={cn("p-8 overflow-hidden", isMale ? "bg-emerald-900 text-white rounded-none italic" : isFemale ? "bg-white rounded-[2.5rem] border-4 border-pink-100 shadow-xl" : "glass-card")}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                <History className={cn("w-6 h-6", isMale ? "text-yellow-400" : isFemale ? "text-pink-400" : "text-indigo-600")} />
                {isMale ? "Match Scorecard" : isFemale ? "Charm History" : "Repayment History"}
              </h3>
              <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", isMale ? "bg-emerald-800 border border-emerald-700" : "bg-slate-100 text-slate-500")}>
                Season 2026
              </div>
            </div>
            <div className="space-y-3">
              {['05 May', '05 April', '05 March'].map((date, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn("p-4 flex items-center justify-between border-b last:border-0", isMale ? "border-emerald-800 hover:bg-emerald-800/50" : "border-pink-50 hover:bg-pink-50/50")}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-black w-14">{date}</span>
                    <div className="h-8 w-px bg-current opacity-10" />
                    <span className="text-lg font-black font-mono">{formatCurrency(12500)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase font-black opacity-60">Auto-Debit</span>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isMale ? "bg-emerald-700 text-yellow-400" : isFemale ? "bg-pink-500 text-white" : "bg-emerald-100 text-emerald-600")}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Gamified Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={cn("p-8 relative overflow-hidden", isMale ? "bg-emerald-950 text-white rounded-none border-b-8 border-yellow-400" : isFemale ? "bg-pink-500 text-white rounded-[2rem] shadow-xl shadow-pink-200" : "glass-card")}
          >
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-6">{isMale ? "CIBIL Average" : isFemale ? "Tiara Points" : "Credit Score"}</h4>
            <div className="flex items-center gap-6">
              <div className={cn("w-24 h-24 rounded-full border-8 flex items-center justify-center font-black text-3xl", isMale ? "border-yellow-400 text-yellow-400" : "border-white/30 text-white")}>
                782
              </div>
              <div>
                <p className={cn("text-lg font-black uppercase italic", isMale ? "text-yellow-400" : "text-white")}>
                  {getMatchStatus(activeLoan.status)}!
                </p>
                <p className="text-[10px] opacity-70 leading-relaxed font-bold">
                  {isMale ? "Your batting consistency is world-class. No dismissals likely." : "You're the most sparkly borrower in the kingdom!"}
                </p>
              </div>
            </div>
          </motion.div>

          <div className={cn("p-8 space-y-6", isMale ? "bg-white border-4 border-emerald-900 rounded-none" : isFemale ? "bg-white rounded-[2rem] border-4 border-pink-100" : "glass-card")}>
            <h4 className={cn("text-xs font-black uppercase tracking-widest", isMale ? "text-emerald-900" : isFemale ? "text-pink-400" : "text-slate-400")}>
              {isMale ? "Locker Room Tools" : isFemale ? "Vanity Kit" : "Loan Tools"}
            </h4>
            <div className="space-y-3">
              {[
                { icon: <CreditCard className="w-4 h-4" />, label: 'Auto-Debit Net', desc: 'Secure connection' },
                { 
                  icon: <ArrowUpRight className="w-4 h-4" />, 
                  label: isMale ? 'Top-up Powerplay' : isFemale ? 'Magic Top-up' : 'Top-up Eligibility', 
                  desc: '₹2L extra pre-approved',
                  onClick: () => setTopUpState(s => ({ ...s, isOpen: true }))
                },
                { icon: <ShieldCheck className="w-4 h-4" />, label: 'Injury Insurance', desc: 'Full active cover' },
              ].map((tool, i) => (
                <div 
                  key={i} 
                  onClick={tool.onClick}
                  className={cn(
                    "p-4 flex items-center gap-4 cursor-pointer transition-all border group",
                    isMale ? "border-emerald-100 hover:bg-emerald-900 hover:text-white rounded-none" : 
                    isFemale ? "border-pink-50 hover:bg-pink-50 rounded-2xl" : 
                    "rounded-xl border-slate-100"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
                    isMale ? "bg-emerald-50 text-emerald-600 group-hover:bg-yellow-400 group-hover:text-emerald-950" : 
                    isFemale ? "bg-pink-50 text-pink-500" : 
                    "bg-slate-100"
                  )}>
                    {tool.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider">{tool.label}</p>
                    <p className="text-[9px] opacity-60 font-bold">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={cn("p-6 flex gap-4", isMale ? "bg-yellow-400 text-emerald-950 rounded-none border-2 border-emerald-950 font-black" : isFemale ? "bg-pink-100 text-pink-600 rounded-[2rem] border-2 border-pink-200" : "bg-amber-50")}
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg", isMale ? "bg-emerald-950 text-yellow-400" : "bg-pink-500 text-white")}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
               <p className="text-[11px] uppercase tracking-tighter">{isMale ? "Tactical Insight" : "Magic Tip"}</p>
               <p className="text-[10px] leading-relaxed">
                 {isMale ? "Early declaration! Foreclosure after next month saves you ₹45,600 in penalty fees." : "A magic secret: Closing the loan early saves you ₹45,600 for more dresses!"}
               </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Top-up Loan Modal */}
      <AnimatePresence>
        {topUpState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setTopUpState(s => ({ ...s, isOpen: false, status: 'idle' }))}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-lg p-8 shadow-2xl",
                isMale ? "bg-emerald-900 text-white rounded-none border-4 border-yellow-400" : 
                isFemale ? "bg-white rounded-[3rem] border-4 border-pink-200" : 
                "bg-white rounded-2xl"
              )}
            >
              {topUpState.status === 'idle' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isMale ? "bg-yellow-400 text-emerald-950" : "bg-pink-100 text-pink-500")}>
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">
                        {isMale ? "Request Powerplay Funds" : isFemale ? "Whisk Up More Magic" : "Apply for Top-up"}
                      </h3>
                      <p className="text-sm opacity-60 font-bold">
                        {isMale ? "Add weight to your batting lineup." : "Expand your королевская сокровищница."}
                      </p>
                    </div>
                  </div>

                  <div className={cn("p-6 rounded-2xl border", isMale ? "bg-emerald-950 border-emerald-800" : "bg-slate-50 border-slate-100")}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Maximum Eligibility</p>
                    <p className={cn("text-4xl font-black", theme.accent)}>{formatCurrency(topUpState.amount)}</p>
                    <div className="mt-4 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-400" />
                       <p className="text-[10px] font-bold">Based on your {profile?.score} CIBIL Score</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleApplyTopUp}
                      className={cn(
                        "w-full py-4 font-black uppercase text-sm tracking-[0.2em] transition-all shadow-xl",
                        isMale ? "bg-yellow-400 text-emerald-950 hover:bg-white" : 
                        isFemale ? "bg-pink-500 text-white rounded-full hover:scale-105" : 
                        "btn-primary"
                      )}
                    >
                      Process Application
                    </button>
                    <button 
                      onClick={() => setTopUpState(s => ({ ...s, isOpen: false }))}
                      className="w-full py-2 text-xs font-bold uppercase opacity-50 hover:opacity-100 transition-opacity"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              )}

              {topUpState.status === 'submitting' && (
                <div className="text-center py-12 space-y-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                  />
                  <div>
                    <h3 className="text-xl font-black uppercase">Analyzing Stats...</h3>
                    <p className="text-sm opacity-60 mt-1">Reviewing your repayment history against the pitch.</p>
                  </div>
                </div>
              )}

              {topUpState.status === 'result' && (
                <div className="text-center py-6 space-y-8">
                  <div className={cn(
                    "w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-2xl",
                    topUpState.isApproved 
                      ? (isMale ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-600")
                      : (isMale ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-600")
                  )}>
                    {topUpState.isApproved ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">
                      {topUpState.isApproved 
                        ? (isMale ? "Decision: Boundary Cleared!" : "Grant Approved!") 
                        : (isMale ? "Decision: Out!" : "Try Again Later")}
                    </h3>
                    <p className={cn("text-sm opacity-70 mt-2 font-bold max-w-xs mx-auto", isFemale ? "text-slate-600" : "")}>
                       {topUpState.isApproved 
                         ? `Success! An additional ${formatCurrency(topUpState.amount)} has been credited to your linked bank account.`
                         : `Unfortunately, based on your current stats, we cannot approve a top-up at this moment. Maintain your 'In Form' status to retry in 30 days.`}
                    </p>
                  </div>

                  <button 
                    onClick={() => setTopUpState(s => ({ ...s, isOpen: false, status: 'idle' }))}
                    className={cn(
                      "px-8 py-3 font-black uppercase text-xs tracking-widest",
                      isMale ? "bg-emerald-950 text-white" : isFemale ? "bg-pink-500 text-white rounded-full" : "btn-primary"
                    )}
                  >
                    Return to Field
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Icon Selection Modal */}
      <AnimatePresence>
        {isIconModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsIconModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-md p-8 shadow-2xl",
                isMale ? "bg-emerald-900 text-white rounded-none border-4 border-yellow-400" : 
                isFemale ? "bg-white rounded-[3rem] border-4 border-pink-200 text-slate-800" : 
                "bg-white rounded-2xl"
              )}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-tighter">
                  {isMale ? "Select Your Emblem" : isFemale ? "Choose Your Trinket" : "Select Dashboard Icon"}
                </h3>
                <button onClick={() => setIsIconModalOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(isMale ? personaIcons.male : personaIcons.female).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedIconId(item.id);
                        setIsIconModalOpen(false);
                      }}
                      className={cn(
                        "p-6 flex flex-col items-center gap-3 transition-all border-2",
                        selectedIconId === item.id 
                          ? (isMale ? "border-yellow-400 bg-emerald-800" : "border-pink-500 bg-pink-50")
                          : (isMale ? "border-emerald-800 hover:bg-emerald-800/50" : "border-slate-50 hover:bg-slate-50"),
                        isMale ? "rounded-none" : "rounded-2xl"
                      )}
                    >
                      <Icon className={cn(
                        "w-8 h-8",
                        selectedIconId === item.id 
                          ? (isMale ? "text-yellow-400" : "text-pink-500")
                          : (isMale ? "text-emerald-400" : "text-slate-400")
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    setSelectedIconId(null);
                    setIsIconModalOpen(false);
                  }}
                  className="text-xs font-bold uppercase opacity-50 hover:opacity-100 transition-opacity"
                >
                  Reset to Default
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
