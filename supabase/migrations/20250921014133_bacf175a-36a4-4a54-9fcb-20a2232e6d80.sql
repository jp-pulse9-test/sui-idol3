-- Remove the public read access policy that exposes sensitive AI character data
DROP POLICY IF EXISTS "Allow public read access" ON public.idols;

-- Ensure only authenticated users can view the sensitive idol data
-- The existing "Only authenticated users can view full idol data" policy should remain

-- Add a comment to clarify the security reasoning
COMMENT ON TABLE public.idols IS 'Contains proprietary AI character data including persona prompts and personality descriptions. Access restricted to authenticated users only to prevent intellectual property theft.';

-- Verify that public views (idols_public, idols_basic_public) only expose non-sensitive data
-- These views are fine as they only show basic information without persona_prompt/personality