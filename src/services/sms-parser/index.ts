// Main entry point for SMS parser
export { parseSMS, bankPatterns } from './parser';
export type { ParsedTransactionResult, ParseResult, BankPattern } from './types';
export { normalizeAmount, normalizeMerchantName, parseSMSDate, stringSimilarity } from './utils';
export { matchMerchantToCategory, suggestCategory, merchantCategoryMap } from './categoryMatcher';

