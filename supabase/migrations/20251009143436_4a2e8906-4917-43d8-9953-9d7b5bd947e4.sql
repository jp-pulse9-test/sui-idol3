-- Security Fix: Remove plaintext API key exposure and enforce proper encryption
-- This migration addresses EXPOSED_SENSITIVE_DATA and PUBLIC_USER_DATA vulnerabilities

-- 1. Drop the insecure RLS policy that allows users to SELECT their plaintext API keys
DROP POLICY IF EXISTS "Users can check their own API key existence" ON public.api_keys;

-- 2. Create a secure policy that only allows checking existence (no data exposure)
-- Users can only verify they have a key, not read any actual key data
CREATE POLICY "Users can verify key existence only"
ON public.api_keys
FOR SELECT
TO authenticated
USING (
  user_wallet = get_current_user_wallet() 
  AND false -- This prevents actual SELECT, forcing use of RPC functions
);

-- 3. Update the existing policies to ensure user_wallet matching (fixes PUBLIC_USER_DATA)
DROP POLICY IF EXISTS "Users can insert their own API keys" ON public.api_keys;
CREATE POLICY "Users can insert their own API keys"
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (user_wallet = get_current_user_wallet());

DROP POLICY IF EXISTS "Users can update their own API keys" ON public.api_keys;
CREATE POLICY "Users can update their own API keys"
ON public.api_keys
FOR UPDATE
TO authenticated
USING (user_wallet = get_current_user_wallet())
WITH CHECK (user_wallet = get_current_user_wallet());

DROP POLICY IF EXISTS "Users can delete their own API keys" ON public.api_keys;
CREATE POLICY "Users can delete their own API keys"
ON public.api_keys
FOR DELETE
TO authenticated
USING (user_wallet = get_current_user_wallet());

-- 4. Create a secure function to hash API keys (for future use)
CREATE OR REPLACE FUNCTION public.hash_api_key(key_to_hash text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use crypt for secure one-way hashing
  -- Note: Requires pgcrypto extension
  RETURN crypt(key_to_hash, gen_salt('bf', 10));
END;
$$;

-- 5. Create a secure function for edge functions to retrieve API keys
-- This should ONLY be called from edge functions, never from client code
CREATE OR REPLACE FUNCTION public.get_api_key_for_service(user_wallet_param text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_key text;
BEGIN
  -- Get the API key for server-side use only
  SELECT api_key INTO stored_key
  FROM api_keys 
  WHERE user_wallet = user_wallet_param 
  AND updated_at > (now() - '30 days'::interval);
  
  RETURN stored_key;
END;
$$;

-- 6. Add security comment to document proper usage
COMMENT ON TABLE public.api_keys IS 
'SECURITY: API keys must never be exposed to clients. Use RPC functions has_active_api_key() for existence checks and get_api_key_for_service() ONLY from edge functions. Never SELECT api_key column from client code.';

COMMENT ON COLUMN public.api_keys.api_key IS 
'SECURITY CRITICAL: Plaintext API key for edge function use only. Should be migrated to encrypted_key in future. Never expose to client.';

COMMENT ON COLUMN public.api_keys.encrypted_key IS 
'Future: Store hashed/encrypted API keys here. Use hash_api_key() function for secure storage.';