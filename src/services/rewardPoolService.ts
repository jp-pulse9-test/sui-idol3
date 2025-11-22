import { supabase } from '@/integrations/supabase/client';

export interface RewardPool {
  id: string;
  pool_name: string;
  pool_type: 'community_goal' | 'ranking' | 'contribution' | 'season_pass';
  status: 'active' | 'calculating' | 'distributed' | 'expired';
  start_date: string;
  end_date: string;
  target_metric?: string;
  target_value?: number;
  current_value?: number;
  reward_type: string;
  total_reward_amount?: number;
  reward_metadata?: any;
  min_participation_score?: number;
  min_purchase_amount?: number;
}

export interface PoolParticipant {
  id: string;
  pool_id: string;
  user_id: string;
  participation_score: number;
  vri_contributed: number;
  hearts_given: number;
  missions_completed: number;
  total_purchases: number;
  boxes_purchased: number;
  hearts_purchased: number;
  rank?: number;
  reward_earned: number;
  reward_claimed: boolean;
}

export const rewardPoolService = {
  async getActivePools(): Promise<RewardPool[]> {
    const { data, error } = await supabase
      .from('reward_pools')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch active pools:', error);
      return [];
    }

    return (data || []) as RewardPool[];
  },

  async getPoolById(poolId: string): Promise<RewardPool | null> {
    const { data, error } = await supabase
      .from('reward_pools')
      .select('*')
      .eq('id', poolId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch pool:', error);
      return null;
    }

    return data as RewardPool | null;
  },

  async getUserParticipation(poolId: string): Promise<PoolParticipant | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('pool_participants')
      .select('*')
      .eq('pool_id', poolId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch participation:', error);
      return null;
    }

    return data;
  },

  async getTopParticipants(poolId: string, limit = 100): Promise<PoolParticipant[]> {
    const { data, error } = await supabase
      .from('pool_participants')
      .select('*')
      .eq('pool_id', poolId)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch top participants:', error);
      return [];
    }

    return data || [];
  }
};
