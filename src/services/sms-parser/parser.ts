// Main SMS parser orchestrator
import { ParsedTransactionResult, ParseResult, BankPattern } from './types';
import { cleanSMSText } from './utils';
import { suggestCategory } from './categoryMatcher';
import { hdfcBankPattern } from './banks/hdfc';
import { iciciBankPattern } from './banks/icici';
import { sbiBankPattern } from './banks/sbi';
import { axisBankPattern } from './banks/axis';
import { genericBankPattern } from './banks/generic';

// All bank patterns in order of preference
const bankPatterns: BankPattern[] = [
  hdfcBankPattern,
  iciciBankPattern,
  sbiBankPattern,
  axisBankPattern,
  genericBankPattern, // Fallback
];

/**
 * Detects which bank pattern matches the SMS
 */
function detectBank(smsText: string, senderId?: string): BankPattern | null {
  const upperText = smsText.toUpperCase();
  
  // Try to match by sender ID first
  if (senderId) {
    const senderUpper = senderId.toUpperCase();
    for (const pattern of bankPatterns) {
      if (pattern.senderIds?.some(id => senderUpper.includes(id.toUpperCase()))) {
        return pattern;
      }
    }
  }
  
  // Try to match by bank name in text
  for (const pattern of bankPatterns) {
    if (pattern.bankName !== 'Generic' && upperText.includes(pattern.bankName.toUpperCase())) {
      return pattern;
    }
  }
  
  return null;
}

/**
 * Attempts to parse SMS using a specific bank pattern
 */
function parseWithPattern(
  smsText: string,
  pattern: BankPattern
): ParsedTransactionResult | null {
  const cleanedText = cleanSMSText(smsText);
  const upperText = cleanedText.toUpperCase();
  
  // Determine transaction type and get appropriate patterns
  const isCredit = 
    upperText.includes('CREDITED') ||
    upperText.includes('CREDIT') ||
    upperText.includes('RECEIVED') ||
    upperText.includes('DEPOSITED') ||
    upperText.includes('SALARY') ||
    upperText.includes('REFUND');
  
  const patterns = isCredit ? pattern.patterns.credit : pattern.patterns.debit;
  
  // Try each pattern until one matches
  for (const regexPattern of patterns) {
    const match = cleanedText.match(regexPattern);
    if (match) {
      try {
        const amount = pattern.extractAmount(match, cleanedText);
        if (amount <= 0) continue; // Invalid amount, try next pattern
        
        const type = pattern.extractType(match, cleanedText);
        const merchant = pattern.extractMerchant(match, cleanedText);
        const date = pattern.extractDate(match, cleanedText);
        const category = suggestCategory(type, merchant, amount);
        
        // Build metadata
        const metadata: ParsedTransactionResult['metadata'] = {
          bankName: pattern.bankName,
        };
        
        if (pattern.extractAccountNumber) {
          const accountNumber = pattern.extractAccountNumber(match, cleanedText);
          if (accountNumber) metadata.accountNumber = accountNumber;
        }
        
        if (pattern.extractReferenceNumber) {
          const refNumber = pattern.extractReferenceNumber(match, cleanedText);
          if (refNumber) metadata.referenceNumber = refNumber;
        }
        
        if (pattern.extractBalance) {
          const balance = pattern.extractBalance(match, cleanedText);
          if (balance) metadata.balance = balance;
        }
        
        // Calculate confidence score
        let confidence = 0.5; // Base confidence
        if (amount > 0) confidence += 0.2;
        if (merchant !== 'Unknown') confidence += 0.2;
        if (pattern.bankName !== 'Generic') confidence += 0.1; // Bank-specific parser increases confidence
        
        confidence = Math.min(confidence, 1.0);
        
        return {
          amount,
          type,
          merchant,
          date: date.toISOString(),
          category,
          confidence,
          rawSms: smsText,
          metadata,
        };
      } catch (error) {
        console.error(`Error parsing with ${pattern.bankName} pattern:`, error);
        continue; // Try next pattern
      }
    }
  }
  
  return null;
}

/**
 * Main parser function - attempts to parse SMS using all available patterns
 */
export function parseSMS(
  smsText: string,
  senderId?: string
): ParseResult {
  if (!smsText || !smsText.trim()) {
    return {
      success: false,
      error: 'SMS text is required',
    };
  }
  
  const cleanedText = cleanSMSText(smsText);
  
  // Try to detect bank first
  const detectedBank = detectBank(cleanedText, senderId);
  
  // If bank detected, try that pattern first
  if (detectedBank) {
    const result = parseWithPattern(cleanedText, detectedBank);
    if (result) {
      return {
        success: true,
        data: result,
        bankName: detectedBank.bankName,
      };
    }
  }
  
  // Try all bank patterns in order
  for (const pattern of bankPatterns) {
    // Skip if we already tried this pattern
    if (detectedBank && pattern.bankName === detectedBank.bankName) {
      continue;
    }
    
    const result = parseWithPattern(cleanedText, pattern);
    if (result) {
      return {
        success: true,
        data: result,
        bankName: pattern.bankName,
      };
    }
  }
  
  // If no pattern matched, return error
  return {
    success: false,
    error: 'Could not parse SMS - no matching pattern found',
    bankName: 'Unknown',
  };
}

/**
 * Exports all bank patterns for reference
 */
export { bankPatterns };

