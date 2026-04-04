import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isAllowedOAuthCallbackOrigin } from '@/lib/auth/oauth-origins'

/**
 * Password recovery emails should redirect here (PKCE). We exchange the code server-side
 * so session cookies match the rest of the app, then send the user to set a new password.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const safeSiteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'

  if (!isAllowedOAuthCallbackOrigin(requestUrl.origin)) {
    return NextResponse.redirect(
      new URL('/auth/login?error=invalid_callback', safeSiteUrl),
    )
  }

  const code = requestUrl.searchParams.get('code')
  const err = requestUrl.searchParams.get('error')

  if (err) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(err)}`, requestUrl.origin),
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
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL('/auth/login?error=recovery_failed', requestUrl.origin),
    )
  }

  return NextResponse.redirect(new URL('/auth/update-password', requestUrl.origin))
}
