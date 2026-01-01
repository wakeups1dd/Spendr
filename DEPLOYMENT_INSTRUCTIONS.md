# Edge Function Deployment Instructions

## Current Status

The Edge Function code is ready in `supabase/functions/parse-sms/`. To deploy it, you need to install the Supabase CLI.

## Recommended Installation Method

Since npm global install doesn't work and Chocolatey package isn't available, here are your best options:

### Option 1: Direct Binary Download (Easiest)

1. **Download the Windows binary:**
   - Go to: https://github.com/supabase/cli/releases/latest
   - Download: `supabase_windows_amd64.zip` (or `supabase_windows_arm64.zip` for ARM)
   - Extract the ZIP file

2. **Add to PATH (Optional but recommended):**
   - Copy `supabase.exe` to a folder (e.g., `C:\tools\supabase\`)
   - Add that folder to your Windows PATH environment variable
   - Or keep it in a folder and use the full path when running commands

3. **Verify installation:**
   ```powershell
   supabase --version
   # Or if not in PATH:
   .\supabase.exe --version
   ```

### Option 2: Install Scoop First (Then Supabase)

If you want a package manager approach:

1. **Install Scoop:**
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Install Supabase:**
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

### Option 3: Use Docker (Alternative)

If you have Docker installed, you can use the Supabase CLI via Docker:

```bash
docker run --rm supabase/cli:latest functions deploy parse-sms --project-ref YOUR_PROJECT_REF
```

But this requires setting up authentication differently.

## Deployment Steps (Once CLI is Installed)

1. **Login to Supabase:**
   ```bash
   supabase login
   ```
   This opens your browser for authentication.

2. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   Get your project ref from: Supabase Dashboard → Settings → General → Reference ID

3. **Deploy the function:**
   ```bash
   supabase functions deploy parse-sms
   ```

4. **Verify:**
   ```bash
   supabase functions list
   ```

## Alternative: Manual Deployment via Dashboard

If CLI installation is problematic, you can deploy manually:

1. **Go to Supabase Dashboard:**
   - Navigate to: https://app.supabase.com
   - Select your project
   - Go to: Edge Functions

2. **Create New Function:**
   - Click "Create a new function"
   - Name it: `parse-sms`

3. **Copy the code:**
   - Copy contents from `supabase/functions/parse-sms/index.ts`
   - Copy contents from `supabase/functions/parse-sms/parser.ts`
   - Combine them or create the parser.ts as a separate file if the dashboard supports it

4. **Deploy through the UI**

## Testing After Deployment

Your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/parse-sms
```

Test it with:
```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/parse-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "smsText": "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00",
    "userId": "test-user-id"
  }'
```

Get `YOUR_ANON_KEY` from: Supabase Dashboard → Settings → API → Project API keys → anon public

## Next Steps

After successful deployment:
1. ✅ Test with real SMS samples
2. ✅ Monitor function logs
3. ✅ Update the frontend to use the deployed function
4. ✅ Deploy `sync-transaction` function when ready

## Files Ready for Deployment

- ✅ `supabase/functions/parse-sms/index.ts` - Main function handler
- ✅ `supabase/functions/parse-sms/parser.ts` - Parser logic
- ✅ Both files are Deno-compatible and ready to deploy

