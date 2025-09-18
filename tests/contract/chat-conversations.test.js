import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ApiClient, TestData, validateSchema } from '../utils/api-client'
import { TEST_CONFIG } from '../config/test-env'

describe('GET /chat/conversations Contract Test', () => {
  let apiClient

  beforeEach(() => {
    apiClient = new ApiClient()
  })

  afterEach(async () => {
    // Cleanup test data if needed
  })

  describe('Valid Requests', () => {
    it('should retrieve user conversations', async () => {
      const response = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data.conversations)).toBe(true)

      // Validate response schema
      if (response.data.conversations.length > 0) {
        response.data.conversations.forEach(conversation => {
          validateSchema.conversation(conversation)

          // Validate conversation fields
          expect(conversation.id).toBeDefined()
          expect(conversation.userId).toBe(TEST_CONFIG.testUsers.user1.id)
          expect(conversation.characterId).toBeDefined()
          expect(conversation.status).toMatch(/^(active|archived|ended)$/)
          expect(conversation.messageCount).toBeTypeOf('number')
          expect(conversation.totalTokens).toBeTypeOf('number')
          expect(conversation.createdAt).toBeDefined()
          expect(conversation.lastMessageAt).toBeDefined()

          // Character info should be included
          expect(conversation.character).toBeDefined()
          expect(conversation.character.name).toBeDefined()
          expect(conversation.character.avatarUrl).toBeDefined()
        })
      }

      // Validate pagination metadata
      expect(response.data.pagination).toBeDefined()
      expect(response.data.pagination.page).toBeTypeOf('number')
      expect(response.data.pagination.limit).toBeTypeOf('number')
      expect(response.data.pagination.total).toBeTypeOf('number')
      expect(response.data.pagination.hasMore).toBeTypeOf('boolean')
    })

    it('should support pagination', async () => {
      const page1 = await apiClient.get('/chat-conversations?page=1&limit=5', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(page1.status).toBe(200)
      expect(page1.data.pagination.page).toBe(1)
      expect(page1.data.pagination.limit).toBe(5)
      expect(page1.data.conversations.length).toBeLessThanOrEqual(5)

      const page2 = await apiClient.get('/chat-conversations?page=2&limit=5', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(page2.status).toBe(200)
      expect(page2.data.pagination.page).toBe(2)
    })

    it('should filter by character', async () => {
      const response = await apiClient.get(`/chat-conversations?characterId=${TEST_CONFIG.testCharacters.luna.id}`, {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)

      // All conversations should be with the specified character
      response.data.conversations.forEach(conversation => {
        expect(conversation.characterId).toBe(TEST_CONFIG.testCharacters.luna.id)
      })
    })

    it('should filter by status', async () => {
      const response = await apiClient.get('/chat-conversations?status=active', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)

      // All conversations should have active status
      response.data.conversations.forEach(conversation => {
        expect(conversation.status).toBe('active')
      })
    })

    it('should sort by last message date (newest first)', async () => {
      const response = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)

      if (response.data.conversations.length > 1) {
        for (let i = 1; i < response.data.conversations.length; i++) {
          const current = new Date(response.data.conversations[i].lastMessageAt)
          const previous = new Date(response.data.conversations[i - 1].lastMessageAt)
          expect(current.getTime()).toBeLessThanOrEqual(previous.getTime())
        }
      }
    })

    it('should return empty array for user with no conversations', async () => {
      const response = await apiClient.get('/chat-conversations', {
        userId: 'user-with-no-conversations'
      })

      expect(response.status).toBe(200)
      expect(response.data.conversations).toEqual([])
      expect(response.data.pagination.total).toBe(0)
    })
  })

  describe('Query Parameters Validation', () => {
    it('should validate page parameter', async () => {
      const response = await apiClient.get('/chat-conversations?page=0', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Page must be greater than 0')
    })

    it('should validate limit parameter', async () => {
      const response = await apiClient.get('/chat-conversations?limit=101', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Limit must be between 1 and 100')
    })

    it('should validate status parameter', async () => {
      const response = await apiClient.get('/chat-conversations?status=invalid-status', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid status value')
    })

    it('should validate character ID format', async () => {
      const response = await apiClient.get('/chat-conversations?characterId=invalid-format', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid character ID format')
    })
  })

  describe('Authentication', () => {
    it('should require authentication', async () => {
      const response = await apiClient.get('/chat-conversations')

      expect(response.status).toBe(401)
      expect(response.error).toContain('Authentication required')
    })

    it('should only return conversations for authenticated user', async () => {
      const user1Response = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      const user2Response = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user2.id
      })

      expect(user1Response.status).toBe(200)
      expect(user2Response.status).toBe(200)

      // Conversations should be different for different users
      if (user1Response.data.conversations.length > 0 && user2Response.data.conversations.length > 0) {
        const user1ConversationIds = user1Response.data.conversations.map(c => c.id)
        const user2ConversationIds = user2Response.data.conversations.map(c => c.id)

        // Should have no overlapping conversation IDs
        const overlap = user1ConversationIds.filter(id => user2ConversationIds.includes(id))
        expect(overlap.length).toBe(0)
      }
    })
  })

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const startTime = Date.now()

      const response = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      const responseTime = Date.now() - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(3000) // Should respond within 3 seconds
    })

    it('should handle large result sets efficiently', async () => {
      const response = await apiClient.get('/chat-conversations?limit=100', {
        userId: 'user-with-many-conversations'
      })

      expect(response.status).toBe(200)
      expect(response.data.conversations.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Data Consistency', () => {
    it('should return consistent data across multiple requests', async () => {
      const response1 = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      const response2 = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)

      // Data should be consistent (assuming no changes between requests)
      expect(response1.data.pagination.total).toBe(response2.data.pagination.total)
    })

    it('should include accurate message counts', async () => {
      const response = await apiClient.get('/chat-conversations', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(200)

      response.data.conversations.forEach(conversation => {
        expect(conversation.messageCount).toBeGreaterThanOrEqual(0)
        expect(conversation.totalTokens).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database connectivity issues', async () => {
      // This test assumes we can simulate database failure
      const response = await apiClient.get('/chat-conversations?simulate_db_error=true', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(503)
      expect(response.error).toContain('Service temporarily unavailable')
    })

    it('should handle malformed query parameters gracefully', async () => {
      const response = await apiClient.get('/chat-conversations?page=not-a-number&limit=also-not-a-number', {
        userId: TEST_CONFIG.testUsers.user1.id
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid query parameters')
    })
  })
})