'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 border border-red-300 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">
            There was a problem loading the dashboard. This might be a temporary issue.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="bg-police-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-police-dark transition-colors w-full"
            >
              Try Again
            </button>
            <Link 
              href="/"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors inline-flex items-center space-x-2 w-full justify-center"
            >
              <Shield className="h-4 w-4" />
              <span>Police Portal Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
