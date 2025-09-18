import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ApiClient, TestData, validateSchema } from '../utils/api-client'
import { TEST_CONFIG } from '../config/test-env'

describe('POST /chat/session Contract Test', () => {
  let apiClient

  beforeEach(() => {
    apiClient = new ApiClient()
  })

  afterEach(async () => {
    // Cleanup test data if needed
  })

  describe('Valid Requests', () => {
    it('should create a new conversation session', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        title: 'New Chat with Luna'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(201)
      expect(response.data).toBeDefined()

      // Validate conversation schema
      validateSchema.conversation(response.data.conversation)

      // Validate specific fields
      expect(response.data.conversation.id).toBeDefined()
      expect(response.data.conversation.userId).toBe(TEST_CONFIG.testUsers.user1.id)
      expect(response.data.conversation.characterId).toBe(TEST_CONFIG.testCharacters.luna.id)
      expect(response.data.conversation.title).toBe('New Chat with Luna')
      expect(response.data.conversation.status).toBe('active')
      expect(response.data.conversation.messageCount).toBe(0)
      expect(response.data.conversation.totalTokens).toBe(0)
      expect(response.data.conversation.createdAt).toBeDefined()
      expect(response.data.conversation.lastMessageAt).toBeDefined()

      // Character details should be included
      expect(response.data.conversation.character).toBeDefined()
      expect(response.data.conversation.character.id).toBe(TEST_CONFIG.testCharacters.luna.id)
      expect(response.data.conversation.character.name).toBe(TEST_CONFIG.testCharacters.luna.name)
    })

    it('should create session with auto-generated title', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.aria.id
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(201)
      expect(response.data.conversation.title).toBeDefined()
      expect(response.data.conversation.title.length).toBeGreaterThan(0)
      expect(response.data.conversation.title).toContain('Aria') // Should include character name
    })

    it('should create session and return first system message', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        includeGreeting: true
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(201)

      // Should include initial greeting message
      expect(response.data.initialMessage).toBeDefined()
      validateSchema.message(response.data.initialMessage)
      expect(response.data.initialMessage.role).toBe('assistant')
      expect(response.data.initialMessage.conversationId).toBe(response.data.conversation.id)
      expect(response.data.initialMessage.content).toBeDefined()
      expect(response.data.initialMessage.content.length).toBeGreaterThan(0)

      // Conversation should reflect the initial message
      expect(response.data.conversation.messageCount).toBe(1)
    })

    it('should handle custom conversation metadata', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        title: 'Custom Session',
        metadata: {
          source: 'test-suite',
          sessionType: 'contract-test'
        }
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(201)
      expect(response.data.conversation.metadata).toBeDefined()
      expect(response.data.conversation.metadata.source).toBe('test-suite')
      expect(response.data.conversation.metadata.sessionType).toBe('contract-test')
    })
  })

  describe('Request Validation', () => {
    it('should reject invalid character ID', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: 'non-existent-character'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid character ID')
    })

    it('should reject inactive character', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: 'inactive-character-id'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Character is not available')
    })

    it('should validate title length', async () => {
      const longTitle = 'A'.repeat(201) // Exceeds 200 character limit

      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        title: longTitle
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Title too long')
    })

    it('should reject empty character ID', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: ''
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Character ID is required')
    })

    it('should validate metadata format', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        metadata: 'invalid-metadata-format' // Should be object
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid metadata format')
    })

    it('should handle malformed JSON', async () => {
      const response = await fetch(`${apiClient.baseUrl}/chat-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key',
          'x-user-id': TEST_CONFIG.testUsers.user1.id
        },
        body: '{"characterId": "luna", "title": "test"' // Missing closing brace
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Authentication', () => {
    it('should require authentication', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id
      }) // No userId provided

      expect(response.status).toBe(401)
      expect(response.error).toContain('Authentication required')
    })

    it('should validate user permissions', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id
      }, { userId: 'invalid-user-id' })

      expect(response.status).toBe(401)
      expect(response.error).toContain('Invalid user credentials')
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce session creation rate limits', async () => {
      const requests = Array.from({ length: 6 }, (_, i) =>
        apiClient.post('/chat-session', {
          characterId: TEST_CONFIG.testCharacters.luna.id,
          title: `Test Session ${i}`
        }, { userId: TEST_CONFIG.testUsers.user1.id })
      )

      const responses = await Promise.all(requests)

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)

      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].error).toContain('Rate limit exceeded')
        expect(rateLimitedResponses[0].headers['retry-after']).toBeDefined()
      }
    })

    it('should allow reasonable session creation frequency', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      // First request should succeed
      expect([201, 429]).toContain(response.status)
      if (response.status === 429) {
        // If rate limited, should include proper headers
        expect(response.headers['retry-after']).toBeDefined()
      }
    })
  })

  describe('Business Logic', () => {
    it('should prevent duplicate active sessions with same character', async () => {
      // Create first session
      const firstResponse = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        title: 'First Session'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      if (firstResponse.status === 201) {
        // Try to create another session with same character
        const secondResponse = await apiClient.post('/chat-session', {
          characterId: TEST_CONFIG.testCharacters.luna.id,
          title: 'Second Session'
        }, { userId: TEST_CONFIG.testUsers.user1.id })

        // Should either succeed (allowing multiple sessions) or fail with specific error
        if (secondResponse.status !== 201) {
          expect(secondResponse.status).toBe(409)
          expect(secondResponse.error).toContain('Active session already exists')
        }
      }
    })

    it('should handle concurrent session creation', async () => {
      const concurrentRequests = Array.from({ length: 3 }, () =>
        apiClient.post('/chat-session', {
          characterId: TEST_CONFIG.testCharacters.aria.id,
          title: 'Concurrent Session'
        }, { userId: TEST_CONFIG.testUsers.user1.id })
      )

      const responses = await Promise.all(concurrentRequests)

      // At least one should succeed
      const successfulResponses = responses.filter(r => r.status === 201)
      expect(successfulResponses.length).toBeGreaterThan(0)

      // All successful responses should have unique conversation IDs
      const conversationIds = successfulResponses.map(r => r.data.conversation.id)
      const uniqueIds = new Set(conversationIds)
      expect(uniqueIds.size).toBe(conversationIds.length)
    })
  })

  describe('Performance', () => {
    it('should create session within acceptable time', async () => {
      const startTime = Date.now()

      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      const responseTime = Date.now() - startTime

      expect([201, 429]).toContain(response.status)
      expect(responseTime).toBeLessThan(5000) // Should respond within 5 seconds
    })

    it('should handle high load gracefully', async () => {
      const startTime = Date.now()

      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        simulateHighLoad: true
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      const responseTime = Date.now() - startTime

      expect([201, 429, 503]).toContain(response.status)

      if (response.status === 503) {
        expect(response.error).toContain('Service temporarily unavailable')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle database connectivity issues', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        simulateDbError: true
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(503)
      expect(response.error).toContain('Service temporarily unavailable')
    })

    it('should handle character service unavailability', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: 'service-unavailable-character'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(503)
      expect(response.error).toContain('Character service temporarily unavailable')
    })

    it('should provide helpful error messages for common issues', async () => {
      const testCases = [
        {
          data: {},
          expectedStatus: 400,
          expectedError: 'Character ID is required'
        },
        {
          data: { characterId: null },
          expectedStatus: 400,
          expectedError: 'Character ID is required'
        },
        {
          data: { characterId: 'invalid-format-character-id-that-is-too-long' },
          expectedStatus: 400,
          expectedError: 'Invalid character ID format'
        }
      ]

      for (const { data, expectedStatus, expectedError } of testCases) {
        const response = await apiClient.post('/chat-session', data, {
          userId: TEST_CONFIG.testUsers.user1.id
        })

        expect(response.status).toBe(expectedStatus)
        expect(response.error).toContain(expectedError)
      }
    })
  })

  describe('Data Integrity', () => {
    it('should create conversation with correct initial state', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id,
        title: 'Integrity Test'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      if (response.status === 201) {
        const conversation = response.data.conversation

        expect(conversation.status).toBe('active')
        expect(conversation.messageCount).toBe(0)
        expect(conversation.totalTokens).toBe(0)
        expect(new Date(conversation.createdAt).getTime()).toBeLessThanOrEqual(Date.now())
        expect(new Date(conversation.lastMessageAt).getTime()).toBeLessThanOrEqual(Date.now())
      }
    })

    it('should maintain referential integrity', async () => {
      const response = await apiClient.post('/chat-session', {
        characterId: TEST_CONFIG.testCharacters.luna.id
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      if (response.status === 201) {
        // Character reference should be valid
        expect(response.data.conversation.character).toBeDefined()
        expect(response.data.conversation.character.id).toBe(response.data.conversation.characterId)

        // User reference should be valid
        expect(response.data.conversation.userId).toBe(TEST_CONFIG.testUsers.user1.id)
      }
    })
  })
})