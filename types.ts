
export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO String
  notes?: string;
  savingsGoalId?: string; // Optional link to a savings goal
  attachment?: string; // Base64 string for receipt
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
  spent: number;
}

export interface Category {
  id?: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface RecurringRule {
  id?: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string; // ISO String
  lastProcessed?: string;
}

export interface SavingsGoal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO String
  color: string; // hex or tailwind class identifier
}

export interface FinancialHealth {
  score: number; // 0-100
  savingsRate: number; // Percentage
  status: 'Critical' | 'Fair' | 'Good' | 'Excellent';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
