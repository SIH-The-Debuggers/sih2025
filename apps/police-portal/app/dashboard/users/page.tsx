'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Shield, 
  Search, 
  Filter,
  Eye,
  Edit,
  Plus,
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  name: string
  role: string
  department: string
  badge_number: string
  blockchain_id: string
  wallet_address: string
  is_verified: boolean
  created_at: string
}

export default function UsersPage() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)
      await loadUsers()
      setLoading(false)
    }
    
    loadData()
  }, [router])

  const loadUsers = async () => {
    try {
      // Get users with their blockchain profiles and police officer data
      const { data, error } = await supabase
        .from('auth.users')
        .select(`
          id,
          email,
          raw_user_meta_data,
          created_at,
          blockchain_profiles!inner (
            blockchain_id,
            wallet_address,
            is_verified
          ),
          police_officers!inner (
            badge_number,
            department
          )
        `)

      if (error) {
        console.error('Error loading users:', error)
        // Fallback: get users from auth and join with our tables
        const { data: authUsers } = await supabase.auth.admin.listUsers()
        
        const usersWithProfiles = await Promise.all(
          authUsers.users.map(async (authUser) => {
            const { data: blockchainProfile } = await supabase
              .from('blockchain_profiles')
              .select('*')
              .eq('user_id', authUser.id)
              .single()

            const { data: policeOfficer } = await supabase
              .from('police_officers')
              .select('*')
              .eq('user_id', authUser.id)
              .single()

            return {
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.name || 'Unknown',
              role: authUser.user_metadata?.role || 'officer',
              department: policeOfficer?.department || 'unknown',
              badge_number: policeOfficer?.badge_number || 'N/A',
              blockchain_id: blockchainProfile?.blockchain_id || 'Not Assigned',
              wallet_address: blockchainProfile?.wallet_address || 'N/A',
              is_verified: blockchainProfile?.is_verified || false,
              created_at: authUser.created_at
            }
          })
        )

        setUsers(usersWithProfiles)
        return
      }

      const formattedUsers = data.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.raw_user_meta_data?.name || 'Unknown',
        role: user.raw_user_meta_data?.role || 'officer',
        department: user.police_officers?.department || 'unknown',
        badge_number: user.police_officers?.badge_number || 'N/A',
        blockchain_id: user.blockchain_profiles?.blockchain_id || 'Not Assigned',
        wallet_address: user.blockchain_profiles?.wallet_address || 'N/A',
        is_verified: user.blockchain_profiles?.is_verified || false,
        created_at: user.created_at
      }))

      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.badge_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.blockchain_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment
    
    return matchesSearch && matchesDepartment
  })

  const departments = [...new Set(users.map(user => user.department))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-police-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-police-blue" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600">Manage police officers and blockchain IDs</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Officer'}</p>
                <p className="text-xs text-gray-500">{user?.department || 'Police Department'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Shield className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, badge number, or blockchain ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Police Officers ({filteredUsers.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badge Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blockchain ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.badge_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {user.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {user.blockchain_id.length > 20 
                            ? `${user.blockchain_id.substring(0, 20)}...` 
                            : user.blockchain_id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(user.blockchain_id, `blockchain-${user.id}`)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {copiedId === `blockchain-${user.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {user.wallet_address.length > 20 
                            ? `${user.wallet_address.substring(0, 20)}...` 
                            : user.wallet_address}
                        </span>
                        <button
                          onClick={() => copyToClipboard(user.wallet_address, `wallet-${user.id}`)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {copiedId === `wallet-${user.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_verified ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center space-x-1">
                          <XCircle className="h-3 w-3" />
                          <span>Unverified</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-police-blue hover:text-police-dark">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
