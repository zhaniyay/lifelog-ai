'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Brain, Upload, Search, Calendar, Sparkles } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check authentication and redirect appropriately
  useEffect(() => {
    if (status === 'authenticated') {
      // Check if user needs to set up their profile
      const storedName = localStorage.getItem('lifelog_user_name')
      const hasName = session?.user?.name || storedName
      
      if (!hasName) {
        // New user - redirect to profile setup
        router.push('/profile/setup')
      } else {
        // Existing user - go to dashboard
        router.push('/dashboard')
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router, session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">LifeLog AI</span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            View Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your Life, <span className="text-primary-600">AI-Powered</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload text, audio, and images. Let AI transcribe, analyze, and help you 
              discover patterns in your life through intelligent search and weekly summaries.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => signIn('google')}
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-transparent border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors"
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="card text-center">
              <Upload className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Format Upload</h3>
              <p className="text-gray-600">
                Upload text files, audio recordings, and images with automatic processing.
              </p>
            </div>
            
            <div className="card text-center">
              <Brain className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Whisper transcription for audio and Tesseract OCR for image text extraction.
              </p>
            </div>
            
            <div className="card text-center">
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Semantic Search</h3>
              <p className="text-gray-600">
                Find anything in your life log using natural language queries.
              </p>
            </div>
            
            <div className="card text-center">
              <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Weekly Summaries</h3>
              <p className="text-gray-600">
                Get AI-generated insights and summaries of your weekly activities.
              </p>
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Your Personal Timeline</h2>
            <div className="space-y-6">
              {/* Mock timeline entries */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-primary-600">Meeting with design team</span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <p className="text-gray-600 text-sm">Discussed the new homepage layout</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-secondary-600">Grocery shopping</span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <p className="text-gray-600 text-sm">Bought apples, bread, milk, eggs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-green-600">Sunset by the lake</span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <p className="text-gray-600 text-sm">Took a photo of the sunset</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 LifeLog AI. Built with FastAPI, Next.js, and AI.</p>
        </div>
      </footer>
    </div>
  )
}
