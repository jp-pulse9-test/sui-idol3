/**
 * Content Moderation Service for AI Chat System
 * Implements content filtering, categorization, and logging
 */

export interface ModerationResult {
  action: 'allowed' | 'flagged' | 'blocked'
  confidence: number
  categories: string[]
  reason?: string
  suggestedEdit?: string
}

export interface ModerationRule {
  id: string
  pattern: RegExp | string
  category: string
  action: 'flag' | 'block'
  confidence: number
  description: string
}

export interface ModerationLog {
  id: string
  messageId: string
  action: string
  reason?: string
  categories: string[]
  confidence: number
  appealed: boolean
  createdAt: string
}

/**
 * Content moderation service with multiple filtering strategies
 */
export class ContentModerator {
  private supabaseClient: any
  private moderationRules: ModerationRule[]
  private enableLogging: boolean

  constructor(supabaseClient: any, enableLogging: boolean = true) {
    this.supabaseClient = supabaseClient
    this.enableLogging = enableLogging
    this.moderationRules = this.initializeModerationRules()
  }

  /**
   * Moderate content and return action to take
   */
  async moderateContent(content: string, userId?: string, context?: {
    conversationId?: string
    characterId?: string
    messageType?: string
  }): Promise<ModerationResult> {
    try {
      // Clean and normalize content
      const normalizedContent = this.normalizeContent(content)

      // Apply moderation rules
      const ruleResults = this.applyModerationRules(normalizedContent)

      // Check for spam patterns
      const spamResult = this.checkSpamPatterns(normalizedContent)

      // Check content length and structure
      const structureResult = this.checkContentStructure(normalizedContent)

      // Combine results and determine final action
      const finalResult = this.combineResults([ruleResults, spamResult, structureResult])

      // Log moderation action if enabled
      if (this.enableLogging && (finalResult.action === 'flagged' || finalResult.action === 'blocked')) {
        await this.logModerationAction(finalResult, userId, context)
      }

      return finalResult
    } catch (error) {
      console.error('Content moderation error:', error)

      // Fail safe - allow content but log error
      return {
        action: 'allowed',
        confidence: 0,
        categories: ['error'],
        reason: 'Moderation service error'
      }
    }
  }

  /**
   * Check if content is likely to be spam
   */
  checkSpamPatterns(content: string): ModerationResult {
    const spamIndicators = [
      // Excessive repetition
      /(.)\1{10,}/, // Same character repeated 10+ times
      /(\b\w+\b)\s*\1\s*\1/i, // Same word repeated 3+ times

      // Excessive capitalization
      /^[A-Z\s!]{20,}$/, // All caps for 20+ characters

      // Common spam phrases
      /click here|buy now|free gift|limited time|act now/i,
      /make money|work from home|lose weight fast/i,

      // Excessive punctuation
      /[!]{5,}|[?]{5,}|[.]{10,}/,

      // URL patterns (simple)
      /https?:\/\/|www\.|\.com|\.org/i
    ]

    let spamScore = 0
    const matchedPatterns: string[] = []

    spamIndicators.forEach((pattern, index) => {
      if (pattern.test(content)) {
        spamScore += 0.3
        matchedPatterns.push(`spam_pattern_${index}`)
      }
    })

    if (spamScore >= 0.6) {
      return {
        action: 'blocked',
        confidence: Math.min(spamScore, 1),
        categories: ['spam', ...matchedPatterns],
        reason: 'Content appears to be spam'
      }
    } else if (spamScore >= 0.3) {
      return {
        action: 'flagged',
        confidence: spamScore,
        categories: ['potential_spam', ...matchedPatterns],
        reason: 'Content shows spam-like characteristics'
      }
    }

    return {
      action: 'allowed',
      confidence: 1 - spamScore,
      categories: []
    }
  }

