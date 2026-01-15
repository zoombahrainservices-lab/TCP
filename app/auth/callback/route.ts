import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // If there's an error from the OAuth provider
  if (error_param) {
    console.error('OAuth error:', error_param, error_description)
    return NextResponse.redirect(`${origin}/auth/login?error=${error_param}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Exchange code error:', error.message)
        return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`)
      }

      // Get user and check if profile exists
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Get user error:', userError?.message)
        return NextResponse.redirect(`${origin}/auth/login?error=user_not_found`)
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // If no profile, create one with parent role (default for OAuth)
      if (!profile) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        
        // Use admin client to bypass RLS for profile creation
        const adminClient = createAdminClient()
        const { error: insertError } = await adminClient.from('profiles').insert({
          id: user.id,
          full_name: fullName,
          role: 'parent',
        })

        if (insertError) {
          console.error('Insert profile error:', insertError.message)
          // Profile might already exist due to race condition, try to fetch again
          const { data: existingProfile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (existingProfile) {
            return NextResponse.redirect(`${origin}/${existingProfile.role}`)
          }
          return NextResponse.redirect(`${origin}/auth/login?error=profile_create_failed`)
        }
        
        return NextResponse.redirect(`${origin}/parent`)
      }
      
      // Redirect based on role
      const redirectMap: Record<string, string> = {
        student: '/student',
        parent: '/parent',
        mentor: '/mentor',
        admin: '/admin',
      }
      
      const redirectPath = redirectMap[profile.role] || '/parent'
      return NextResponse.redirect(`${origin}${redirectPath}`)
      
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
