'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function QuickFix() {
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: "Go to Supabase Dashboard",
      content: "Navigate to https://supabase.com/dashboard/project/xmvdjtlyfazgudrmaojr",
      action: "Open Dashboard"
    },
    {
      title: "Go to Authentication Settings",
      content: "Click: Authentication → Settings",
      action: "Navigate to Settings"
    },
    {
      title: "Disable Email Confirmation",
      content: "Find 'Enable email confirmations' and toggle it OFF",
      action: "Disable Confirmation"
    },
    {
      title: "Save Changes",
      content: "Click Save to apply the changes",
      action: "Save Settings"
    },
    {
      title: "Test Registration",
      content: "Try registering a new account - you should be able to login immediately",
      action: "Test Login"
    }
  ]

  const nextStep = () => {
    if (step < steps.length) {
      setStep(step + 1)
      toast.success(`Step ${step} completed!`)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard/project/xmvdjtlyfazgudrmaojr/auth/users', '_blank')
    toast.success('Opening Supabase Dashboard...')
  }

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-400 mb-4">🚀 Quick Fix: Disable Email Confirmation</h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Progress</span>
          <span className="text-sm text-white/60">{step}/{steps.length}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-2">
          Step {step}: {steps[step - 1].title}
        </h4>
        <p className="text-white/80 text-sm mb-3">
          {steps[step - 1].content}
        </p>
        
        {step === 1 && (
          <button
            onClick={openSupabase}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Open Supabase Dashboard
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={step === steps.length}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex-1"
        >
          {step === steps.length ? 'Complete!' : `Complete Step ${step}`}
        </button>
      </div>

      {step === steps.length && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-sm">
            ✅ All steps completed! Email confirmation is now disabled. 
            You can register and login immediately without waiting for email confirmation.
          </p>
        </div>
      )}
    </div>
  )
}
