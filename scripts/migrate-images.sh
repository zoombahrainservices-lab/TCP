#!/bin/bash

# Migration script to upload all existing images to Supabase Storage
# 
# Prerequisites:
# 1. chapter-assets bucket must be created in Supabase Dashboard
# 2. Storage policies must be applied
# 3. Environment variables must be set in .env.local

echo "🚀 Image Migration Script"
echo "========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  echo "Please create .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Load environment variables
export $(cat .env.local | xargs)

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
  exit 1
fi

echo "✅ Environment variables loaded"
echo "📦 Installing dependencies..."
npm install node-fetch

echo ""
echo "🔄 Running migration..."
npx ts-node scripts/migrate-images-to-storage.ts

echo ""
echo "✨ Done!"
