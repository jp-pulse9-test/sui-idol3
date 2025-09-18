/**
 * Conversation Context Manager for AI Chat System
 * Manages conversation history, context windowing, and token optimization
 */

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens?: number
  metadata?: Record<string, any>
  hidden: boolean
  createdAt: string
}

export interface ConversationContext {
  conversationId: string
  characterId: string
  messages: Message[]
  totalTokens: number
  contextWindow: Message[]
  systemPrompt: string
  summary?: string
}

export interface ContextWindow {
  messages: Message[]
  totalTokens: number
  truncated: boolean
  summaryUsed: boolean
}

export interface TokenLimits {
  maxContextTokens: number
  maxMessageTokens: number
  systemPromptTokens: number
  responseTokens: number
}

/**
 * Service for managing conversation context and token optimization
 */
export class ContextManager {
  private supabaseClient: any
  private defaultTokenLimits: TokenLimits

  constructor(supabaseClient: any, tokenLimits?: Partial<TokenLimits>) {
    this.supabaseClient = supabaseClient
    this.defaultTokenLimits = {
      maxContextTokens: 4000, // Total context window
      maxMessageTokens: 1000, // Max tokens per message
      systemPromptTokens: 500, // Reserved for system prompt
      responseTokens: 500, // Reserved for AI response
      ...tokenLimits
    }
  }

  /**
   * Get conversation context with optimized token management
   */
  async getConversationContext(
    conversationId: string,
    includeSystemPrompt: boolean = true
  ): Promise<ConversationContext | null> {
    try {
      // Get conversation details
      const conversation = await this.getConversationDetails(conversationId)
      if (!conversation) {
        return null
      }

      // Get message history
      const messages = await this.getConversationMessages(conversationId)

      // Calculate total tokens
      const totalTokens = this.calculateTotalTokens(messages)

      // Create optimized context window
      const contextWindow = this.createContextWindow(messages, this.defaultTokenLimits)

      // Generate system prompt if needed
      const systemPrompt = includeSystemPrompt
        ? await this.generateSystemPrompt(conversation.characterId, contextWindow.messages)
        : ''

      return {
        conversationId,
        characterId: conversation.characterId,
        messages,
        totalTokens,
        contextWindow: contextWindow.messages,
        systemPrompt,
        summary: conversation.summary
      }
    } catch (error) {
      console.error('Error getting conversation context:', error)
      return null
    }
  }

  /**
   * Add message to conversation and update context
   */
  async addMessageToContext(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<Message | null> {
    try {
      // Estimate tokens for the new message
      const estimatedTokens = this.estimateTokens(content)

      // Create message record
      const { data: message, error } = await this.supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
          tokens: estimatedTokens,
          metadata: metadata || {},
          hidden: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding message:', error)
        return null
      }

      // Update conversation stats (handled by database trigger)

      return message
    } catch (error) {
      console.error('Error adding message to context:', error)
      return null
    }
  }

  /**
   * Create optimized context window within token limits
   */
  createContextWindow(messages: Message[], limits: TokenLimits): ContextWindow {
    const availableTokens = limits.maxContextTokens - limits.systemPromptTokens - limits.responseTokens

    let totalTokens = 0
    const contextMessages: Message[] = []
    let truncated = false
    let summaryUsed = false

    // Process messages from newest to oldest
    const sortedMessages = [...messages].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    for (const message of sortedMessages) {
      const messageTokens = message.tokens || this.estimateTokens(message.content)

      if (totalTokens + messageTokens <= availableTokens) {
        contextMessages.unshift(message) // Add to beginning to maintain chronological order
        totalTokens += messageTokens
      } else {
        truncated = true
        break
      }
    }

    // If we have very few messages, try to include more by summarizing
    if (contextMessages.length < 3 && truncated) {
      const { summarizedMessages, summary } = this.summarizeOlderMessages(
        sortedMessages.slice(contextMessages.length),
        availableTokens - totalTokens
      )

      if (summary) {
        // Add summary as a system message
        const summaryMessage: Message = {
          id: 'summary',
          conversationId: messages[0]?.conversationId || '',
          role: 'system',
          content: `Previous conversation summary: ${summary}`,
          tokens: this.estimateTokens(summary),
          metadata: { isSummary: true },
          hidden: false,
          createdAt: contextMessages[0]?.createdAt || new Date().toISOString()
        }

        contextMessages.unshift(summaryMessage)
        totalTokens += summaryMessage.tokens || 0
        summaryUsed = true
      }
    }

    return {
      messages: contextMessages,
      totalTokens,
      truncated,
      summaryUsed
    }
  }

