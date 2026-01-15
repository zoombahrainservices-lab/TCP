import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_param = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  // If there's an error from the OAuth provider
  if (error_param) {
    console.error('OAuth error:', error_param, error_description)
    return NextResponse.redirect(`${origin}/auth/login?error=${error_param}`)
  }

  if (code) {
    // Create response that we'll add cookies to
    let redirectPath = '/parent'
    
    // Collect cookies from the exchange
    const cookiesToSet: { name: string; value: string; options: any }[] = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookies) {
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Exchange code error:', error.message)
        return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`)
      }

      // Get user
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
      
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
    }

    // Create redirect response and attach cookies
    const response = NextResponse.redirect(`${origin}${redirectPath}`)
    
    // Set all auth cookies on the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, {
        ...options,
        // Ensure cookies work in production
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    })
    
    return response
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
