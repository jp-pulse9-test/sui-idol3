# Contract Tests

Contract tests validate that our API endpoints match the expected OpenAPI specifications. These tests ensure that:

1. **Request/Response Schemas**: All endpoints accept and return data in the expected format
2. **HTTP Status Codes**: Correct status codes are returned for different scenarios
3. **Error Handling**: Proper error responses for invalid inputs
4. **Authentication**: Security measures work as expected

## Test Structure

Each contract test follows this pattern:
1. **Setup**: Prepare test data and authentication
2. **Execute**: Make API calls to endpoints
3. **Validate**: Check response schema and status codes
4. **Cleanup**: Remove test data

## Contract Test Files

- `chat-send.test.js` - Tests POST /chat/send endpoint
- `chat-conversations.test.js` - Tests GET /chat/conversations endpoint
- `chat-conversation-detail.test.js` - Tests GET /chat/conversations/{id} endpoint
- `chat-session.test.js` - Tests POST /chat/session endpoint
- `chat-characters.test.js` - Tests GET /chat/characters endpoint

## Running Contract Tests

```bash
# Run all contract tests
npm run test:contract

# Run specific contract test
npx vitest tests/contract/chat-send.test.js

# Run with UI
npm run test:ui
```

## Important Notes

- **TDD Approach**: Write tests FIRST, then implement endpoints
- **Failing Tests**: All tests should FAIL initially (no implementation exists)
- **Schema Validation**: Use the validation helpers in `/tests/utils/api-client.ts`
- **Test Data**: Use predefined test data from `/tests/config/test-env.ts`
- **Cleanup**: Always clean up test data after each test

## Example Test Structure

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ApiClient, TestData, validateSchema } from '../utils/api-client'

describe('POST /chat/send Contract Test', () => {
  let apiClient: ApiClient

  beforeEach(() => {
    apiClient = new ApiClient()
  })

  it('should send message and return valid response', async () => {
    // This test should FAIL initially
    const response = await apiClient.post('/chat/send', {
      conversationId: 'test-conversation-id',
      message: TestData.message.content,
    }, { userId: TestData.user.id })

    expect(response.status).toBe(200)
    validateSchema.message(response.data)
  })
})
```

Remember: **All tests must FAIL before implementation begins!**