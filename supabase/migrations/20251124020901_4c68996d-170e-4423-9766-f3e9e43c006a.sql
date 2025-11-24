-- Fix Security Definer View issue
-- Drop existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.vri_leaderboard;

-- Recreate view with SECURITY INVOKER (queries as calling user, not view creator)
CREATE VIEW public.vri_leaderboard
WITH (security_invoker = true)
AS
SELECT 
  uv.user_id,
  u.wallet_address,
  uv.total_vri,
  uv.trust_vri,
  uv.empathy_vri,
  uv.love_vri,
  uv.global_rank,
  uv.last_updated,
  (SELECT COUNT(DISTINCT branch_id) 
   FROM branch_progress bp 
   WHERE bp.user_id = uv.user_id AND bp.is_cleared = true) as cleared_branches
FROM user_vri uv
LEFT JOIN users u ON u.id = uv.user_id
ORDER BY uv.total_vri DESC, uv.last_updated ASC;

-- Grant SELECT permissions to anon and authenticated roles
GRANT SELECT ON public.vri_leaderboard TO anon;
GRANT SELECT ON public.vri_leaderboard TO authenticated;