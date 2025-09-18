/**
 * Utility for making API calls to Supabase Edge Functions during testing
 */

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
  headers: Record<string, string>
}

export class ApiClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(baseUrl = 'http://localhost:54321/functions/v1', apiKey = 'test-key') {
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }
  }

  async post<T>(endpoint: string, data: any, options: { userId?: string } = {}): Promise<ApiResponse<T>> {
    const headers = { ...this.headers }

    if (options.userId) {
      // Mock user authentication for tests
      headers['x-user-id'] = options.userId
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      return {
        data: response.ok ? responseData : undefined,
        error: response.ok ? undefined : responseData.error || 'Request failed',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
        headers: {},
      }
    }
  }

  async get<T>(endpoint: string, options: { userId?: string } = {}): Promise<ApiResponse<T>> {
    const headers = { ...this.headers }

    if (options.userId) {
      headers['x-user-id'] = options.userId
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers,
      })

      const responseData = await response.json()

      return {
        data: response.ok ? responseData : undefined,
        error: response.ok ? undefined : responseData.error || 'Request failed',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
        headers: {},
      }
    }
  }
}

// Test data factory
export const TestData = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    walletAddress: '0x123456789',
  },

  character: {
    id: 'idol_001',
    name: 'Luna',
  },

  message: {
    content: 'Hello! How are you today?',
    role: 'user' as const,
  },

  conversation: {
    characterId: 'idol_001',
    title: 'Test Conversation',
  },
}

// Schema validation helpers
export const validateSchema = {
  conversation: (data: any) => {
    const required = ['id', 'userId', 'characterId', 'status', 'createdAt']
    for (const field of required) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    return data
  },

  message: (data: any) => {
    const required = ['id', 'conversationId', 'role', 'content', 'createdAt']
    for (const field of required) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    return data
  },

  character: (data: any) => {
    const required = ['id', 'name', 'personality', 'speakingStyle', 'active']
    for (const field of required) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    return data
  },

  error: (data: any) => {
    if (!data.error || typeof data.error !== 'string') {
      throw new Error('Invalid error response format')
    }
    return data
  },
}