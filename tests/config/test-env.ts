/**
 * Test environment configuration
 */

export const TEST_CONFIG = {
  // Supabase configuration for testing
  supabase: {
    url: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key',
  },

  // API endpoints
  endpoints: {
    chatSend: '/chat-send',
    chatSession: '/chat-session',
    chatConversations: '/chat-conversations',
    chatConversationDetail: '/chat-conversation-detail',
    chatCharacters: '/chat-characters',
  },

  // Rate limiting settings
  rateLimit: {
    maxRequestsPerMinute: 10,
    windowSizeMs: 60000,
  },

  // Test timeouts
  timeouts: {
    apiCall: 30000, // 30 seconds
    integration: 60000, // 1 minute
    e2e: 120000, // 2 minutes
  },

  // Test data
  testUsers: {
    user1: {
      id: 'test-user-1',
      email: 'user1@test.com',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    },
    user2: {
      id: 'test-user-2',
      email: 'user2@test.com',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    },
  },

  // Test characters
  testCharacters: {
    luna: {
      id: 'idol_001',
      name: 'Luna',
    },
    aria: {
      id: 'idol_002',
      name: 'Aria',
    },
  },

  // Content moderation test cases
  moderationTestCases: {
    allowed: [
      'Hello, how are you?',
      'What is your favorite color?',
      'Tell me about your day',
    ],
    flagged: [
      'spam spam spam spam',
      'inappropriate content here',
      'testing moderation system',
    ],
    blocked: [
      'extremely inappropriate content',
      'harmful content example',
      'content that should be blocked',
    ],
  },
}

// Helper to check if running in CI environment
export const isCI = () => process.env.CI === 'true'

// Helper to check if running locally
export const isLocal = () => !isCI() && process.env.NODE_ENV !== 'production'

// Helper to get test database URL
export const getTestDatabaseUrl = () => {
  if (isLocal()) {
    return 'postgresql://postgres:postgres@localhost:54322/postgres'
  }
  return process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test'
}

// Cleanup utilities
export const cleanup = {
  // Clean up test data after tests
  async cleanupTestData(userId: string) {
    // This would connect to the database and clean up test data
    console.log(`Cleaning up test data for user: ${userId}`)
  },

  // Reset rate limits for testing
  async resetRateLimits(userId: string) {
    console.log(`Resetting rate limits for user: ${userId}`)
  },
}

export default TEST_CONFIG