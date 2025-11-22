import { supabase } from '@/integrations/supabase/client';

export const rewardPoolUpdateService = {
  async updateParticipantScore(
    eventType: 'vri_update' | 'purchase' | 'mission_complete',
    metadata?: {
      vriIncrease?: number;
      purchaseAmount?: number;
      missionId?: string;
    }
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user for reward pool update');
        return;
      }

      const { error } = await supabase.functions.invoke('update-participant-score', {
        body: {
          userId: user.id,
          eventType,
          metadata
        }
      });

      if (error) {
        console.error('Failed to update participant score:', error);
      } else {
        console.log(`Participant score updated for event: ${eventType}`);
      }
    } catch (error) {
      console.error('Error calling update-participant-score:', error);
    }
  }
};
