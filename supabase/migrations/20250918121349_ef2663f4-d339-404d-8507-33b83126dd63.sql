-- 기존 RLS 정책들을 삭제하고 새로운 정책 생성
DROP POLICY IF EXISTS "Users can create their own character profiles" ON public.character_profiles;
DROP POLICY IF EXISTS "Users can view their own character profiles" ON public.character_profiles;
DROP POLICY IF EXISTS "Users can update their own character profiles" ON public.character_profiles;
DROP POLICY IF EXISTS "Users can delete their own character profiles" ON public.character_profiles;

-- 임시로 모든 사용자가 접근할 수 있도록 하는 정책 생성 (인증 구현 전까지)
CREATE POLICY "Anyone can create character profiles" 
ON public.character_profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view character profiles" 
ON public.character_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update character profiles" 
ON public.character_profiles 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete character profiles" 
ON public.character_profiles 
FOR DELETE 
USING (true);