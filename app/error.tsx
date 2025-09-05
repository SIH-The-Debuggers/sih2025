'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-police-blue to-police-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
          <div className="bg-red-500/20 border border-red-500/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
          <p className="text-white/80 mb-6">
            An unexpected error occurred. This might be a temporary issue.
          </p>
          <button
            onClick={reset}
            className="bg-white text-police-blue px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>
        </div>
      </div>
    </div>
  )
}
