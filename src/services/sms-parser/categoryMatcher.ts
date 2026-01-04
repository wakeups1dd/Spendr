// Category matching logic for merchants

/**
 * Merchant to category mapping
 * Maps common merchant names/patterns to application categories
 */
export const merchantCategoryMap: Record<string, string> = {
  // Food & Dining
  'swiggy': 'Food & Dining',
  'zomato': 'Food & Dining',
  'uber eats': 'Food & Dining',
  'dominos': 'Food & Dining',
  'pizza hut': 'Food & Dining',
  'mcdonalds': 'Food & Dining',
  'kfc': 'Food & Dining',
  'starbucks': 'Food & Dining',
  'cafe coffee day': 'Food & Dining',
  'ccd': 'Food & Dining',
  'barista': 'Food & Dining',
  'starbucks': 'Food & Dining',
  
  // Transport
  'uber': 'Transport',
  'ola': 'Transport',
  'rapido': 'Transport',
  'zoomcar': 'Transport',
  'revv': 'Transport',
  'metro': 'Transport',
  'irctc': 'Transport',
  'makemytrip': 'Transport',
  'goibibo': 'Transport',
  'ixigo': 'Transport',
  'redbus': 'Transport',
  'indigo': 'Transport',
  'spicejet': 'Transport',
  'air india': 'Transport',
  'vistara': 'Transport',
  
  // Shopping
  'amazon': 'Shopping',
  'flipkart': 'Shopping',
  'myntra': 'Shopping',
  'nykaa': 'Shopping',
  'ajio': 'Shopping',
  'meesho': 'Shopping',
  'snapdeal': 'Shopping',
  'paytm mall': 'Shopping',
  'bigbasket': 'Shopping',
  'grofers': 'Shopping',
  'reliance': 'Shopping',
  'dmart': 'Shopping',
  
  // Entertainment
  'netflix': 'Entertainment',
  'prime video': 'Entertainment',
  'hotstar': 'Entertainment',
  'sony liv': 'Entertainment',
  'zee5': 'Entertainment',
  'voot': 'Entertainment',
  'spotify': 'Entertainment',
  'youtube premium': 'Entertainment',
  'bookmyshow': 'Entertainment',
  'pvr': 'Entertainment',
  'inox': 'Entertainment',
  
  // Utilities
  'bsnl': 'Utilities',
  'airtel': 'Utilities',
  'jio': 'Utilities',
  'vodafone': 'Utilities',
  'idea': 'Utilities',
  'electricity': 'Utilities',
  'water': 'Utilities',
  'gas': 'Utilities',
  'broadband': 'Utilities',
  'wifi': 'Utilities',
  'internet': 'Utilities',
  
  // Health
  'pharmacy': 'Health',
  'apollo': 'Health',
  'fortis': 'Health',
  'max': 'Health',
  'medlife': 'Health',
  '1mg': 'Health',
  'pharmeasy': 'Health',
  'netmeds': 'Health',
  'practo': 'Health',
  'hospital': 'Health',
  'clinic': 'Health',
  'doctor': 'Health',
  
  // Income keywords
  'salary': 'Salary',
  'credit': 'Salary', // Generic credit (could be refined)
  'refund': 'Other Income',
  'cashback': 'Other Income',
  'reward': 'Other Income',
  'interest': 'Investment',
  'dividend': 'Investment',
};

/**
 * Category keywords for fuzzy matching
 */
export const categoryKeywords: Record<string, string[]> = {
  'Food & Dining': ['food', 'restaurant', 'cafe', 'pizza', 'burger', 'coffee', 'dining', 'meal', 'lunch', 'dinner', 'breakfast'],
  'Transport': ['taxi', 'cab', 'ride', 'metro', 'train', 'flight', 'bus', 'fuel', 'petrol', 'diesel', 'parking'],
  'Shopping': ['purchase', 'buy', 'order', 'shopping', 'mall', 'store', 'retail'],
  'Entertainment': ['movie', 'cinema', 'streaming', 'music', 'game', 'concert', 'theatre'],
  'Utilities': ['bill', 'recharge', 'electricity', 'water', 'gas', 'phone', 'internet', 'broadband'],
  'Health': ['medicine', 'pharmacy', 'hospital', 'doctor', 'clinic', 'medical', 'health'],
  'Salary': ['salary', 'payroll', 'income', 'credit'],
  'Investment': ['investment', 'stocks', 'mutual fund', 'fd', 'sip'],
};

/**
 * Matches a merchant name to a category
 */
export function matchMerchantToCategory(merchant: string): string | undefined {
  if (!merchant || merchant === 'Unknown') return undefined;
  
  const normalizedMerchant = merchant.toLowerCase().trim();
  
  // Direct mapping check
  if (merchantCategoryMap[normalizedMerchant]) {
    return merchantCategoryMap[normalizedMerchant];
  }
  
  // Check if merchant name contains any mapped keyword
  for (const [keyword, category] of Object.entries(merchantCategoryMap)) {
    if (normalizedMerchant.includes(keyword) || keyword.includes(normalizedMerchant)) {
      return category;
    }
  }
  
  // Fuzzy matching with category keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (normalizedMerchant.includes(keyword)) {
        return category;
      }
    }
  }
  
  return undefined;
}

/**
 * Suggests category based on transaction type and merchant
 */
export function suggestCategory(
  type: 'income' | 'expense',
  merchant: string,
  amount?: number
): string {
  // For income, prioritize income categories
  if (type === 'income') {
    const matched = matchMerchantToCategory(merchant);
    if (matched === 'Salary' || matched === 'Investment' || matched === 'Other Income') {
      return matched;
    }
    // Default income categories
    if (amount && amount > 10000) {
      return 'Salary'; // Large amounts likely salary
    }
    return 'Other Income';
  }
  
  // For expenses, try to match merchant
  const matched = matchMerchantToCategory(merchant);
  if (matched && matched !== 'Salary') {
    return matched;
  }
  
  return 'Other Expense'; // Default fallback
}


