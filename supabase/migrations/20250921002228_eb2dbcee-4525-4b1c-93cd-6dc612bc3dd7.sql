-- Security Definer 뷰 경고 해결: 일반 뷰로 재생성
-- 기존 뷰들 삭제 후 일반 뷰로 재생성

DROP VIEW IF EXISTS public.idols_basic_public;
DROP VIEW IF EXISTS public.idols_public;

-- 기본 공개 정보만 포함하는 안전한 뷰 (Security Definer 없이)
CREATE VIEW public.idols_basic_public AS
SELECT 
  id,
  name,
  profile_image,
  created_at
FROM public.idolsx;

-- 기존 idols 테이블의 안전한 공개 뷰
CREATE VIEW public.idols_public AS
SELECT 
  id,
  name,
  "Gender" as gender,
  "Category" as category,
  "Concept" as concept,
  profile_image,
  created_at
FROM public.idols;

-- 뷰에 대한 적절한 권한 설정
GRANT SELECT ON public.idols_basic_public TO anon;
GRANT SELECT ON public.idols_basic_public TO authenticated;
GRANT SELECT ON public.idols_public TO anon;
GRANT SELECT ON public.idols_public TO authenticated;

-- 추가 보안: idolsx 테이블의 민감한 컬럼 접근 제한을 위한 함수
CREATE OR REPLACE FUNCTION public.get_safe_idol_data(idol_id bigint)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', id,
    'name', name,
    'profile_image', profile_image,
    'created_at', created_at
  )
  FROM public.idolsx
  WHERE id = idol_id;
$$;