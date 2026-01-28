/**
 * Script to create a test student account with email and password
 * 
 * Usage (from project root):
 *   npx tsx scripts/create-test-student.ts <parent-id> <student-email> <student-name> <password>
 * 
 * Example:
 *   npx tsx scripts/create-test-student.ts 99abce4e-2115-4d29-a2d4-0bedf... test@example.com "Test Student" testpass123
 */

import { createAdminClient } from '../lib/supabase/admin'

async function createTestStudent(
  parentId: string,
  email: string,
  fullName: string,
  password: string
) {
  console.log('Creating test student account...')
  console.log(`  Parent ID: ${parentId}`)
  console.log(`  Email: ${email}`)
  console.log(`  Name: ${fullName}`)
  console.log(`  Password: ${'*'.repeat(password.length)}`)

  const adminClient = createAdminClient()

  try {
    // Create user with password
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError || !authData.user) {
      console.error('❌ Failed to create user:', authError?.message)
      process.exit(1)
    }

    console.log('✅ User created:', authData.user.id)

    // Create profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role: 'student',
      })

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Profile created')

    // Link parent and child
    const { error: linkError } = await adminClient
      .from('parent_child_links')
      .insert({
        parent_id: parentId,
        child_id: authData.user.id,
      })

    if (linkError) {
      console.error('❌ Failed to link parent and child:', linkError.message)
      process.exit(1)
    }

    console.log('✅ Parent-child link created')
    console.log('\n🎉 Student account created successfully!')
    console.log(`\nLogin credentials:`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
    console.log(`\nStudent ID: ${authData.user.id}`)
    console.log(`\nYou can now login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Get arguments from command line
const args = process.argv.slice(2)

if (args.length < 4) {
  console.error('Usage: npx tsx scripts/create-test-student.ts <parent-id> <email> <name> <password>')
  console.error('\nExample:')
  console.error('  npx tsx scripts/create-test-student.ts 99abce4e-2115-4d29-a2d4-0bedf... student@test.com "Test Student" testpass123')
  process.exit(1)
}

const [parentId, email, fullName, password] = args

// Validate inputs
if (!email.includes('@')) {
  console.error('❌ Invalid email address')
  process.exit(1)
}

if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters')
  process.exit(1)
}

createTestStudent(parentId, email, fullName, password)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
