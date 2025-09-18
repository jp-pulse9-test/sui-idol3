import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ApiClient, TestData, validateSchema } from '../utils/api-client'
import { TEST_CONFIG } from '../config/test-env'

describe('POST /chat/send Contract Test', () => {
  let apiClient

  beforeEach(() => {
    apiClient = new ApiClient()
  })

  afterEach(async () => {
    // Cleanup test data if needed
  })

  describe('Valid Requests', () => {
    it('should send message and return AI response', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'Hello! How are you today?',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()

      // Validate response schema
      validateSchema.message(response.data)

      // Specific validations for AI response
      expect(response.data.role).toBe('assistant')
      expect(response.data.content).toBeDefined()
      expect(response.data.content.length).toBeGreaterThan(0)
      expect(response.data.conversationId).toBe('test-conversation-123')
      expect(response.data.tokens).toBeTypeOf('number')
      expect(response.data.createdAt).toBeDefined()
    })

    it('should handle system messages', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'System initialization message',
        role: 'system'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(200)
      expect(response.data.role).toBe('system')
    })

    it('should include metadata in response', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'Test message for metadata',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(200)
      expect(response.data.metadata).toBeDefined()
      expect(response.data.metadata.model).toBeDefined()
      expect(response.data.metadata.processingTime).toBeTypeOf('number')
    })
  })

  describe('Validation', () => {
    it('should reject empty messages', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: '',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Content cannot be empty')
    })

    it('should reject messages that are too long', async () => {
      const longMessage = 'A'.repeat(1001) // Exceeds 1000 character limit

      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: longMessage,
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Content too long')
    })

    it('should reject invalid role values', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'Test message',
        role: 'invalid-role'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid role')
    })

    it('should require valid conversation ID', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'invalid-conversation-id',
        content: 'Test message',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(404)
      expect(response.error).toContain('Conversation not found')
    })

    it('should reject malformed JSON', async () => {
      // This simulates sending malformed JSON
      const response = await fetch(`${apiClient.baseUrl}/chat-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer test-key`,
          'x-user-id': TEST_CONFIG.testUsers.user1.id
        },
        body: '{"conversationId": "test", "content": "test", "role": "user"' // Missing closing brace
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Authentication', () => {
    it('should require authentication', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'Test message',
        role: 'user'
      }) // No userId provided

      expect(response.status).toBe(401)
      expect(response.error).toContain('Authentication required')
    })

    it('should prevent access to other users conversations', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'other-user-conversation-123',
        content: 'Test message',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user2.id })

      expect(response.status).toBe(403)
      expect(response.error).toContain('Access denied')
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limiting', async () => {
      // Send multiple requests rapidly to trigger rate limit
      const requests = Array.from({ length: 12 }, (_, i) =>
        apiClient.post('/chat-send', {
          conversationId: 'test-conversation-123',
          content: `Test message ${i}`,
          role: 'user'
        }, { userId: TEST_CONFIG.testUsers.user1.id })
      )

      const responses = await Promise.all(requests)

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)

      // Rate limited response should have proper error
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].error).toContain('Rate limit exceeded')
      }
    })
  })

  describe('Content Moderation', () => {
    it('should flag inappropriate content', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'This is inappropriate content that should be flagged',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(200)
      expect(response.data.hidden).toBe(true)
      expect(response.data.moderated).toBe(true)
    })

    it('should block severely inappropriate content', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'Extremely harmful content that should be blocked',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(403)
      expect(response.error).toContain('Content blocked by moderation')
    })
  })

  describe('Error Handling', () => {
    it('should handle AI service unavailability', async () => {
      // This test assumes we can simulate AI service failure
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-123',
        content: 'SIMULATE_AI_SERVICE_ERROR',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(503)
      expect(response.error).toContain('AI service temporarily unavailable')
    })

    it('should handle conversation context overflow', async () => {
      const response = await apiClient.post('/chat-send', {
        conversationId: 'test-conversation-with-max-tokens',
        content: 'This message would exceed token limits',
        role: 'user'
      }, { userId: TEST_CONFIG.testUsers.user1.id })

      expect(response.status).toBe(413)
      expect(response.error).toContain('Conversation context too large')
    })
  })
})