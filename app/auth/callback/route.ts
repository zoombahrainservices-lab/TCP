import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_param = requestUrl.searchParams.get('error')

  if (error_param) {
    return NextResponse.redirect(
      new URL('/auth/login?error=' + error_param, requestUrl.origin),
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=no_code', requestUrl.origin),
    )
  }

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
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.log('Callback - exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(
        new URL('/auth/login?error=exchange_failed', requestUrl.origin),
      )
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('Callback - No user returned after exchangeCodeForSession')
      return NextResponse.redirect(
        new URL('/auth/login?error=user_not_found', requestUrl.origin),
      )
    }

    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // Create profile if it doesn't exist
    if (!profile) {
      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'User'

      await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
      })
    }

    // Always redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch (_err) {
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_error', requestUrl.origin),
    )
  }
}
