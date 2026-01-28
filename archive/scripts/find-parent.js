/**
 * Find parent ID by name or email
 * Usage: node scripts/find-parent.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function findParent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('Searching for parent accounts...\n')

  const { data, error } = await admin
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('role', 'parent')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('No parent accounts found')
    return
  }

  console.log('Found parent accounts:\n')
  data.forEach((parent, index) => {
    console.log(`${index + 1}. ${parent.full_name}`)
    console.log(`   ID: ${parent.id}`)
    console.log(`   Created: ${new Date(parent.created_at).toLocaleString()}\n`)
  })

  // If we find "farzeen", highlight it
  const farzeen = data.find(p => p.full_name.toLowerCase().includes('farzeen'))
  if (farzeen) {
    console.log('✨ Found matching parent (likely yours):')
    console.log(`   Name: ${farzeen.full_name}`)
    console.log(`   ID: ${farzeen.id}\n`)
    console.log('Copy this ID and use it in create-test-student.js')
  }
}

findParent()
