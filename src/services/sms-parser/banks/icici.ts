// ICICI Bank SMS parser patterns
import { BankPattern } from '../types';
import { normalizeAmount, normalizeMerchantName, parseSMSDate, extractAccountNumber } from '../utils';

export const iciciBankPattern: BankPattern = {
  bankName: 'ICICI',
  senderIds: ['ICICIB', 'ICICBK', 'ICICI'],
  patterns: {
    debit: [
      /INR\s+([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /INR\s+([\d,]+\.?\d*)\s+paid\s+to\s+([A-Z0-9\s\-\.]+)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /(?:Debit|Spent)\s+INR\s+([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
    ],
    credit: [
      /INR\s+([\d,]+\.?\d*)\s+credited\s+to\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /INR\s+([\d,]+\.?\d*)\s+received\s+from\s+([A-Z0-9\s\-\.]+)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      /(?:Credit|Received)\s+INR\s+([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
    ],
  },
  
  extractAmount(match: RegExpMatchArray): number {
    return normalizeAmount(match[1] || '');
  },
  
  extractMerchant(match: RegExpMatchArray, text: string): string {
    // ICICI sometimes includes merchant name directly
    if (match[2] && !match[2].match(/\d{1,2}[-/]\w+[-/]\d{2,4}/)) {
      return normalizeMerchantName(match[2]);
    }
    
    // Try UPI pattern
    const upiMatch = text.match(/UPI\/([A-Z0-9\s\-\.]+)/i);
    if (upiMatch && upiMatch[1]) {
      return normalizeMerchantName(upiMatch[1]);
    }
    
    // Try "paid to" or "received from" pattern
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
    const dateMatch = text.match(/(\d{1,2}[-/]\w+[-/]\d{2,4})/i);
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
    const refMatch = text.match(/(?:Ref\s+No|Reference):?\s*(\w+)/i);
    return refMatch ? refMatch[1] : undefined;
  },
  
  extractBalance(match: RegExpMatchArray, text: string): number | undefined {
    const balanceMatch = text.match(/(?:Avl\s+Bal|Balance|Bal):?\s*INR\s+([\d,]+\.?\d*)/i);
    if (balanceMatch && balanceMatch[1]) {
      return normalizeAmount(balanceMatch[1]);
    }
    return undefined;
  },
};