  /**
   * Check content structure and length
   */
  checkContentStructure(content: string): ModerationResult {
    const issues: string[] = []
    let severity = 0

    // Check content length
    if (content.length === 0) {
      issues.push('empty_content')
      severity = 1
    } else if (content.length > 1000) {
      issues.push('excessive_length')
      severity = 0.3
    }

    // Check for only whitespace
    if (content.trim().length === 0) {
      issues.push('whitespace_only')
      severity = 1
    }

    // Check for excessive special characters
    const specialCharRatio = (content.match(/[^a-zA-Z0-9\s]/g) || []).length / content.length
    if (specialCharRatio > 0.5) {
      issues.push('excessive_special_chars')
      severity = Math.max(severity, 0.4)
    }

    if (severity >= 0.8) {
      return {
        action: 'blocked',
        confidence: severity,
        categories: ['structure_violation', ...issues],
        reason: 'Content structure is problematic'
      }
    } else if (severity >= 0.3) {
      return {
        action: 'flagged',
        confidence: severity,
        categories: ['structure_warning', ...issues],
        reason: 'Content structure may be problematic'
      }
    }

    return {
      action: 'allowed',
      confidence: 1 - severity,
      categories: []
    }
  }

  /**
   * Apply configured moderation rules
   */
  applyModerationRules(content: string): ModerationResult {
    let highestConfidence = 0
    let worstAction: 'allowed' | 'flagged' | 'blocked' = 'allowed'
    const triggeredCategories: string[] = []
    const triggeredReasons: string[] = []

    for (const rule of this.moderationRules) {
      let matches = false

      if (rule.pattern instanceof RegExp) {
        matches = rule.pattern.test(content)
      } else {
        matches = content.toLowerCase().includes(rule.pattern.toLowerCase())
      }

      if (matches) {
        triggeredCategories.push(rule.category)
        triggeredReasons.push(rule.description)

        if (rule.confidence > highestConfidence) {
          highestConfidence = rule.confidence
          worstAction = rule.action === 'block' ? 'blocked' : 'flagged'
        }
      }
    }

    if (highestConfidence === 0) {
      return {
        action: 'allowed',
        confidence: 1,
        categories: []
      }
    }

    return {
      action: worstAction,
      confidence: highestConfidence,
      categories: [...new Set(triggeredCategories)],
      reason: triggeredReasons.join('; ')
    }
  }

  /**
   * Combine multiple moderation results
   */
  combineResults(results: ModerationResult[]): ModerationResult {
    let finalAction: 'allowed' | 'flagged' | 'blocked' = 'allowed'
    let maxConfidence = 0
    const allCategories: string[] = []
    const allReasons: string[] = []

    for (const result of results) {
      if (result.action === 'blocked') {
        finalAction = 'blocked'
      } else if (result.action === 'flagged' && finalAction !== 'blocked') {
        finalAction = 'flagged'
      }

      maxConfidence = Math.max(maxConfidence, result.confidence)
      allCategories.push(...result.categories)
      if (result.reason) {
        allReasons.push(result.reason)
      }
    }

    return {
      action: finalAction,
      confidence: maxConfidence,
      categories: [...new Set(allCategories)],
      reason: allReasons.length > 0 ? allReasons.join('; ') : undefined
    }
  }

  /**
   * Log moderation action to database
   */
  async logModerationAction(
    result: ModerationResult,
    userId?: string,
    context?: any
  ): Promise<void> {
    try {
      const logEntry = {
        message_id: context?.messageId || null,
        action: result.action,
        reason: result.reason || null,
        categories: result.categories,
        confidence: result.confidence,
        appealed: false
      }

      await this.supabaseClient
        .from('moderation_logs')
        .insert(logEntry)

      console.log('Moderation action logged:', logEntry)
    } catch (error) {
      console.error('Error logging moderation action:', error)
    }
  }

  /**
   * Get moderation history for analysis
   */
  async getModerationHistory(filters?: {
    userId?: string
    action?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
  }): Promise<ModerationLog[]> {
    try {
      let query = this.supabaseClient
        .from('moderation_logs')
        .select('*')

      if (filters?.action) {
        query = query.eq('action', filters.action)
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString())
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString())
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100)

      const { data, error } = await query

