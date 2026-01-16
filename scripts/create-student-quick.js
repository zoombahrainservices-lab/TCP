/**
 * Quick student creation - reads env vars from process.env directly
 * Run with: node tcp-platform/scripts/create-student-quick.js
 */

const { createClient } = require('@supabase/supabase-js')

const PARENT_ID = '99abce4e-2115-4d29-a2d4-0bedf6c5d60e'
const STUDENT_EMAIL = 'teststudent@example.com'
const STUDENT_NAME = 'Test Student'
const STUDENT_PASSWORD = 'TestStudent123'

// Get env vars - they should be set in your environment or .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  console.error('\n   You can set them temporarily:')
  console.error('   $env:NEXT_PUBLIC_SUPABASE_URL="your-url"')
  console.error('   $env:SUPABASE_SERVICE_ROLE_KEY="your-key"')
  console.error('   node tcp-platform/scripts/create-student-quick.js')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function create() {
  console.log('Creating test student account...')
  console.log(`  Parent ID: ${PARENT_ID}`)
  console.log(`  Email: ${STUDENT_EMAIL}`)
  console.log(`  Name: ${STUDENT_NAME}\n`)

  try {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: STUDENT_NAME },
    })

    if (authError || !authData.user) {
      console.error('❌ Failed to create user:', authError?.message)
      process.exit(1)
    }

    console.log('✅ User created')

    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: STUDENT_NAME,
        role: 'student',
      })

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Profile created')

    const { error: linkError } = await admin
      .from('parent_child_links')
      .insert({
        parent_id: PARENT_ID,
        child_id: authData.user.id,
      })

    if (linkError) {
      console.error('❌ Failed to link:', linkError.message)
      process.exit(1)
    }

    console.log('✅ Parent-child link created\n')
    console.log('🎉 SUCCESS!\n')
    console.log('Login credentials:')
    console.log(`  Email: ${STUDENT_EMAIL}`)
    console.log(`  Password: ${STUDENT_PASSWORD}\n`)
    console.log(`Student ID: ${authData.user.id}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

create()
