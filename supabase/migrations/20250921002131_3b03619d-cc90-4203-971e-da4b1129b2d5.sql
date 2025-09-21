-- 기존의 과도하게 관대한 RLS 정책 제거
DROP POLICY IF EXISTS "Public can view basic idolsx info" ON public.idolsx;
DROP POLICY IF EXISTS "Authenticated users can manage idolsx" ON public.idolsx;

-- 민감한 컬럼은 제외하고 기본 정보만 접근 가능하도록 뷰 생성
CREATE OR REPLACE VIEW public.idols_basic_public AS
SELECT 
  id,
  name,
  profile_image,
  created_at
FROM public.idolsx;

-- 뷰에 대한 접근 권한 설정 (누구나 볼 수 있음)
GRANT SELECT ON public.idols_basic_public TO anon;
GRANT SELECT ON public.idols_basic_public TO authenticated;

-- 인증된 사용자만 전체 데이터 접근 가능
CREATE POLICY "Authenticated users can view full idol data" ON public.idolsx
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 인증된 사용자만 데이터 삽입 가능
CREATE POLICY "Authenticated users can insert idols" ON public.idolsx
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 인증된 사용자만 데이터 수정 가능
CREATE POLICY "Authenticated users can update idols" ON public.idolsx
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 인증된 사용자만 데이터 삭제 가능
CREATE POLICY "Authenticated users can delete idols" ON public.idolsx
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- 기존 idols_public 뷰도 보안 강화 (민감한 데이터 제외)
DROP VIEW IF EXISTS public.idols_public;
CREATE OR REPLACE VIEW public.idols_public AS
SELECT 
  id,
  name,
  "Gender" as gender,
  "Category" as category,
  "Concept" as concept,
  profile_image,
  created_at
FROM public.idols;

-- idols_public 뷰 접근 권한
GRANT SELECT ON public.idols_public TO anon;
GRANT SELECT ON public.idols_public TO authenticated;