      if (error) {
        console.error('Error fetching moderation history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching moderation history:', error)
      return []
    }
  }

  /**
   * Process moderation appeal
   */
  async processAppeal(moderationLogId: string, approved: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('moderation_logs')
        .update({ appealed: true })
        .eq('id', moderationLogId)

      if (error) {
        console.error('Error processing appeal:', error)
        return false
      }

      console.log(`Appeal ${approved ? 'approved' : 'denied'} for moderation log ${moderationLogId}`)
      return true
    } catch (error) {
      console.error('Error processing appeal:', error)
      return false
    }
  }

  /**
   * Normalize content for consistent processing
   */
  private normalizeContent(content: string): string {
    return content
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
  }

  /**
   * Initialize moderation rules
   */
  private initializeModerationRules(): ModerationRule[] {
    return [
      // Inappropriate content
      {
        id: 'inappropriate_1',
        pattern: /\b(hate|kill|die|suicide)\b/i,
        category: 'harmful_content',
        action: 'block',
        confidence: 0.9,
        description: 'Contains harmful language'
      },

      // Personal information
      {
        id: 'personal_info_1',
        pattern: /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
        category: 'personal_information',
        action: 'block',
        confidence: 0.95,
        description: 'Contains potential personal information'
      },

      // Profanity (mild)
      {
        id: 'profanity_1',
        pattern: /\b(damn|hell|crap)\b/i,
        category: 'mild_profanity',
        action: 'flag',
        confidence: 0.6,
        description: 'Contains mild profanity'
      },

      // Spam indicators
      {
        id: 'spam_1',
        pattern: 'CLICK HERE NOW',
        category: 'spam',
        action: 'block',
        confidence: 0.8,
        description: 'Spam-like content'
      },

      // Testing patterns for development
      {
        id: 'test_block',
        pattern: 'SIMULATE_CONTENT_BLOCK',
        category: 'test',
        action: 'block',
        confidence: 1.0,
        description: 'Test content blocking'
      },

      {
        id: 'test_flag',
        pattern: 'SIMULATE_CONTENT_FLAG',
        category: 'test',
        action: 'flag',
        confidence: 0.8,
        description: 'Test content flagging'
      }
    ]
  }
}

/**
 * Factory function to create content moderator instance
 */
export function createContentModerator(
  supabaseClient: any,
  enableLogging: boolean = true
): ContentModerator {
  return new ContentModerator(supabaseClient, enableLogging)
}

/**
 * Quick moderation function for simple use cases
 */
export async function moderateMessage(
  content: string,
  supabaseClient: any,
  context?: any
): Promise<ModerationResult> {
  const moderator = createContentModerator(supabaseClient)
  return await moderator.moderateContent(content, context?.userId, context)
}

/**
 * Utility functions for content moderation
 */
export const ModerationUtils = {
  /**
   * Check if result should block message
   */
  shouldBlockMessage(result: ModerationResult): boolean {
    return result.action === 'blocked'
  },

  /**
   * Check if result should flag message
   */
  shouldFlagMessage(result: ModerationResult): boolean {
    return result.action === 'flagged' || result.action === 'blocked'
  },

  /**
   * Get moderation severity level
   */
  getSeverityLevel(result: ModerationResult): 'low' | 'medium' | 'high' {
    if (result.action === 'blocked') return 'high'
    if (result.action === 'flagged') return 'medium'
    return 'low'
  },

  /**
   * Format moderation result for API response
   */
  formatForAPI(result: ModerationResult): {
    moderated: boolean
    action: string
    categories: string[]
  } {
    return {
      moderated: result.action !== 'allowed',
      action: result.action,
      categories: result.categories
    }
  },

  /**
   * Create moderation headers for response
   */
  createModerationHeaders(result: ModerationResult): Record<string, string> {
    return {
      'X-Content-Moderated': result.action !== 'allowed' ? 'true' : 'false',
      'X-Moderation-Action': result.action,
      'X-Moderation-Confidence': result.confidence.toString()
    }
  }
}