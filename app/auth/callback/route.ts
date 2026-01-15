import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_param = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  if (error_param) {
    console.error('OAuth error:', error_param, error_description)
    return NextResponse.redirect(`${origin}/auth/login?error=${error_param}`)
  }

  if (code) {
    // Collect cookies to set on response
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

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Get user error:', userError?.message)
        return NextResponse.redirect(`${origin}/auth/login?error=user_not_found`)
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
          return NextResponse.redirect(`${origin}/auth/login?error=profile_create_failed`)
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
      
      // Create redirect response and set cookies WITHOUT overriding options
      const response = NextResponse.redirect(`${origin}${redirectPath}`)
      
      // Use Supabase's cookie options as-is (don't force secure: true)
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      
      return response
      
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
