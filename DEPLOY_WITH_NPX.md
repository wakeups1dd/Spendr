# Deploy Edge Function Using npx (Quick Method)

Since Supabase CLI is available via npx, you can deploy without installing it globally.

## Step 1: Get Your Project Reference ID

1. Go to: https://app.supabase.com
2. Select your project (or create one)
3. Go to: **Settings → General**
4. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

## Step 2: Login to Supabase

```bash
npx supabase login
```

This will open your browser for authentication.

## Step 3: Link Your Project

Replace `YOUR_PROJECT_REF` with your actual project reference ID:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

## Step 4: Deploy the Function

```bash
npx supabase functions deploy parse-sms --project-ref YOUR_PROJECT_REF
```

Or if you've linked the project:
```bash
npx supabase functions deploy parse-sms
```

## Alternative: One-Line Deploy (If Already Linked)

If you've already linked your project in a previous session:

```bash
npx supabase functions deploy parse-sms
```

## Verify Deployment

```bash
npx supabase functions list --project-ref YOUR_PROJECT_REF
```

## Test the Function

After deployment, your function URL will be:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/parse-sms
```

Get your anon key from: **Settings → API → anon public**

Test with curl (PowerShell):
```powershell
curl.exe -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/parse-sms' `
  --header 'Authorization: Bearer YOUR_ANON_KEY' `
  --header 'Content-Type: application/json' `
  --data '{\"smsText\": \"Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00\", \"userId\": \"test-user-id\"}'
```

## Notes

- Using npx downloads the CLI each time (slower but works)
- For frequent deployments, consider installing CLI globally via binary download
- See `DEPLOYMENT_INSTRUCTIONS.md` for alternative installation methods

