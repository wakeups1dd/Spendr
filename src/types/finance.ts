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

// SMS Parsing Types
export interface SmsSyncSettings {
  id: string;
  userId: string;
  phoneNumber?: string;
  bankName?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedTransactionQueue {
  id: string;
  userId: string;
  rawSms: string;
  parsedJson?: Record<string, unknown>;
  confidenceScore?: number;
  status: 'pending' | 'approved' | 'rejected' | 'duplicate';
  suggestedTransaction?: {
    amount: number;
    type: TransactionType;
    merchant: string;
    date: string;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  merchant: string;
  date: string;
  category?: string;
  confidence: number;
  rawSms: string;
  metadata?: {
    accountNumber?: string;
    referenceNumber?: string;
    balance?: number;
    bankName?: string;
    [key: string]: unknown;
  };
}