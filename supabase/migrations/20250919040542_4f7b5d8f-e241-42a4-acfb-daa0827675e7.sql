-- Fix critical security vulnerabilities: Multiple tables exposed to public access
-- This migration secures all user-related data with proper RLS policies

-- Fix vaults table - users should only access their own vaults
DROP POLICY IF EXISTS "Allow all access" ON public.vaults;

CREATE POLICY "Users can view their own vaults" 
ON public.vaults 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaults" 
ON public.vaults 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaults" 
ON public.vaults 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaults" 
ON public.vaults 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix story_sessions table - users should only access sessions for their vaults
DROP POLICY IF EXISTS "Allow all access" ON public.story_sessions;

CREATE POLICY "Users can view their own story sessions" 
ON public.story_sessions 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can insert their own story sessions" 
ON public.story_sessions 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can update their own story sessions" 
ON public.story_sessions 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can delete their own story sessions" 
ON public.story_sessions 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

-- Fix chat_logs table - users should only access chat logs for their vaults
DROP POLICY IF EXISTS "Allow all access" ON public.chat_logs;

CREATE POLICY "Users can view their own chat logs" 
ON public.chat_logs 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can insert their own chat logs" 
ON public.chat_logs 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can update their own chat logs" 
ON public.chat_logs 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can delete their own chat logs" 
ON public.chat_logs 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

-- Fix memory_cards table - users should only access memory cards for their vaults
DROP POLICY IF EXISTS "Allow all access" ON public.memory_cards;

CREATE POLICY "Users can view their own memory cards" 
ON public.memory_cards 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can insert their own memory cards" 
ON public.memory_cards 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can update their own memory cards" 
ON public.memory_cards 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can delete their own memory cards" 
ON public.memory_cards 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

-- Fix idol_cards table - users should only access idol cards for their vaults
DROP POLICY IF EXISTS "Allow all access" ON public.idol_cards;

CREATE POLICY "Users can view their own idol cards" 
ON public.idol_cards 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can insert their own idol cards" 
ON public.idol_cards 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can update their own idol cards" 
ON public.idol_cards 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can delete their own idol cards" 
ON public.idol_cards 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

-- Fix debut_cards table - users should only access debut cards for their vaults
DROP POLICY IF EXISTS "Allow all access" ON public.debut_cards;

CREATE POLICY "Users can view their own debut cards" 
ON public.debut_cards 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can insert their own debut cards" 
ON public.debut_cards 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can update their own debut cards" 
ON public.debut_cards 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can delete their own debut cards" 
ON public.debut_cards 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

-- Fix debut_badges table - users should only access debut badges for their vaults
DROP POLICY IF EXISTS "Allow all access" ON public.debut_badges;

CREATE POLICY "Users can view their own debut badges" 
ON public.debut_badges 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can insert their own debut badges" 
ON public.debut_badges 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can update their own debut badges" 
ON public.debut_badges 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

CREATE POLICY "Users can delete their own debut badges" 
ON public.debut_badges 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.vaults WHERE id = vault_id));

-- Keep idols table publicly readable since it contains game content, not user data
-- But restrict write access to authenticated users only
DROP POLICY IF EXISTS "Allow all access" ON public.idols;

CREATE POLICY "Anyone can view idols" 
ON public.idols 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can insert idols" 
ON public.idols 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update idols" 
ON public.idols 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can delete idols" 
ON public.idols 
FOR DELETE 
TO authenticated
USING (true);