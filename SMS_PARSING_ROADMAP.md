# SMS Parsing Feature Roadmap 📱

This document outlines a comprehensive roadmap for implementing SMS parsing functionality in the Spendr finance tracking application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Options](#architecture-options)
3. [Recommended Approach](#recommended-approach)
4. [Implementation Phases](#implementation-phases)
5. [Technical Specifications](#technical-specifications)
6. [Testing Strategy](#testing-strategy)
7. [Security & Privacy](#security--privacy)
8. [Future Enhancements](#future-enhancements)

---

## Overview

The SMS parsing feature will automatically extract transaction information from bank SMS notifications and sync them to the Spendr web application. This eliminates manual entry and provides real-time transaction tracking.

### Current State
- ✅ Transaction type already supports `source: 'sms'`
- ✅ Transaction interface includes `rawSms` and `parsedJson` fields
- ✅ Supabase backend infrastructure in place
- ❌ No SMS parsing logic implemented
- ❌ No SMS ingestion mechanism
- ❌ No Android app or SMS bridge

---

## Architecture Options

### Option 1: Native Android App (Recommended)
**Pros:**
- Direct access to SMS inbox
- Can run in background
- Better user experience
- Full control over SMS access permissions

**Cons:**
- Requires Android development skills
- Separate codebase to maintain
- App store submission process

### Option 2: Android SMS Bridge via Webhook
**Pros:**
- Lightweight Android app
- Centralized logic in web app
- Easier to update parsing logic

**Cons:**
- Requires API endpoints
- More complex setup
- Latency in processing

### Option 3: Browser Extension (Limited)
**Pros:**
- No separate app needed
- Cross-platform

**Cons:**
- Cannot access SMS directly
- Requires manual copy-paste
- Limited functionality

### Option 4: Third-party SMS Gateway
**Pros:**
- No mobile app needed
- Professional SMS APIs

**Cons:**
- Requires phone number registration
- Additional costs
- Privacy concerns
- May not work with all carriers

---

## Recommended Approach

**Hybrid: Native Android App + Supabase Edge Functions + Web App Integration**

This approach provides:
- Native Android app for SMS access
- Supabase Edge Functions for parsing logic (centralized, updatable)
- Web app UI for viewing and managing parsed transactions

---

## Implementation Phases

### Phase 1: Backend Infrastructure Setup (Week 1-2)

#### 1.1 Database Schema Updates
- [ ] Verify `transactions` table includes:
  - `source` column (already supports 'sms')
  - `raw_sms` column (text, nullable)
  - `parsed_json` column (jsonb, nullable)
- [ ] Create `sms_sync_settings` table:
  ```sql
  CREATE TABLE sms_sync_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT,
    bank_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Create `parsed_transactions_queue` table (for manual review):
  ```sql
  CREATE TABLE parsed_transactions_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_sms TEXT NOT NULL,
    parsed_json JSONB,
    confidence_score DECIMAL(3,2),
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'duplicate'
    suggested_transaction JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

#### 1.2 Supabase Edge Functions Setup
- [ ] Install Supabase CLI
- [ ] Create Edge Function: `parse-sms`
  - Input: Raw SMS text, user_id, phone_number
  - Output: Parsed transaction data with confidence score
- [ ] Create Edge Function: `sync-transaction`
  - Input: Parsed transaction data, user_id
  - Output: Created transaction or error
- [ ] Set up authentication for Edge Functions (JWT validation)

#### 1.3 API Endpoints (Supabase REST or Edge Functions)
- [ ] `POST /api/v1/sms/parse` - Parse SMS text
- [ ] `POST /api/v1/sms/sync` - Sync parsed transaction
- [ ] `GET /api/v1/sms/queue` - Get pending transactions
- [ ] `POST /api/v1/sms/queue/:id/approve` - Approve transaction
- [ ] `POST /api/v1/sms/queue/:id/reject` - Reject transaction
- [ ] `GET /api/v1/sms/settings` - Get sync settings
- [ ] `POST /api/v1/sms/settings` - Update sync settings

---

### Phase 2: SMS Parsing Engine (Week 2-3)

#### 2.1 Core Parsing Logic
- [ ] Create parsing service structure:
  ```
  src/services/sms-parser/
    ├── parser.ts          # Main parser orchestrator
    ├── patterns.ts        # Regex patterns for different banks
    ├── banks/
    │   ├── hdfc.ts       # HDFC Bank patterns
    │   ├── sbi.ts        # State Bank of India patterns
    │   ├── icici.ts      # ICICI Bank patterns
    │   ├── axis.ts       # Axis Bank patterns
    │   └── generic.ts    # Generic fallback patterns
    ├── utils.ts          # Helper functions
    └── types.ts          # TypeScript types
  ```

#### 2.2 Bank Pattern Development
For each supported bank, create patterns to extract:
- [ ] Transaction amount
- [ ] Transaction type (debit/credit/income/expense)
- [ ] Merchant/vendor name
- [ ] Transaction date and time
- [ ] Account balance (optional)
- [ ] Transaction reference number (optional)

**Example Pattern Structure:**
```typescript
interface BankPattern {
  bankName: string;
  patterns: {
    debit: RegExp[];
    credit: RegExp[];
  };
  extractAmount: (match: RegExpMatchArray) => number;
  extractMerchant: (match: RegExpMatchArray) => string;
  extractDate: (match: RegExpMatchArray) => Date;
  extractType: (match: RegExpMatchArray) => 'income' | 'expense';
}
```

#### 2.3 Parsing Service Implementation
- [ ] Implement main parser function:
  - Try bank-specific parsers first
  - Fall back to generic parser
  - Return confidence score (0-1)
  - Return structured data or null
- [ ] Add transaction type detection:
  - Keywords for income: "credited", "received", "salary"
  - Keywords for expense: "debited", "spent", "purchase", "paid"
- [ ] Add merchant name extraction and normalization
- [ ] Add category suggestion based on merchant keywords

#### 2.4 Category Auto-matching
- [ ] Create merchant-to-category mapping:
  ```typescript
  const merchantCategoryMap: Record<string, string> = {
    'swiggy': 'Food',
    'zomato': 'Food',
    'uber': 'Transport',
    'ola': 'Transport',
    'amazon': 'Shopping',
    'flipkart': 'Shopping',
    // ... more mappings
  };
  ```
- [ ] Implement fuzzy matching for merchant names
- [ ] Allow user to customize merchant-category mappings

---

### Phase 3: Android App Development (Week 3-5)

#### 3.1 Project Setup
- [ ] Create new Android project (Kotlin recommended)
- [ ] Set up project structure
- [ ] Configure dependencies:
  - Retrofit/OkHttp for API calls
  - Room Database (optional, for offline support)
  - WorkManager for background processing
  - Permissions library

#### 3.2 Core Features
- [ ] SMS Permission Request (READ_SMS)
- [ ] SMS Reader Service:
  - Monitor SMS inbox for bank messages
  - Filter by sender (bank numbers)
  - Extract SMS content
- [ ] Authentication Integration:
  - Supabase Auth SDK for Android
  - Secure token storage
- [ ] Background Service:
  - Foreground service for continuous monitoring
  - WorkManager for periodic sync
  - Battery optimization handling

#### 3.3 SMS Processing
- [ ] SMS Observer/Receiver:
  - Listen for new SMS
  - Filter bank SMS based on sender numbers
  - Extract SMS body and metadata
- [ ] API Integration:
  - Call parsing API with SMS text
  - Handle parsing response
  - Send parsed data to sync endpoint
- [ ] Error Handling:
  - Network failures
  - Parsing failures
  - Rate limiting

#### 3.4 User Interface (Minimal)
- [ ] Onboarding screen (permissions, bank selection)
- [ ] Settings screen:
  - Enable/disable sync
  - Select banks to monitor
  - View sync status
- [ ] Sync status indicator
- [ ] Error notifications

#### 3.5 Security
- [ ] Encrypt sensitive data (tokens, SMS)
- [ ] Secure storage using Android Keystore
- [ ] Certificate pinning for API calls
- [ ] Obfuscate sensitive strings

---

### Phase 4: Web App Integration (Week 5-6)

#### 4.1 Frontend Components
- [ ] SMS Settings Page (`/settings/sms`):
  - Enable/disable SMS sync
  - View connected phone number
  - Sync status indicator
  - Last sync time
- [ ] Parsed Transactions Queue Page (`/transactions/pending`):
  - List of pending transactions
  - Approve/Reject actions
  - Edit transaction before approval
  - Bulk actions
- [ ] Transaction List Enhancement:
  - Show SMS source indicator
  - View raw SMS on hover/click
  - Option to edit SMS-parsed transactions

#### 4.2 API Integration
- [ ] Create SMS service (`src/services/smsService.ts`):
  ```typescript
  export const smsService = {
    getSettings: () => supabase.from('sms_sync_settings').select('*'),
    updateSettings: (settings) => supabase.from('sms_sync_settings').upsert(settings),
    getPendingTransactions: () => supabase.from('parsed_transactions_queue').select('*'),
    approveTransaction: (id, transaction) => { /* ... */ },
    rejectTransaction: (id) => { /* ... */ },
    testParse: (smsText) => supabase.functions.invoke('parse-sms', { body: { text: smsText } })
  };
  ```
- [ ] Integrate with FinanceContext
- [ ] Add real-time subscriptions for new parsed transactions

#### 4.3 UI Components
- [ ] `SmsSettingsCard` component
- [ ] `PendingTransactionCard` component
- [ ] `SmsSourceBadge` component
- [ ] `SmsParserTest` component (for testing)

---

### Phase 5: Duplicate Detection & Deduplication (Week 6-7)

#### 5.1 Duplicate Detection Logic
- [ ] Create duplicate detection service:
  - Compare amount, date, merchant
  - Fuzzy matching for similar transactions
  - Time window (e.g., 24 hours)
- [ ] Database query optimization for duplicate checks
- [ ] Handle edge cases:
  - Refunds (negative amounts)
  - Partial refunds
  - Same merchant, multiple transactions in short time

#### 5.2 User Experience
- [ ] Show duplicate warnings in queue
- [ ] Auto-merge option for duplicates
- [ ] Manual merge UI

---

### Phase 6: Testing & Refinement (Week 7-8)

#### 6.1 Unit Testing
- [ ] Test parsing patterns for each bank
- [ ] Test edge cases (special characters, multiple currencies)
- [ ] Test category matching logic
- [ ] Test duplicate detection

#### 6.2 Integration Testing
- [ ] End-to-end flow: SMS → Parse → Queue → Approve
- [ ] API endpoint testing
- [ ] Android app → Backend integration
- [ ] Error scenario testing

#### 6.3 User Testing
- [ ] Beta testing with real users
- [ ] Collect feedback on parsing accuracy
- [ ] Gather SMS samples for pattern refinement
- [ ] Performance testing

---

## Technical Specifications

### SMS Format Examples

**HDFC Bank:**
```
Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00
```

**ICICI Bank:**
```
INR 5,000.00 credited to A/c XX5678 on 15-Jan-24. Ref No:123456. Avl Bal:INR 55,000.00
```

**State Bank of India:**
```
A/c XX9012 debited by Rs.999.00 on 15-Jan-24. UPI/PAYTM. Avl Bal Rs.40,000.00
```

### Parsed Transaction Structure

```typescript
interface ParsedTransaction {
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  date: string; // ISO format
  category?: string; // Suggested category
  confidence: number; // 0-1
  rawSms: string;
  metadata?: {
    accountNumber?: string;
    referenceNumber?: string;
    balance?: number;
    bankName?: string;
  };
}
```

### API Request/Response Examples

**Parse SMS:**
```typescript
POST /api/v1/sms/parse
{
  "smsText": "Rs.1,234.56 debited from A/c XX1234...",
  "phoneNumber": "+919876543210",
  "userId": "user-uuid"
}

Response:
{
  "success": true,
  "data": {
    "amount": 1234.56,
    "type": "expense",
    "merchant": "SWIGGY",
    "date": "2024-01-15T10:30:00Z",
    "category": "Food",
    "confidence": 0.95,
    "rawSms": "...",
    "metadata": { ... }
  }
}
```

---

## Testing Strategy

### Unit Tests
- [ ] Test each bank parser independently
- [ ] Test amount extraction (various formats)
- [ ] Test date parsing (various formats)
- [ ] Test merchant name extraction
- [ ] Test category matching

### Integration Tests
- [ ] Test full parsing pipeline
- [ ] Test API endpoints
- [ ] Test database operations
- [ ] Test duplicate detection

### E2E Tests
- [ ] Test Android app → API → Database flow
- [ ] Test web app queue approval flow
- [ ] Test error scenarios

### Manual Testing Checklist
- [ ] Parse SMS from 5+ different banks
- [ ] Test with various transaction types
- [ ] Test edge cases (refunds, failed transactions)
- [ ] Test duplicate detection
- [ ] Test offline scenarios (Android app)
- [ ] Test error handling and recovery

---

## Security & Privacy

### Data Security
- [ ] Encrypt SMS data in transit (HTTPS/TLS)
- [ ] Encrypt sensitive data at rest
- [ ] Implement rate limiting on API endpoints
- [ ] Use secure authentication (JWT tokens)
- [ ] Implement API key rotation

### Privacy Considerations
- [ ] Clear privacy policy for SMS data usage
- [ ] User consent for SMS access
- [ ] Option to delete raw SMS after processing
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policies

### Permissions
- [ ] Minimal permissions (READ_SMS only)
- [ ] Clear explanation of why permissions are needed
- [ ] Graceful handling of permission denial

---

## Future Enhancements

### Phase 7+ (Post-MVP)
- [ ] iOS app support (requires different approach - Shortcuts/Widgets)
- [ ] Multi-language SMS support
- [ ] Machine learning for improved parsing accuracy
- [ ] Receipt scanning integration
- [ ] Bank API integration (when available)
- [ ] Real-time notifications for transactions
- [ ] Budget alerts based on parsed transactions
- [ ] Spending insights from SMS data
- [ ] Export parsed SMS data
- [ ] Custom parsing rules per user

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Backend Setup | 2 weeks | - |
| Phase 2: Parsing Engine | 2 weeks | Phase 1 |
| Phase 3: Android App | 3 weeks | Phase 1, Phase 2 |
| Phase 4: Web Integration | 2 weeks | Phase 1, Phase 2 |
| Phase 5: Deduplication | 1 week | Phase 2, Phase 4 |
| Phase 6: Testing | 2 weeks | All phases |
| **Total** | **12 weeks** | |

---

## Resources & References

### Documentation
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Android SMS API](https://developer.android.com/guide/components/intents-filters#sms)
- [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager)

### Libraries
- Android: Retrofit, OkHttp, Room, WorkManager
- Backend: Supabase Functions, Node.js/Deno
- Frontend: Existing React + TypeScript stack

### Bank SMS Pattern Research
- Collect real SMS samples from users
- Analyze patterns for major banks
- Create regex patterns based on samples

---

## Notes

- Start with 3-5 major banks for MVP
- Prioritize banks with consistent SMS formats
- Collect user feedback early and iterate
- Consider creating a pattern submission system for users to contribute
- Keep parsing logic centralized (Edge Functions) for easier updates
- Monitor parsing accuracy and adjust patterns regularly

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Status:** Planning Phase

