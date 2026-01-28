import { createAdminClient } from '@/lib/supabase/admin'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
config({ path: join(process.cwd(), '.env.local') })

const ADMIN_EMAIL = 'admin@tcp.local'
const ADMIN_PASSWORD = 'Admin123!@#'
const ADMIN_NAME = 'TCP Admin'

async function createAdminUser() {
  console.log('🚀 Creating new admin user...\n')
  
  const supabase = createAdminClient()
  
  try {
    // Step 1: Check if user already exists
    console.log('🔍 Checking if admin user already exists...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL)
    
    if (existingUser) {
      console.log(`⚠️  User with email ${ADMIN_EMAIL} already exists!`)
      console.log('   Updating existing user to admin role...\n')
      
      // Update profile to admin role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', existingUser.id)
      
      if (updateError) {
        // Profile might not exist, create it
        await supabase.from('profiles').insert({
          id: existingUser.id,
          full_name: ADMIN_NAME,
          role: 'admin'
        })
      }
      
      console.log('✅ Existing user updated to admin role!')
      console.log('\n═══════════════════════════════════════════')
      console.log('✨ ADMIN CREDENTIALS')
      console.log('═══════════════════════════════════════════')
      console.log(`📧 Email: ${ADMIN_EMAIL}`)
      console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
      console.log('═══════════════════════════════════════════\n')
      return
    }
    
    // Step 2: Create new user in Supabase Auth
    console.log('👤 Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: ADMIN_NAME
      }
    })
    
    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`)
    }
    
    if (!authData.user) {
      throw new Error('User creation returned no user data')
    }
    
    console.log(`✅ User created: ${authData.user.id}\n`)
    
    // Step 3: Create profile with admin role
    console.log('📝 Creating admin profile...')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: ADMIN_NAME,
        role: 'admin'
      })
    
    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }
    
    console.log('✅ Admin profile created!\n')
    
    // Step 4: Verify
    console.log('🔍 Verifying admin account...')
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profile?.role === 'admin') {
      console.log('✅ Verification successful!\n')
      console.log('═══════════════════════════════════════════')
      console.log('✨ NEW ADMIN ACCOUNT CREATED')
      console.log('═══════════════════════════════════════════')
      console.log(`📧 Email: ${ADMIN_EMAIL}`)
      console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
      console.log(`👤 Name: ${ADMIN_NAME}`)
      console.log(`🆔 User ID: ${authData.user.id}`)
      console.log('═══════════════════════════════════════════')
      console.log('\n🎯 You can now log in at /auth/signin')
      console.log('   After login, you will be redirected to /admin\n')
    } else {
      console.log('⚠️  Verification failed - role mismatch')
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error('\nStack:', error.stack)
    process.exit(1)
  }
}

createAdminUser()
