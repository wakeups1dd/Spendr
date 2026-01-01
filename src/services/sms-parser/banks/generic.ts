// Generic SMS parser - fallback for unknown bank formats
import { BankPattern } from '../types';
import { normalizeAmount, normalizeMerchantName, parseSMSDate, extractAccountNumber } from '../utils';

export const genericBankPattern: BankPattern = {
  bankName: 'Generic',
  patterns: {
    debit: [
      // Common debit patterns
      /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:debited|spent|paid|withdrawn)/i,
      /([\d,]+\.?\d*)\s*(?:Rs\.?|INR)\s*(?:debited|spent|paid|withdrawn)/i,
      /(?:debited|spent|paid)\s*(?:Rs\.?|INR)?\s*([\d,]+\.?\d*)/i,
      /(?:paid|spent)\s+([\d,]+\.?\d*)\s*(?:Rs\.?|INR)?/i,
    ],
    credit: [
      // Common credit patterns
      /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:credited|received|deposited)/i,
      /([\d,]+\.?\d*)\s*(?:Rs\.?|INR)\s*(?:credited|received|deposited)/i,
      /(?:credited|received|deposited)\s*(?:Rs\.?|INR)?\s*([\d,]+\.?\d*)/i,
    ],
  },
  
  extractAmount(match: RegExpMatchArray): number {
    return normalizeAmount(match[1] || '');
  },
  
  extractMerchant(match: RegExpMatchArray, text: string): string {
    // Try to extract merchant after amount
    const merchantPatterns = [
      /(?:by|at|via|to|from)\s+([A-Z0-9\s\-\.]+?)(?:\s+(?:on|ref|bal|account|date|time)|$)/i,
      /UPI\/([A-Z0-9\s\-\.]+)/i,
      /NEFT\/([A-Z0-9\s\-\.]+)/i,
      /IMPS\/([A-Z0-9\s\-\.]+)/i,
      /RTGS\/([A-Z0-9\s\-\.]+)/i,
      /([A-Z]{2,}[A-Z0-9\s\-\.]{2,})(?:\s+(?:on|ref|bal|account))?/i,
    ];
    
    for (const pattern of merchantPatterns) {
      const merchantMatch = text.match(pattern);
      if (merchantMatch && merchantMatch[1]) {
        return normalizeMerchantName(merchantMatch[1]);
      }
    }
    
    return 'Unknown';
  },
  
  extractDate(match: RegExpMatchArray, text: string): Date {
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
      /(?:on|date)\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    ];
    
    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern);
      if (dateMatch && dateMatch[1]) {
        return parseSMSDate(dateMatch[1]);
      }
    }
    
    return new Date(); // Default to current date
  },
  
  extractType(match: RegExpMatchArray, text: string): 'income' | 'expense' {
    const upperText = text.toUpperCase();
    
    if (
      upperText.includes('CREDITED') ||
      upperText.includes('RECEIVED') ||
      upperText.includes('DEPOSITED') ||
      upperText.includes('SALARY') ||
      upperText.includes('REFUND')
    ) {
      return 'income';
    }
    
    return 'expense';
  },
  
  extractAccountNumber(match: RegExpMatchArray, text: string): string | undefined {
    return extractAccountNumber(text);
  },
};

