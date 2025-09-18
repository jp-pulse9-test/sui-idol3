import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ApiClient, TestData, validateSchema } from '../utils/api-client'
import { TEST_CONFIG, cleanup } from '../config/test-env'

describe('Full Conversation Flow Integration Test', () => {
  let apiClient
  let testUserId
  let conversationId
  let characterId

  beforeEach(() => {
    apiClient = new ApiClient()
    testUserId = TEST_CONFIG.testUsers.user1.id
    characterId = TEST_CONFIG.testCharacters.luna.id
  })

  afterEach(async () => {
    if (conversationId) {
      await cleanup.cleanupTestData(testUserId)
    }
  })

  describe('Complete Conversation Lifecycle', () => {
    it('should complete full conversation flow from creation to archiving', async () => {
      // Step 1: Create new conversation session
      const sessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'Integration Test Conversation',
        includeGreeting: true
      }, { userId: testUserId })

      expect(sessionResponse.status).toBe(201)
      validateSchema.conversation(sessionResponse.data.conversation)
      conversationId = sessionResponse.data.conversation.id

      // Should include initial greeting
      expect(sessionResponse.data.initialMessage).toBeDefined()
      expect(sessionResponse.data.initialMessage.role).toBe('assistant')

      // Step 2: Send user message
      const userMessage = 'Hello! I\'m excited to chat with you!'
      const sendResponse = await apiClient.post('/chat-send', {
        conversationId: conversationId,
        content: userMessage,
        role: 'user'
      }, { userId: testUserId })

      expect(sendResponse.status).toBe(200)
      validateSchema.message(sendResponse.data)
      expect(sendResponse.data.role).toBe('assistant')
      expect(sendResponse.data.content.length).toBeGreaterThan(0)

      // Step 3: Verify conversation appears in user's list
      const conversationsResponse = await apiClient.get('/chat-conversations', {
        userId: testUserId
      })

      expect(conversationsResponse.status).toBe(200)
      const foundConversation = conversationsResponse.data.conversations.find(
        c => c.id === conversationId
      )
      expect(foundConversation).toBeDefined()
      expect(foundConversation.messageCount).toBeGreaterThanOrEqual(2) // Greeting + user message + AI response

      // Step 4: Get conversation details with message history
      const detailResponse = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: testUserId
      })

      expect(detailResponse.status).toBe(200)
      expect(detailResponse.data.conversation.id).toBe(conversationId)
      expect(detailResponse.data.messages.length).toBeGreaterThanOrEqual(2)

      // Messages should be in correct order (newest first)
      const messages = detailResponse.data.messages
      for (let i = 1; i < messages.length; i++) {
        const current = new Date(messages[i].createdAt)
        const previous = new Date(messages[i - 1].createdAt)
        expect(current.getTime()).toBeLessThanOrEqual(previous.getTime())
      }

      // Step 5: Continue conversation with multiple exchanges
      for (let i = 0; i < 3; i++) {
        const followupMessage = `This is follow-up message ${i + 1}. How are you handling our conversation?`

        const followupResponse = await apiClient.post('/chat-send', {
          conversationId: conversationId,
          content: followupMessage,
          role: 'user'
        }, { userId: testUserId })

        expect(followupResponse.status).toBe(200)
        expect(followupResponse.data.role).toBe('assistant')
        expect(followupResponse.data.conversationId).toBe(conversationId)
      }

      // Step 6: Verify final conversation state
      const finalDetailResponse = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: testUserId
      })

      expect(finalDetailResponse.status).toBe(200)
      expect(finalDetailResponse.data.conversation.messageCount).toBeGreaterThanOrEqual(8) // Multiple exchanges
      expect(finalDetailResponse.data.conversation.totalTokens).toBeGreaterThan(0)
      expect(finalDetailResponse.data.conversation.status).toBe('active')
    })

    it('should handle conversation context and character consistency', async () => {
      // Create conversation
      const sessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'Character Consistency Test'
      }, { userId: testUserId })

      expect(sessionResponse.status).toBe(201)
      conversationId = sessionResponse.data.conversation.id

      // Send messages that should maintain character consistency
      const contextMessages = [
        'What is your name?',
        'What did you just tell me your name was?',
        'Can you remember what we talked about?'
      ]

      const responses = []
      for (const message of contextMessages) {
        const response = await apiClient.post('/chat-send', {
          conversationId: conversationId,
          content: message,
          role: 'user'
        }, { userId: testUserId })

        expect(response.status).toBe(200)
        responses.push(response.data)
      }

      // Character should maintain consistency
      const characterName = TEST_CONFIG.testCharacters.luna.name
      expect(responses[0].content.toLowerCase()).toContain(characterName.toLowerCase())

      // Should reference previous context
      expect(responses[1].content.toLowerCase()).toContain(characterName.toLowerCase())
      expect(responses[2].content).toBeDefined()
    })

    it('should handle error recovery in conversation flow', async () => {
      // Create conversation
      const sessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'Error Recovery Test'
      }, { userId: testUserId })

      expect(sessionResponse.status).toBe(201)
      conversationId = sessionResponse.data.conversation.id

      // Send normal message
      const normalResponse = await apiClient.post('/chat-send', {
        conversationId: conversationId,
        content: 'This is a normal message',
        role: 'user'
      }, { userId: testUserId })

      expect(normalResponse.status).toBe(200)

      // Try to send problematic message
      const problematicResponse = await apiClient.post('/chat-send', {
        conversationId: conversationId,
        content: 'SIMULATE_AI_SERVICE_ERROR',
        role: 'user'
      }, { userId: testUserId })

      // Should handle error gracefully
      expect([503, 500]).toContain(problematicResponse.status)

      // Should still be able to continue conversation
      const recoveryResponse = await apiClient.post('/chat-send', {
        conversationId: conversationId,
        content: 'Can we continue our conversation?',
        role: 'user'
      }, { userId: testUserId })

      expect([200, 503]).toContain(recoveryResponse.status)

      // Conversation should still be accessible
      const detailResponse = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: testUserId
      })

      expect(detailResponse.status).toBe(200)
      expect(detailResponse.data.conversation.status).toBe('active')
    })
  })

  describe('Multi-User Conversation Isolation', () => {
    it('should maintain conversation isolation between users', async () => {
      const user1Id = TEST_CONFIG.testUsers.user1.id
      const user2Id = TEST_CONFIG.testUsers.user2.id

      // User 1 creates conversation
      const user1SessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'User 1 Conversation'
      }, { userId: user1Id })

      expect(user1SessionResponse.status).toBe(201)
      const user1ConversationId = user1SessionResponse.data.conversation.id

      // User 2 creates conversation
      const user2SessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'User 2 Conversation'
      }, { userId: user2Id })

      expect(user2SessionResponse.status).toBe(201)
      const user2ConversationId = user2SessionResponse.data.conversation.id

      // Conversations should be different
      expect(user1ConversationId).not.toBe(user2ConversationId)

      // User 1 sends message
      const user1MessageResponse = await apiClient.post('/chat-send', {
        conversationId: user1ConversationId,
        content: 'User 1 private message',
        role: 'user'
      }, { userId: user1Id })

      expect(user1MessageResponse.status).toBe(200)

      // User 2 should not be able to access User 1's conversation
      const unauthorizedAccessResponse = await apiClient.get(
        `/chat-conversation-detail?conversationId=${user1ConversationId}`,
        { userId: user2Id }
      )

      expect(unauthorizedAccessResponse.status).toBe(403)

      // User 2 should not see User 1's conversation in their list
      const user2ConversationsResponse = await apiClient.get('/chat-conversations', {
        userId: user2Id
      })

      expect(user2ConversationsResponse.status).toBe(200)
      const foundUser1Conversation = user2ConversationsResponse.data.conversations.find(
        c => c.id === user1ConversationId
      )
      expect(foundUser1Conversation).toBeUndefined()

      // Cleanup
      conversationId = user1ConversationId // For cleanup in afterEach
    })
  })

  describe('Character Switching and Multiple Conversations', () => {
    it('should handle multiple active conversations with different characters', async () => {
      const character1Id = TEST_CONFIG.testCharacters.luna.id
      const character2Id = TEST_CONFIG.testCharacters.aria.id

      // Create conversation with Character 1
      const session1Response = await apiClient.post('/chat-session', {
        characterId: character1Id,
        title: 'Conversation with Luna'
      }, { userId: testUserId })

      expect(session1Response.status).toBe(201)
      const conversation1Id = session1Response.data.conversation.id

      // Create conversation with Character 2
      const session2Response = await apiClient.post('/chat-session', {
        characterId: character2Id,
        title: 'Conversation with Aria'
      }, { userId: testUserId })

      expect(session2Response.status).toBe(201)
      const conversation2Id = session2Response.data.conversation.id

      // Send messages to both conversations
      const message1Response = await apiClient.post('/chat-send', {
        conversationId: conversation1Id,
        content: 'Hello Luna!',
        role: 'user'
      }, { userId: testUserId })

      const message2Response = await apiClient.post('/chat-send', {
        conversationId: conversation2Id,
        content: 'Hello Aria!',
        role: 'user'
      }, { userId: testUserId })

      expect(message1Response.status).toBe(200)
      expect(message2Response.status).toBe(200)

      // Responses should be from different characters
      expect(message1Response.data.conversationId).toBe(conversation1Id)
      expect(message2Response.data.conversationId).toBe(conversation2Id)

      // Verify both conversations appear in user's list
      const conversationsResponse = await apiClient.get('/chat-conversations', {
        userId: testUserId
      })

      expect(conversationsResponse.status).toBe(200)
      const conversationIds = conversationsResponse.data.conversations.map(c => c.id)
      expect(conversationIds).toContain(conversation1Id)
      expect(conversationIds).toContain(conversation2Id)

      conversationId = conversation1Id // For cleanup
    })
  })

  describe('Real-time Conversation Updates', () => {
    it('should reflect real-time updates in conversation state', async () => {
      // Create conversation
      const sessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'Real-time Updates Test'
      }, { userId: testUserId })

      expect(sessionResponse.status).toBe(201)
      conversationId = sessionResponse.data.conversation.id

      // Get initial state
      const initialDetailResponse = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: testUserId
      })

      expect(initialDetailResponse.status).toBe(200)
      const initialMessageCount = initialDetailResponse.data.conversation.messageCount
      const initialTokens = initialDetailResponse.data.conversation.totalTokens

      // Send message
      const messageResponse = await apiClient.post('/chat-send', {
        conversationId: conversationId,
        content: 'Test message for real-time updates',
        role: 'user'
      }, { userId: testUserId })

      expect(messageResponse.status).toBe(200)

      // Get updated state
      const updatedDetailResponse = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: testUserId
      })

      expect(updatedDetailResponse.status).toBe(200)

      // State should be updated
      expect(updatedDetailResponse.data.conversation.messageCount).toBeGreaterThan(initialMessageCount)
      expect(updatedDetailResponse.data.conversation.totalTokens).toBeGreaterThan(initialTokens)

      // Last message timestamp should be updated
      const updatedLastMessage = new Date(updatedDetailResponse.data.conversation.lastMessageAt)
      const initialLastMessage = new Date(initialDetailResponse.data.conversation.lastMessageAt)
      expect(updatedLastMessage.getTime()).toBeGreaterThanOrEqual(initialLastMessage.getTime())
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle rapid message exchanges efficiently', async () => {
      // Create conversation
      const sessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'Performance Test Conversation'
      }, { userId: testUserId })

      expect(sessionResponse.status).toBe(201)
      conversationId = sessionResponse.data.conversation.id

      // Send multiple messages rapidly
      const messagePromises = Array.from({ length: 5 }, (_, i) =>
        apiClient.post('/chat-send', {
          conversationId: conversationId,
          content: `Rapid message ${i + 1}`,
          role: 'user'
        }, { userId: testUserId })
      )

      const startTime = Date.now()
      const responses = await Promise.all(messagePromises)
      const totalTime = Date.now() - startTime

      // All messages should be processed successfully
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status) // Success or rate limited
      })

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(30000) // 30 seconds for 5 messages

      // Verify final conversation state
      const finalDetailResponse = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: testUserId
      })

      expect(finalDetailResponse.status).toBe(200)
      expect(finalDetailResponse.data.conversation.messageCount).toBeGreaterThan(0)
    })

    it('should maintain conversation integrity under concurrent access', async () => {
      // Create conversation
      const sessionResponse = await apiClient.post('/chat-session', {
        characterId: characterId,
        title: 'Concurrency Test Conversation'
      }, { userId: testUserId })

      expect(sessionResponse.status).toBe(201)
      conversationId = sessionResponse.data.conversation.id

      // Simulate concurrent reads and writes
      const operations = [
        // Concurrent message sends
        apiClient.post('/chat-send', {
          conversationId: conversationId,
          content: 'Concurrent message 1',
          role: 'user'
        }, { userId: testUserId }),

        // Concurrent conversation reads
        apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
          userId: testUserId
        }),

        apiClient.post('/chat-send', {
          conversationId: conversationId,
          content: 'Concurrent message 2',
          role: 'user'
        }, { userId: testUserId }),

        apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
          userId: testUserId
        })
      ]

      const results = await Promise.all(operations)

      // All operations should complete successfully or be rate limited
      results.forEach(result => {
        expect([200, 201, 429]).toContain(result.status)
      })

      // Final state should be consistent
      const finalState = await apiClient.get(`/chat-conversation-detail?conversationId=${conversationId}`, {
        userId: testUserId
      })

      expect(finalState.status).toBe(200)
      expect(finalState.data.conversation.messageCount).toBeGreaterThan(0)
    })
  })
})