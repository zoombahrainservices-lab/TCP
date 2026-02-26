# Migration script to upload all existing images to Supabase Storage
# 
# Prerequisites:
# 1. chapter-assets bucket must be created in Supabase Dashboard
# 2. Storage policies must be applied
# 3. Environment variables must be set in .env.local

Write-Host "🚀 Image Migration Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found" -ForegroundColor Red
    Write-Host "Please create .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
}

# Load environment variables
Get-Content .env.local | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        $name = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Check required variables
if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
    Write-Host "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set" -ForegroundColor Red
    exit 1
}

if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables loaded" -ForegroundColor Green
Write-Host "📦 Installing dependencies..."
npm install node-fetch

Write-Host ""
Write-Host "🔄 Running migration..." -ForegroundColor Yellow
npx ts-node scripts/migrate-images-to-storage.ts

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
