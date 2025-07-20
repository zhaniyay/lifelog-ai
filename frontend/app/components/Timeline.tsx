'use client'

import React from 'react'
import { User, FileText, Mic, Image, RefreshCw } from 'lucide-react'
import { useTimeline } from '../../hooks/useApi'
import { formatDistanceToNow } from 'date-fns'

interface TimelineEntry {
  id: string
  title: string
  content: string
  type: string
  created_at: string
  processed: boolean
}

const getAvatarColor = (type: string) => {
  switch (type) {
    case 'text':
      return 'bg-purple-200'
    case 'audio':
      return 'bg-blue-200'
    case 'image':
      return 'bg-gradient-to-br from-orange-300 to-pink-300'
    default:
      return 'bg-gray-200'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
      return <FileText className="h-6 w-6 text-gray-600" />
    case 'audio':
      return <Mic className="h-6 w-6 text-gray-600" />
    case 'image':
      return <Image className="h-6 w-6 text-gray-600" />
    default:
      return <User className="h-6 w-6 text-gray-600" />
  }
}

export function Timeline() {
  const { entries, loading, error, refetch } = useTimeline()

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h2>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-600">Loading your timeline...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-2">Failed to load timeline: {error}</p>
          <button 
            onClick={() => refetch()}
            className="text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Timeline</h2>
        <button 
          onClick={() => refetch()}
          className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
      
      {/* Today Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Today</h3>
        
        {entries.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h4>
            <p className="text-gray-600">Start by uploading your first file or creating a text entry.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(entry.type)}`}>
                    {getTypeIcon(entry.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{entry.title}</h4>
                        <p className="text-gray-600 mb-2">{entry.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.processed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.processed ? 'Processed' : 'Processing...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="btn-secondary">
          Load More Entries
        </button>
      </div>
    </div>
  )
}
