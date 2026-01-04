// Utility functions for SMS parsing

/**
 * Normalizes amount string by removing currency symbols and commas
 */
export function normalizeAmount(amountStr: string): number {
  if (!amountStr) return 0;
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = amountStr
    .replace(/[Rs\.|INR|USD|EUR|₹]/gi, '')
    .replace(/,/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalizes merchant name by removing extra whitespace and common prefixes
 */
export function normalizeMerchantName(merchant: string): string {
  if (!merchant) return 'Unknown';
  
  return merchant
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(UPI\/|NEFT\/|IMPS\/|RTGS\/)/i, '')
    .replace(/^BY\s+/i, '')
    .replace(/^AT\s+/i, '')
    .replace(/^VIA\s+/i, '')
    .trim()
    || 'Unknown';
}

/**
 * Parses date from various formats commonly found in SMS
 */
export function parseSMSDate(dateStr: string, timeStr?: string): Date {
  const now = new Date();
  let date = new Date(now);
  
  if (!dateStr) return date;
  
  // Format: DD-MM-YY or DD-MM-YYYY
  const ddmmyyMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (ddmmyyMatch) {
    const day = parseInt(ddmmyyMatch[1], 10);
    const month = parseInt(ddmmyyMatch[2], 10) - 1; // Months are 0-indexed
    let year = parseInt(ddmmyyMatch[3], 10);
    
    // Convert 2-digit year to 4-digit
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    date = new Date(year, month, day);
  }
  
  // Format: DD MMM YYYY (e.g., "15 Jan 2024")
  const ddmmyyyyMatch = dateStr.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = monthNames.indexOf(ddmmyyyyMatch[2].toLowerCase());
    const year = parseInt(ddmmyyyyMatch[3], 10);
    
    if (month !== -1) {
      date = new Date(year, month, day);
    }
  }
  
  // Parse time if provided (HH:MM or HH:MM:SS)
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      date.setHours(parseInt(timeMatch[1], 10));
      date.setMinutes(parseInt(timeMatch[2], 10));
      date.setSeconds(timeMatch[3] ? parseInt(timeMatch[3], 10) : 0);
    }
  }
  
  // Validate date (should not be too far in future or past)
  const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in future
  const minDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days in past
  
  if (date > maxDate || date < minDate) {
    return now; // Return current date if parsed date seems invalid
  }
  
  return date;
}

/**
 * Calculates similarity between two strings (simple Levenshtein-based)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.7;
  }
  
  // Simple character-based similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const editDistance = levenshteinDistance(s1, s2);
  
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Extracts account number from text (masks it for privacy)
 */
export function extractAccountNumber(text: string): string | undefined {
  // Common patterns: A/c XX1234, A/c **1234, Account XX1234
  const patterns = [
    /(?:A\/c|Account|Acc)\s*(?:\*{2,}|XX)?(\d{4,})/i,
    /(?:A\/c|Account|Acc)\s*(\d{2,})/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return `****${match[1].slice(-4)}`; // Return last 4 digits only
    }
  }
  
  return undefined;
}

/**
 * Cleans and formats SMS text for parsing
 */
export function cleanSMSText(text: string): string {
  return text
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


