'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Play } from 'lucide-react'

export default function SupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConfiguration = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const configured = supabaseUrl && 
                        supabaseKey && 
                        supabaseUrl !== 'https://placeholder.supabase.co' &&
                        supabaseKey !== 'placeholder-key'
      
      setIsConfigured(!!configured)
      setIsChecking(false)
    }

    checkConfiguration()
  }, [])

  if (isChecking) {
    return null
  }

  if (!isConfigured) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-red-500/90 backdrop-blur-md border border-red-400 rounded-lg p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-red-200 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-100">Supabase Not Configured</h3>
              <p className="text-xs text-red-200 mt-1">
                Please set up your environment variables to enable authentication.
              </p>
              <a 
                href="/SETUP.md" 
                className="text-xs text-red-100 underline hover:text-white mt-2 inline-block"
              >
                View Setup Instructions
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-green-500/90 backdrop-blur-md border border-green-400 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-200 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-100">Supabase Configured</h3>
            <p className="text-xs text-green-200 mt-1">
              Authentication system is ready to use.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
