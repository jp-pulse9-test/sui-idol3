-- 아이돌 데이터를 누구나 볼 수 있도록 RLS 정책 수정
DROP POLICY IF EXISTS "Authenticated users can view idols" ON public.idols;

-- 새로운 정책: 아이돌 데이터는 공개 데이터로 누구나 볼 수 있음
CREATE POLICY "Anyone can view idols" 
ON public.idols 
FOR SELECT 
USING (true);