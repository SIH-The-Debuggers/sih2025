export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1e40af', minHeight: '100vh', color: 'white' }}>
      <h1>🚔 Police Portal - Server Test</h1>
      <p>If you can see this page, the server is working!</p>
      <p>✅ Backend: http://localhost:4000</p>
      <p>✅ Police Portal: http://localhost:3000</p>
      <br />
      <a href="/auth/login" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
        Go to Login Page
      </a>
    </div>
  )
}
