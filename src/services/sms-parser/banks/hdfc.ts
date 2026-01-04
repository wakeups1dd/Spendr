// HDFC Bank SMS parser patterns
import { BankPattern } from '../types';
import { normalizeAmount, normalizeMerchantName, parseSMSDate, extractAccountNumber } from '../utils';

export const hdfcBankPattern: BankPattern = {
  bankName: 'HDFC',
  senderIds: ['HDFCBK', 'HDFC', 'VK-HDFCBK'],
  patterns: {
    debit: [
      /Rs\.?([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})\s+by\s+(?:NEFT|UPI|IMPS|RTGS)\/([A-Z0-9\s\-\.]+)/i,
      /Rs\.?([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /(?:Debit|Spent)\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
    ],
    credit: [
      /Rs\.?([\d,]+\.?\d*)\s+credited\s+to\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /(?:Credit|Received)\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
    ],
  },
  
  extractAmount(match: RegExpMatchArray): number {
    return normalizeAmount(match[1] || '');
  },
  
  extractMerchant(match: RegExpMatchArray, text: string): string {
    // HDFC typically includes merchant after "by NEFT/UPI/"
    if (match[3]) {
      return normalizeMerchantName(match[3]);
    }
    
    // Fallback: try to extract from common patterns
    const merchantMatch = text.match(/(?:by|at)\s+(?:NEFT|UPI|IMPS|RTGS)\/([A-Z0-9\s\-\.]+)/i);
    if (merchantMatch && merchantMatch[1]) {
      return normalizeMerchantName(merchantMatch[1]);
    }
    
    return 'Unknown';
  },
  
  extractDate(match: RegExpMatchArray, text: string): Date {
    if (match[2]) {
      return parseSMSDate(match[2]);
    }
    
    // Fallback pattern
    const dateMatch = text.match(/(\d{1,2}[-/]\w+[-/]\d{2,4})/i);
    if (dateMatch) {
      return parseSMSDate(dateMatch[1]);
    }
    
    return new Date();
  },
  
  extractType(match: RegExpMatchArray, text: string): 'income' | 'expense' {
    const upperText = text.toUpperCase();
    return upperText.includes('CREDITED') || upperText.includes('CREDIT') ? 'income' : 'expense';
  },
  
  extractAccountNumber(match: RegExpMatchArray, text: string): string | undefined {
    return extractAccountNumber(text);
  },
  
  extractBalance(match: RegExpMatchArray, text: string): number | undefined {
    const balanceMatch = text.match(/(?:Avl\s+Bal|Balance|Bal):?\s*Rs\.?([\d,]+\.?\d*)/i);
    if (balanceMatch && balanceMatch[1]) {
      return normalizeAmount(balanceMatch[1]);
    }
    return undefined;
  },
};


