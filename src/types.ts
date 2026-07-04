export enum RiskCategory {
  LOW = 'Low Risk',
  MODERATE = 'Moderate Risk',
  HIGH = 'High Risk',
}

export interface ExpenseItem {
  id: string;
  label: string;
  amount: number;
}

export interface FinancialData {
  name: string;
  gender: 'male' | 'female' | 'other';
  monthlyIncome: number;
  variableIncome: number;
  expenses: ExpenseItem[];
  existingEmis: number;
  otherDebts: number;
  loanRequirement: {
    amount: number;
    tenureYears: number;
    interestRate: number;
  };
}

export interface RiskProfile {
  score: number;
  category: RiskCategory;
  dti: number;
  disposableIncome: number;
  recommendations: string[];
}

export interface RecommendedLoan {
  id: string;
  provider: string;
  maxAmount: number;
  tenureMonths: number;
  estimatedInterest: number;
  estimatedEmi: number;
}
