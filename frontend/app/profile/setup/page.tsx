'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Brain, User, Save } from 'lucide-react'

export default function ProfileSetup() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update the session with the new name
      await update({
        ...session,
        user: {
          ...session?.user,
          name: name
        }
      })

      // Store in localStorage for persistence
      localStorage.setItem('lifelog_user_name', name)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-10 w-10 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900">LifeLog AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome! 👋</h1>
          <p className="text-gray-600">Let's personalize your experience</p>
        </div>

        {/* Profile Setup Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Set Your Name</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                What should we call you?
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (e.g., Zhaniya)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This name will appear in your dashboard and throughout the app
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save & Continue'}</span>
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Account Information:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Sign-in method:</strong> {session?.user?.image ? 'Google' : 'Demo'}</p>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Sign out and use different account
          </button>
        </div>
      </div>
    </div>
  )
}
