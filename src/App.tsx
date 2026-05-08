/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinancialWizard } from './components/Wizard';
import { Dashboard } from './components/Dashboard';
import { CustomerView } from './components/CustomerView';
import { FinancialData, RiskProfile } from './types';
import { calculateFinancials, formatCurrency } from './utils/finance';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, LayoutDashboard, FileText, Activity, Layers, Settings } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'wizard' | 'dashboard' | 'customer'>('wizard');
  const [data, setData] = useState<FinancialData | null>(null);
  const [profile, setProfile] = useState<RiskProfile | null>(null);

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

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page select-none">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">LoanSphere</h1>
          </div>
          
          <div className="space-y-1">
            {[
              { id: 'wizard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'EMI Engine', no: '01' },
              { id: 'dashboard', icon: <Activity className="w-4 h-4" />, label: 'Lead Dashboard', no: '02' },
              { id: 'insights', icon: <FileText className="w-4 h-4" />, label: 'Loan Results', no: '03' },
              { id: 'risk', icon: <Layers className="w-4 h-4" />, label: 'Risk Map', no: '04' },
              { id: 'customer', icon: <Shield className="w-4 h-4" />, label: 'Customer View', no: '05' },
            ].map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => {
                  if (item.id === 'wizard') handleReset();
                  else if (item.id === 'customer') setView('customer');
                  else if (data) setView('dashboard');
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg font-medium border transition-all cursor-pointer",
                  view === item.id
                    ? "bg-blue-50 text-blue-700 border-blue-100" 
                    : "text-slate-500 border-transparent hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px]",
                  view === item.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                )}>
                  {item.no}
                </span>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-3 tracking-widest px-2">Decision Context</p>
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">MVP Session</p>
              <p className="text-[10px] text-blue-600 font-bold underline cursor-pointer">Live Rules v1.0.2</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Metric Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex gap-12">
            <div className="flex flex-col">
              <span className="metric-label">Monthly Income</span>
              <span className="metric-value">{formatCurrency(totalMonthlyIncome)}</span>
            </div>
            <div className="flex flex-col border-l border-slate-100 pl-12">
              <span className="metric-label">Liabilities</span>
              <span className="metric-value text-rose-500">{formatCurrency(currentLiabilities)}</span>
            </div>
            <div className="flex flex-col border-l border-slate-100 pl-12">
              <span className="metric-label">Available Surplus</span>
              <span className={cn("metric-value", surplus > 0 ? "text-emerald-600" : "text-rose-600")}>
                {formatCurrency(surplus)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-slate-400 hidden lg:block uppercase tracking-widest">
               Real-time Simulation Active
             </span>
             <button 
              onClick={handleReset} 
              className="btn-primary flex items-center gap-2"
             >
              <Sparkles className="w-4 h-4 text-amber-200" /> New Analysis
             </button>
          </div>
        </header>

        {/* Content Rail */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            {view === 'wizard' ? (
              <motion.div
                key="wizard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-12"
              >
                <div className="max-w-2xl mx-auto px-6 mb-8 text-center">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">EMI Affordability Engine</h2>
                  <p className="text-sm text-slate-500 mt-2">Enter your financial vitals to run the score.</p>
                </div>
                <FinancialWizard onComplete={handleWizardComplete} />
              </motion.div>
            ) : view === 'customer' ? (
              <motion.div
                key="customer-view"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="p-8"
              >
                <CustomerView data={data} profile={profile} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="p-8"
              >
                {data && profile && (
                  <Dashboard 
                    data={data} 
                    profile={profile} 
                    onReset={handleReset} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Rails */}
        <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <div className="flex gap-6 uppercase tracking-widest">
            <span>Status: <span className="text-emerald-600 font-bold">Live - MVP</span></span>
            <span>Version: v1.0.2</span>
            <span>Security: <span className="text-blue-500">AES-256 Enabled</span></span>
          </div>
          <div className="flex gap-4">
             <span className="hover:text-blue-600 cursor-pointer transition-colors">User Guide</span>
             <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
