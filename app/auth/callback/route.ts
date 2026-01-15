import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_param = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  if (error_param) {
    console.error('OAuth error:', error_param, error_description)
    return NextResponse.redirect(new URL('/auth/login?error=' + error_param, requestUrl.origin))
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    try {
      // This sets the auth cookies via the cookie adapter above
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Exchange code error:', error.message)
        return NextResponse.redirect(new URL('/auth/login?error=exchange_failed', requestUrl.origin))
      }

      // Get user and ensure profile exists
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Get user error:', userError?.message)
        return NextResponse.redirect(new URL('/auth/login?error=user_not_found', requestUrl.origin))
      }

      // Check/create profile using admin client
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      let redirectPath = '/parent'
      
      if (!profile) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        
        const { error: insertError } = await adminClient.from('profiles').insert({
          id: user.id,
          full_name: fullName,
          role: 'parent',
        })

        if (insertError) {
          console.error('Insert profile error:', insertError.message)
          return NextResponse.redirect(new URL('/auth/login?error=profile_create_failed', requestUrl.origin))
        }
      } else {
        const redirectMap: Record<string, string> = {
          student: '/student',
          parent: '/parent',
          mentor: '/mentor',
          admin: '/admin',
        }
        redirectPath = redirectMap[profile.role] || '/parent'
      }
      
      // Redirect – auth cookies are already attached via cookieStore
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
      
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(new URL('/auth/login?error=callback_error', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=no_code', requestUrl.origin))
}
