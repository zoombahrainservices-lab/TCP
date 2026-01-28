/**
 * Fix Student XP - Reset remaining student XP to 0
 * Run with: npx tsx scripts/fix-student-xp.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('🔧 Resetting student XP to 0...\n')

  // Update all student profiles to have XP = 0 and level = 1
  const { data, error } = await supabase
    .from('profiles')
    .update({ xp: 0, level: 1 })
    .eq('role', 'student')
    .select()

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  if (data) {
    console.log(`✓ Updated ${data.length} student profile(s):`)
    data.forEach(student => {
      console.log(`   - ${student.full_name}: XP=${student.xp}, Level=${student.level}`)
    })
  }

  console.log('\n✅ All student XP reset to 0!\n')
}

main()
