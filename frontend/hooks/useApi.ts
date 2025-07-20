import { useState, useEffect } from 'react'
import { apiClient, TimelineEntry, WeeklySummary, UploadResponse } from '../lib/api'

// Timeline hook
export function useTimeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = async (filters?: {
    entry_type?: string
    start_date?: string
    end_date?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getTimelineEntries(
        0, 
        20, 
        filters?.entry_type,
        filters?.start_date,
        filters?.end_date
      )
      setEntries(data)
    } catch (err) {
      // Fallback to mock data if API fails - don't show error in demo mode
      console.log('Backend unavailable, using mock data for demo')
      setError(null)
      setEntries([
        {
          id: '1',
          title: 'Meeting with design team',
          content: 'Discussed the new homepage layout',
          type: 'text',
          created_at: new Date().toISOString(),
          processed: true
        },
        {
          id: '2',
          title: 'Grocery shopping',
          content: 'Bought apples, bread, milk, eggs',
          type: 'text',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          processed: true
        },
        {
          id: '3',
          title: 'Sunset by the lake',
          content: 'Took a photo of the sunset',
          type: 'image',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          processed: true
        },
        {
          id: '4',
          title: 'Project plan feedback',
          content: 'Provided comments on project outline',
          type: 'text',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          processed: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries
  }
}

// File upload hook
export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<UploadResponse | null> => {
    try {
      setUploading(true)
      setUploadError(null)
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: Math.min(prev[file.name] + 10, 90)
        }))
      }, 200)

      const response = await apiClient.uploadFile(file)
      
      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
      
      return response
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadFile,
    uploading,
    uploadProgress,
    uploadError
  }
}

// Search hook
export function useSearch() {
  const [results, setResults] = useState<TimelineEntry[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setSearching(true)
      setSearchError(null)
      const data = await apiClient.searchEntries(query)
      setResults(data)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
      // Fallback to mock filtered results
      const mockResults = [
        {
          id: '1',
          title: 'Meeting with design team',
          content: 'Discussed the new homepage layout',
          type: 'text' as const,
          created_at: new Date().toISOString(),
          processed: true
        }
      ]
      setResults(mockResults.filter(entry => 
        entry.title.toLowerCase().includes(query.toLowerCase()) ||
        entry.content.toLowerCase().includes(query.toLowerCase())
      ))
    } finally {
      setSearching(false)
    }
  }

  return {
    results,
    searching,
    searchError,
    search
  }
}

// Weekly summary hook
export function useWeeklySummary() {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const fetchSummaries = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getWeeklySummaries()
      setSummaries(data)
    } catch (err) {
      console.log('Backend unavailable, using mock data for demo')
      setSummaries([
        {
          id: '1',
          week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          week_end: new Date().toISOString(),
          summary: 'Completed 5 tasks, attended 3 meetings, focused on project plan',
          total_entries: 12,
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const generateSummary = async () => {
    try {
      setGenerating(true)
      const newSummary = await apiClient.generateWeeklySummary()
      setSummaries(prev => [newSummary, ...prev])
      return newSummary
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
      return null
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchSummaries()
  }, [])

  return {
    summaries,
    loading,
    error,
    generating,
    generateSummary,
    refetch: fetchSummaries
  }
}
