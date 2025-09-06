'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function SMTPDebugger() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSMTP = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    setTestResults([])
    addResult('🔄 Starting SMTP test...')

    try {
      // Test 1: Password Reset Email (simpler than signup)
      addResult('📧 Testing password reset email...')
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      })

      if (resetError) {
        addResult(`❌ Password reset failed: ${resetError.message}`)
        
        // Check if it's still a rate limit issue
        if (resetError.message.includes('rate limit') || resetError.message.toLowerCase().includes('too many')) {
          addResult('⚠️ Still hitting rate limits - SMTP might not be properly configured')
          addResult('💡 Check: Authentication → Settings → SMTP Settings in Supabase')
        }
      } else {
        addResult('✅ Password reset email sent successfully!')
        addResult('📥 Check your email inbox for the reset link')
      }

      // Test 2: Registration (will show if SMTP is working)
      addResult('👤 Testing registration with confirmation...')
      const testPassword = 'TestPassword123!'
      const { error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        addResult(`❌ Registration test failed: ${signUpError.message}`)
        
        if (signUpError.message.includes('rate limit')) {
          addResult('⚠️ SMTP not working - still using Supabase built-in email service')
          addResult('🔧 SMTP Configuration Issue Detected!')
        }
      } else {
        addResult('✅ Registration test successful!')
        addResult('📧 If SMTP is working, you should receive a confirmation email')
      }

    } catch (err) {
      addResult(`💥 Network error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">🔧 SMTP Configuration Debugger</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            placeholder="your-email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testSMTP}
            disabled={loading || !email}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Testing SMTP...' : 'Test SMTP Configuration'}
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-white/80 mb-2">Test Results:</h4>
          <div className="bg-black/30 rounded-lg p-4 max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className="text-sm text-white/90 font-mono leading-relaxed"
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-400 mb-2">🔍 SMTP Checklist:</h4>
        <div className="text-xs text-yellow-300/80 space-y-1">
          <p>✅ Supabase → Authentication → Settings → SMTP Settings</p>
          <p>✅ Enable custom SMTP: ON</p>
          <p>✅ Host: smtp.gmail.com</p>
          <p>✅ Port: 587</p>
          <p>✅ Username: your-gmail@gmail.com</p>
          <p>✅ Password: 16-character App Password (not regular password)</p>
          <p>✅ Sender name: Police Portal</p>
          <p>✅ Sender email: your-gmail@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
