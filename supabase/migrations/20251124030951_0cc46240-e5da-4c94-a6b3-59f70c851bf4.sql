-- Phase 1: Create photocards table
CREATE TABLE IF NOT EXISTS public.photocards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  idol_id INTEGER NOT NULL,
  idol_name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('N', 'R', 'SR', 'SSR')),
  concept TEXT NOT NULL,
  season TEXT NOT NULL,
  serial_no INTEGER NOT NULL,
  total_supply INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  persona_prompt TEXT,
  walrus_blob_id TEXT,
  is_public BOOLEAN DEFAULT true,
  hearts_received INTEGER DEFAULT 0,
  floor_price DECIMAL,
  last_sale_price DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for photocards
CREATE INDEX IF NOT EXISTS idx_photocards_user_wallet ON public.photocards(user_wallet);
CREATE INDEX IF NOT EXISTS idx_photocards_idol_id ON public.photocards(idol_id);
CREATE INDEX IF NOT EXISTS idx_photocards_rarity ON public.photocards(rarity);

-- Enable RLS for photocards
ALTER TABLE public.photocards ENABLE ROW LEVEL SECURITY;

-- RLS policies for photocards
CREATE POLICY "Users can view their own and public photocards"
  ON public.photocards FOR SELECT
  USING (user_wallet = get_current_user_wallet() OR is_public = true);

CREATE POLICY "Users can insert their own photocards"
  ON public.photocards FOR INSERT
  WITH CHECK (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can update their own photocards"
  ON public.photocards FOR UPDATE
  USING (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can delete their own photocards"
  ON public.photocards FOR DELETE
  USING (user_wallet = get_current_user_wallet());

-- Phase 2: Create photocard_videos table
CREATE TABLE IF NOT EXISTS public.photocard_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photocard_id UUID REFERENCES public.photocards(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_blob_id TEXT,
  duration_seconds INTEGER DEFAULT 5,
  generation_cost_sui DECIMAL DEFAULT 0.15,
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for photocard_videos
CREATE INDEX IF NOT EXISTS idx_photocard_videos_photocard_id ON public.photocard_videos(photocard_id);
CREATE INDEX IF NOT EXISTS idx_photocard_videos_user_wallet ON public.photocard_videos(user_wallet);

-- Enable RLS for photocard_videos
ALTER TABLE public.photocard_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for photocard_videos
CREATE POLICY "Users can view their own photocard videos"
  ON public.photocard_videos FOR SELECT
  USING (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can insert their own photocard videos"
  ON public.photocard_videos FOR INSERT
  WITH CHECK (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can update their own photocard videos"
  ON public.photocard_videos FOR UPDATE
  USING (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can delete their own photocard videos"
  ON public.photocard_videos FOR DELETE
  USING (user_wallet = get_current_user_wallet());