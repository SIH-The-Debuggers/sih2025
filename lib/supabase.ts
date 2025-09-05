import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Allowed domains for authentication
export const ALLOWED_DOMAINS = [
  'nic.gov.in',
  'police.gov.in', 
  'gmail.com'
]

// Validate email domain
export function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_DOMAINS.includes(domain || '')
}
