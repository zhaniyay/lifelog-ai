'use client'

import React from 'react'
import { useWeeklySummary } from '../../hooks/useApi'
import { RefreshCw, Sparkles } from 'lucide-react'

export function WeeklySummary() {
  const { summaries, loading, error, generating, generateSummary } = useWeeklySummary()
  const currentSummary = summaries[0]

  if (loading) {
    return (
      <div className="bg-orange-100 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <RefreshCw className="h-5 w-5 text-gray-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900">Loading...</h3>
        </div>
        <p className="text-gray-700">Getting your weekly summary...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Error</h3>
        <p className="text-red-700 mb-4">Failed to load weekly summary</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-red-600 hover:text-red-800 underline text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-orange-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          {currentSummary?.summary || 'Completed 5 tasks, attended 3 meetings, focused on project plan'}
        </p>
        
        {currentSummary && (
          <div className="text-sm text-gray-600">
            <p>{currentSummary.total_entries} entries this week</p>
          </div>
        )}
      </div>

      {/* Generate New Summary Button */}
      <button
        onClick={generateSummary}
        disabled={generating}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Generate New Summary</span>
          </>
        )}
      </button>
    </div>
  )
}
