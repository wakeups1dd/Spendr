# Getting Your Supabase Project Reference ID

## ✅ Found Your Project Reference ID!

I found your Supabase configuration in your `.env` file. Your project reference ID is:

**`gwrcmbuovmuzjczolfxk`**

This is extracted from your Supabase URL: `https://gwrcmbuovmuzjczolfxk.supabase.co`

## How to Get It Manually (For Reference)

If you need to find it in the future:

### Method 1: From Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Settings → General**
4. Find **Reference ID** (it's the unique identifier for your project)

### Method 2: From Your Supabase URL
If you have your Supabase URL (like in your `.env` file):
- Format: `https://YOUR_PROJECT_REF.supabase.co`
- The part before `.supabase.co` is your project reference ID

### Method 3: From Your Anon Key (JWT)
Your anon key is a JWT token. You can decode it to see the project reference:
- The `ref` field in the JWT payload contains your project reference ID

## Using It for Deployment

Now you can deploy using:

```powershell
.\deploy-function.ps1 gwrcmbuovmuzjczolfxk
```

Or manually:
```bash
npx supabase link --project-ref gwrcmbuovmuzjczolfxk
npx supabase functions deploy parse-sms --project-ref gwrcmbuovmuzjczolfxk
```

