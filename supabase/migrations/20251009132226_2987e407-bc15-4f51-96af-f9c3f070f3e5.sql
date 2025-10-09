-- Enable Row Level Security on api_keys table
-- This is CRITICAL: The table has policies but RLS was never enabled
-- Without this, anyone can read all API keys including Google GenAI service keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Verify that the existing policies are still in place
-- (They should already exist, but let's ensure the SELECT policy is restrictive)
-- This policy ensures users can only see their own API keys
DROP POLICY IF EXISTS "Users can check their own API key existence" ON public.api_keys;
CREATE POLICY "Users can check their own API key existence" 
ON public.api_keys 
FOR SELECT 
USING (
  user_wallet = get_current_user_wallet() 
  AND updated_at > (now() - '30 days'::interval)
);

-- Add a comment to document the security requirement
COMMENT ON TABLE public.api_keys IS 'SECURITY CRITICAL: This table contains sensitive API keys. RLS MUST remain enabled at all times. Keys should be encrypted and only accessible to their owners.';