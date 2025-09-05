import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // OAuth (e.g., Google) uses `code`
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Auth callback error (code):', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_callback_error`)
      }
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    }

    // Magic link / email OTP uses token_hash + type
    if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: (type as any) || 'magiclink',
      })
      if (error) {
        console.error('Auth callback error (otp):', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=otp_callback_error`)
      }
      // If this is a password recovery, send to update-password screen
      if (type === 'recovery') {
        return NextResponse.redirect(`${requestUrl.origin}/auth/update-password`)
      }
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    }
  } catch (e) {
    console.error('Auth callback unexpected error:', e)
  }

  // Fallback: redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}
