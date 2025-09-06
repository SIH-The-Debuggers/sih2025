'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function EmailTest() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const testEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      // Test password reset email (uses SMTP)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      })

      if (error) {
        toast.error(`SMTP Test Failed: ${error.message}`)
      } else {
        toast.success('SMTP Test Email Sent! Check your inbox.')
      }
    } catch (err) {
      toast.error('Network error during SMTP test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">📧 SMTP Test Tool</h3>
      <p className="text-white/80 text-sm mb-4">
        Test if your Gmail SMTP configuration is working by sending a password reset email.
      </p>
      
      <div className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Enter email to test SMTP"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={testEmail}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Sending Test Email...' : 'Test SMTP Configuration'}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-white/60">
        <p>✅ If successful: You'll receive a password reset email</p>
        <p>❌ If failed: Check your Gmail SMTP settings in Supabase</p>
      </div>
    </div>
  )
}
