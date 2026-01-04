# Deploy Edge Function Guide

This guide will help you deploy the `parse-sms` Edge Function to your Supabase project.

## Prerequisites

1. **Supabase Account** - You need a Supabase project
2. **Supabase CLI** - Install the CLI tool
3. **Project Access** - Your project reference ID

## Step 1: Install Supabase CLI

### Option A: Using npm (Recommended)
```bash
npm install -g supabase
```

### Option B: Using Scoop (Windows)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Option C: Using Chocolatey (Windows)
```bash
choco install supabase
```

### Verify Installation
```bash
supabase --version
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser for authentication. Follow the prompts to log in.

## Step 3: Link Your Project

Get your project reference ID from your Supabase dashboard:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID"

Then link it:
```bash
supabase link --project-ref your-project-ref
```

Or if you're running locally:
```bash
supabase start
```

## Step 4: Deploy the Edge Function

Deploy the `parse-sms` function:
```bash
supabase functions deploy parse-sms
```

This will:
- Upload the function code
- Deploy it to your Supabase project
- Make it available at: `https://<your-project-ref>.supabase.co/functions/v1/parse-sms`

## Step 5: Set Environment Variables (if needed)

Edge Functions automatically have access to:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

These are set automatically by Supabase.

If you need custom secrets:
```bash
supabase secrets set MY_SECRET_KEY=my_secret_value
```

## Step 6: Test the Deployment

### Using curl:
```bash
curl -i --location --request POST 'https://<your-project-ref>.supabase.co/functions/v1/parse-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "smsText": "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00",
    "userId": "your-user-id"
  }'
```

Replace:
- `<your-project-ref>` with your project reference
- `YOUR_ANON_KEY` with your anon/public key (from Supabase dashboard)
- `your-user-id` with an actual user ID (optional for testing)

### Using the Frontend Service

The function will be automatically called when you use `smsService.parseSMS()` in your React app.

## Troubleshooting

### Error: "Function not found"
- Make sure you've deployed the function: `supabase functions deploy parse-sms`
- Check the function name matches exactly

### Error: "Unauthorized"
- Ensure you're passing the Authorization header with a valid JWT token
- Use the anon key for public access (not service role key)

### Error: "Module not found"
- Check that `parser.ts` exists in `supabase/functions/parse-sms/`
- Verify all imports are correct

### Check Function Logs
```bash
supabase functions logs parse-sms
```

### View All Functions
```bash
supabase functions list
```

## Update/Re-deploy

To update the function after making changes:
```bash
supabase functions deploy parse-sms
```

## Local Testing (Optional)

Before deploying, you can test locally:
```bash
# Start local Supabase (if not running)
supabase start

# Serve functions locally
supabase functions serve parse-sms

# Test locally
curl -i --location --request POST 'http://localhost:54321/functions/v1/parse-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"smsText": "Rs.100 debited...", "userId": "test-user"}'
```

## Next Steps

After successful deployment:
1. Test with real SMS samples
2. Monitor function logs for errors
3. Update patterns based on feedback
4. Deploy other functions (sync-transaction) when ready

## Notes

- Edge Functions are serverless and scale automatically
- There may be cold start delays on first invocation
- Functions have a default timeout (check Supabase limits)
- Monitor usage in Supabase dashboard


