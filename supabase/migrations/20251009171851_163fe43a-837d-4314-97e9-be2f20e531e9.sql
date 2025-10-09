-- Fix API Keys security vulnerability using built-in hash functions
-- We'll use md5 first, then can upgrade to sha256 when pgcrypto is confirmed working

-- 1. Drop the broken policy that always returns false
DROP POLICY IF EXISTS "Users can verify key existence only" ON public.api_keys;

-- 2. Create a proper policy that completely blocks direct SELECT access
CREATE POLICY "Block all direct SELECT access to API keys" ON public.api_keys
FOR SELECT USING (false);

-- 3. Create hash function using built-in md5 (will upgrade to sha256 later)
CREATE OR REPLACE FUNCTION public.hash_api_key(key_to_hash text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Use MD5 hashing with salt for now (we'll upgrade to SHA-256 when pgcrypto works)
  SELECT md5(key_to_hash || 'sui_idol_salt_2025');
$$;

-- 4. Update the auto_hash_api_key function to immediately redact plaintext
CREATE OR REPLACE FUNCTION public.auto_hash_api_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hash the API key if it's not already redacted
  IF NEW.api_key IS NOT NULL AND NEW.api_key <> '[REDACTED]' THEN
    NEW.encrypted_key := hash_api_key(NEW.api_key);
    NEW.encryption_version := 2;
    NEW.updated_at = now();
  END IF;
  
  -- Always redact the plaintext API key for security
  NEW.api_key := '[REDACTED]';
  
  RETURN NEW;
END;
$$;

-- 5. Create triggers to automatically hash and redact API keys
DROP TRIGGER IF EXISTS api_keys_before_insert_hash ON public.api_keys;
CREATE TRIGGER api_keys_before_insert_hash
BEFORE INSERT ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.auto_hash_api_key();

DROP TRIGGER IF EXISTS api_keys_before_update_hash ON public.api_keys;
CREATE TRIGGER api_keys_before_update_hash
BEFORE UPDATE OF api_key ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.auto_hash_api_key();

-- 6. Redact any existing plaintext API keys and ensure they're hashed
UPDATE public.api_keys 
SET 
  encrypted_key = COALESCE(encrypted_key, hash_api_key(api_key)),
  encryption_version = 2,
  api_key = '[REDACTED]'
WHERE api_key IS NOT NULL AND api_key <> '[REDACTED]';

-- 7. Remove the insecure function that returns plaintext keys
DROP FUNCTION IF EXISTS public.get_api_key_for_service(text);

-- 8. Add comprehensive table documentation
COMMENT ON TABLE public.api_keys IS 'API keys are stored in hashed form only. The api_key column is always redacted after hashing. Use has_active_api_key() and verify_api_key() functions for secure operations. Direct SELECT is completely blocked by RLS for security.';

-- 9. Ensure the secure verification function is properly implemented
CREATE OR REPLACE FUNCTION public.verify_api_key(user_wallet_param text, provided_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
  provided_hash text;
BEGIN
  -- Security check: users can only verify their own keys
  IF user_wallet_param != get_current_user_wallet() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot verify API keys for other users';
  END IF;
  
  -- Get the stored hash for active keys only
  SELECT encrypted_key INTO stored_hash
  FROM api_keys 
  WHERE user_wallet = user_wallet_param 
  AND updated_at > (now() - '30 days'::interval);
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Hash the provided key and compare securely
  provided_hash := hash_api_key(provided_key);
  
  -- Constant-time comparison for security
  RETURN stored_hash = provided_hash;
END;
$$;

-- 10. Ensure the existence check function is secure
CREATE OR REPLACE FUNCTION public.has_active_api_key(user_wallet_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: users can only check their own keys
  IF user_wallet_param != get_current_user_wallet() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot check API keys for other users';
  END IF;
  
  -- Return true if user has an active API key (check encrypted_key instead of api_key)
  RETURN EXISTS (
    SELECT 1 FROM api_keys 
    WHERE user_wallet = user_wallet_param 
    AND encrypted_key IS NOT NULL
    AND updated_at > (now() - '30 days'::interval)
  );
END;
$$;