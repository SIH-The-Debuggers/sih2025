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
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        // Check if user exists but is not confirmed
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email_confirmed_at, created_at')
          .eq('email', email)
          .single()
        
        if (!userError && userData && !userData.email_confirmed_at) {
          toast.error('Account exists but email not confirmed. Please check your email or contact admin.')
          return { error: 'Email not confirmed. Check your email for confirmation link, or disable email confirmation in Supabase settings.' }
        }
        
        toast.error('Invalid email or password. Please check your credentials.')
        return { error: 'Invalid credentials - please verify your email and password are correct.' }
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please check your email and click the confirmation link before logging in.')
        return { error: 'Email not confirmed. Please check your email for a confirmation link.' }
      } else if (error.message.includes('User not found')) {
        toast.error('No account found with this email. Please register first.')
        return { error: 'Account not found. Please register first.' }
      } else {
        toast.error(error.message)
        return { error: error.message }
      }
    }

    if (data.user) {
      toast.success('Login successful!')
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
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      toast.error(error.message)
      return { error: error.message }
    }

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at) {
      toast.success('Registration successful! Please check your email to confirm your account before logging in.')
    } else {
      toast.success('Registration successful! You can now log in.')
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
