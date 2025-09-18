import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ApiClient, TestData, validateSchema } from '../utils/api-client'
import { TEST_CONFIG } from '../config/test-env'

describe('GET /chat/conversations/{id} Contract Test', () => {
  let apiClient

  beforeEach(() => {
    apiClient = new ApiClient()
  })

  afterEach(async () => {
    // Cleanup test data if needed
  })

  describe('Valid Requests', () => {
    it('should retrieve conversation details with messages', async () => {
      const conversationId = 'test-conversation-123'
      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()

      // Validate conversation details
      validateSchema.conversation(response.data.conversation)
      expect(response.data.conversation.id).toBe(conversationId)
      expect(response.data.conversation.userId).toBe(TEST_CONFIG.testUsers.user1.id)

      // Character details should be included
      expect(response.data.conversation.character).toBeDefined()
      validateSchema.character(response.data.conversation.character)

      // Messages should be included
      expect(Array.isArray(response.data.messages)).toBe(true)

      if (response.data.messages.length > 0) {
        response.data.messages.forEach(message => {
          validateSchema.message(message)
          expect(message.conversationId).toBe(conversationId)
          expect(message.hidden).toBe(false) // Hidden messages should not be returned
          expect(['user', 'assistant', 'system']).toContain(message.role)
        })
      }

      // Pagination metadata for messages
      expect(response.data.pagination).toBeDefined()
      expect(response.data.pagination.page).toBeTypeOf('number')
      expect(response.data.pagination.limit).toBeTypeOf('number')
      expect(response.data.pagination.total).toBeTypeOf('number')
      expect(response.data.pagination.hasMore).toBeTypeOf('boolean')
    })

    it('should support message pagination', async () => {
      const conversationId = 'test-conversation-with-many-messages'

      const page1 = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}&page=1&limit=10`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(page1.status).toBe(200)
      expect(page1.data.pagination.page).toBe(1)
      expect(page1.data.pagination.limit).toBe(10)
      expect(page1.data.messages.length).toBeLessThanOrEqual(10)

      if (page1.data.pagination.hasMore) {
        const page2 = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}&page=2&limit=10`, {
          userId: TEST_CONFIG.testUsers.user1.id
        })

        expect(page2.status).toBe(200)
        expect(page2.data.pagination.page).toBe(2)

        // Messages should be different between pages
        const page1MessageIds = page1.data.messages.map(m => m.id)
        const page2MessageIds = page2.data.messages.map(m => m.id)
        const overlap = page1MessageIds.filter(id => page2MessageIds.includes(id))
        expect(overlap.length).toBe(0)
      }
    })

    it('should sort messages by creation date (newest first)', async () => {
      const conversationId = 'test-conversation-123'
      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)

      if (response.data.messages.length > 1) {
        for (let i = 1; i < response.data.messages.length; i++) {
          const current = new Date(response.data.messages[i].createdAt)
          const previous = new Date(response.data.messages[i - 1].createdAt)
          expect(current.getTime()).toBeLessThanOrEqual(previous.getTime())
        }
      }
    })

    it('should exclude hidden messages from results', async () => {
      const conversationId = 'test-conversation-with-hidden-messages'
      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)

      // All returned messages should not be hidden
      response.data.messages.forEach(message => {
        expect(message.hidden).toBe(false)
      })
    })

    it('should include message metadata', async () => {
      const conversationId = 'test-conversation-123'
      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)

      if (response.data.messages.length > 0) {
        const assistantMessages = response.data.messages.filter(m => m.role === 'assistant')

        assistantMessages.forEach(message => {
          if (message.metadata) {
            expect(message.metadata.model).toBeDefined()
            expect(message.metadata.processingTime).toBeTypeOf('number')
          }
        })
      }
    })
  })

  describe('Request Validation', () => {
    it('should return 404 for non-existent conversation', async () => {
      const response = await apiClient.get('/chat-conversation-detail?conversationId=non-existent-id', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(404)
      expect(response.error).toContain('Conversation not found')
    })

    it('should validate conversation ID format', async () => {
      const response = await apiClient.get('/chat-conversation-detail?conversationId=', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid conversation ID')
    })

    it('should validate pagination parameters', async () => {
      const conversationId = 'test-conversation-123'

      // Invalid page number
      const response1 = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}&page=0`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response1.status).toBe(400)
      expect(response1.error).toContain('Page must be greater than 0')

      // Invalid limit
      const response2 = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}&limit=101`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response2.status).toBe(400)
      expect(response2.error).toContain('Limit must be between 1 and 100')
    })

    it('should handle malformed query parameters', async () => {
      const response = await apiClient.get('/chat-conversation-detail?conversationId=test&page=not-a-number', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid query parameters')
    })
  })

  describe('Authentication & Authorization', () => {
    it('should require authentication', async () => {
      const response = await apiClient.get('/chat-conversation-detail?conversationId=test-conversation-123')

      expect(response.status).toBe(401)
      expect(response.error).toContain('Authentication required')
    })

    it('should prevent access to other users conversations', async () => {
      const conversationId = 'user1-private-conversation'

      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user2.id // Different user trying to access
      })

      expect(response.status).toBe(403)
      expect(response.error).toContain('Access denied')
    })

    it('should allow access to own conversations', async () => {
      const conversationId = 'user1-conversation-123'

      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      // Should either succeed or return 404 if conversation doesn't exist, but not 403
      expect([200, 404]).toContain(response.status)
      if (response.status !== 200) {
        expect(response.error).not.toContain('Access denied')
      }
    })
  })

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const conversationId = 'test-conversation-123'
      const startTime = Date.now()

      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      const responseTime = Date.now() - startTime

      expect([200, 404]).toContain(response.status)
      expect(responseTime).toBeLessThan(5000) // Should respond within 5 seconds
    })

    it('should handle large message history efficiently', async () => {
      const conversationId = 'conversation-with-many-messages'

      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}&limit=50`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect([200, 404]).toContain(response.status)

      if (response.status === 200) {
        expect(response.data.messages.length).toBeLessThanOrEqual(50)
      }
    })
  })

  describe('Data Integrity', () => {
    it('should return consistent conversation metadata', async () => {
      const conversationId = 'test-conversation-123'

      const response = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      if (response.status === 200) {
        const conversation = response.data.conversation
        const messages = response.data.messages

        // Message count should be consistent
        expect(conversation.messageCount).toBeGreaterThanOrEqual(messages.length)

        // Character should be valid
        expect(conversation.character.id).toBe(conversation.characterId)
        expect(conversation.character.active).toBe(true)
      }
    })

    it('should maintain message order consistency', async () => {
      const conversationId = 'test-conversation-123'

      const response1 = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}&page=1&limit=5`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      const response2 = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}&page=1&limit=5`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      if (response1.status === 200 && response2.status === 200) {
        // Same request should return same order
        expect(response1.data.messages.map(m => m.id)).toEqual(response2.data.messages.map(m => m.id))
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle database connectivity issues', async () => {
      const response = await apiClient.get('/chat-conversation-detail?conversationId=test&simulate_db_error=true', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(503)
      expect(response.error).toContain('Service temporarily unavailable')
    })

    it('should handle conversation data corruption gracefully', async () => {
      const response = await apiClient.get('/chat-conversation-detail?conversationId=corrupted-conversation', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect([404, 500]).toContain(response.status)
      expect(response.error).toBeDefined()
    })

    it('should provide helpful error messages', async () => {
      const invalidRequests = [
        { url: '/chat-conversation-detail', expectedError: 'Conversation ID required' },
        { url: '/chat-conversation-detail?conversationId=', expectedError: 'Invalid conversation ID' },
        { url: '/chat-conversation-detail?conversationId=123&page=-1', expectedError: 'Page must be greater than 0' }
      ]

      for (const { url, expectedError } of invalidRequests) {
        const response = await apiClient.get(url, {
          userId: TEST_CONFIG.testUsers.user1.id
        })

        expect(response.status).toBe(400)
        expect(response.error).toContain(expectedError)
      }
    })
  })
})