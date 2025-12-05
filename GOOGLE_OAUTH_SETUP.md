# Setting Up Google OAuth with Supabase for Spendr

A complete step-by-step guide to enable Google Sign-In.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `spendr` (or any name you prefer)
   - **Database Password**: Create a strong password (save it somewhere)
   - **Region**: Choose the closest region to you
4. Click **"Create new project"** and wait ~2 minutes for setup

---

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

3. Create a `.env` file in your project root (`d:\Portfolio Projects\Spendr\Spendr\.env`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 3: Set Up Google Cloud OAuth

### 3.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown (top-left) → **"New Project"**
3. Name it `Spendr` and click **Create**
4. Select your new project from the dropdown

### 3.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in:
   - **App name**: `Spendr`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. Skip "Scopes" → Click **Save and Continue**
6. Skip "Test users" → Click **Save and Continue**
7. Click **Back to Dashboard**

### 3.3 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. Select **Web application**
4. Fill in:
   - **Name**: `Spendr Web`
   - **Authorized JavaScript origins**: Add these:
     ```
     http://localhost:8080
     https://your-project-id.supabase.co
     ```
   - **Authorized redirect URIs**: Add this:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
     (Replace `your-project-id` with your actual Supabase project ID)

5. Click **Create**
6. **Copy the Client ID and Client Secret** (you'll need these next)

---

## Step 4: Enable Google Provider in Supabase

1. Go back to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Click **Save**

---

## Step 5: Configure Supabase Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:8080`
3. Under **Redirect URLs**, add:
   ```
   http://localhost:8080/auth/callback
   ```
4. Click **Save**

---

## Step 6: Test the Integration

1. Stop your dev server (Ctrl+C) and restart it:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:8080` in your browser

3. Click **"Sign in with Google"**

4. You should be redirected to Google's sign-in page

5. After signing in, you'll be redirected back to the dashboard

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Double-check that the redirect URI in Google Cloud Console matches exactly:
  `https://your-project-id.supabase.co/auth/v1/callback`

### "Invalid API Key" Error
- Verify your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure you restarted the dev server after creating the `.env` file

### Not Redirecting After Sign-In
- Ensure `http://localhost:8080/auth/callback` is in your Supabase Redirect URLs
- Check browser console for any errors

---

## Production Deployment

When deploying to production, update:

1. **Google Cloud Console**:
   - Add your production URL to "Authorized JavaScript origins"
   - Add `https://your-project-id.supabase.co/auth/v1/callback` to redirect URIs

2. **Supabase Dashboard**:
   - Update **Site URL** to your production URL
   - Add `https://your-production-url.com/auth/callback` to Redirect URLs

3. **Environment Variables**:
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting platform
