import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user and check if profile exists
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        // If no profile, create one with parent role (default for OAuth)
        if (!profile) {
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: fullName,
            role: 'parent',
          })
          
          return NextResponse.redirect(`${origin}/parent`)
        }
        
        // Redirect based on role
        const redirectMap: Record<string, string> = {
          student: '/student',
          parent: '/parent',
          mentor: '/mentor',
          admin: '/admin',
        }
        
        const redirectPath = redirectMap[profile.role] || '/'
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
}
