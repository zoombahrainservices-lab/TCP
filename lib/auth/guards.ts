import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UserRole = 'student' | 'parent' | 'mentor' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  fullName: string
}

export async function requireAuth(requiredRole?: UserRole): Promise<AuthUser> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // DEBUG: Log user state
  console.log('requireAuth - getUser result:', { 
    hasUser: !!user, 
    userId: user?.id, 
    email: user?.email,
    error: error?.message 
  })
  
  if (error || !user) {
    console.log('requireAuth - No user found, redirecting to login')
    redirect('/auth/login')
  }

  // Fetch user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  console.log('requireAuth - profile query:', { 
    hasProfile: !!profile, 
    role: profile?.role,
    profileError: profileError?.message 
  })

  if (profileError || !profile) {
    console.log('requireAuth - No profile found, redirecting to login')
    redirect('/auth/login')
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    fullName: profile.full_name,
  }

  // Check if user has the required role
  if (requiredRole && authUser.role !== requiredRole) {
    redirectByRole(authUser.role)
  }

  return authUser
}

export function redirectByRole(role: UserRole): never {
  switch (role) {
    case 'student':
      redirect('/student')
    case 'parent':
      redirect('/parent')
    case 'mentor':
      redirect('/mentor')
    case 'admin':
      redirect('/admin')
    default:
      redirect('/auth/login')
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
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    fullName: profile.full_name,
  }
}
