export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'manual' | 'sms' | 'import';

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  type: TransactionType;
  source: TransactionSource;
  notes?: string;
  rawSms?: string;
  parsedJson?: Record<string, unknown>;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
}

export interface User {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}
