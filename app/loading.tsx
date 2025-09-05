'use client'

import { Shield } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-police-blue to-police-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4">
          <Shield className="h-16 w-16 text-white m-8" />
        </div>
        <p className="text-white text-lg">Loading Police Portal...</p>
      </div>
    </div>
  )
}
