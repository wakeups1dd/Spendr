# PowerShell script to deploy Supabase Edge Function
# Run this script in PowerShell (you may need to run as Administrator)

Write-Host "🚀 Supabase Edge Function Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Check if project ref is provided
$projectRef = $args[0]

if (-not $projectRef) {
    Write-Host "❌ Error: Project Reference ID is required" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage: .\deploy-function.ps1 YOUR_PROJECT_REF" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your Project Reference ID:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://app.supabase.com" -ForegroundColor White
    Write-Host "  2. Select your project" -ForegroundColor White
    Write-Host "  3. Go to Settings → General" -ForegroundColor White
    Write-Host "  4. Copy the Reference ID" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "📦 Step 1: Logging in to Supabase..." -ForegroundColor Yellow
npx --yes supabase login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔗 Step 2: Linking project..." -ForegroundColor Yellow
npx --yes supabase link --project-ref $projectRef
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Project linking failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Step 3: Deploying parse-sms function..." -ForegroundColor Yellow
npx --yes supabase functions deploy parse-sms --project-ref $projectRef
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Your function is now available at:" -ForegroundColor Cyan
Write-Host "https://$projectRef.supabase.co/functions/v1/parse-sms" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the function (see DEPLOY_WITH_NPX.md)" -ForegroundColor White
Write-Host "  2. Update your frontend to use the deployed function" -ForegroundColor White
Write-Host "  3. Monitor function logs in Supabase Dashboard" -ForegroundColor White

