# Quick Test Script - Test a single SMS message
# Usage: .\test-single-sms.ps1 "Your SMS text here"

param(
    [Parameter(Mandatory=$false)]
    [string]$SmsText = "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00"
)

$PROJECT_REF = "gwrcmbuovmuzjczolfxk"
$FUNCTION_URL = "https://$PROJECT_REF.supabase.co/functions/v1/parse-sms"

# Get anon key from .env file
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    exit 1
}

$anonKey = (Get-Content $envFile | Select-String -Pattern "VITE_SUPABASE_ANON_KEY" | ForEach-Object {
    $_.Line -replace 'VITE_SUPABASE_ANON_KEY=', '' -replace '"', ''
}).Trim()

if (-not $anonKey) {
    Write-Host "❌ Error: Could not find VITE_SUPABASE_ANON_KEY in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "🧪 Testing parse-sms Edge Function" -ForegroundColor Cyan
Write-Host "Function URL: $FUNCTION_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "SMS Text: $SmsText" -ForegroundColor Yellow
Write-Host ""

$body = @{
    smsText = $SmsText
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
        Write-Host "✅ Parsing Successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Amount: Rs. $($data.amount)" -ForegroundColor White
        Write-Host "Type: $($data.type)" -ForegroundColor White
        Write-Host "Merchant: $($data.merchant)" -ForegroundColor White
        Write-Host "Category: $($data.category)" -ForegroundColor White
        Write-Host "Confidence: $([math]::Round($data.confidence * 100, 1))%" -ForegroundColor White
        Write-Host "Bank: $($data.metadata.bankName)" -ForegroundColor White
        Write-Host "Date: $($data.date)" -ForegroundColor Gray
        
        Write-Host ""
        Write-Host "Full Response:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 10 | Write-Host
    } else {
        Write-Host "❌ Failed: $($response.error)" -ForegroundColor Red
        $response | ConvertTo-Json | Write-Host
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-Host "Details: $($errorDetails.error)" -ForegroundColor Red
        } else {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    exit 1
}


