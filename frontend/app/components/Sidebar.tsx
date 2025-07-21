'use client'

import React, { useState } from 'react'
import { 
  Home, 
  Clock, 
  FileText,
  Search,
  Upload,
  LogOut,
  Edit3
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Logo } from './Logo'

interface SidebarProps {
  currentView?: string
  onViewChange?: (view: string) => void
  session?: any
  userDisplayName?: string
}

const navigation = [
  { name: 'Dashboard', view: 'dashboard', icon: Home },
  { name: 'Timeline', view: 'timeline', icon: Clock },
  { name: 'Upload', view: 'upload', icon: Upload },
  { name: 'Search', view: 'search', icon: Search },
]

export function Sidebar({ currentView = 'timeline', onViewChange, session, userDisplayName }: SidebarProps) {
  const pathname = usePathname()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(userDisplayName || '')

  const handleNavClick = (view: string) => {
    if (onViewChange) {
      onViewChange(view)
    }
  }

  const handleSaveName = () => {
    if (editName.trim()) {
      localStorage.setItem('lifelog_user_name', editName.trim())
      setIsEditingName(false)
      // Reload the page to update the name everywhere
      window.location.reload()
    }
  }

  const handleCancelEdit = () => {
    setEditName(userDisplayName || '')
    setIsEditingName(false)
  }

  return (
    <div className="w-64 bg-gradient-to-b from-purple-200 via-purple-300 to-purple-400 text-white min-h-screen shadow-xl">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Logo size="md" className="drop-shadow-sm" />
          <span className="text-xl font-bold text-purple-900">LifeLog AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.view
          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.view)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-purple-800 hover:bg-purple-500 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          )
        })}
      </nav>

      {/* User Profile Section */}
      {session && (
        <div className="mt-auto p-4">
          <div className="bg-purple-600/30 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {(userDisplayName || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-purple-600/30 border border-purple-500/30 rounded text-white placeholder-white/70 focus:outline-none focus:border-purple-400"
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={handleSaveName}
                        className="px-2 py-1 bg-green-500/80 text-white text-xs rounded hover:bg-green-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-red-500/80 text-white text-xs rounded hover:bg-red-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-900 font-medium text-sm truncate">
                        {userDisplayName || 'User'}
                      </p>
                      <p className="text-purple-700 text-xs truncate">
                        {session?.user?.email || 'demo@lifelog.ai'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 hover:bg-purple-500/30 rounded transition-colors"
                      title="Edit name"
                    >
                      <Edit3 className="h-3 w-3 text-purple-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Sign Out Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
