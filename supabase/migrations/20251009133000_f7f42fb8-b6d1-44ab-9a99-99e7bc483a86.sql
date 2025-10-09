-- Restrict public access to proprietary AI character data in idols table
-- 1) Ensure RLS is enabled
ALTER TABLE public.idols ENABLE ROW LEVEL SECURITY;

-- 2) Remove overly permissive public read policy
DROP POLICY IF EXISTS "Allow public read access" ON public.idols;

-- 3) (Optional) Keep/selective policies already in place that require authentication
-- The policy "Only authenticated users can view full idol data" should remain active.

-- 4) Document security requirement
COMMENT ON TABLE public.idols IS 'SECURITY: Proprietary AI character data (persona prompts, personality, descriptions). Public SELECT is prohibited. Use SECURITY DEFINER RPC get_public_idol_data() for public, non-sensitive fields.';