'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateEmail, validatePassword } from '@/lib/utils/validation'

export async function signInWithEmail(email: string, password: string) {
  if (!validateEmail(email)) {
    return { error: 'Invalid email format' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get user profile to determine redirect
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      revalidatePath('/', 'layout')
      
      switch (profile.role) {
        case 'student':
          redirect('/student')
        case 'parent':
          redirect('/parent')
        case 'mentor':
          redirect('/mentor')
        case 'admin':
          redirect('/admin')
        default:
          redirect('/')
      }
    }
  }

  return { error: 'Unable to determine user role' }
}

export async function signUpParent(email: string, password: string, fullName: string) {
  if (!validateEmail(email)) {
    return { error: 'Invalid email format' }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return { error: passwordValidation.message }
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Please provide a valid name' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create profile with parent role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        role: 'parent',
      })

    if (profileError) {
      return { error: 'Failed to create profile' }
    }

    revalidatePath('/', 'layout')
    redirect('/parent')
  }

  return { error: 'Signup failed' }
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message, url: null }
  }

  if (data.url) {
    return { error: null, url: data.url }
  }

  return { error: 'Failed to initiate Google sign-in', url: null }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
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
    role: profile.role,
    fullName: profile.full_name,
  }
}
