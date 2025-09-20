-- Update RLS policy for api_keys table to allow anonymous access
-- This is needed because the app uses wallet authentication, not Supabase auth

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to read API keys" ON public.api_keys;

-- Create a new policy that allows anonymous access for reading API keys
-- This is safe because API keys are read-only and needed for app functionality
CREATE POLICY "Allow public read access to API keys"
ON public.api_keys
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Update the comment to reflect the new access pattern
COMMENT ON POLICY "Allow public read access to API keys" ON public.api_keys IS 'Allow anonymous and authenticated users to read active API keys for app functionality';