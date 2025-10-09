# API Key Security Documentation

## Overview
This document describes the security measures implemented for API key management in the Sui Idol application.

## Security Vulnerabilities Fixed

### 1. EXPOSED_SENSITIVE_DATA - Plaintext API Keys
**Problem:** API keys were stored in plaintext and accessible to authenticated users.

**Fix:** 
- Removed SELECT policy that allowed users to read plaintext API keys
- Created RLS policy that blocks all direct SELECT queries on `api_keys` table
- Users can only verify key existence through secure RPC functions
- API keys can only be retrieved server-side through `get_api_key_for_service()` RPC

### 2. PUBLIC_USER_DATA - Wallet Address Enumeration
**Problem:** User wallet addresses were exposed through SELECT queries on `api_keys` table.

**Fix:**
- Updated RLS policies to prevent SELECT queries entirely
- Only INSERT, UPDATE, and DELETE operations are allowed for users' own records
- All read operations must use secure RPC functions

## Architecture

### Client-Side (Frontend)
**What clients CAN do:**
- ✅ Save/update their own API key (via INSERT/UPDATE)
- ✅ Check if they have an active API key (via `has_active_api_key()` RPC)
- ✅ Delete their own API key (via DELETE)

**What clients CANNOT do:**
- ❌ Read plaintext API keys from the database
- ❌ View other users' wallet addresses
- ❌ Enumerate all API keys in the system
- ❌ Access the `api_key` column through SELECT queries

### Server-Side (Edge Functions)
**Secure API Key Retrieval:**
```typescript
// Use this ONLY in edge functions, NEVER in client code
const { data: apiKey } = await supabaseClient
  .rpc('get_api_key_for_service', {
    user_wallet_param: userWallet
  });
```

**Example Usage in Edge Function:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

// Get user's API key for server-side operations
const { data: userApiKey } = await supabaseClient
  .rpc('get_api_key_for_service', {
    user_wallet_param: userWalletAddress
  });

if (!userApiKey) {
  // Fallback to system API key
  userApiKey = Deno.env.get('GEMINI_API_KEY');
}
```

## Database Functions

### `has_active_api_key(user_wallet_param text) → boolean`
**Purpose:** Check if a user has an active API key (not expired)
**Security:** SECURITY DEFINER - validates user owns the wallet
**Usage:** Client-side to check key existence

### `verify_api_key(user_wallet_param text, provided_key text) → boolean`
**Purpose:** Verify if provided key matches stored key
**Security:** SECURITY DEFINER - validates user owns the wallet
**Usage:** Server-side key verification

### `get_api_key_for_service(user_wallet_param text) → text`
**Purpose:** Retrieve plaintext API key for server-side use
**Security:** SECURITY DEFINER - should ONLY be called from edge functions
**Usage:** Edge functions needing user's API key

### `hash_api_key(key_to_hash text) → text`
**Purpose:** Hash API keys for future encrypted storage
**Security:** SECURITY DEFINER - uses bcrypt for secure hashing
**Usage:** Future migration to encrypted-only storage

## Row-Level Security Policies

### api_keys Table
```sql
-- Prevents all SELECT queries (forces use of RPC functions)
CREATE POLICY "Users can verify key existence only"
ON public.api_keys FOR SELECT
USING (user_wallet = get_current_user_wallet() AND false);

-- Allows users to create their own API keys
CREATE POLICY "Users can insert their own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (user_wallet = get_current_user_wallet());

-- Allows users to update only their own API keys
CREATE POLICY "Users can update their own API keys"
ON public.api_keys FOR UPDATE
USING (user_wallet = get_current_user_wallet())
WITH CHECK (user_wallet = get_current_user_wallet());

-- Allows users to delete only their own API keys
CREATE POLICY "Users can delete their own API keys"
ON public.api_keys FOR DELETE
USING (user_wallet = get_current_user_wallet());
```

## Client-Side Code Examples

### Saving API Key (Secure)
```typescript
import { ApiKeyService } from '@/services/apiKeyService';

// Save API key - does not return plaintext
const success = await ApiKeyService.saveApiKey(walletAddress, apiKey);
if (success) {
  console.log('API key saved successfully');
}
```

### Checking Key Existence (Secure)
```typescript
// Check if user has an active key
const hasKey = await ApiKeyService.hasApiKey(walletAddress);
```

### What NOT to Do (Insecure)
```typescript
// ❌ NEVER do this - will fail due to RLS
const { data } = await supabase
  .from('api_keys')
  .select('api_key')
  .eq('user_wallet', walletAddress);
// This query will return empty due to RLS policies
```

## Future Improvements

### Migration to Encrypted Storage
1. Enable `pgcrypto` extension
2. Use `hash_api_key()` to hash all existing keys
3. Store hashed keys in `encrypted_key` column
4. Remove plaintext `api_key` column
5. Update verification to use hash comparison

### Additional Security Measures
- Rate limiting on API key operations
- Audit logging for all API key access
- Automatic key rotation policies
- Multi-factor authentication for sensitive operations
- API key expiration warnings

## Testing Security

### Verify RLS Protection
```sql
-- As a regular user, this should return empty
SELECT * FROM api_keys;

-- This should work (returns boolean)
SELECT has_active_api_key('your_wallet_address');
```

### Verify Edge Function Access
```typescript
// In edge function with SERVICE_ROLE_KEY
const { data } = await supabaseClient
  .rpc('get_api_key_for_service', {
    user_wallet_param: 'wallet_address'
  });
// Should return the API key
```

## Security Best Practices

1. **Never log API keys** - Even in server logs
2. **Use SERVICE_ROLE_KEY only in edge functions** - Never expose to client
3. **Validate user ownership** - Always check `get_current_user_wallet()`
4. **Rotate keys regularly** - Encourage users to rotate keys periodically
5. **Monitor suspicious activity** - Log all API key operations
6. **Expire old keys** - Auto-expire keys older than 30 days

## Support

For security concerns or questions:
- Review the RLS policies in Supabase Dashboard
- Check edge function logs for authentication issues
- Use `has_active_api_key()` for debugging key existence
- Never expose `api_key` column in client queries
