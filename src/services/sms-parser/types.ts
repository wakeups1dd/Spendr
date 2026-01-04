// TypeScript types for SMS parser

export type TransactionType = 'income' | 'expense';

export interface ParsedTransactionResult {
  amount: number;
  type: TransactionType;
  merchant: string;
  date: string; // ISO format
  category?: string;
  confidence: number; // 0-1
  rawSms: string;
  metadata?: {
    accountNumber?: string;
    referenceNumber?: string;
    balance?: number;
    bankName?: string;
    [key: string]: unknown;
  };
}

export interface BankPattern {
  bankName: string;
  senderIds?: string[]; // SMS sender numbers/IDs to identify bank
  patterns: {
    debit: RegExp[];
    credit: RegExp[];
  };
  extractAmount: (match: RegExpMatchArray, text: string) => number;
  extractMerchant: (match: RegExpMatchArray, text: string) => string;
  extractDate: (match: RegExpMatchArray, text: string) => Date;
  extractType: (match: RegExpMatchArray, text: string) => TransactionType;
  extractAccountNumber?: (match: RegExpMatchArray, text: string) => string;
  extractReferenceNumber?: (match: RegExpMatchArray, text: string) => string;
  extractBalance?: (match: RegExpMatchArray, text: string) => number;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedTransactionResult;
  bankName?: string;
  error?: string;
}


