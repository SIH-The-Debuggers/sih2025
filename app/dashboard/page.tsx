'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  MapPin, 
  Clock,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalOfficers: number
  activeCases: number
  emergencyAlerts: number
  patrolRoutes: number
  verifiedBlockchain: number
  totalBlockchain: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalOfficers: 0,
    activeCases: 0,
    emergencyAlerts: 0,
    patrolRoutes: 0,
    verifiedBlockchain: 0,
    totalBlockchain: 0
  })
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)
      
      // Load real stats from Supabase
      await loadDashboardStats()
      
      setLoading(false)
    }
    
    loadDashboard()
  }, [router])

  const loadDashboardStats = async () => {
    try {
      // Load stats from Supabase
      const { data: officers } = await supabase
        .from('police_officers')
        .select('id')
      
      const { data: blockchainProfiles } = await supabase
        .from('blockchain_profiles')
        .select('is_verified')
      
      const { data: cases } = await supabase
        .from('cases')
        .select('status')

      const totalOfficers = officers?.length || 0
      const totalBlockchain = blockchainProfiles?.length || 0
      const verifiedBlockchain = blockchainProfiles?.filter(p => p.is_verified).length || 0
      const activeCases = cases?.filter(c => c.status === 'open').length || 0

      setStats({
        totalOfficers,
        activeCases,
        emergencyAlerts: 3, // Static for now
        patrolRoutes: 12, // Static for now
        verifiedBlockchain,
        totalBlockchain
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Fallback to static data
      setStats({
        totalOfficers: 156,
        activeCases: 23,
        emergencyAlerts: 3,
        patrolRoutes: 12,
        verifiedBlockchain: 45,
        totalBlockchain: 67
      })
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-police-blue"></div>
      </div>
    )
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Shield, current: true },
    { name: 'Users', href: '/dashboard/users', icon: Users, current: false },
    { name: 'Cases', href: '/dashboard/cases', icon: FileText, current: false },
    { name: 'Emergency', href: '/dashboard/emergency', icon: AlertTriangle, current: false },
    { name: 'Patrol', href: '/dashboard/patrol', icon: MapPin, current: false },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-police-blue" />
              <span className="ml-2 text-xl font-bold text-gray-900">Police Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  item.current
                    ? 'bg-police-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <Shield className="h-8 w-8 text-police-blue" />
            <span className="ml-2 text-xl font-bold text-gray-900">Police Portal</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  item.current
                    ? 'bg-police-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent"
                />
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Officer'}</p>
                  <p className="text-xs text-gray-500">{user?.department || 'Police Department'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Officer'}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Officers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOfficers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Emergency Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.emergencyAlerts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Patrol Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.patrolRoutes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Blockchain IDs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBlockchain}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified IDs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedBlockchain}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Cases</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Case #2024-001</p>
                      <p className="text-sm text-gray-500">Theft Investigation</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Case #2024-002</p>
                      <p className="text-sm text-gray-500">Traffic Violation</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Closed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Case #2024-003</p>
                      <p className="text-sm text-gray-500">Domestic Dispute</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Urgent
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Emergency Alerts</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">High Priority Alert</p>
                      <p className="text-sm text-gray-500">Suspicious activity reported</p>
                      <p className="text-xs text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Patrol Update</p>
                      <p className="text-sm text-gray-500">Unit 5 checking in</p>
                      <p className="text-xs text-gray-400">15 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
