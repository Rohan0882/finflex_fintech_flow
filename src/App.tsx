/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FinancialWizard } from './components/Wizard';
import { Dashboard } from './components/Dashboard';
import { CustomerView } from './components/CustomerView';
import { FinancialData, RiskProfile } from './types';
import { calculateFinancials, formatCurrency } from './utils/finance';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, LayoutDashboard, FileText, Activity, Layers, Settings, Menu, X, Lock, Sun, Moon } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'wizard' | 'dashboard' | 'insights' | 'risk' | 'customer'>('wizard');
  const [data, setData] = useState<FinancialData | null>(null);
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleWizardComplete = (finishedData: FinancialData) => {
    const result = calculateFinancials(finishedData);
    setData(finishedData);
    setProfile(result);
    setView('dashboard');
  };

  const handleReset = () => {
    setView('wizard');
  };

  const totalMonthlyIncome = data ? data.monthlyIncome + (data.variableIncome / 12) : 0;
  const currentLiabilities = data ? data.existingEmis + data.otherDebts : 0;
  const surplus = profile ? profile.disposableIncome : 0;

  const NavContent = () => (
    <div className="p-6 h-full flex flex-col bg-white dark:bg-slate-900 transition-colors duration-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">RohanKumar(LoanSphere)_ABC</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 dark:text-slate-400">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="space-y-1">
        {[
          { id: 'wizard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'EMI Engine', no: '01', requiresData: false },
          { id: 'dashboard', icon: <Activity className="w-4 h-4" />, label: 'Lead Dashboard', no: '02', requiresData: true },
          { id: 'insights', icon: <FileText className="w-4 h-4" />, label: 'Loan Results', no: '03', requiresData: true },
          { id: 'risk', icon: <Layers className="w-4 h-4" />, label: 'Risk Map', no: '04', requiresData: true },
          { id: 'customer', icon: <Shield className="w-4 h-4" />, label: 'Customer View', no: '05', requiresData: true },
        ].map((item, idx) => {
          const isLocked = item.requiresData && !data;
          const isActive = view === item.id;

          return (
            <div 
              key={item.id}
              onClick={() => {
                if (isLocked) return;
                if (item.id === 'wizard') handleReset();
                else setView(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg font-medium border transition-all cursor-pointer relative group",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" 
                  : isLocked
                    ? "text-slate-300 dark:text-slate-700 border-transparent cursor-not-allowed"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
              title={isLocked ? "Complete EMI Engine to unlock" : undefined}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px]",
                isActive
                  ? "bg-blue-600 text-white"
                  : isLocked
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              )}>
                {item.no}
              </span>
              <span className="text-sm">{item.label}</span>
              {isLocked && (
                <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 ml-auto" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-3 tracking-widest px-2">Decision Context</p>
        <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">MVP Session</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold underline cursor-pointer">Live Rules v1.0.2</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page dark:bg-slate-950 select-none flex-col lg:flex-row transition-colors duration-200">
      {/* Mobile Top Nav */}
      <div className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-40 w-full shrink-0 no-print">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
          <h1 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">RohanKumar(LoanSphere)_ABC</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0">
        <NavContent />
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.nav 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-[60] lg:hidden shadow-2xl"
            >
              <NavContent />
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Metric Header */}
        <header className="min-h-20 lg:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-8 py-4 lg:py-0 flex-shrink-0 gap-4 lg:gap-0 transition-colors duration-200">
          <div className="flex gap-4 sm:gap-12 w-full lg:w-auto justify-between lg:justify-start">
            
            {/* Animated Metric 1: Income */}
            <div className="flex flex-col justify-center">
              <span className="metric-label">Income</span>
              <div className="h-7 sm:h-8 relative overflow-hidden min-w-[80px] sm:min-w-[120px] flex items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={totalMonthlyIncome}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="metric-value text-sm sm:text-lg text-slate-800 dark:text-slate-100 absolute left-0"
                  >
                    {formatCurrency(totalMonthlyIncome)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Animated Metric 2: Liabilities */}
            <div className="flex flex-col justify-center border-l border-slate-100 dark:border-slate-800 pl-4 sm:pl-12">
              <span className="metric-label">Liabilities</span>
              <div className="h-7 sm:h-8 relative overflow-hidden min-w-[80px] sm:min-w-[120px] flex items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={currentLiabilities}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="metric-value text-sm sm:text-lg text-rose-500 absolute left-0"
                  >
                    {formatCurrency(currentLiabilities)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Animated Metric 3: Surplus */}
            <div className="flex flex-col justify-center border-l border-slate-100 dark:border-slate-800 pl-4 sm:pl-12">
              <span className="metric-label">Surplus</span>
              <div className="h-7 sm:h-8 relative overflow-hidden min-w-[80px] sm:min-w-[120px] flex items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={surplus}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={cn("metric-value text-sm sm:text-lg absolute left-0", surplus > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-450")}
                  >
                    {formatCurrency(surplus)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto no-print">
             <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hidden xl:block uppercase tracking-widest whitespace-nowrap">
               Real-time Simulation Active
             </span>
             
             {/* Desktop Dark Mode Toggle */}
             <button
               onClick={() => setIsDark(!isDark)}
               className="p-2 h-10 w-10 hidden lg:flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
               aria-label="Toggle Dark Mode"
               title="Toggle Dark Mode"
             >
               {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
             </button>

             <button 
              onClick={handleReset} 
              className="btn-primary flex items-center justify-center gap-2 w-full lg:w-auto py-2 h-10 px-4"
             >
              <Sparkles className="w-4 h-4 text-amber-200" /> <span className="whitespace-nowrap">New Analysis</span>
             </button>
          </div>
        </header>

        {/* Content Rail */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30 transition-colors duration-200">
          <AnimatePresence mode="wait">
            {view === 'wizard' ? (
              <motion.div
                key="wizard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-6 lg:py-12"
              >
                <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-8 text-center">
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight">EMI Affordability Engine</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter your financial vitals to run the score.</p>
                </div>
                <FinancialWizard onComplete={handleWizardComplete} />
              </motion.div>
            ) : view === 'customer' ? (
              <motion.div
                key="customer-view"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="p-4 lg:p-8"
              >
                <CustomerView data={data} profile={profile} />
              </motion.div>
            ) : (
              <motion.div
                key={`dashboard-${view}`}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="p-4 lg:p-8"
              >
                {data && profile && (
                  <Dashboard 
                    data={data} 
                    profile={profile} 
                    onReset={handleReset} 
                    viewMode={view === 'insights' ? 'insights' : view === 'risk' ? 'risk' : 'dashboard'}
                    onNavigate={(newView) => setView(newView)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Rails */}
        <footer className="min-h-10 lg:h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-2 flex flex-col lg:flex-row items-center justify-between text-[8px] lg:text-[10px] text-slate-400 dark:text-slate-500 font-medium gap-2 lg:gap-0 whitespace-nowrap overflow-x-hidden transition-colors duration-200 no-print">
          <div className="flex gap-4 lg:gap-6 uppercase tracking-widest">
            <span>Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">MVP</span></span>
            <span>Version: v1.0.2</span>
            <span>Security: <span className="text-blue-500 dark:text-blue-400 uppercase">AES-256</span></span>
          </div>
          <div className="flex gap-4">
             <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">User Guide</span>
             <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

