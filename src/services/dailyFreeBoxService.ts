import { supabase } from '@/integrations/supabase/client';

interface DailyFreeBoxStatus {
  totalClaimsToday: number;
  userHasClaimedToday: boolean;
  canClaim: boolean;
  maxDailyClaims: number;
  remainingSlots: number;
}

interface ClaimResult {
  success: boolean;
  error?: string;
  totalClaimsToday: number;
  remainingSlots: number;
}

export const dailyFreeBoxService = {
  async getStatus(userWallet: string): Promise<DailyFreeBoxStatus> {
    const { data, error } = await supabase.rpc('get_daily_free_box_status', {
      user_wallet_param: userWallet
    });

    if (error) {
      console.error('Error getting daily free box status:', error);
      throw new Error('Failed to get daily free box status');
    }

    return data as unknown as DailyFreeBoxStatus;
  },

  async claimFreeBox(userWallet: string): Promise<ClaimResult> {
    const { data, error } = await supabase.rpc('claim_daily_free_box', {
      user_wallet_param: userWallet
    });

    if (error) {
      console.error('Error claiming daily free box:', error);
      throw new Error('Failed to claim daily free box');
    }

    return data as unknown as ClaimResult;
  }
};