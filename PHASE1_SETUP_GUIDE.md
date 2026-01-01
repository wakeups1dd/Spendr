# Phase 1 Setup Guide - SMS Parsing Backend Infrastructure

This guide will help you set up the database schemas and Edge Functions for the SMS parsing feature.

## Prerequisites

1. **Supabase CLI** - Install if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. **Deno** - Required for Edge Functions:
   - Install from: https://deno.land/
   - Or use a version manager: https://github.com/denoland/deno_install

3. **Supabase Account** - You need a Supabase project (free tier works)

## Step 1: Link Your Supabase Project

1. Login to Supabase CLI:
   ```bash
   supabase login
   ```

2. Link your project (get your project ref from Supabase dashboard):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   
   Or if running locally:
   ```bash
   supabase start
   ```

## Step 2: Apply Database Migrations

The migration file `supabase/migrations/001_add_sms_parsing_tables.sql` will:
- Add `raw_sms` and `parsed_json` columns to the `transactions` table (if they don't exist)
- Create `sms_sync_settings` table
- Create `parsed_transactions_queue` table
- Set up Row Level Security (RLS) policies
- Create indexes for performance

### Apply Migration to Remote (Production):

```bash
supabase db push
```

### Or Apply Locally (for testing):

```bash
supabase db reset
```

This will apply all migrations from scratch. If you have existing data, use:
```bash
supabase migration up
```

### Verify Migration:

Check in your Supabase dashboard:
- SQL Editor → Run: `SELECT * FROM sms_sync_settings LIMIT 1;`
- Should not error (table exists)
- Check RLS policies are enabled

## Step 3: Deploy Edge Functions

### Install Dependencies (if needed):

Edge Functions use Deno's native module system, so no npm install needed.

### Deploy Functions:

1. **Deploy parse-sms function:**
   ```bash
   supabase functions deploy parse-sms
   ```

2. **Deploy sync-transaction function:**
   ```bash
   supabase functions deploy sync-transaction
   ```

### Test Functions Locally First:

1. Start local Supabase (if not already running):
   ```bash
   supabase start
   ```

2. Serve functions locally:
   ```bash
   supabase functions serve
   ```

3. Test parse-sms (replace YOUR_ANON_KEY with your anon key):
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/parse-sms' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{
       "smsText": "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00",
       "userId": "YOUR_USER_ID"
     }'
   ```

4. Test sync-transaction:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/sync-transaction' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{
       "userId": "YOUR_USER_ID",
       "parsedTransaction": {
         "amount": 1234.56,
         "type": "expense",
         "merchant": "SWIGGY",
         "date": "2024-01-15T10:30:00Z",
         "confidence": 0.8,
         "rawSms": "Rs.1,234.56 debited..."
       },
       "autoApprove": false
     }'
   ```

## Step 4: Verify Setup

### Check Tables Exist:

Run in Supabase SQL Editor:
```sql
-- Check transactions table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name IN ('raw_sms', 'parsed_json', 'source');

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('sms_sync_settings', 'parsed_transactions_queue');
```

### Check RLS Policies:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('sms_sync_settings', 'parsed_transactions_queue');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('sms_sync_settings', 'parsed_transactions_queue');
```

### Check Edge Functions:

1. In Supabase Dashboard → Edge Functions
2. You should see `parse-sms` and `sync-transaction` functions
3. Check function logs for any errors

## Step 5: Update Frontend Code

The frontend code has been updated:
- ✅ `src/types/finance.ts` - Added SMS-related types
- ✅ `src/contexts/FinanceContext.tsx` - Updated to handle `raw_sms` and `parsed_json`
- ✅ `src/services/smsService.ts` - New service for SMS operations

## Step 6: Test Integration

### Test SMS Service (in browser console after logging in):

```javascript
// Import the service (adjust import path as needed)
import { smsService } from './src/services/smsService';

// Test parsing
const result = await smsService.parseSMS(
  "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00"
);
console.log(result);

// Test sync (with autoApprove: false to add to queue)
if (result.success && result.data) {
  const syncResult = await smsService.syncTransaction(result.data, false);
  console.log(syncResult);
}

// Check queue
const queue = await smsService.getPendingTransactions();
console.log(queue);
```

## Troubleshooting

### Migration Errors:

- **"relation already exists"**: Tables already exist. Check if migration was partially applied.
- **"permission denied"**: Ensure you're using the service role key for migrations, or that your user has proper permissions.
- **"column already exists"**: The columns already exist in transactions table. The migration uses `IF NOT EXISTS` so this should be safe.

### Edge Function Errors:

- **"Function not found"**: Ensure functions are deployed: `supabase functions deploy <function-name>`
- **"Unauthorized"**: Check that you're passing the Authorization header with a valid JWT token.
- **"Module not found"**: Edge Functions use Deno imports. Ensure imports use `https://` URLs (already configured).

### RLS Policy Issues:

- **"permission denied for table"**: Check that RLS policies are created and the user is authenticated.
- **"policy does not exist"**: Re-run the migration or manually create policies.

## Next Steps

After completing Phase 1, you can proceed to:
- **Phase 2**: Implement the actual SMS parsing engine with bank-specific patterns
- **Phase 3**: Build the Android app
- **Phase 4**: Create the web UI for managing parsed transactions

## Environment Variables

For Edge Functions, Supabase automatically provides:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your anon/public key

You can add custom secrets if needed:
```bash
supabase secrets set MY_SECRET=my_value
```

Access in functions via: `Deno.env.get("MY_SECRET")`

## Notes

- The `parse-sms` function currently has placeholder parsing logic. Real parsing will be implemented in Phase 2.
- The functions include CORS headers for cross-origin requests.
- All database operations use Row Level Security (RLS) for data isolation per user.
- The migration is idempotent - safe to run multiple times.

