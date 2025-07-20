'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { apiClient } from '../../lib/api'
import { SearchBar } from '../components/SearchBar'
import { Timeline } from '../components/Timeline'
import { WeeklySummary } from '../components/WeeklySummary'
import { FileUpload } from '../components/FileUpload'
import { User, Upload, Search as SearchIcon } from 'lucide-react'

type ViewType = 'dashboard' | 'timeline' | 'upload' | 'search'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [hasSearchResults, setHasSearchResults] = useState(false)
  const [userDisplayName, setUserDisplayName] = useState<string>('')

  // Enable auth check
  const { data: session, status } = useSession()

  // Load user display name from localStorage or session
  React.useEffect(() => {
    if (session) {
      const storedName = localStorage.getItem('lifelog_user_name')
      console.log('Debug - Stored name:', storedName)
      console.log('Debug - Session user:', session.user)
      
      let displayName = 'Demo User' // Default fallback
      
      if (storedName && storedName.trim()) {
        displayName = storedName
      } else if (session.user?.name && session.user.name !== 'Demo User') {
        displayName = session.user.name
      } else if (session.user?.email) {
        const emailName = session.user.email.split('@')[0]
        if (emailName && emailName !== 'demo') {
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
        }
      }
      
      console.log('Debug - Final display name:', displayName)
      setUserDisplayName(displayName)
      
      // Authenticate with backend for demo users
      if (session.user?.email) {
        apiClient.authenticateDemo(session.user.email, 'demo123')
          .then(() => console.log('Backend authentication successful'))
          .catch((err: any) => console.log('Backend authentication failed:', err))
      }
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Personalized Welcome */}
            <div className="bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                Hey {userDisplayName}! 👋
              </h1>
              <p className="text-purple-100">
                Welcome to your personal LifeLog AI dashboard. Here's what's happening in your digital life.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Entries</h3>
                <p className="text-3xl font-bold text-primary-600">24</p>
                <p className="text-sm text-gray-500 mt-1">+3 this week</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Files Processed</h3>
                <p className="text-3xl font-bold text-green-600">18</p>
                <p className="text-sm text-gray-500 mt-1">+2 today</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Summaries</h3>
                <p className="text-3xl font-bold text-orange-600">5</p>
                <p className="text-sm text-gray-500 mt-1">Generated this month</p>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Uploaded meeting notes - 2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Generated weekly summary - Yesterday</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Processed voice memo - 2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'timeline':
        return <Timeline />
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Upload Files</h2>
            </div>
            <FileUpload />
          </div>
        )
      case 'search':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <SearchIcon className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Search Your Life Log</h2>
            </div>
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
              <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Your Entries</h3>
              <p className="text-gray-600 mb-6">Use the search bar above to find specific entries, keywords, or topics from your life log.</p>
              <div className="text-sm text-gray-500">
                <p>Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full">meetings</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">project</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">photos</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">shopping</span>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <Timeline />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as ViewType)} session={session} userDisplayName={userDisplayName} />
        <div className="flex-1 bg-gray-50 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <SearchBar onResultsChange={setHasSearchResults} />
            <div className="flex items-center space-x-4">
              {/* User Greeting */}
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-900">
                  {userDisplayName}
                </p>
              </div>
              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                {userDisplayName[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1">
              {renderMainContent()}
            </div>

            {/* Weekly Summary Sidebar - show on dashboard and timeline views */}
            {(currentView === 'dashboard' || currentView === 'timeline') && !hasSearchResults && (
              <div className="w-80">
                <WeeklySummary />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
