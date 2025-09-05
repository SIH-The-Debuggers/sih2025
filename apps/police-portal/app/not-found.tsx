'use client'

import Link from 'next/link'
import { Shield, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-police-blue to-police-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-white/80 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-3">
            <Link 
              href="/"
              className="bg-white text-police-blue px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors inline-flex items-center space-x-2 w-full justify-center"
            >
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center space-x-2 w-full justify-center"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
