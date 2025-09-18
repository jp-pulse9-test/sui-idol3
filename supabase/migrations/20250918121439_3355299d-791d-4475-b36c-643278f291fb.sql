-- 현재 정책들을 모두 확인하고 삭제
DO $$ 
BEGIN
    -- 기존 정책들을 모두 삭제
    DROP POLICY IF EXISTS "Anyone can create character profiles" ON public.character_profiles;
    DROP POLICY IF EXISTS "Anyone can view character profiles" ON public.character_profiles;
    DROP POLICY IF EXISTS "Anyone can update character profiles" ON public.character_profiles;
    DROP POLICY IF EXISTS "Anyone can delete character profiles" ON public.character_profiles;
    DROP POLICY IF EXISTS "Users can create their own character profiles" ON public.character_profiles;
    DROP POLICY IF EXISTS "Users can view their own character profiles" ON public.character_profiles;
    DROP POLICY IF EXISTS "Users can update their own character profiles" ON public.character_profiles;
    DROP POLICY IF EXISTS "Users can delete their own character profiles" ON public.character_profiles;
END $$;

-- 새로운 임시 정책들 생성 (인증 없이도 사용 가능)
CREATE POLICY "Temporary: Allow all access for character profiles" 
ON public.character_profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);