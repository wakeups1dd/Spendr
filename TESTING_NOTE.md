# Important Note: Testing the Edge Function

## Authentication Requirement

The `parse-sms` Edge Function requires **user authentication** (JWT token), not just the anon key. This is by design for security.

## Testing Options

### Option 1: Test from Your Frontend (Recommended)

The function will work correctly when called from your React app using `smsService.parseSMS()` because:
- The frontend automatically includes the user's JWT token
- The user is authenticated via Supabase Auth
- The function validates the user session

**Test in your app:**
1. Run your React app: `npm run dev`
2. Log in to your app
3. Use the SMS parsing feature - it will automatically use the deployed function

### Option 2: Get a User JWT Token

To test via curl/scripts, you need a valid user JWT token:

1. **Log in via your app:**
   - Open browser DevTools → Application/Storage → Local Storage
   - Look for Supabase auth token: `sb-<project>-auth-token`
   - Extract the `access_token` from the stored session

2. **Or create a test user and get token:**
   ```javascript
   // In browser console (on your app):
   const { data: { session } } = await supabase.auth.getSession()
   console.log(session.access_token) // Use this token
   ```

3. **Then test with the token:**
   ```bash
   curl -X POST "https://gwrcmbuovmuzjczolfxk.supabase.co/functions/v1/parse-sms" \
     -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"smsText": "Rs.100 debited...", "userId": "user-id-from-token"}'
   ```

### Option 3: Temporarily Allow Anonymous Access (For Testing Only)

⚠️ **Warning: Only for development/testing!**

You can temporarily modify the function to allow testing without auth, but **remove this before production**:

In `supabase/functions/parse-sms/index.ts`, comment out the auth check:

```typescript
// Temporarily disable auth for testing (REMOVE IN PRODUCTION)
/*
const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  return new Response(
    JSON.stringify({ success: false, error: "Unauthorized" }),
    {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
*/

// Use a test user ID
const user = { id: "test-user-id" };
```

Then redeploy:
```bash
npx supabase functions deploy parse-sms --project-ref gwrcmbuovmuzjczolfxk
```

**Remember to restore the auth check before production!**

## Recommended Approach

The best way to test is through your React application:

1. ✅ User is already authenticated
2. ✅ JWT token is automatically included
3. ✅ Tests the full integration
4. ✅ No security compromises

The function is working correctly - it's just enforcing proper authentication as designed! 🎉


