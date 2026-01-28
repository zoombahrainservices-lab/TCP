import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

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

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.log('Signin - signInWithPassword error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('Signin - No user returned after signInWithPassword')
    return NextResponse.json({ error: 'Login failed' }, { status: 400 })
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
  return NextResponse.json({ success: true, redirectTo: '/dashboard' })
}
