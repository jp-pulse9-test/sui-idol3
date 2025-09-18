import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ApiClient, TestData, validateSchema } from '../utils/api-client'
import { TEST_CONFIG } from '../config/test-env'

describe('GET /chat/characters Contract Test', () => {
  let apiClient

  beforeEach(() => {
    apiClient = new ApiClient()
  })

  afterEach(async () => {
    // Cleanup test data if needed
  })

  describe('Valid Requests', () => {
    it('should retrieve available characters', async () => {
      const response = await apiClient.get('/chat-characters')

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data.characters)).toBe(true)
      expect(response.data.characters.length).toBeGreaterThan(0)

      // Validate each character
      response.data.characters.forEach(character => {
        validateSchema.character(character)

        expect(character.id).toBeDefined()
        expect(character.name).toBeDefined()
        expect(character.personality).toBeDefined()
        expect(character.speakingStyle).toBeDefined()
        expect(character.background).toBeDefined()
        expect(Array.isArray(character.traits)).toBe(true)
        expect(character.traits.length).toBeGreaterThan(0)
        expect(character.active).toBe(true) // Only active characters should be returned
        expect(character.createdAt).toBeDefined()

        // Avatar URL should be valid if present
        if (character.avatarUrl) {
          expect(character.avatarUrl).toMatch(/^(https?:\/\/|\/)/);
        }
      })

      // Validate metadata
      expect(response.data.total).toBeTypeOf('number')
      expect(response.data.total).toBe(response.data.characters.length)
    })

    it('should filter by active status', async () => {
      const response = await apiClient.get('/chat-characters?active=true')

      expect(response.status).toBe(200)

      // All returned characters should be active
      response.data.characters.forEach(character => {
        expect(character.active).toBe(true)
      })
    })

    it('should filter by character traits', async () => {
      const response = await apiClient.get('/chat-characters?traits=cheerful')

      expect(response.status).toBe(200)

      // All returned characters should have the specified trait
      response.data.characters.forEach(character => {
        expect(character.traits).toContain('cheerful')
      })
    })

    it('should support pagination', async () => {
      const page1 = await apiClient.get('/chat-characters?page=1&limit=3')

      expect(page1.status).toBe(200)
      expect(page1.data.characters.length).toBeLessThanOrEqual(3)
      expect(page1.data.pagination).toBeDefined()
      expect(page1.data.pagination.page).toBe(1)
      expect(page1.data.pagination.limit).toBe(3)
      expect(page1.data.pagination.total).toBeTypeOf('number')
      expect(page1.data.pagination.hasMore).toBeTypeOf('boolean')

      if (page1.data.pagination.hasMore) {
        const page2 = await apiClient.get('/chat-characters?page=2&limit=3')

        expect(page2.status).toBe(200)
        expect(page2.data.pagination.page).toBe(2)

        // Characters should be different between pages
        const page1Ids = page1.data.characters.map(c => c.id)
        const page2Ids = page2.data.characters.map(c => c.id)
        const overlap = page1Ids.filter(id => page2Ids.includes(id))
        expect(overlap.length).toBe(0)
      }
    })

    it('should search by character name', async () => {
      const response = await apiClient.get('/chat-characters?search=Luna')

      expect(response.status).toBe(200)

      if (response.data.characters.length > 0) {
        // At least one character should have Luna in the name
        const hasLuna = response.data.characters.some(character =>
          character.name.toLowerCase().includes('luna')
        )
        expect(hasLuna).toBe(true)
      }
    })

    it('should sort characters by name', async () => {
      const response = await apiClient.get('/chat-characters?sort=name&order=asc')

      expect(response.status).toBe(200)

      if (response.data.characters.length > 1) {
        for (let i = 1; i < response.data.characters.length; i++) {
          const current = response.data.characters[i].name.toLowerCase()
          const previous = response.data.characters[i - 1].name.toLowerCase()
          expect(current.localeCompare(previous)).toBeGreaterThanOrEqual(0)
        }
      }
    })

    it('should include character statistics', async () => {
      const response = await apiClient.get('/chat-characters?includeStats=true')

      expect(response.status).toBe(200)

      response.data.characters.forEach(character => {
        if (character.stats) {
          expect(character.stats.totalConversations).toBeTypeOf('number')
          expect(character.stats.totalMessages).toBeTypeOf('number')
          expect(character.stats.averageRating).toBeTypeOf('number')
          expect(character.stats.averageRating).toBeGreaterThanOrEqual(0)
          expect(character.stats.averageRating).toBeLessThanOrEqual(5)
        }
      })
    })
  })

  describe('Query Parameter Validation', () => {
    it('should validate pagination parameters', async () => {
      const invalidPage = await apiClient.get('/chat-characters?page=0')
      expect(invalidPage.status).toBe(400)
      expect(invalidPage.error).toContain('Page must be greater than 0')

      const invalidLimit = await apiClient.get('/chat-characters?limit=101')
      expect(invalidLimit.status).toBe(400)
      expect(invalidLimit.error).toContain('Limit must be between 1 and 100')
    })

    it('should validate sort parameters', async () => {
      const invalidSort = await apiClient.get('/chat-characters?sort=invalid-field')
      expect(invalidSort.status).toBe(400)
      expect(invalidSort.error).toContain('Invalid sort field')

      const invalidOrder = await apiClient.get('/chat-characters?sort=name&order=invalid')
      expect(invalidOrder.status).toBe(400)
      expect(invalidOrder.error).toContain('Invalid sort order')
    })

    it('should validate filter parameters', async () => {
      const invalidActive = await apiClient.get('/chat-characters?active=invalid')
      expect(invalidActive.status).toBe(400)
      expect(invalidActive.error).toContain('Invalid active parameter')

      const invalidTraits = await apiClient.get('/chat-characters?traits=invalid-trait')
      expect(invalidTraits.status).toBe(400)
      expect(invalidTraits.error).toContain('Invalid trait filter')
    })

    it('should handle malformed query parameters', async () => {
      const response = await apiClient.get('/chat-characters?page=not-a-number&limit=also-not-a-number')

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid query parameters')
    })
  })

  describe('Public Access', () => {
    it('should allow access without authentication', async () => {
      // This endpoint should be publicly accessible
      const response = await apiClient.get('/chat-characters')

      expect(response.status).toBe(200)
      expect(response.data.characters).toBeDefined()
    })

    it('should not expose sensitive character data', async () => {
      const response = await apiClient.get('/chat-characters')

      expect(response.status).toBe(200)

      response.data.characters.forEach(character => {
        // Should not include internal fields
        expect(character.internalNotes).toBeUndefined()
        expect(character.developmentNotes).toBeUndefined()
        expect(character.createdBy).toBeUndefined()
        expect(character.lastModified).toBeUndefined()
      })
    })
  })

  describe('Caching', () => {
    it('should include proper cache headers', async () => {
      const response = await apiClient.get('/chat-characters')

      expect(response.status).toBe(200)
      expect(response.headers['cache-control']).toBeDefined()
      expect(response.headers['etag'] || response.headers['last-modified']).toBeDefined()
    })

    it('should handle conditional requests', async () => {
      const firstResponse = await apiClient.get('/chat-characters')
      expect(firstResponse.status).toBe(200)

      if (firstResponse.headers['etag']) {
        // Make conditional request with ETag
        const conditionalResponse = await fetch(`${apiClient.baseUrl}/chat-characters`, {
          headers: {
            'If-None-Match': firstResponse.headers['etag']
          }
        })

        expect([200, 304]).toContain(conditionalResponse.status)
      }
    })
  })

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const startTime = Date.now()

      const response = await apiClient.get('/chat-characters')

      const responseTime = Date.now() - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(2000) // Should respond within 2 seconds
    })

    it('should handle large character sets efficiently', async () => {
      const response = await apiClient.get('/chat-characters?limit=50')

      expect(response.status).toBe(200)
      expect(response.data.characters.length).toBeLessThanOrEqual(50)
    })

    it('should optimize responses for mobile clients', async () => {
      const response = await fetch(`${apiClient.baseUrl}/chat-characters`, {
        headers: {
          'User-Agent': 'Mobile App/1.0'
        }
      })

      expect(response.status).toBe(200)
      expect(response.headers['content-encoding']).toBeDefined() // Should be compressed
    })
  })

  describe('Data Consistency', () => {
    it('should return consistent data across requests', async () => {
      const response1 = await apiClient.get('/chat-characters')
      const response2 = await apiClient.get('/chat-characters')

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)

      // Data should be consistent
      expect(response1.data.total).toBe(response2.data.total)

      // Same characters should be returned in same order
      expect(response1.data.characters.map(c => c.id)).toEqual(
        response2.data.characters.map(c => c.id)
      )
    })

    it('should maintain character data integrity', async () => {
      const response = await apiClient.get('/chat-characters')

      expect(response.status).toBe(200)

      response.data.characters.forEach(character => {
        // All required fields should be present and valid
        expect(character.id).toMatch(/^[a-z0-9_]+$/) // Valid ID format
        expect(character.name.length).toBeGreaterThan(0)
        expect(character.name.length).toBeLessThanOrEqual(50)
        expect(character.personality.length).toBeGreaterThan(0)
        expect(character.personality.length).toBeLessThanOrEqual(500)
        expect(character.traits.length).toBeGreaterThan(0)

        // Traits should be valid strings
        character.traits.forEach(trait => {
          expect(typeof trait).toBe('string')
          expect(trait.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database connectivity issues', async () => {
      const response = await apiClient.get('/chat-characters?simulate_db_error=true')

      expect(response.status).toBe(503)
      expect(response.error).toContain('Service temporarily unavailable')
    })

    it('should handle character service unavailability', async () => {
      const response = await apiClient.get('/chat-characters?simulate_service_error=true')

      expect(response.status).toBe(503)
      expect(response.error).toContain('Character service temporarily unavailable')
    })

    it('should provide helpful error messages', async () => {
      const testCases = [
        {
          url: '/chat-characters?page=-1',
          expectedError: 'Page must be greater than 0'
        },
        {
          url: '/chat-characters?limit=0',
          expectedError: 'Limit must be between 1 and 100'
        },
        {
          url: '/chat-characters?sort=invalid',
          expectedError: 'Invalid sort field'
        }
      ]

      for (const { url, expectedError } of testCases) {
        const response = await apiClient.get(url)
        expect(response.status).toBe(400)
        expect(response.error).toContain(expectedError)
      }
    })

    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${apiClient.baseUrl}/chat-characters?%invalid%query%`)

      expect([400, 404]).toContain(response.status)
    })
  })

  describe('Content Delivery', () => {
    it('should properly format character data for display', async () => {
      const response = await apiClient.get('/chat-characters')

      expect(response.status).toBe(200)

      response.data.characters.forEach(character => {
        // Text fields should be properly formatted
        expect(character.personality.trim()).toBe(character.personality)
        expect(character.speakingStyle.trim()).toBe(character.speakingStyle)
        expect(character.background.trim()).toBe(character.background)

        // No HTML or script tags should be present
        expect(character.name).not.toMatch(/<[^>]*>/g)
        expect(character.personality).not.toMatch(/<script/i)
        expect(character.background).not.toMatch(/<script/i)
      })
    })

    it('should support localization headers', async () => {
      const response = await fetch(`${apiClient.baseUrl}/chat-characters`, {
        headers: {
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
        }
      })

      expect(response.status).toBe(200)
      // Should handle different languages gracefully
    })
  })

  describe('Security', () => {
    it('should not expose internal character data', async () => {
      const response = await apiClient.get('/chat-characters')

      expect(response.status).toBe(200)

      response.data.characters.forEach(character => {
        // Should not expose sensitive fields
        expect(character.apiKeys).toBeUndefined()
        expect(character.internalConfig).toBeUndefined()
        expect(character.moderationSettings).toBeUndefined()
        expect(character.createdBy).toBeUndefined()
      })
    })

    it('should prevent SQL injection in query parameters', async () => {
      const maliciousQueries = [
        '/chat-characters?search=\'; DROP TABLE characters; --',
        '/chat-characters?traits=1\' OR \'1\'=\'1',
        '/chat-characters?page=1; DELETE FROM characters WHERE 1=1'
      ]

      for (const query of maliciousQueries) {
        const response = await apiClient.get(query)
        // Should either return 400 for invalid input or 200 with safe results
        expect([200, 400]).toContain(response.status)

        if (response.status === 200) {
          // Should return normal character data, not expose any errors
          expect(response.data.characters).toBeDefined()
        }
      }
    })
  })
})