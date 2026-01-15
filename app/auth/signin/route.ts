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

  // DEBUG: Log signin success
  console.log('Signin - User logged in:', { 
    userId: user?.id, 
    email: user?.email,
    hasUser: !!user 
  })

  if (!user) {
    console.log('Signin - No user returned after signInWithPassword')
    return NextResponse.json({ error: 'Login failed' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  let { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const fullName =
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User'

    await adminClient.from('profiles').insert({
      id: user.id,
      full_name: fullName,
      role: 'parent',
    })

    profile = { role: 'parent' }
  }

  const redirectMap: Record<string, string> = {
    student: '/student',
    parent: '/parent',
    mentor: '/mentor',
    admin: '/admin',
  }

  const redirectPath = redirectMap[profile.role] || '/parent'

  // Important: no manual cookie copying – Next.js will attach cookies()
  return NextResponse.json({ success: true, redirectTo: redirectPath })
}
