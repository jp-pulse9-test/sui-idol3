import { supabase } from '@/integrations/supabase/client';
import { rewardPoolUpdateService } from './rewardPoolUpdateService';

export interface PurchaseRecord {
  purchase_type: 'random_box' | 'fan_hearts' | 'photocard_key';
  item_name: string;
  amount_sui: number;
  quantity?: number;
  metadata?: Record<string, any>;
}

export const purchaseHistoryService = {
  async recordPurchase(purchase: PurchaseRecord): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user for purchase tracking');
      return;
    }

    const userWallet = localStorage.getItem('currentWallet') || '';

    const { error } = await supabase
      .from('purchase_history')
      .insert({
        user_id: user.id,
        user_wallet: userWallet,
        purchase_type: purchase.purchase_type,
        item_name: purchase.item_name,
        amount_sui: purchase.amount_sui,
        quantity: purchase.quantity || 1,
        metadata: purchase.metadata || {}
      });

    if (error) {
      console.error('Failed to record purchase:', error);
    } else {
      // Update participant scores in active reward pools
      await rewardPoolUpdateService.updateParticipantScore('purchase', {
        purchaseAmount: purchase.amount_sui
      });
    }
  },

  async getUserPurchaseHistory(limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('purchase_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch purchase history:', error);
      return [];
    }

    return data || [];
  },

  async getTotalPurchases() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return 0;

    const { data, error } = await supabase
      .from('purchase_history')
      .select('amount_sui')
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to fetch total purchases:', error);
      return 0;
    }

    return data?.reduce((sum, record) => sum + parseFloat(record.amount_sui as any), 0) || 0;
  }
};
