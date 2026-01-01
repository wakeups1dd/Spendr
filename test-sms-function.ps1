# Test Script for parse-sms Edge Function
# This script tests the deployed Edge Function with sample SMS messages

$PROJECT_REF = "gwrcmbuovmuzjczolfxk"
$FUNCTION_URL = "https://$PROJECT_REF.supabase.co/functions/v1/parse-sms"

# Get anon key from .env file
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    exit 1
}

$anonKey = (Get-Content $envFile | Select-String -Pattern "VITE_SUPABASE_ANON_KEY" | ForEach-Object {
    $_.Line -replace 'VITE_SUPABASE_ANON_KEY=', '' -replace '"', '' -replace 'VITE_SUPABASE_ANON_KEY=', ''
}).Trim()

if (-not $anonKey) {
    Write-Host "❌ Error: Could not find VITE_SUPABASE_ANON_KEY in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "🧪 Testing parse-sms Edge Function" -ForegroundColor Cyan
Write-Host "Function URL: $FUNCTION_URL" -ForegroundColor Gray
Write-Host ""

# Test cases with sample SMS messages from different banks
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
    },
    @{
        Name = "Axis Bank Payment"
        SMS = "Rs.2,500.00 paid to AMAZON on 20-Jan-24. Avl Bal Rs.30,000.00"
        ExpectedType = "expense"
    },
    @{
        Name = "Generic Debit"
        SMS = "Rs.500.00 debited from your account on 25-Jan-24"
        ExpectedType = "expense"
    },
    @{
        Name = "Generic Credit"
        SMS = "INR 10,000.00 credited to your account on 01-Feb-24. Salary payment."
        ExpectedType = "income"
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
        userId = "test-user-id"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $FUNCTION_URL `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $anonKey"
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
            Write-Host "   Date: $($data.date)" -ForegroundColor Gray
            
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
    Write-Host "🎉 All tests passed! Your function is working correctly." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the error messages above." -ForegroundColor Yellow
}

