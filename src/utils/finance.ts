import { FinancialData, RiskCategory, RiskProfile } from '../types';

/**
 * Calculates Monthly EMI
 * P * R * (1+R)^N / ((1+R)^N - 1)
 */
export const calculateEmi = (principal: number, annualRate: number, years: number): number => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 12 / 100;
  const n = years * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  return Math.round(emi);
};

export const calculateFinancials = (data: FinancialData): RiskProfile => {
  const totalIncome = data.monthlyIncome + (data.variableIncome / 12);
  const totalExpenses = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalLiabilities = data.existingEmis + data.otherDebts;
  
  const disposableIncome = totalIncome - totalExpenses - totalLiabilities;
  const dti = (totalLiabilities / totalIncome) * 100;

  // New potential DTI with requested loan
  const newEmi = calculateEmi(
    data.loanRequirement.amount,
    data.loanRequirement.interestRate,
    data.loanRequirement.tenureYears
  );
  const potentialDti = ((totalLiabilities + newEmi) / totalIncome) * 100;

  let score = 100;
  // Penalty for high DTI
  if (potentialDti > 50) score -= 50;
  else if (potentialDti > 40) score -= 30;
  else if (potentialDti > 20) score -= 10;

  // Penalty for low disposable income
  if (disposableIncome < (totalIncome * 0.2)) score -= 20;
  
  let category = RiskCategory.LOW;
  if (score < 40) category = RiskCategory.HIGH;
  else if (score < 75) category = RiskCategory.MODERATE;

  const recommendations = [];
  if (potentialDti > 40) {
    recommendations.push("Your DTI ratio is high. Consider a longer tenure or smaller loan amount.");
  }
  if (disposableIncome < 10000) {
    recommendations.push("Buffer for emergencies is low. We suggest reducing variable expenses.");
  }
  if (category === RiskCategory.LOW) {
    recommendations.push("Great financial health! You are eligible for competitive interest rates.");
  }

  return {
    score,
    category,
    dti: Math.round(potentialDti * 10) / 10,
    disposableIncome,
    recommendations
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculates Year-by-Year Amortization Schedule
 */
export interface AmortizationPoint {
  name: string;
  year: number;
  remainingPrincipal: number;
  cumulativeInterestPaid: number;
  principalPaid: number;
}

export const calculateAmortization = (
  principal: number,
  annualRate: number,
  years: number
): AmortizationPoint[] => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return [];
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = years * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  const schedule: AmortizationPoint[] = [];
  let remainingBalance = principal;
  let cumulativeInterest = 0;
  
  // Year 0
  schedule.push({
    name: 'Start',
    year: 0,
    remainingPrincipal: Math.round(principal),
    cumulativeInterestPaid: 0,
    principalPaid: 0,
  });

  for (let m = 1; m <= totalMonths; m++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(remainingBalance, emi - interestPayment);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    cumulativeInterest += interestPayment;
    
    if (m % 12 === 0 || m === totalMonths) {
      const yearNum = Math.ceil(m / 12);
      schedule.push({
        name: `Yr ${yearNum}`,
        year: yearNum,
        remainingPrincipal: Math.round(remainingBalance),
        cumulativeInterestPaid: Math.round(cumulativeInterest),
        principalPaid: Math.round(principal - remainingBalance),
      });
    }
  }
  return schedule;
};
