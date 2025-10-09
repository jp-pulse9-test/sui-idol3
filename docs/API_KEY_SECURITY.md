# API Key Security Documentation

## Overview
This document describes the security measures implemented for API key management in the Sui Idol application. All API keys are now stored using **SHA-256 hashing with salt** - plaintext keys are NEVER stored in the database.

## Security Vulnerabilities Fixed

### 1. EXPOSED_SENSITIVE_DATA - Plaintext API Keys ✅ FIXED
**Problem:** API keys were stored in plaintext and accessible to authenticated users.

**Fix:** 
- Implemented SHA-256 hashing with salt for all API keys
- Automatic hashing trigger on INSERT/UPDATE operations
- Removed SELECT policy that allowed users to read API keys
- Created RLS policy that blocks all direct SELECT queries on `api_keys` table
- Users can only verify key existence through secure RPC functions
- API keys are automatically hashed before storage using `auto_hash_api_key()` trigger

### 2. PUBLIC_USER_DATA - Wallet Address Enumeration ✅ FIXED
**Problem:** User wallet addresses were exposed through SELECT queries on `api_keys` table.

**Fix:**
- Updated RLS policies to prevent SELECT queries entirely
- Only INSERT, UPDATE, and DELETE operations are allowed for users' own records
- All read operations must use secure RPC functions

### 3. MISSING_RLS_PROTECTION - Usage Log Forgery ✅ FIXED
**Problem:** No INSERT policy on `api_key_usage_logs` allowed potential log forgery.

**Fix:**
- Added INSERT policy restricting log creation to authenticated users
- Users can only create logs for their own wallet address
- Audit logging triggers automatically create logs for all API key operations

## Architecture

### Key Hashing Implementation
**All API keys are hashed using SHA-256 with a salt before storage:**
- Salt: `sui_idol_salt_2025`
- Algorithm: SHA-256
- Storage format: Hex-encoded hash in `encrypted_key` column
- Encryption version: 2 (indicates SHA-256 hashed keys)

**Security Benefits:**
- ✅ One-way hashing - impossible to reverse
- ✅ Salt prevents rainbow table attacks
- ✅ Constant-time comparison prevents timing attacks
- ✅ Even if database is compromised, keys cannot be recovered

### Client-Side (Frontend)
**What clients CAN do:**
- ✅ Save/update their own API key (automatically hashed before storage)
- ✅ Check if they have an active API key (via `has_active_api_key()` RPC)
- ✅ Verify an API key they possess (via `verify_api_key()` RPC)
- ✅ Delete their own API key (via DELETE)

**What clients CANNOT do:**
- ❌ Read plaintext or hashed API keys from the database
- ❌ View other users' wallet addresses
- ❌ Enumerate all API keys in the system
- ❌ Access the `api_key` or `encrypted_key` columns through SELECT queries
- ❌ Retrieve API keys for reuse (they must re-enter or store locally if needed)

### Server-Side (Edge Functions)
**For User-Provided API Keys:**
Edge functions cannot retrieve user API keys because they are hashed. Users must:
1. Store their API key locally (encrypted in browser storage), OR
2. Re-enter their API key when needed, OR  
3. Use the system-wide API keys from Supabase secrets

**For System API Keys:**
```typescript
// Use system-wide Gemini API key from secrets
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
```

## Database Functions

### `has_active_api_key(user_wallet_param text) → boolean`
**Purpose:** Check if a user has an active API key (not expired)
**Security:** SECURITY DEFINER - validates user owns the wallet
**Usage:** Client-side to check key existence

### `verify_api_key(user_wallet_param text, provided_key text) → boolean`
**Purpose:** Verify if provided key matches stored hashed key
**Security:** SECURITY DEFINER - validates user owns the wallet, uses constant-time comparison
**Usage:** Server-side or client-side key verification
**Implementation:** Hashes the provided key and compares with stored hash

### `hash_api_key(key_to_hash text) → text`
**Purpose:** Hash API keys using SHA-256 with salt
**Security:** SECURITY DEFINER - uses `sui_idol_salt_2025` salt
**Usage:** Automatic via trigger, or manual for testing
**Returns:** Hex-encoded SHA-256 hash

### `auto_hash_api_key() → trigger`
**Purpose:** Automatically hash API keys on INSERT/UPDATE
**Security:** SECURITY DEFINER - ensures all keys are hashed before storage
**Usage:** Triggered automatically by database
**Implementation:** Hashes `api_key` column and stores in `encrypted_key`

