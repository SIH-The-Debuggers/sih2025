'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, FileText, AlertTriangle, LogIn } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-police-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-police-blue to-police-dark">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Police Department Portal</h1>
            </div>
            <Link 
              href="/auth/login"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Secure Police Management
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Advanced dashboard for police department operations, case management, and secure communication.
            Access restricted to authorized personnel only.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/login"
              className="bg-white text-police-blue px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Access Dashboard
            </Link>
            <Link 
              href="/auth/register"
              className="bg-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
            >
              Request Access
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <Users className="h-12 w-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Personnel Management</h3>
            <p className="text-white/80">
              Manage police personnel, assignments, and duty rosters with advanced tracking capabilities.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <FileText className="h-12 w-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Case Management</h3>
            <p className="text-white/80">
              Track cases, evidence, and investigations with secure document management and reporting.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <AlertTriangle className="h-12 w-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Emergency Response</h3>
            <p className="text-white/80">
              Real-time emergency alerts, dispatch management, and rapid response coordination.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Security Notice</h3>
          <p className="text-white/80">
            This system is restricted to authorized personnel only. Access is limited to verified government email domains.
            All activities are logged and monitored for security purposes.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 Police Department Portal. All rights reserved.</p>
            <p className="mt-2">Authorized access only. Unauthorized use is prohibited.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
