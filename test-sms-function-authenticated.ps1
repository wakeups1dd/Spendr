# Test Script for parse-sms Edge Function (Requires User Authentication)
# This script requires a valid JWT token from an authenticated user session

param(
    [Parameter(Mandatory=$true)]
    [string]$JwtToken,
    
    [Parameter(Mandatory=$false)]
    [string]$UserId
)

$PROJECT_REF = "gwrcmbuovmuzjczolfxk"
$FUNCTION_URL = "https://$PROJECT_REF.supabase.co/functions/v1/parse-sms"

if (-not $UserId) {
    # Try to extract user ID from JWT token (basic decode)
    # Note: This is a simple base64 decode - for production, use proper JWT library
    try {
        $payload = $JwtToken.Split('.')[1]
        $payloadBytes = [System.Convert]::FromBase64String($payload)
        $payloadJson = [System.Text.Encoding]::UTF8.GetString($payloadBytes) | ConvertFrom-Json
        $UserId = $payloadJson.sub
        Write-Host "✅ Extracted User ID from token: $UserId" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not extract User ID from token. Please provide -UserId parameter" -ForegroundColor Yellow
        Write-Host "Usage: .\test-sms-function-authenticated.ps1 -JwtToken 'YOUR_TOKEN' -UserId 'USER_ID'" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🧪 Testing parse-sms Edge Function (Authenticated)" -ForegroundColor Cyan
Write-Host "Function URL: $FUNCTION_URL" -ForegroundColor Gray
Write-Host "User ID: $UserId" -ForegroundColor Gray
Write-Host ""

# Test cases
$testCases = @(
    @{
        Name = "HDFC Bank Debit"
        SMS = "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00"
        ExpectedType = "expense"
    },
    @{
        Name = "ICICI Bank Credit"
        SMS = "INR 5,000.00 credited to A/c XX5678 on 20-Jan-24. Ref No:123456. Avl Bal:INR 55,000.00"
        ExpectedType = "income"
    },
    @{
        Name = "SBI UPI Payment"
        SMS = "A/c XX9012 debited by Rs.999.00 on 15-Jan-24. UPI/PAYTM. Avl Bal Rs.40,000.00"
        ExpectedType = "expense"
    }
)

$successCount = 0
$failCount = 0

foreach ($testCase in $testCases) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "Test: $($testCase.Name)" -ForegroundColor Yellow
    Write-Host "SMS: $($testCase.SMS)" -ForegroundColor Gray
    Write-Host ""
    
    $body = @{
        smsText = $testCase.SMS
        userId = $UserId
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $FUNCTION_URL `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $JwtToken"
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop
        
        if ($response.success -and $response.data) {
            $data = $response.data
            Write-Host "✅ Success!" -ForegroundColor Green
            Write-Host "   Amount: Rs. $($data.amount)" -ForegroundColor White
            Write-Host "   Type: $($data.type)" -ForegroundColor White
            Write-Host "   Merchant: $($data.merchant)" -ForegroundColor White
            Write-Host "   Category: $($data.category)" -ForegroundColor White
            Write-Host "   Confidence: $([math]::Round($data.confidence * 100, 1))%" -ForegroundColor White
            Write-Host "   Bank: $($data.metadata.bankName)" -ForegroundColor White
            
            if ($data.type -eq $testCase.ExpectedType) {
                $successCount++
            } else {
                Write-Host "   ⚠️  Warning: Expected type '$($testCase.ExpectedType)' but got '$($data.type)'" -ForegroundColor Yellow
                $failCount++
            }
        } else {
            Write-Host "❌ Failed: $($response.error)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($errorDetails) {
                Write-Host "   Details: $($errorDetails.error)" -ForegroundColor Red
            }
        }
        $failCount++
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "   Total Tests: $($testCases.Count)" -ForegroundColor White
Write-Host "   ✅ Passed: $successCount" -ForegroundColor Green
Write-Host "   ❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Tip: Get your JWT token from browser DevTools after logging into your app" -ForegroundColor Cyan
Write-Host "   Look for: Local Storage → sb-<project>-auth-token → access_token" -ForegroundColor Gray


