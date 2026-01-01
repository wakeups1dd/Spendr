// Axis Bank SMS parser patterns
import { BankPattern } from '../types';
import { normalizeAmount, normalizeMerchantName, parseSMSDate, extractAccountNumber } from '../utils';

export const axisBankPattern: BankPattern = {
  bankName: 'Axis',
  senderIds: ['AXISBK', 'AXIS', 'AXISB'],
  patterns: {
    debit: [
      /Rs\.?([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Debit\s+Rs\.?([\d,]+\.?\d*)\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Rs\.?([\d,]+\.?\d*)\s+paid\s+to\s+([A-Z0-9\s\-\.]+)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
    ],
    credit: [
      /Rs\.?([\d,]+\.?\d*)\s+credited\s+to\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Credit\s+Rs\.?([\d,]+\.?\d*)\s+to\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /Rs\.?([\d,]+\.?\d*)\s+received\s+from\s+([A-Z0-9\s\-\.]+)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
    ],
  },
  
  extractAmount(match: RegExpMatchArray): number {
    return normalizeAmount(match[1] || '');
  },
  
  extractMerchant(match: RegExpMatchArray, text: string): string {
    // Axis sometimes includes merchant directly
    if (match[2] && !match[2].match(/\d{1,2}[-/]\w+[-/]\d{2,4}/)) {
      return normalizeMerchantName(match[2]);
    }
    
    // Try UPI/NEFT patterns
    const paymentMatch = text.match(/(?:UPI|NEFT|IMPS|RTGS)\/([A-Z0-9\s\-\.]+)/i);
    if (paymentMatch && paymentMatch[1]) {
      return normalizeMerchantName(paymentMatch[1]);
    }
    
    // Try "paid to" or "received from"
    const paidMatch = text.match(/(?:paid\s+to|received\s+from)\s+([A-Z0-9\s\-\.]+)/i);
    if (paidMatch && paidMatch[1]) {
      return normalizeMerchantName(paidMatch[1]);
    }
    
    return 'Unknown';
  },
  
  extractDate(match: RegExpMatchArray, text: string): Date {
    // Date is typically in match[2] or match[3]
    const dateStr = match[2]?.match(/\d{1,2}[-/]\w+[-/]\d{2,4}/) 
      ? match[2] 
      : match[3]?.match(/\d{1,2}[-/]\w+[-/]\d{2,4}/)
      ? match[3]
      : null;
    
    if (dateStr) {
      return parseSMSDate(dateStr);
    }
    
    // Fallback
    const dateMatch = text.match(/on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i);
    if (dateMatch) {
      return parseSMSDate(dateMatch[1]);
    }
    
    return new Date();
  },
  
  extractType(match: RegExpMatchArray, text: string): 'income' | 'expense' {
    const upperText = text.toUpperCase();
    return upperText.includes('CREDITED') || upperText.includes('RECEIVED') || upperText.includes('CREDIT') 
      ? 'income' 
      : 'expense';
  },
  
  extractAccountNumber(match: RegExpMatchArray, text: string): string | undefined {
    return extractAccountNumber(text);
  },
  
  extractReferenceNumber(match: RegExpMatchArray, text: string): string | undefined {
    const refMatch = text.match(/(?:Ref|Reference)\s+No:?\s*(\w+)/i);
    return refMatch ? refMatch[1] : undefined;
  },
  
  extractBalance(match: RegExpMatchArray, text: string): number | undefined {
    const balanceMatch = text.match(/(?:Avl\s+Bal|Balance|Bal):?\s*Rs\.?([\d,]+\.?\d*)/i);
    if (balanceMatch && balanceMatch[1]) {
      return normalizeAmount(balanceMatch[1]);
    }
    return undefined;
  },
};

