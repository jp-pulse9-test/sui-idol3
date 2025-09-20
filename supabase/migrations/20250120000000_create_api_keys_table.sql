-- Create api_keys table for storing API keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL UNIQUE,
  key TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read API keys
CREATE POLICY "Allow authenticated users to read API keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (true);

-- Only allow service role to update API keys
CREATE POLICY "Only service role can insert API keys"
ON public.api_keys
FOR INSERT
TO service_role
USING (true);

CREATE POLICY "Only service role can update API keys"
ON public.api_keys
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Only service role can delete API keys"
ON public.api_keys
FOR DELETE
TO service_role
USING (true);

-- Insert Google GenAI API key placeholder
-- Replace 'your-google-genai-api-key-here' with actual API key
INSERT INTO public.api_keys (service, key, description)
VALUES (
  'google_genai',
  'your-google-genai-api-key-here',
  'Google Generative AI (Gemini) API key for photocard generation'
)
ON CONFLICT (service) DO UPDATE
SET
  key = EXCLUDED.key,
  updated_at = NOW();

-- Add comment
COMMENT ON TABLE public.api_keys IS 'Stores API keys for various external services';
COMMENT ON COLUMN public.api_keys.service IS 'Service identifier (e.g., google_genai, openai, etc.)';
COMMENT ON COLUMN public.api_keys.key IS 'API key value (encrypted in production)';
COMMENT ON COLUMN public.api_keys.is_active IS 'Whether the API key is currently active';