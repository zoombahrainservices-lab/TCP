'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // If no profile exists, create one
    if (!profile) {
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
      })
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  return { error: 'Login failed - please try again' }
}

export async function signUp(email: string, password: string, fullName: string) {
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
    // Create profile using admin client to bypass RLS
    const adminClient = createAdminClient()
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      })

    if (profileError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile creation error:', profileError)
      }
      return { error: 'Failed to create profile' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  return { error: 'Signup failed' }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null)
  const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: redirectTo ? { redirectTo } : {},
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
    .select('full_name')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    fullName: profile?.full_name || user.email?.split('@')[0] || 'User',
  }
}
