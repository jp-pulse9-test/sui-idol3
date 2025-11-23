-- Add beat tracking to episode progress
-- This will allow us to explicitly track which story beat the player is on

-- Create episode_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.episode_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  current_turn INTEGER NOT NULL DEFAULT 1,
  current_beat TEXT NOT NULL DEFAULT 'hook',
  choices_made JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, episode_id, mission_id)
);

-- Enable RLS
ALTER TABLE public.episode_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own episode progress"
  ON public.episode_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own episode progress"
  ON public.episode_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episode progress"
  ON public.episode_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episode progress"
  ON public.episode_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_episode_progress_user_episode 
  ON public.episode_progress(user_id, episode_id, mission_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_episode_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER episode_progress_updated_at
  BEFORE UPDATE ON public.episode_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_episode_progress_updated_at();