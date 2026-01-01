// SMS Parser for Edge Functions (Deno-compatible)
// Simplified version of the main parser optimized for Deno runtime

export interface ParsedTransaction {
  amount: number;
  type: "income" | "expense";
  merchant: string;
  date: string;
  category?: string;
  confidence: number;
  rawSms: string;
  metadata?: {
    accountNumber?: string;
    referenceNumber?: string;
    balance?: number;
    bankName?: string;
    [key: string]: unknown;
  };
}

function normalizeAmount(amountStr: string): number {
  if (!amountStr) return 0;
  const cleaned = amountStr
    .replace(/[Rs\.|INR|USD|EUR|₹]/gi, "")
    .replace(/,/g, "")
    .trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeMerchantName(merchant: string): string {
  if (!merchant) return "Unknown";
  return merchant
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(UPI\/|NEFT\/|IMPS\/|RTGS\/)/i, "")
    .replace(/^BY\s+/i, "")
    .replace(/^AT\s+/i, "")
    .replace(/^VIA\s+/i, "")
    .trim() || "Unknown";
}

function parseSMSDate(dateStr: string): Date {
  const now = new Date();
  let date = new Date(now);

  if (!dateStr) return date;

  const ddmmyyMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (ddmmyyMatch) {
    const day = parseInt(ddmmyyMatch[1], 10);
    const month = parseInt(ddmmyyMatch[2], 10) - 1;
    let year = parseInt(ddmmyyMatch[3], 10);
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    date = new Date(year, month, day);
  }

  const ddmmyyyyMatch = dateStr.match(
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i
  );
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const month = monthNames.indexOf(ddmmyyyyMatch[2].toLowerCase());
    const year = parseInt(ddmmyyyyMatch[3], 10);
    if (month !== -1) {
      date = new Date(year, month, day);
    }
  }

  const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const minDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  if (date > maxDate || date < minDate) {
    return now;
  }

  return date;
}

