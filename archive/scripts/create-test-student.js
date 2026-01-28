/**
 * Simple script to create a test student account
 * Usage: node scripts/create-test-student.js
 * 
 * Modify the values below, then run:
 *   node scripts/create-test-student.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Try to load .env.local file manually if dotenv is not available
try {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
} catch (e) {
  // If .env.local doesn't exist or can't be read, continue - env vars might be set another way
}

// CONFIGURE THESE VALUES:
const PARENT_ID = '99abce4e-2115-4d29-a2d4-0bedf6c5d60e'
const STUDENT_EMAIL = 'teststudent@example.com'
const STUDENT_NAME = 'Test Student'
const STUDENT_PASSWORD = 'TestStudent123'

async function createTestStudent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    console.error('   Make sure .env.local file exists and has these values')
    process.exit(1)
  }


  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('Creating test student account...')
  console.log(`  Parent ID: ${PARENT_ID}`)
  console.log(`  Email: ${STUDENT_EMAIL}`)
  console.log(`  Name: ${STUDENT_NAME}`)
  console.log(`  Password: ${'*'.repeat(STUDENT_PASSWORD.length)}`)

  try {
    // Create user with password
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: STUDENT_NAME,
      },
    })

    if (authError || !authData.user) {
      console.error('❌ Failed to create user:', authError?.message)
      process.exit(1)
    }

    console.log('✅ User created:', authData.user.id)

    // Create profile
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

    // Link parent and child
    const { error: linkError } = await admin
      .from('parent_child_links')
      .insert({
        parent_id: PARENT_ID,
        child_id: authData.user.id,
      })

    if (linkError) {
      console.error('❌ Failed to link parent and child:', linkError.message)
      process.exit(1)
    }

    console.log('✅ Parent-child link created')
    console.log('\n🎉 Student account created successfully!')
    console.log(`\nLogin credentials:`)
    console.log(`  Email: ${STUDENT_EMAIL}`)
    console.log(`  Password: ${STUDENT_PASSWORD}`)
    console.log(`\nStudent ID: ${authData.user.id}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createTestStudent()
