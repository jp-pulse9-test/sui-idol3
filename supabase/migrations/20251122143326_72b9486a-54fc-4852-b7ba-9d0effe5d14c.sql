-- Create table for user's personal Gemini API keys
CREATE TABLE IF NOT EXISTS public.user_gemini_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_gemini_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own keys
CREATE POLICY "Users can view their own Gemini keys"
  ON public.user_gemini_keys
  FOR SELECT
  USING (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can insert their own Gemini keys"
  ON public.user_gemini_keys
  FOR INSERT
  WITH CHECK (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can update their own Gemini keys"
  ON public.user_gemini_keys
  FOR UPDATE
  USING (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can delete their own Gemini keys"
  ON public.user_gemini_keys
  FOR DELETE
  USING (user_wallet = get_current_user_wallet());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_gemini_keys_wallet ON public.user_gemini_keys(user_wallet);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_user_gemini_keys_updated_at
  BEFORE UPDATE ON public.user_gemini_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();