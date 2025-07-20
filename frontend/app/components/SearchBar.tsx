'use client'

import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useSearch } from '../../hooks/useApi'
import { formatDistanceToNow } from 'date-fns'

interface SearchBarProps {
  onResultsChange?: (hasResults: boolean) => void
}

export function SearchBar({ onResultsChange }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const { results, searching, search } = useSearch()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      await search(query)
      setShowResults(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (!value.trim()) {
      setShowResults(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setShowResults(false)
  }

  useEffect(() => {
    onResultsChange?.(showResults && results.length > 0)
  }, [showResults, results.length, onResultsChange])

  return (
    <div className="flex-1 max-w-2xl relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search your life log..."
            className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-500 shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {searching ? (
            <div className="p-4 text-center">
              <Search className="h-6 w-6 text-gray-400 animate-pulse mx-auto mb-2" />
              <p className="text-gray-600">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              <div className="text-sm text-gray-500 px-3 py-2 border-b border-gray-100">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => {
                    // TODO: Navigate to entry or show details
                    console.log('Selected entry:', entry)
                  }}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{entry.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{entry.content}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${
                      entry.type === 'text' ? 'bg-purple-100 text-purple-800' :
                      entry.type === 'audio' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {entry.type}
                    </span>
                    <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <Search className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No results found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Try different keywords or check your spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
