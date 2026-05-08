import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Wallet, 
  TrendingDown, 
  CreditCard, 
  CheckCircle2, 
  Info,
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';
import { FinancialData, ExpenseItem } from '../types';
import { cn } from '../lib/utils';

interface WizardProps {
  onComplete: (data: FinancialData) => void;
}

const DEFAULT_DATA: FinancialData = {
  name: '',
  gender: 'male',
  monthlyIncome: 0,
  variableIncome: 0,
  expenses: [
    { id: '1', label: 'Rent/Home Loan', amount: 0 },
    { id: '2', label: 'Utilities & Bills', amount: 0 }
  ],
  existingEmis: 0,
  otherDebts: 0,
  loanRequirement: {
    amount: 100000,
    tenureYears: 2,
    interestRate: 12
  }
};

export function FinancialWizard({ onComplete }: WizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FinancialData>(DEFAULT_DATA);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateExpense = (id: string, amount: number) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => exp.id === id ? { ...exp, amount } : exp)
    }));
  };

  const addExpense = () => {
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: Math.random().toString(), label: 'Custom Expense', amount: 0 }]
    }));
  };

  const removeExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(exp => exp.id !== id)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Progress Header */}
      <div className="flex justify-between mb-12">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={cn(
              "step-indicator",
              step >= i ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
            )}>
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-wider font-bold",
              step >= i ? "text-indigo-600" : "text-slate-400"
            )}>
              {["Profile", "Income", "Expenses", "Debts", "Goal"][i-1]}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="text-indigo-600" />
                Let's get to know you
              </h2>
              <p className="text-slate-500">How should we address you and customize your experience?</p>
            </div>

            <div className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Full Name</span>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Aman Gupta"
                  value={data.name}
                  onChange={e => setData({ ...data, name: e.target.value })}
                />
              </label>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Gender</span>
                <div className="grid grid-cols-3 gap-3">
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setData({ ...data, gender: g as any })}
                      className={cn(
                        "py-3 px-4 rounded-xl text-sm font-bold border transition-all capitalize",
                        data.gender === g 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Wallet className="text-indigo-600" />
                Your Earnings
              </h2>
              <p className="text-slate-500">Provide your monthly earnings to help us calculate your capacity.</p>
            </div>

            <div className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Monthly Net Salary (INR)</span>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="e.g. 50000"
                  value={data.monthlyIncome || ''}
                  onChange={e => setData({ ...data, monthlyIncome: Number(e.target.value) })}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Annual Variable/Bonus (INR)</span>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="e.g. 100000"
                  value={data.variableIncome || ''}
                  onChange={e => setData({ ...data, variableIncome: Number(e.target.value) })}
                />
              </label>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingDown className="text-pink-600" />
                Monthly Expenses
              </h2>
              <p className="text-slate-500">List your monthly commitments to see what's left for a new EMI.</p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {data.expenses.map((expense) => (
                <div key={expense.id} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-1">
                    <input 
                      className="text-xs font-semibold text-slate-500 bg-transparent border-none focus:ring-0 p-0"
                      value={expense.label}
                      onChange={e => {
                        const newLabel = e.target.value;
                        setData(prev => ({
                          ...prev,
                          expenses: prev.expenses.map(exp => exp.id === expense.id ? { ...exp, label: newLabel } : exp)
                        }));
                      }}
                    />
                    <input 
                      type="number" 
                      className="input-field" 
                      value={expense.amount || ''}
                      onChange={e => updateExpense(expense.id, Number(e.target.value))}
                    />
                  </div>
                  <button 
                    onClick={() => removeExpense(expense.id)}
                    className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button 
                onClick={addExpense}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add custom expense
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="text-amber-500" />
                Existing Liabilities
              </h2>
              <p className="text-slate-500">Current loan repayments and credit card debts.</p>
            </div>

            <div className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Current Monthly EMIs (INR)</span>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Total ongoing EMIs"
                  value={data.existingEmis || ''}
                  onChange={e => setData({ ...data, existingEmis: Number(e.target.value) })}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Other Debts (Credit Card, etc.)</span>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Outstanding short-term debts"
                  value={data.otherDebts || ''}
                  onChange={e => setData({ ...data, otherDebts: Number(e.target.value) })}
                />
              </label>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingDown className="text-indigo-600" />
                Desired Loan Goal
              </h2>
              <p className="text-slate-500">What are you planning to borrow today?</p>
            </div>

            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Planned Amount (INR)</span>
                  <span className="text-lg font-bold text-indigo-600">{new Intl.NumberFormat('en-IN').format(data.loanRequirement.amount)}</span>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="2000000" 
                  step="10000"
                  className="w-full accent-indigo-600"
                  value={data.loanRequirement.amount}
                  onChange={e => setData({ 
                    ...data, 
                    loanRequirement: { ...data.loanRequirement, amount: Number(e.target.value) } 
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tenure (Years)</span>
                  <select 
                    className="input-field"
                    value={data.loanRequirement.tenureYears}
                    onChange={e => setData({ 
                      ...data, 
                      loanRequirement: { ...data.loanRequirement, tenureYears: Number(e.target.value) } 
                    })}
                  >
                    {[1, 2, 3, 5, 7, 10, 15, 20].map(y => (
                      <option key={y} value={y}>{y} Years</option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Expected Rate (%)</span>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={data.loanRequirement.interestRate}
                    onChange={e => setData({ 
                      ...data, 
                      loanRequirement: { ...data.loanRequirement, interestRate: Number(e.target.value) } 
                    })}
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className="btn-secondary flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back
        </button>
        {step === 5 ? (
          <button 
            onClick={() => onComplete(data)}
            className="btn-primary flex items-center gap-2 shadow-xl shadow-indigo-100"
          >
            Calculate Affordability <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={nextStep}
            className="btn-primary flex items-center gap-2 group"
          >
            Next <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-700">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          <strong>Security Note:</strong> All data is processed locally in your browser. We don't store your sensitive financial information on our servers.
        </p>
      </div>
    </div>
  );
}
