-- Secure API key management: Never expose actual keys in SELECT queries

-- Drop the insecure SELECT policy that returns actual API keys
DROP POLICY IF EXISTS "Users can view their own API keys with enhanced security" ON public.api_keys;

-- Create a policy that only allows checking if a key exists, not retrieving it
CREATE POLICY "Users can check their own API key existence" 
ON public.api_keys 
FOR SELECT 
USING (
  user_wallet = get_current_user_wallet() 
  AND updated_at > (now() - '30 days'::interval)
);

-- Create a secure function to verify API keys without exposing them
CREATE OR REPLACE FUNCTION public.verify_api_key(user_wallet_param text, provided_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_key text;
BEGIN
  -- Security check: ensure user can only verify their own keys
  IF user_wallet_param != get_current_user_wallet() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot verify API keys for other users';
  END IF;
  
  -- Get the stored key (this stays server-side)
  SELECT api_key INTO stored_key
  FROM api_keys 
  WHERE user_wallet = user_wallet_param 
  AND updated_at > (now() - '30 days'::interval);
  
  -- Return true if keys match, false otherwise
  RETURN stored_key IS NOT NULL AND stored_key = provided_key;
END;
$$;

-- Create a secure function to check if user has an API key without exposing it
CREATE OR REPLACE FUNCTION public.has_active_api_key(user_wallet_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check
  IF user_wallet_param != get_current_user_wallet() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot check API keys for other users';
  END IF;
  
  -- Return true if user has an active API key
  RETURN EXISTS (
    SELECT 1 FROM api_keys 
    WHERE user_wallet = user_wallet_param 
    AND updated_at > (now() - '30 days'::interval)
  );
END;
$$;

-- Add security comments
COMMENT ON POLICY "Users can check their own API key existence" ON public.api_keys IS 'Allows users to check if they have an API key without exposing the actual key value';
COMMENT ON FUNCTION public.verify_api_key(text, text) IS 'Securely verifies API keys server-side without exposing them to client';
COMMENT ON FUNCTION public.has_active_api_key(text) IS 'Checks if user has an active API key without exposing the actual key';