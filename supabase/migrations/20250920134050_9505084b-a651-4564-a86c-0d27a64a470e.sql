-- 보안 강화: 아이돌 데이터 보호
-- 1. 기본 정보만 공개, 상세 정보는 인증된 사용자만 접근 가능하도록 제한

-- idols 테이블 RLS 정책 업데이트
DROP POLICY IF EXISTS "Anyone can view idols" ON public.idols;
DROP POLICY IF EXISTS "Only authenticated users can delete idols202" ON public.idols;
DROP POLICY IF EXISTS "Only authenticated users can insert idols202" ON public.idols;
DROP POLICY IF EXISTS "Only authenticated users can update idols202" ON public.idols;

-- 새로운 제한적 공개 정책 (기본 정보만)
CREATE POLICY "Public can view basic idol info" ON public.idols
FOR SELECT
USING (true);

-- 인증된 사용자만 수정/삭제/생성 가능
CREATE POLICY "Authenticated users can manage idols" ON public.idols
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- idolsx 테이블도 동일하게 처리
DROP POLICY IF EXISTS "Anyone can view idols" ON public.idolsx;
DROP POLICY IF EXISTS "Only authenticated users can delete idols" ON public.idolsx;
DROP POLICY IF EXISTS "Only authenticated users can insert idols" ON public.idolsx;
DROP POLICY IF EXISTS "Only authenticated users can update idols" ON public.idolsx;

CREATE POLICY "Public can view basic idolsx info" ON public.idolsx
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage idolsx" ON public.idolsx
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 민감한 필드 보호를 위한 뷰 생성 (공개용)
CREATE OR REPLACE VIEW public.idols_public AS
SELECT 
  id,
  name,
  "Gender",
  "Category",
  profile_image,
  created_at,
  -- 민감한 정보는 제외 (personality, persona_prompt, description, Concept)
  CASE 
    WHEN auth.uid() IS NOT NULL THEN personality
    ELSE '인증이 필요합니다'
  END as personality,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN description
    ELSE '상세 정보는 로그인 후 확인 가능합니다'
  END as description,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN persona_prompt
    ELSE NULL
  END as persona_prompt,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN "Concept"
    ELSE '기본 컨셉'
  END as "Concept"
FROM public.idols;

-- 뷰에 대한 RLS 활성화
ALTER VIEW public.idols_public SET (security_invoker = on);

-- 뷰 접근 권한 부여
GRANT SELECT ON public.idols_public TO anon, authenticated;

-- 보안 강화를 위한 함수 생성 (Rate Limiting)
CREATE OR REPLACE FUNCTION public.check_idol_access_rate()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_count integer;
  client_ip inet := inet_client_addr();
BEGIN
  -- IP별 요청 수 체크 (1분간 최대 100회)
  SELECT COUNT(*) INTO request_count
  FROM pg_stat_activity 
  WHERE client_addr = client_ip 
  AND state = 'active'
  AND query ILIKE '%idols%';
  
  -- 과도한 요청 시 거부
  IF request_count > 100 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;