  /**
   * Prepare context for AI API call
   */
  async prepareAIContext(
    conversationId: string,
    systemPrompt: string
  ): Promise<{
    messages: Array<{ role: string; content: string }>
    contextInfo: {
      totalTokens: number
      truncated: boolean
      messageCount: number
    }
  } | null> {
    try {
      const context = await this.getConversationContext(conversationId, false)
      if (!context) {
        return null
      }

      const contextWindow = this.createContextWindow(context.messages, this.defaultTokenLimits)

      // Format messages for AI API
      const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...contextWindow.messages
          .filter(msg => !msg.hidden && msg.role !== 'system')
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }))
      ]

      return {
        messages: aiMessages,
        contextInfo: {
          totalTokens: contextWindow.totalTokens,
          truncated: contextWindow.truncated,
          messageCount: contextWindow.messages.length
        }
      }
    } catch (error) {
      console.error('Error preparing AI context:', error)
      return null
    }
  }

  /**
   * Update conversation with context summary
   */
  async updateConversationSummary(conversationId: string): Promise<boolean> {
    try {
      const context = await this.getConversationContext(conversationId, false)
      if (!context || context.messages.length < 10) {
        return false // Don't summarize short conversations
      }

      // Create summary of older messages
      const olderMessages = context.messages.slice(0, -5) // Keep last 5 messages unsummarized
      const summary = this.createConversationSummary(olderMessages)

      // Update conversation record
      const { error } = await this.supabaseClient
        .from('conversations')
        .update({ summary })
        .eq('id', conversationId)

      if (error) {
        console.error('Error updating conversation summary:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating conversation summary:', error)
      return false
    }
  }

  /**
   * Get conversation details
   */
  private async getConversationDetails(conversationId: string): Promise<any> {
    const { data, error } = await this.supabaseClient
      .from('conversations')
      .select('*, character:characters(*)')
      .eq('id', conversationId)
      .single()

    if (error) {
      console.error('Error getting conversation details:', error)
      return null
    }

    return data
  }

  /**
   * Get conversation messages
   */
  private async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.supabaseClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('hidden', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error getting conversation messages:', error)
      return []
    }

    return data || []
  }

  /**
   * Generate system prompt with character context
   */
  private async generateSystemPrompt(characterId: string, recentMessages: Message[]): Promise<string> {
    // This would integrate with the CharacterService
    // For now, return a basic prompt
    return `You are an AI assistant having a conversation. Respond naturally and helpfully.

Recent conversation context:
${recentMessages.slice(-3).map(msg => `${msg.role}: ${msg.content.slice(0, 100)}`).join('\n')}`
  }

  /**
   * Estimate tokens for text content
   */
  private estimateTokens(content: string): number {
    // Simple estimation: ~4 characters per token for English text
    return Math.ceil(content.length / 4)
  }

  /**
   * Calculate total tokens for messages
   */
  private calculateTotalTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => {
      return total + (msg.tokens || this.estimateTokens(msg.content))
    }, 0)
  }

  /**
   * Summarize older messages to save context space
   */
  private summarizeOlderMessages(
    messages: Message[],
    availableTokens: number
  ): { summarizedMessages: Message[]; summary: string | null } {
    if (messages.length === 0 || availableTokens < 50) {
      return { summarizedMessages: messages, summary: null }
    }

    // Simple summarization - take key points from user and assistant messages
    const keyMessages = messages
      .filter(msg => msg.role !== 'system')
      .slice(-10) // Last 10 messages to summarize

    if (keyMessages.length === 0) {
      return { summarizedMessages: messages, summary: null }
    }

    const summary = this.createConversationSummary(keyMessages)
    const summaryTokens = this.estimateTokens(summary)

    if (summaryTokens <= availableTokens) {
      return { summarizedMessages: [], summary }
    }

    return { summarizedMessages: messages, summary: null }
  }

  /**
   * Create a summary of conversation messages
   */
  private createConversationSummary(messages: Message[]): string {
    if (messages.length === 0) {
      return ''
    }

    const userMessages = messages.filter(msg => msg.role === 'user')
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')

    const topics = this.extractTopics(userMessages)
    const tone = this.detectConversationTone(messages)

    let summary = `Conversation involved ${userMessages.length} user messages and ${assistantMessages.length} responses.`

    if (topics.length > 0) {
      summary += ` Topics discussed: ${topics.join(', ')}.`
    }

    if (tone) {
      summary += ` Conversation tone: ${tone}.`
    }

    // Add last user message context
    const lastUserMessage = userMessages[userMessages.length - 1]
    if (lastUserMessage) {
      const preview = lastUserMessage.content.slice(0, 100)
      summary += ` Last user topic: "${preview}${lastUserMessage.content.length > 100 ? '...' : ''}"`
    }

    return summary
  }

  /**
   * Extract topics from user messages
   */
  private extractTopics(userMessages: Message[]): string[] {
    const topics: string[] = []
    const topicKeywords = [
      'about', 'tell me', 'what is', 'how do', 'can you', 'explain', 'help with'
    ]

    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase()
      topicKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          // Extract potential topic after keyword
          const index = content.indexOf(keyword)
          const afterKeyword = content.slice(index + keyword.length, index + keyword.length + 20).trim()
          if (afterKeyword) {
            topics.push(afterKeyword.split(' ').slice(0, 3).join(' '))
          }
        }
      })
    })

    return [...new Set(topics)].slice(0, 3) // Unique topics, max 3
  }

  /**
   * Detect overall conversation tone
   */
  private detectConversationTone(messages: Message[]): string {
    const allContent = messages.map(msg => msg.content.toLowerCase()).join(' ')

    if (allContent.includes('thank') || allContent.includes('please') || allContent.includes('appreciate')) {
      return 'polite'
    }
    if (allContent.includes('!') || allContent.includes('wow') || allContent.includes('amazing')) {
      return 'enthusiastic'
    }
    if (allContent.includes('help') || allContent.includes('question') || allContent.includes('how')) {
      return 'inquisitive'
    }

    return 'neutral'
  }
}

