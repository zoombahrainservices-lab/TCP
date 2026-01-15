import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
      const cookieStore = await cookies()
      
      // Track cookies to set on response
      const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookies) {
              cookies.forEach((cookie) => {
                cookiesToSet.push(cookie)
              })
            },
          },
        }
      )
      
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

      // Check if profile exists using admin client
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      let redirectPath = '/parent'
      
      // If no profile, create one with parent role (default for OAuth)
      if (!profile) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        
        const { error: insertError } = await adminClient.from('profiles').insert({
          id: user.id,
          full_name: fullName,
          role: 'parent',
        })

        if (insertError) {
          console.error('Insert profile error:', insertError.message)
          return NextResponse.redirect(`${origin}/auth/login?error=profile_create_failed`)
        }
      } else {
        // Redirect based on role
        const redirectMap: Record<string, string> = {
          student: '/student',
          parent: '/parent',
          mentor: '/mentor',
          admin: '/admin',
        }
        redirectPath = redirectMap[profile.role] || '/parent'
      }
      
      // Create redirect response with cookies
      const response = NextResponse.redirect(`${origin}${redirectPath}`)
      
      // Set all the auth cookies on the response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      
      return response
      
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
