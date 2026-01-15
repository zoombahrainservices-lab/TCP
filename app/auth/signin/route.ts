import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  const origin = new URL(request.url).origin

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

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Login failed' }, { status: 400 })
  }

  // Check/create profile
  const adminClient = createAdminClient()
  let { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    await adminClient.from('profiles').insert({
      id: user.id,
      full_name: fullName,
      role: 'parent',
    })
    profile = { role: 'parent' }
  }

  // Determine redirect path
  const redirectMap: Record<string, string> = {
    student: '/student',
    parent: '/parent',
    mentor: '/mentor',
    admin: '/admin',
  }
  const redirectPath = redirectMap[profile.role] || '/parent'

  // Create response with cookies
  const response = NextResponse.json({ success: true, redirectTo: redirectPath })
  
  // Set all auth cookies on the response
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
