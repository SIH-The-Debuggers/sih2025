import { supabase, validateEmailDomain } from './supabase'
import { toast } from 'react-hot-toast'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
  department?: string
}

export async function signInWithEmail(email: string, password: string) {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    toast.error('Supabase not configured. Please set up environment variables.')
    return { error: 'Supabase not configured' }
  }

  // Validate email domain
  if (!validateEmailDomain(email)) {
    toast.error('Access denied. Only authorized domains are allowed.')
    return { error: 'Invalid domain' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      return { error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    toast.error('Network error. Please check your connection and Supabase configuration.')
    return { error: 'Network error' }
  }
}

export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    toast.error('Supabase not configured. Please set up environment variables.')
    return { error: 'Supabase not configured' }
  }

  // Validate email domain
  if (!validateEmailDomain(email)) {
    toast.error('Access denied. Only authorized domains are allowed.')
    return { error: 'Invalid domain' }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      toast.error(error.message)
      return { error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    toast.error('Network error. Please check your connection and Supabase configuration.')
    return { error: 'Network error' }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    toast.error(error.message)
    return { error: error.message }
  }
  return { error: null }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
    role: user.user_metadata?.role,
    department: user.user_metadata?.department,
  }
}

export async function sendOTP(email: string) {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    toast.error('Supabase not configured. Please set up environment variables.')
    return { error: 'Supabase not configured' }
  }

  // Validate email domain
  if (!validateEmailDomain(email)) {
    toast.error('Access denied. Only authorized domains are allowed.')
    return { error: 'Invalid domain' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      toast.error(error.message)
      return { error: error.message }
    }

    toast.success('OTP sent to your email!')
    return { data, error: null }
  } catch (err) {
    toast.error('Network error. Please check your connection and Supabase configuration.')
    return { error: 'Network error' }
  }
}

export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })

  if (error) {
    toast.error(error.message)
    return { error: error.message }
  }

  return { data, error: null }
}
