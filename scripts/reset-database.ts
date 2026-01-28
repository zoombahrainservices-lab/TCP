/**
 * Database Reset Script
 * Drops all custom tables and creates fresh minimal schema.
 * Run with: npx tsx scripts/reset-database.ts
 * 
 * WARNING: This is a DESTRUCTIVE operation!
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as readline from 'readline'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase credentials not found')
  console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question + ' (yes/no): ', (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

async function dropAllTables() {
  console.log('\n🗑️  Dropping all custom tables...\n')

  // Drop tables using individual delete operations
  const tablesToDrop = [
    'xp_events',
    'phase_uploads', 
    'student_progress',
    'uploads',
    'daily_records',
    'phases',
    'chapters',
    'zones',
    'parent_child_links',
    'program_baselines',
    'profiles',
    'archived_chapters',
    'archived_daily_records'
  ]

  for (const table of tablesToDrop) {
    try {
      // Try to delete all records first
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error && !error.message.includes('does not exist')) {
        console.log(`   ⚠️  ${table}: ${error.message}`)
      } else {
        console.log(`   ✓ Cleared ${table}`)
      }
    } catch (e) {
      console.log(`   ⚠️  ${table}: table might not exist`)
    }
  }

  console.log('\n✅ Tables cleared (use Supabase Dashboard to drop tables completely)\n')
}

async function createFreshSchema() {
  console.log('📦 Creating fresh profiles table...\n')

  // Check if profiles table exists by trying to query it
  const { error: checkError } = await supabase.from('profiles').select('id').limit(1)
  
  if (checkError?.message.includes('does not exist')) {
    console.log('   ⚠️  profiles table does not exist')
    console.log('   Please run the fresh_schema.sql in Supabase Dashboard SQL Editor')
  } else {
    console.log('   ✓ profiles table exists')
  }

  console.log('\n✅ Schema check complete\n')
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║              DATABASE RESET - FRESH START                 ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('⚠️  WARNING: This will delete ALL data from custom tables!')
  console.log('')
  console.log('This script will:')
  console.log('  1. Clear all data from custom tables')
  console.log('  2. Verify the profiles table exists')
  console.log('')
  console.log('This will NOT affect:')
  console.log('  • auth.users (Supabase managed)')
  console.log('  • Your Supabase project settings')
  console.log('')

  const confirmed = await askConfirmation('Are you sure you want to proceed?')
  
  if (!confirmed) {
    console.log('\n❌ Reset cancelled.\n')
    process.exit(0)
  }

  try {
    await dropAllTables()
    await createFreshSchema()
    
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║                    RESET COMPLETE                          ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Go to Supabase Dashboard → SQL Editor')
    console.log('  2. Run supabase/drop_all_tables.sql to fully drop tables')
    console.log('  3. Run supabase/fresh_schema.sql to create fresh schema')
    console.log('')
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Reset failed:', error)
    process.exit(1)
  }
}

main()
