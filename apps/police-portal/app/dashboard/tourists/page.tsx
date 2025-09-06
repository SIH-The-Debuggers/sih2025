'use client'

import { useState, useEffect } from 'react'

interface Tourist {
  subjectAddr: string
  tripId: string
  fullName: string | null
  destination: string | null
  startDate: string | null
  endDate: string | null
  didUri: string
  anchorHash: string
  version: number
  registerTx: string
  createdAt: string
  updatedAt: string
}

export default function TouristsPage() {
  const [tourists, setTourists] = useState<Tourist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTourists()
  }, [])

  const loadTourists = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/trips')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tourists data')
      }
      
      const data = await response.json()
      setTourists(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading tourists:', error)
      setError('Failed to load tourist data. Make sure the backend server is running on port 4000.')
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const filteredTourists = tourists.filter(tourist => 
    tourist.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.subjectAddr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.tripId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom right, #2563eb, #1e40af)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '8px', 
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p>Loading tourists data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom right, #2563eb, #1e40af)',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '100px' }}>
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.2)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '8px', 
            padding: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>❌ Error Loading Data</h2>
            <p style={{ marginBottom: '16px' }}>{error}</p>
            <button 
              onClick={loadTourists}
              style={{ 
                background: '#ef4444', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Retry
            </button>
            <br /><br />
            <a 
              href="/dashboard" 
              style={{ color: '#60a5fa', textDecoration: 'underline' }}
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #2563eb, #1e40af)',
      color: 'white'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a 
              href="/dashboard"
              style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ← Back to Dashboard
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>👥</span>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Tourist Management</h1>
            </div>
          </div>
          <a 
            href="/"
            style={{ 
              background: 'rgba(239, 68, 68, 0.2)', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              textDecoration: 'none'
            }}
          >
            🚪 Home
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Search */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '8px', 
          padding: '24px', 
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="🔍 Search by name, destination, wallet address, or trip ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.8 }}>
            <span>Total Tourists: {tourists.length}</span>
            <span>Filtered Results: {filteredTourists.length}</span>
          </div>
        </div>

        {/* Tourists Grid */}
        {filteredTourists.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '24px' 
          }}>
            {filteredTourists.map((tourist) => (
              <div 
                key={tourist.subjectAddr + tourist.tripId} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'background 0.2s'
                }}
              >
                {/* Tourist Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      background: 'rgba(59, 130, 246, 0.2)', 
                      padding: '8px', 
                      borderRadius: '8px',
                      fontSize: '24px'
                    }}>
                      🌍
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                        {tourist.fullName || 'Anonymous Tourist'}
                      </h3>
                      <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>Trip ID: {tourist.tripId}</p>
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(34, 197, 94, 0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    ✅ Verified
                  </div>
                </div>

                {/* Trip Details */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span>📍</span>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>
                      {tourist.destination || 'Destination not specified'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span>📅</span>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>
                      {formatDate(tourist.startDate)} - {formatDate(tourist.endDate)}
                    </span>
                  </div>
                </div>

                {/* Wallet Address */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span>💳</span>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>Wallet Address:</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ 
                      fontSize: '12px', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tourist.subjectAddr}
                    </code>
                    <button
                      onClick={() => copyToClipboard(tourist.subjectAddr)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                      title="Copy wallet address"
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div style={{ 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                  paddingTop: '16px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                    <span>⛓️ Blockchain Anchored</span>
                    <span>Version {tourist.version}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>Hash:</span>
                    <button
                      onClick={() => copyToClipboard(tourist.anchorHash)}
                      style={{ 
                        fontSize: '12px', 
                        background: 'rgba(0, 0, 0, 0.2)', 
                        border: 'none',
                        color: 'white',
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Copy anchor hash"
                    >
                      {tourist.anchorHash.slice(0, 10)}... 📋
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.7 }}>
                    <span>Registered: {formatDate(tourist.createdAt)}</span>
                    <a
                      href={'https://sepolia.etherscan.io/tx/' + tourist.registerTx}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#60a5fa', textDecoration: 'none' }}
                    >
                      View TX 🔗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>No tourists found</h3>
            <p style={{ opacity: 0.7, marginBottom: '24px' }}>
              {searchTerm 
                ? 'Try adjusting your search criteria.' 
                : 'No tourist data available yet.'}
            </p>
            <button 
              onClick={loadTourists}
              style={{ 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔄 Refresh Data
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
