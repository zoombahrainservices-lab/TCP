import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role?: string
}

// Cached helper that fetches auth user and profile once per request
const getCachedAuthUser = cache(async () => {
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

  return {
    user,
    profile,
  }
})

export async function requireAuth(role?: 'admin' | 'mentor' | 'parent' | 'student'): Promise<AuthUser> {
  const { user, profile } = await getCachedAuthUser()

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
  try {
    const { user, profile } = await getCachedAuthUser()
    
    return {
      id: user.id,
      email: user.email!,
      fullName: profile?.full_name || user.email?.split('@')[0] || 'User',
      role: profile?.role,
    }
  } catch (error) {
    // If redirect is thrown, let it propagate
    // Otherwise return null for errors
    return null
  }
}
