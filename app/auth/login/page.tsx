'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react'
import { signInWithEmail, sendOTP } from '@/lib/auth'
import { validateEmailDomain } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateEmailDomain(email)) {
      setError('Access denied. Only authorized domains are allowed.')
      setLoading(false)
      return
    }

    const result = await signInWithEmail(email, password)
    
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpLoading(true)
    setError('')

    if (!validateEmailDomain(otpEmail)) {
      setError('Access denied. Only authorized domains are allowed.')
      setOtpLoading(false)
      return
    }

    const result = await sendOTP(otpEmail)
    
    if (result.error) {
      setError(result.error)
    } else {
      setShowOTP(true)
    }
    
    setOtpLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-police-blue to-police-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Police Portal Login</h1>
          <p className="text-white/80">Access restricted to authorized personnel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          {!showOTP ? (
            <>
              {/* Email/Password Login */}
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="your.email@police.gov.in"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-police-blue py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/60">Or</span>
                  </div>
                </div>
              </div>

              {/* OTP Login */}
              <form onSubmit={handleOTPRequest} className="mt-6 space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email for OTP
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="your.email@police.gov.in"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-200">
                  OTP sent to <strong>{otpEmail}</strong>
                </p>
                <p className="text-green-200/80 text-sm mt-1">
                  Please check your email and click the verification link.
                </p>
              </div>
              <button
                onClick={() => setShowOTP(false)}
                className="text-white/80 hover:text-white underline"
              >
                Try different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have access?{' '}
              <Link href="/auth/register" className="text-white hover:underline">
                Request Access
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-200 text-sm text-center">
            <strong>Security Notice:</strong> Access is restricted to authorized domains only.
            All login attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  )
}
