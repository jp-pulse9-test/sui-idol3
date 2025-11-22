-- Create reward pools table
CREATE TABLE public.reward_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_name TEXT NOT NULL,
  pool_type TEXT NOT NULL CHECK (pool_type IN ('community_goal', 'ranking', 'contribution', 'season_pass')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'calculating', 'distributed', 'expired')),
  
  -- Period settings
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Goal settings (for community_goal)
  target_metric TEXT,
  target_value BIGINT,
  current_value BIGINT DEFAULT 0,
  
  -- Reward settings
  reward_type TEXT NOT NULL,
  total_reward_amount DECIMAL,
  reward_metadata JSONB DEFAULT '{}',
  
  -- Participation requirements
  min_participation_score INTEGER DEFAULT 0,
  min_purchase_amount DECIMAL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pool participants table
CREATE TABLE public.pool_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.reward_pools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  
  -- Participation scores
  participation_score INTEGER DEFAULT 0,
  vri_contributed INTEGER DEFAULT 0,
  hearts_given INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  
  -- Purchase amounts
  total_purchases DECIMAL DEFAULT 0,
  boxes_purchased INTEGER DEFAULT 0,
  hearts_purchased INTEGER DEFAULT 0,
  
  -- Ranking and rewards
  rank INTEGER,
  reward_earned DECIMAL DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT FALSE,
  reward_claim_tx TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pool_id, user_id)
);

-- Create purchase history table
CREATE TABLE public.purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_wallet TEXT NOT NULL,
  
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('random_box', 'fan_hearts', 'photocard_key')),
  item_name TEXT NOT NULL,
  amount_sui DECIMAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  
  transaction_hash TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reward distributions table
CREATE TABLE public.reward_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.reward_pools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  
  reward_type TEXT NOT NULL,
  reward_amount DECIMAL,
  reward_metadata JSONB DEFAULT '{}',
  
  distribution_tx TEXT,
  distributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reward_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_distributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reward_pools
CREATE POLICY "Everyone can view active reward pools"
  ON public.reward_pools FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage reward pools"
  ON public.reward_pools FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pool_participants
CREATE POLICY "Users can view their own participation"
  ON public.pool_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all participants in active pools"
  ON public.pool_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reward_pools 
    WHERE id = pool_id AND status = 'active'
  ));

CREATE POLICY "System can manage participants"
  ON public.pool_participants FOR ALL
  USING (true);

-- RLS Policies for purchase_history
CREATE POLICY "Users can view their own purchase history"
  ON public.purchase_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON public.purchase_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reward_distributions
CREATE POLICY "Users can view their own rewards"
  ON public.reward_distributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage reward distributions"
  ON public.reward_distributions FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_reward_pools_status ON public.reward_pools(status);
CREATE INDEX idx_reward_pools_dates ON public.reward_pools(start_date, end_date);
CREATE INDEX idx_pool_participants_pool ON public.pool_participants(pool_id);
CREATE INDEX idx_pool_participants_user ON public.pool_participants(user_id);
CREATE INDEX idx_pool_participants_rank ON public.pool_participants(pool_id, rank);
CREATE INDEX idx_purchase_history_user ON public.purchase_history(user_id);
CREATE INDEX idx_purchase_history_date ON public.purchase_history(created_at);
CREATE INDEX idx_reward_distributions_user ON public.reward_distributions(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_reward_pools_updated_at
  BEFORE UPDATE ON public.reward_pools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pool_participants_updated_at
  BEFORE UPDATE ON public.pool_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();