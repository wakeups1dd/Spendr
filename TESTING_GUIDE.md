# Testing Guide for parse-sms Edge Function

## ⚠️ Important: Authentication Required

The Edge Function requires **user authentication** (valid JWT token). The function enforces this for security.

## Recommended: Test from Your React App

The easiest way to test is through your React application:

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Log in to your app** (creates a valid session)

3. **Use the SMS parsing feature** - it will automatically call the deployed function with proper authentication

The `smsService.parseSMS()` function in your app handles authentication automatically!

## Manual Testing Options

### Option 1: Get JWT Token from Browser

1. Log in to your React app
2. Open Browser DevTools (F12)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Find **Local Storage** → Your site
5. Look for: `sb-gwrcmbuovmuzjczolfxk-auth-token`
6. Copy the `access_token` value from the JSON

Then use it in the authenticated test script:
```powershell
.\test-sms-function-authenticated.ps1 -JwtToken "YOUR_JWT_TOKEN_HERE"
```

### Option 2: Test with curl

```bash
curl -X POST "https://gwrcmbuovmuzjczolfxk.supabase.co/functions/v1/parse-sms" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "smsText": "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY",
    "userId": "YOUR_USER_ID"
  }'
```

### Option 3: Use Browser Console (On Your App)

After logging into your app, open browser console and run:

```javascript
// Get your session token
const { data: { session } } = await supabase.auth.getSession()
console.log('Token:', session.access_token)
console.log('User ID:', session.user.id)

// Test the function
const response = await fetch('https://gwrcmbuovmuzjczolfxk.supabase.co/functions/v1/parse-sms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    smsText: 'Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY',
    userId: session.user.id
  })
})

const result = await response.json()
console.log(result)
```

## Test SMS Samples

### HDFC Bank
```
Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00
```

### ICICI Bank
```
INR 5,000.00 credited to A/c XX5678 on 20-Jan-24. Ref No:123456. Avl Bal:INR 55,000.00
```

### SBI
```
A/c XX9012 debited by Rs.999.00 on 15-Jan-24. UPI/PAYTM. Avl Bal Rs.40,000.00
```

### Axis Bank
```
Rs.2,500.00 paid to AMAZON on 20-Jan-24. Avl Bal Rs.30,000.00
```

## Expected Response

```json
{
  "success": true,
  "data": {
    "amount": 1234.56,
    "type": "expense",
    "merchant": "SWIGGY",
    "date": "2024-01-15T00:00:00.000Z",
    "category": "Food & Dining",
    "confidence": 0.9,
    "rawSms": "Rs.1,234.56 debited from A/c XX1234...",
    "metadata": {
      "bankName": "HDFC"
    }
  }
}
```

## Troubleshooting

### Error: Unauthorized (401)
- ✅ This is expected if you're not using a valid JWT token
- Get a token from your authenticated browser session
- Or test through your React app (recommended)

### Error: Function not found (404)
- Verify the function is deployed in Supabase Dashboard
- Check the URL is correct

### Low Confidence Scores
- Normal for generic SMS formats (0.5-0.7)
- Bank-specific SMS typically scores higher (0.8-1.0)

## View Function Logs

In Supabase Dashboard:
1. Go to: Edge Functions
2. Click on `parse-sms`
3. View logs and monitor requests

## Summary

**Best Testing Method:** Use your React app - it handles authentication automatically! ✅

The function is working correctly - it's enforcing proper security by requiring user authentication. This is the correct behavior for production use.