/**
 * Factory function to create context manager instance
 */
export function createContextManager(
  supabaseClient: any,
  tokenLimits?: Partial<TokenLimits>
): ContextManager {
  return new ContextManager(supabaseClient, tokenLimits)
}

/**
 * Utility functions for context management
 */
export const ContextUtils = {
  /**
   * Check if conversation needs summarization
   */
  needsSummarization(messageCount: number, totalTokens: number): boolean {
    return messageCount > 20 || totalTokens > 3000
  },

  /**
   * Calculate context efficiency ratio
   */
  calculateEfficiency(contextWindow: ContextWindow, limits: TokenLimits): number {
    return contextWindow.totalTokens / limits.maxContextTokens
  },

  /**
   * Format context info for debugging
   */
  formatContextInfo(context: ConversationContext): string {
    return `Context: ${context.messages.length} messages, ${context.totalTokens} tokens, Character: ${context.characterId}`
  },

  /**
   * Validate message before adding to context
   */
  validateMessage(content: string, limits: TokenLimits): {
    valid: boolean
    reason?: string
  } {
    if (!content || content.trim().length === 0) {
      return { valid: false, reason: 'Empty content' }
    }

    const estimatedTokens = Math.ceil(content.length / 4)
    if (estimatedTokens > limits.maxMessageTokens) {
      return { valid: false, reason: 'Message too long' }
    }

    return { valid: true }
  }
}