function cleanSMSText(text: string): string {
  return text.replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

const merchantCategoryMap: Record<string, string> = {
  swiggy: "Food & Dining",
  zomato: "Food & Dining",
  "uber eats": "Food & Dining",
  dominos: "Food & Dining",
  "pizza hut": "Food & Dining",
  mcdonalds: "Food & Dining",
  kfc: "Food & Dining",
  starbucks: "Food & Dining",
  "cafe coffee day": "Food & Dining",
  ccd: "Food & Dining",
  barista: "Food & Dining",
  uber: "Transport",
  ola: "Transport",
  rapido: "Transport",
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  netflix: "Entertainment",
  "prime video": "Entertainment",
  hotstar: "Entertainment",
  salary: "Salary",
};

function suggestCategory(
  type: "income" | "expense",
  merchant: string,
  amount?: number
): string {
  if (type === "income") {
    const normalized = merchant.toLowerCase().trim();
    if (merchantCategoryMap[normalized] === "Salary") return "Salary";
    if (amount && amount > 10000) return "Salary";
    return "Other Income";
  }

  const normalized = merchant.toLowerCase().trim();
  if (merchantCategoryMap[normalized] && merchantCategoryMap[normalized] !== "Salary") {
    return merchantCategoryMap[normalized];
  }

  for (const [keyword, category] of Object.entries(merchantCategoryMap)) {
    if (normalized.includes(keyword) && category !== "Salary") {
      return category;
    }
  }

  return "Other Expense";
}

// Bank patterns
const bankPatterns = [
  {
    name: "HDFC",
    patterns: {
      debit: [
        /Rs\.?([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})\s+by\s+(?:NEFT|UPI|IMPS|RTGS)\/([A-Z0-9\s\-\.]+)/i,
        /Rs\.?([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      ],
      credit: [
        /Rs\.?([\d,]+\.?\d*)\s+credited\s+to\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      ],
    },
  },
  {
    name: "ICICI",
    patterns: {
      debit: [
        /INR\s+([\d,]+\.?\d*)\s+debited\s+from\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
        /INR\s+([\d,]+\.?\d*)\s+paid\s+to\s+([A-Z0-9\s\-\.]+)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      ],
      credit: [
        /INR\s+([\d,]+\.?\d*)\s+credited\s+to\s+A\/c\s+\w+\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      ],
    },
  },
  {
    name: "SBI",
    patterns: {
      debit: [
        /A\/c\s+\w+\s+debited\s+by\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
        /UPI\/([A-Z0-9\s\-\.]+)\s+Rs\.?([\d,]+\.?\d*)\s+debited/i,
      ],
      credit: [
        /A\/c\s+\w+\s+credited\s+by\s+Rs\.?([\d,]+\.?\d*)\s+on\s+(\d{1,2}[-/]\w+[-/]\d{2,4})/i,
      ],
    },
  },
  {
    name: "Generic",
    patterns: {
      debit: [
        /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:debited|spent|paid|withdrawn)/i,
        /([\d,]+\.?\d*)\s*(?:Rs\.?|INR)\s*(?:debited|spent|paid|withdrawn)/i,
      ],
      credit: [
        /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:credited|received|deposited)/i,
        /([\d,]+\.?\d*)\s*(?:Rs\.?|INR)\s*(?:credited|received|deposited)/i,
      ],
    },
  },
];

export function parseSMS(smsText: string, senderId?: string): ParsedTransaction {
  const cleanedText = cleanSMSText(smsText);
  const upperText = cleanedText.toUpperCase();

  const isCredit =
    upperText.includes("CREDITED") ||
    upperText.includes("CREDIT") ||
    upperText.includes("RECEIVED") ||
    upperText.includes("DEPOSITED") ||
    upperText.includes("SALARY");

  let amount = 0;
  let merchant = "Unknown";
  let date = new Date();
  let bankName = "Unknown";

  // Try each bank pattern
  for (const bank of bankPatterns) {
    const patterns = isCredit ? bank.patterns.credit : bank.patterns.debit;

    for (const pattern of patterns) {
      const match = cleanedText.match(pattern);
      if (match && match[1]) {
        amount = normalizeAmount(match[1] || match[2] || "");
        if (amount > 0) {
          bankName = bank.name;

          // Extract merchant
          if (match[3] && !match[3].match(/\d{1,2}[-/]\w+[-/]\d{2,4}/)) {
            merchant = normalizeMerchantName(match[3]);
          } else {
            const upiMatch = cleanedText.match(/(?:UPI|NEFT|IMPS)\/([A-Z0-9\s\-\.]+)/i);
            if (upiMatch && upiMatch[1]) {
              merchant = normalizeMerchantName(upiMatch[1]);
            } else {
              const paidMatch = cleanedText.match(/(?:paid\s+to|received\s+from|by)\s+([A-Z0-9\s\-\.]+)/i);
              if (paidMatch && paidMatch[1]) {
                merchant = normalizeMerchantName(paidMatch[1]);
              }
            }
          }

          // Extract date
          if (match[2] && match[2].match(/\d{1,2}[-/]\w+[-/]\d{2,4}/)) {
            date = parseSMSDate(match[2]);
          } else {
            const dateMatch = cleanedText.match(/(\d{1,2}[-/]\w+[-/]\d{2,4})/i);
            if (dateMatch) {
              date = parseSMSDate(dateMatch[1]);
            }
          }

          break;
        }
      }
      if (amount > 0) break;
    }
    if (amount > 0) break;
  }

  const type: "income" | "expense" = isCredit ? "income" : "expense";
  const category = suggestCategory(type, merchant, amount);

  let confidence = 0.5;
  if (amount > 0) confidence += 0.2;
  if (merchant !== "Unknown") confidence += 0.2;
  if (bankName !== "Generic" && bankName !== "Unknown") confidence += 0.1;
  confidence = Math.min(confidence, 1.0);

  return {
    amount,
    type,
    merchant,
    date: date.toISOString(),
    category,
    confidence,
    rawSms: smsText,
    metadata: {
      bankName,
    },
  };
}

