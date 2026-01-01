# Quick Edge Function Deployment Guide

## Installation Options

Supabase CLI cannot be installed via `npm install -g`. Use one of these methods:

### Option 1: Using Scoop (Recommended for Windows)

1. Install Scoop (if not installed):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. Add Supabase bucket:
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   ```

3. Install Supabase CLI:
   ```powershell
   scoop install supabase
   ```

### Option 2: Using Chocolatey

```powershell
choco install supabase
```

### Option 3: Download Binary Directly

1. Go to: https://github.com/supabase/cli/releases
2. Download the Windows binary (`supabase_windows_amd64.zip`)
3. Extract and add to PATH, or run directly

### Option 4: Use npx (Temporary)

You can use npx for one-time deployments (slower):
```bash
npx supabase functions deploy parse-sms --project-ref your-project-ref
```

## Quick Deployment Steps

Once CLI is installed:

1. **Login:**
   ```bash
   supabase login
   ```

2. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Get project ref from Supabase dashboard → Settings → General)

3. **Deploy the function:**
   ```bash
   supabase functions deploy parse-sms
   ```

4. **Verify deployment:**
   ```bash
   supabase functions list
   ```

## Alternative: Deploy via Supabase Dashboard

If CLI installation is problematic, you can also:

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions
3. Create a new function manually
4. Copy the code from `supabase/functions/parse-sms/index.ts` and `parser.ts`
5. Deploy through the UI

However, using the CLI is recommended for easier updates.

## Need Help?

See `DEPLOY_EDGE_FUNCTION.md` for detailed instructions and troubleshooting.

