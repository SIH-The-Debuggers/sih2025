'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DevTools() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState('')

  const manuallyConfirmUser = async () => {
    try {
      // This requires admin privileges - you'd need to do this via Supabase dashboard
      setResult('Please use Supabase Dashboard → Authentication → Users to manually confirm the user')
    } catch (err) {
      setResult(`Error: ${err}`)
    }
  }

  const checkUserStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', email)
      
      if (error) {
        setResult(`Error: ${error.message}`)
      } else {
        setResult(`User data: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (err) {
      setResult(`Error: ${err}`)
    }
  }

  return (
    <div className="p-4 bg-gray-100 border rounded">
      <h3 className="font-bold mb-4">🛠️ Development Tools</h3>
      
      <div className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Enter email to check"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-x-2">
          <button 
            onClick={checkUserStatus}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Check User Status
          </button>
          <button 
            onClick={manuallyConfirmUser}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Manual Confirm Instructions
          </button>
        </div>
        
        {result && (
          <pre className="text-xs bg-white p-2 border rounded overflow-auto max-h-40">
            {result}
          </pre>
        )}
      </div>
    </div>
  )
}
