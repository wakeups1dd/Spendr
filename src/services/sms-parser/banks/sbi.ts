// State Bank of India (SBI) SMS parser patterns
import { BankPattern } from '../types';
import { normalizeAmount, normalizeMerchantName, parseSMSDate, extractAccountNumber } from '../utils';

export const sbiBankPattern: BankPattern = {
  bankName: 'SBI',
  senderIds: ['SBIIN', 'SBI', 'STATEBNK'],
  patterns: {
    debit: [
      /A\/c\s+\w+\s+debited\s+by\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Rs\.?([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Debit\s+of\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /UPI\/([A-Z0-9\s\-\.]+)\s+Rs\.?([\d,]+\.?\d*)\s+debited/i,
    ],
    credit: [
      /A\/c\s+\w+\s+credited\s+by\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Rs\.?([\d,]+\.?\d*)\s+credited\s+to\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Credit\s+of\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
    ],
  },
  
  extractAmount(match: RegExpMatchArray): number {
    // For UPI pattern, amount might be in match[2]
    return normalizeAmount(match[2] || match[1] || '');
  },
  
  extractMerchant(match: RegExpMatchArray, text: string): string {
    // SBI UPI pattern has merchant in match[1]
    if (match[1] && !match[1].match(/Rs\.?|INR|[\d,]+/)) {
      return normalizeMerchantName(match[1]);
    }
    
    // Try UPI pattern
    const upiMatch = text.match(/UPI\/([A-Z0-9\s\-\.]+)/i);
    if (upiMatch && upiMatch[1]) {
      return normalizeMerchantName(upiMatch[1]);
    }
    
    // Try NEFT/IMPS pattern
    const neftMatch = text.match(/(?:NEFT|IMPS|RTGS)\/([A-Z0-9\s\-\.]+)/i);
    if (neftMatch && neftMatch[1]) {
      return normalizeMerchantName(neftMatch[1]);
    }
    
    return 'Unknown';
  },
  
  extractDate(match: RegExpMatchArray, text: string): Date {
    // Date is typically after "on"
    const dateMatch = text.match(/on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i);
    if (dateMatch && dateMatch[1]) {
      return parseSMSDate(dateMatch[1]);
    }
    
    // Fallback
    const fallbackMatch = text.match(/(\d{1,2}[-/]\w+[-/]\d{2,4})/i);
    if (fallbackMatch) {
      return parseSMSDate(fallbackMatch[1]);
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


