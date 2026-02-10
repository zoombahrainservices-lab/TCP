import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role?: string
}

export async function requireAuth(role?: 'admin' | 'mentor' | 'parent' | 'student'): Promise<AuthUser> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Check role if specified
  if (role && profile?.role !== role) {
    redirect('/dashboard')
  }

  return {
    id: user.id,
    email: user.email!,
    fullName: profile?.full_name || user.email?.split('@')[0] || 'User',
    role: profile?.role,
  }
}

export async function getSession() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    fullName: profile?.full_name || user.email?.split('@')[0] || 'User',
  }
}
