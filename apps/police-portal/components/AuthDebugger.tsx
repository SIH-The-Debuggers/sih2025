'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebugger() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      checkAuthStatus()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      setAuthStatus({
        user,
        session,
        error,
        isLoggedIn: !!user,
        emailConfirmed: user?.email_confirmed_at ? true : false,
        userMetadata: user?.user_metadata
      })
    } catch (err) {
      setAuthStatus({ error: err })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4 bg-yellow-100 text-yellow-800">Loading auth status...</div>

  return (
    <div className="p-4 bg-gray-100 text-gray-800 text-sm">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info:</h3>
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(authStatus, null, 2)}
      </pre>
      <button 
        onClick={checkAuthStatus}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
      >
        Refresh Status
      </button>
    </div>
  )
}
