export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #2563eb, #1e40af)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px 0',
        marginBottom: '32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '4px' }}></div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Police Department Portal</h1>
          </div>
          <a 
            href="/auth/login"
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              color: 'white',
              border: 'none'
            }}
          >
            🔐 Login
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            Police Department Portal
          </h2>
          <p style={{ fontSize: '20px', opacity: 0.8, marginBottom: '32px' }}>
            Secure access for law enforcement personnel. Monitor tourist data, manage cases, and coordinate emergency responses.
          </p>
          <a 
            href="/auth/login"
            style={{ 
              background: 'white', 
              color: '#1e40af', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '18px'
            }}
          >
            Access Portal
          </a>
        </div>

        {/* Features Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>User Management</h3>
            <p style={{ opacity: 0.8 }}>Manage police officer accounts and access permissions</p>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Tourist Monitoring</h3>
            <p style={{ opacity: 0.8 }}>View and track tourist data from blockchain-verified KYC submissions</p>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Emergency Response</h3>
            <p style={{ opacity: 0.8 }}>Handle emergency alerts and coordinate response efforts</p>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.2)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: '12px', 
          padding: '24px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Security Notice</h3>
          <p style={{ opacity: 0.8 }}>
            This system is restricted to authorized personnel only. Access is limited to verified government email domains.
            All activities are logged and monitored for security purposes.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        background: 'rgba(0, 0, 0, 0.2)', 
        backdropFilter: 'blur(10px)', 
        borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
        marginTop: '64px', 
        padding: '32px 0' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', opacity: 0.6 }}>
          <p>&copy; 2024 Police Department Portal. All rights reserved.</p>
          <p style={{ marginTop: '8px' }}>Authorized access only. Unauthorized use is prohibited.</p>
        </div>
      </footer>
    </div>
  )
}
