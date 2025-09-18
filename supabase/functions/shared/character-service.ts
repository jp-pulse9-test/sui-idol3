/**
 * Character Service for AI Idol Personality Management
 * Handles character data, personality traits, and conversation context
 */

export interface Character {
  id: string
  name: string
  personality: string
  speakingStyle: string
  background: string
  traits: string[]
  avatarUrl?: string
  active: boolean
  createdAt: string
}

export interface CharacterContext {
  character: Character
  conversationHistory: string[]
  currentMood: string
  responseStyle: {
    temperature: number
    maxTokens: number
    tone: string
  }
}

/**
 * Service for managing AI character data and personality
 */
export class CharacterService {
  private supabaseClient: any

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient
  }

  /**
   * Get character by ID with full personality data
   */
  async getCharacterById(characterId: string): Promise<Character | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .eq('active', true)
        .single()

      if (error) {
        console.error('Error fetching character:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Character service error:', error)
      return null
    }
  }

  /**
   * Get all active characters
   */
  async getAllActiveCharacters(): Promise<Character[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('characters')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Error fetching characters:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Character service error:', error)
      return []
    }
  }

  /**
   * Build character context for AI conversation
   */
  buildCharacterContext(character: Character, conversationHistory: any[] = []): CharacterContext {
    // Extract recent conversation context (last 10 messages)
    const recentHistory = conversationHistory
      .slice(-10)
      .map(msg => `${msg.role}: ${msg.content}`)

    // Determine current mood based on conversation
    const currentMood = this.determineMoodFromHistory(character, conversationHistory)

    // Set response style based on character traits
    const responseStyle = this.getResponseStyle(character)

    return {
      character,
      conversationHistory: recentHistory,
      currentMood,
      responseStyle
    }
  }

  /**
   * Generate system prompt for AI based on character context
   */
  generateSystemPrompt(context: CharacterContext): string {
    const { character, currentMood, conversationHistory } = context

    let systemPrompt = `You are ${character.name}, an AI idol with the following personality:

PERSONALITY: ${character.personality}

SPEAKING STYLE: ${character.speakingStyle}

BACKGROUND: ${character.background}

TRAITS: ${character.traits.join(', ')}

CURRENT MOOD: ${currentMood}

INSTRUCTIONS:
- Always respond as ${character.name} in character
- Use your unique speaking style consistently
- Reference your background and experiences when relevant
- Maintain the personality traits throughout the conversation
- Be engaging and authentic to your character
- Keep responses conversational and idol-like
- Remember previous parts of this conversation`

    if (conversationHistory.length > 0) {
      systemPrompt += `\n\nCONVERSATION CONTEXT:\n${conversationHistory.slice(-5).join('\n')}`
    }

    return systemPrompt
  }

  /**
   * Validate character availability for conversation
   */
  async validateCharacterAvailability(characterId: string): Promise<{
    isAvailable: boolean
    reason?: string
  }> {
    const character = await this.getCharacterById(characterId)

    if (!character) {
      return {
        isAvailable: false,
        reason: 'Character not found or inactive'
      }
    }

    if (!character.active) {
      return {
        isAvailable: false,
        reason: 'Character is currently unavailable'
      }
    }

    return { isAvailable: true }
  }

  /**
   * Get character statistics for display
   */
  async getCharacterStats(characterId: string): Promise<{
    totalConversations: number
    totalMessages: number
    averageRating: number
  } | null> {
    try {
      // Get conversation count
      const { count: conversationCount } = await this.supabaseClient
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('character_id', characterId)

      // Get message count
      const { count: messageCount } = await this.supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'assistant')
        .in('conversation_id',
          this.supabaseClient
            .from('conversations')
            .select('id')
            .eq('character_id', characterId)
        )

      return {
        totalConversations: conversationCount || 0,
        totalMessages: messageCount || 0,
        averageRating: 4.5 // Placeholder - would be calculated from ratings table
      }
    } catch (error) {
      console.error('Error getting character stats:', error)
      return null
    }
  }

  /**
   * Search characters by name or traits
   */
  async searchCharacters(query: string, filters?: {
    traits?: string[]
    active?: boolean
  }): Promise<Character[]> {
    try {
      let queryBuilder = this.supabaseClient
        .from('characters')
        .select('*')

      // Text search on name and personality
      if (query) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,personality.ilike.%${query}%`
        )
      }

      // Filter by active status
      if (filters?.active !== undefined) {
        queryBuilder = queryBuilder.eq('active', filters.active)
      }

      // Filter by traits
      if (filters?.traits && filters.traits.length > 0) {
        queryBuilder = queryBuilder.contains('traits', filters.traits)
      }

      const { data, error } = await queryBuilder.order('name')

      if (error) {
        console.error('Error searching characters:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Character search error:', error)
      return []
    }
  }

  /**
   * Private method to determine mood from conversation history
   */
  private determineMoodFromHistory(character: Character, history: any[]): string {
    if (history.length === 0) {
      return 'welcoming'
    }

    const recentMessages = history.slice(-5)
    const userMessages = recentMessages.filter(msg => msg.role === 'user')

    // Simple mood detection based on conversation patterns
    if (userMessages.length === 0) {
      return 'neutral'
    }

    // Check for emotional keywords in recent user messages
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || ''
    const lowerContent = lastUserMessage.toLowerCase()

    if (lowerContent.includes('sad') || lowerContent.includes('upset')) {
      return 'supportive'
    }
    if (lowerContent.includes('happy') || lowerContent.includes('excited')) {
      return 'enthusiastic'
    }
    if (lowerContent.includes('tired') || lowerContent.includes('stress')) {
      return 'caring'
    }

    // Default mood based on character traits
    if (character.traits.includes('cheerful')) {
      return 'upbeat'
    }
    if (character.traits.includes('mysterious')) {
      return 'enigmatic'
    }
    if (character.traits.includes('gentle')) {
      return 'warm'
    }

    return 'friendly'
  }

  /**
   * Private method to get response style based on character
   */
  private getResponseStyle(character: Character): CharacterContext['responseStyle'] {
    let temperature = 0.7
    let maxTokens = 150
    let tone = 'conversational'

    // Adjust based on character traits
    if (character.traits.includes('energetic')) {
      temperature = 0.8
      tone = 'enthusiastic'
    }
    if (character.traits.includes('mysterious')) {
      temperature = 0.6
      tone = 'thoughtful'
    }
    if (character.traits.includes('shy')) {
      temperature = 0.5
      maxTokens = 100
      tone = 'gentle'
    }
    if (character.traits.includes('confident')) {
      temperature = 0.9
      tone = 'bold'
    }

    return { temperature, maxTokens, tone }
  }
}

/**
 * Factory function to create character service instance
 */
export function createCharacterService(supabaseClient: any): CharacterService {
  return new CharacterService(supabaseClient)
}

/**
 * Utility functions for character management
 */
export const CharacterUtils = {
  /**
   * Validate character ID format
   */
  isValidCharacterId(id: string): boolean {
    return /^[a-z0-9_]+$/.test(id) && id.length > 0 && id.length <= 50
  },

  /**
   * Format character for public API response
   */
  formatCharacterForAPI(character: Character): Omit<Character, 'createdAt'> & {
    stats?: {
      totalConversations: number
      totalMessages: number
      averageRating: number
    }
  } {
    const { createdAt, ...publicCharacter } = character
    return publicCharacter
  },

  /**
   * Get character traits as formatted list
   */
  formatTraits(traits: string[]): string {
    if (traits.length === 0) return ''
    if (traits.length === 1) return traits[0]
    if (traits.length === 2) return `${traits[0]} and ${traits[1]}`

    const lastTrait = traits[traits.length - 1]
    const otherTraits = traits.slice(0, -1).join(', ')
    return `${otherTraits}, and ${lastTrait}`
  }
}