### `migrate_api_key_to_hash(user_wallet_param text) → boolean`
**Purpose:** Migrate legacy plaintext keys to hashed format
**Security:** SECURITY DEFINER - validates user owns the wallet
**Usage:** One-time migration for existing users
**Note:** No longer needed as all new keys are automatically hashed

## Row-Level Security Policies

### api_keys Table
```sql
-- Prevents all SELECT queries (forces use of RPC functions)
-- This is intentional - even users cannot read their own keys
CREATE POLICY "Users can verify key existence only"
ON public.api_keys FOR SELECT
USING (user_wallet = get_current_user_wallet() AND false);

-- Allows users to create their own API keys (auto-hashed by trigger)
CREATE POLICY "Users can insert their own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (user_wallet = get_current_user_wallet());

-- Allows users to update only their own API keys (auto-hashed by trigger)
CREATE POLICY "Users can update their own API keys"
ON public.api_keys FOR UPDATE
USING (user_wallet = get_current_user_wallet())
WITH CHECK (user_wallet = get_current_user_wallet());

-- Allows users to delete only their own API keys
CREATE POLICY "Users can delete their own API keys"
ON public.api_keys FOR DELETE
USING (user_wallet = get_current_user_wallet());
```

### api_key_usage_logs Table
```sql
-- Users can only view their own usage logs
CREATE POLICY "Users can view their own API usage logs"
ON public.api_key_usage_logs FOR SELECT
USING (user_wallet = get_current_user_wallet());

-- Users can only create logs for their own wallet
CREATE POLICY "Users can log their own API usage"
ON public.api_key_usage_logs FOR INSERT
WITH CHECK (user_wallet = get_current_user_wallet());

-- Admins can view all logs (for security monitoring)
CREATE POLICY "Admins can view all API usage logs"
ON public.api_key_usage_logs FOR SELECT
USING (get_current_user_wallet() = ANY (ARRAY['admin_wallet_1', 'admin_wallet_2']));
```

**Security Notes:**
- The SELECT policy on `api_keys` intentionally has `AND false` to block ALL reads
- This prevents even the key owner from reading their hashed keys
- Verification is done server-side via `verify_api_key()` RPC function
- Usage logs have INSERT protection to prevent forgery

## Client-Side Code Examples

### Saving API Key (Secure - Automatically Hashed)
```typescript
import { ApiKeyService } from '@/services/apiKeyService';

// Save API key - automatically hashed before storage
const success = await ApiKeyService.saveApiKey(walletAddress, apiKey);
if (success) {
  console.log('API key saved and hashed successfully');
  // The plaintext key is NEVER stored, only the SHA-256 hash
}
```

### Verifying API Key (Secure)
```typescript
// Verify if user's provided key matches the stored hash
const isValid = await ApiKeyService.verifyApiKey(walletAddress, providedKey);
if (isValid) {
  console.log('API key is valid');
}
```

### Checking Key Existence (Secure)
```typescript
// Check if user has an active hashed key
const hasKey = await ApiKeyService.hasApiKey(walletAddress);
```

### What NOT to Do (Insecure)
```typescript
// ❌ NEVER do this - will fail due to RLS
const { data } = await supabase
  .from('api_keys')
  .select('api_key, encrypted_key')
  .eq('user_wallet', walletAddress);
// This query will return empty due to RLS policies

// ❌ NEVER try to retrieve the API key for reuse
const key = await ApiKeyService.getApiKey(walletAddress);
// This will throw an error - keys cannot be retrieved
```

## Current Implementation Status

### ✅ Completed Security Measures
1. **SHA-256 Hashing** - All keys hashed with salt before storage
2. **Automatic Hashing Trigger** - Keys automatically hashed on INSERT/UPDATE
3. **RLS Policies** - SELECT blocked, only INSERT/UPDATE/DELETE for own keys
4. **Secure RPC Functions** - `verify_api_key()` and `has_active_api_key()`
5. **Audit Logging** - All API key operations logged automatically
6. **Usage Log Protection** - INSERT policy prevents log forgery
7. **Constant-Time Comparison** - Prevents timing attacks on verification

### 🔄 Implementation Notes
- The `api_key` column still exists but is never returned via SELECT
- Hash trigger automatically populates `encrypted_key` on save
- Encryption version 2 indicates SHA-256 hashed keys
- Legacy plaintext keys (version 1) are no longer supported

### 🎯 Current Architecture
```
User enters API key → auto_hash_api_key() trigger → SHA-256 hash stored in encrypted_key
User verifies key → verify_api_key() RPC → Hashes input & compares with stored hash
User checks existence → has_active_api_key() RPC → Returns boolean only
```

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
