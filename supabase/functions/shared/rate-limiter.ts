/**
 * Rate Limiter Utility for Supabase Edge Functions
 * Implements sliding window rate limiting with database persistence
 */

export interface RateLimitConfig {
  endpoint: string
  maxRequests: number
  windowMs: number
  blockDurationMs?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

export interface RateLimitEntry {
  id: string
  userId: string
  endpoint: string
  windowStart: string
  requestCount: number
  createdAt: string
}

/**
 * Rate limiting service with sliding window implementation
 */
export class RateLimiter {
  private supabaseClient: any
  private defaultConfig: RateLimitConfig

  constructor(supabaseClient: any, defaultConfig?: Partial<RateLimitConfig>) {
    this.supabaseClient = supabaseClient
    this.defaultConfig = {
      endpoint: 'default',
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      blockDurationMs: 300000, // 5 minutes
      ...defaultConfig
    }
  }

  /**
   * Check and update rate limit for a user and endpoint
   */
  async checkRateLimit(
    userId: string,
    endpoint: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const finalConfig = { ...this.defaultConfig, endpoint, ...config }
    const now = new Date()
    const windowStart = this.getWindowStart(now, finalConfig.windowMs)

    try {
      // Clean up old rate limit entries first
      await this.cleanupOldEntries(userId, endpoint, now, finalConfig.windowMs)

      // Get or create current window entry
      const currentEntry = await this.getCurrentWindowEntry(userId, endpoint, windowStart)

      if (!currentEntry) {
        // Create new entry
        const newEntry = await this.createRateLimitEntry(userId, endpoint, windowStart)
        return {
          allowed: true,
          remaining: finalConfig.maxRequests - 1,
          resetTime: windowStart.getTime() + finalConfig.windowMs
        }
      }

      // Check if rate limit exceeded
      if (currentEntry.requestCount >= finalConfig.maxRequests) {
        const resetTime = new Date(currentEntry.windowStart).getTime() + finalConfig.windowMs
        const retryAfter = Math.ceil((resetTime - now.getTime()) / 1000)

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter
        }
      }

      // Increment request count
      const updatedEntry = await this.incrementRequestCount(currentEntry.id)
      const remaining = finalConfig.maxRequests - updatedEntry.requestCount

      return {
        allowed: true,
        remaining: Math.max(0, remaining),
        resetTime: new Date(currentEntry.windowStart).getTime() + finalConfig.windowMs
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      // Fail open - allow request if rate limiter has issues
      return {
        allowed: true,
        remaining: finalConfig.maxRequests - 1,
        resetTime: now.getTime() + finalConfig.windowMs
      }
    }
  }

  /**
   * Check if user is currently blocked
   */
  async isUserBlocked(userId: string, endpoint: string): Promise<boolean> {
    try {
      const blockKey = `${userId}:${endpoint}:blocked`
      // This would typically check a cache or separate blocked users table
      // For now, we'll use the rate_limits table with a special marker

      const { data, error } = await this.supabaseClient
        .from('rate_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('endpoint', `${endpoint}:blocked`)
        .gte('window_start', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
        .single()

      return !error && data !== null
    } catch (error) {
      console.error('Error checking user block status:', error)
      return false
    }
  }

  /**
   * Block user for specified duration
   */
  async blockUser(userId: string, endpoint: string, durationMs: number = 300000): Promise<void> {
    try {
      const blockUntil = new Date(Date.now() + durationMs)

      await this.supabaseClient
        .from('rate_limits')
        .insert({
          user_id: userId,
          endpoint: `${endpoint}:blocked`,
          window_start: new Date().toISOString(),
          request_count: 1
        })

      console.log(`User ${userId} blocked on ${endpoint} until ${blockUntil.toISOString()}`)
    } catch (error) {
      console.error('Error blocking user:', error)
    }
  }

  /**
   * Reset rate limit for a user and endpoint
   */
  async resetRateLimit(userId: string, endpoint: string): Promise<void> {
    try {
      await this.supabaseClient
        .from('rate_limits')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint)

      console.log(`Rate limit reset for user ${userId} on ${endpoint}`)
    } catch (error) {
      console.error('Error resetting rate limit:', error)
    }
  }

  /**
   * Get rate limit status for user across all endpoints
   */
  async getUserRateLimitStatus(userId: string): Promise<{
    endpoint: string
    requestCount: number
    windowStart: string
    remaining: number
  }[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('rate_limits')
        .select('*')
        .eq('user_id', userId)
        .gte('window_start', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('window_start', { ascending: false })

      if (error) {
        console.error('Error getting user rate limit status:', error)
        return []
      }

      return (data || []).map(entry => ({
        endpoint: entry.endpoint,
        requestCount: entry.request_count,
        windowStart: entry.window_start,
        remaining: Math.max(0, this.defaultConfig.maxRequests - entry.request_count)
      }))
    } catch (error) {
      console.error('Error getting user rate limit status:', error)
      return []
    }
  }

  /**
   * Private method to get window start time
   */
  private getWindowStart(now: Date, windowMs: number): Date {
    const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs)
    return windowStart
  }

