const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export interface TimelineEntry {
  id: string
  title: string
  content: string
  type: 'text' | 'audio' | 'image'
  created_at: string
  processed: boolean
  file_path?: string
}

export interface WeeklySummary {
  id: string
  week_start: string
  week_end: string
  summary: string
  total_entries: number
  created_at: string
}

export interface UploadResponse {
  id: string
  message: string
  task_id: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  // Demo authentication
  async authenticateDemo(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        this.token = data.access_token
        // Store token in localStorage for persistence
        localStorage.setItem('lifelog_backend_token', data.access_token)
      }
    } catch (error) {
      console.log('Demo auth failed, continuing without backend token')
    }
  }

  // Initialize token from localStorage
  initializeToken(): void {
    const storedToken = localStorage.getItem('lifelog_backend_token')
    if (storedToken) {
      this.token = storedToken
    }
  }

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.initializeToken()
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Timeline API
  async getTimelineEntries(
    skip: number = 0,
    limit: number = 20,
    entry_type?: string,
    start_date?: string,
    end_date?: string
  ): Promise<TimelineEntry[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    })
    
    if (entry_type) params.append('entry_type', entry_type)
    if (start_date) params.append('start_date', start_date)
    if (end_date) params.append('end_date', end_date)

    return this.request<TimelineEntry[]>(`/timeline/entries?${params}`)
  }

  // Upload API
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/uploads/file`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Search API
  async searchEntries(query: string): Promise<TimelineEntry[]> {
    return this.request<TimelineEntry[]>('/search/entries', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }

  // Weekly Summary API
  async getWeeklySummaries(limit: number = 5): Promise<WeeklySummary[]> {
    return this.request<WeeklySummary[]>(`/timeline/weekly-summaries?limit=${limit}`)
  }

  async generateWeeklySummary(): Promise<WeeklySummary> {
    return this.request<WeeklySummary>('/timeline/generate-summary', {
      method: 'POST',
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient
