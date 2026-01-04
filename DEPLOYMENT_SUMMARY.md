# Edge Function Deployment Summary

## ✅ Ready to Deploy

Your `parse-sms` Edge Function is ready for deployment!

**Location:** `supabase/functions/parse-sms/`
- ✅ `index.ts` - Main function handler
- ✅ `parser.ts` - SMS parsing logic

## Quick Deploy Options

### Option 1: Using PowerShell Script (Easiest)

1. Get your Project Reference ID from Supabase Dashboard
2. Run:
   ```powershell
   .\deploy-function.ps1 YOUR_PROJECT_REF
   ```

### Option 2: Manual npx Commands

```bash
# 1. Login
npx supabase login

# 2. Link project (replace YOUR_PROJECT_REF)
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Deploy
npx supabase functions deploy parse-sms --project-ref YOUR_PROJECT_REF
```

### Option 3: Install CLI First (For Repeated Deployments)

Download binary from: https://github.com/supabase/cli/releases

Then use:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy parse-sms
```

## Get Your Project Reference ID

1. Go to: https://app.supabase.com
2. Select your project
3. Settings → General → Reference ID

## What Gets Deployed

- ✅ SMS parsing logic with bank-specific patterns
- ✅ HDFC, ICICI, SBI, Axis, and Generic bank parsers
- ✅ Category auto-matching
- ✅ Confidence scoring
- ✅ Full transaction extraction

## After Deployment

Your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/parse-sms
```

The frontend `smsService.parseSMS()` will automatically use this deployed function.

## Need Help?

- See `DEPLOY_WITH_NPX.md` for detailed npx instructions
- See `DEPLOYMENT_INSTRUCTIONS.md` for CLI installation methods
- See `PHASE2_IMPLEMENTATION_SUMMARY.md` for function details