  /**
   * Private method to get current window entry
   */
  private async getCurrentWindowEntry(
    userId: string,
    endpoint: string,
    windowStart: Date
  ): Promise<RateLimitEntry | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('rate_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .eq('window_start', windowStart.toISOString())
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error getting rate limit entry:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting rate limit entry:', error)
      return null
    }
  }

  /**
   * Private method to create new rate limit entry
   */
  private async createRateLimitEntry(
    userId: string,
    endpoint: string,
    windowStart: Date
  ): Promise<RateLimitEntry> {
    const { data, error } = await this.supabaseClient
      .from('rate_limits')
      .insert({
        user_id: userId,
        endpoint: endpoint,
        window_start: windowStart.toISOString(),
        request_count: 1
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create rate limit entry: ${error.message}`)
    }

    return data
  }

  /**
   * Private method to increment request count
   */
  private async incrementRequestCount(entryId: string): Promise<RateLimitEntry> {
    const { data, error } = await this.supabaseClient
      .from('rate_limits')
      .update({
        request_count: this.supabaseClient.raw('request_count + 1')
      })
      .eq('id', entryId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to increment request count: ${error.message}`)
    }

    return data
  }

  /**
   * Private method to clean up old entries
   */
  private async cleanupOldEntries(
    userId: string,
    endpoint: string,
    now: Date,
    windowMs: number
  ): Promise<void> {
    try {
      const cutoffTime = new Date(now.getTime() - windowMs * 2) // Keep 2 windows worth

      await this.supabaseClient
        .from('rate_limits')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .lt('window_start', cutoffTime.toISOString())
    } catch (error) {
      console.error('Error cleaning up old rate limit entries:', error)
    }
  }
}

/**
 * Predefined rate limit configurations for different endpoints
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  'chat-send': {
    endpoint: 'chat-send',
    maxRequests: 10,
    windowMs: 60000, // 10 messages per minute
    blockDurationMs: 300000 // 5 minute block
  },
  'chat-session': {
    endpoint: 'chat-session',
    maxRequests: 5,
    windowMs: 60000, // 5 new sessions per minute
    blockDurationMs: 600000 // 10 minute block
  },
  'chat-conversations': {
    endpoint: 'chat-conversations',
    maxRequests: 30,
    windowMs: 60000, // 30 requests per minute
    blockDurationMs: 60000 // 1 minute block
  },
  'chat-conversation-detail': {
    endpoint: 'chat-conversation-detail',
    maxRequests: 20,
    windowMs: 60000, // 20 requests per minute
    blockDurationMs: 60000 // 1 minute block
  },
  'chat-characters': {
    endpoint: 'chat-characters',
    maxRequests: 60,
    windowMs: 60000, // 60 requests per minute (public endpoint)
    blockDurationMs: 60000 // 1 minute block
  }
}

/**
 * Factory function to create rate limiter instance
 */
export function createRateLimiter(
  supabaseClient: any,
  config?: Partial<RateLimitConfig>
): RateLimiter {
  return new RateLimiter(supabaseClient, config)
}

/**
 * Middleware function for rate limiting in Edge Functions
 */
export async function rateLimitMiddleware(
  request: Request,
  supabaseClient: any,
  endpoint: string,
  userId?: string
): Promise<{ allowed: boolean; response?: Response }> {
  if (!userId) {
    return { allowed: true } // No rate limiting for unauthenticated requests to public endpoints
  }

  const rateLimiter = createRateLimiter(supabaseClient)
  const config = RATE_LIMIT_CONFIGS[endpoint]

  const result = await rateLimiter.checkRateLimit(userId, endpoint, config)

  if (!result.allowed) {
    const response = new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': config?.maxRequests.toString() || '10',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    )

    return { allowed: false, response }
  }

  return { allowed: true }
}

/**
 * Utility functions for rate limiting
 */
export const RateLimitUtils = {
  /**
   * Get user ID from request headers
   */
  getUserIdFromRequest(request: Request): string | null {
    return request.headers.get('x-user-id') ||
           request.headers.get('user-id') ||
           null
  },

  /**
   * Get endpoint name from URL
   */
  getEndpointFromUrl(url: string): string {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] || 'unknown'
  },

  /**
   * Create rate limit headers for response
   */
  createRateLimitHeaders(result: RateLimitResult, config: RateLimitConfig): Record<string, string> {
    return {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString()
    }
  }
}