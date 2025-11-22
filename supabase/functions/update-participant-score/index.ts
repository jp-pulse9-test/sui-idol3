import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateScoreRequest {
  userId: string;
  eventType: 'vri_update' | 'purchase' | 'mission_complete';
  metadata?: {
    vriIncrease?: number;
    purchaseAmount?: number;
    missionId?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, eventType, metadata }: UpdateScoreRequest = await req.json();

    console.log(`Processing ${eventType} for user ${userId}`, metadata);

    // Get all active reward pools
    const { data: activePools, error: poolsError } = await supabase
      .from('reward_pools')
      .select('*')
      .eq('status', 'active');

    if (poolsError) {
      console.error('Error fetching active pools:', poolsError);
      throw poolsError;
    }

    console.log(`Found ${activePools?.length || 0} active pools`);

    // Get user's current VRI
    const { data: userVri, error: vriError } = await supabase
      .from('user_vri')
      .select('total_vri')
      .eq('user_id', userId)
      .maybeSingle();

    if (vriError) {
      console.error('Error fetching user VRI:', vriError);
    }

    // Get user's total purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchase_history')
      .select('amount_sui')
      .eq('user_id', userId);

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
    }

    const totalPurchases = purchases?.reduce((sum, p) => sum + parseFloat(p.amount_sui as any), 0) || 0;

    // Get user's completed missions count
    const { data: branchProgress, error: branchError } = await supabase
      .from('branch_progress')
      .select('completed_missions')
      .eq('user_id', userId);

    if (branchError) {
      console.error('Error fetching branch progress:', branchError);
    }

    const totalMissions = branchProgress?.reduce((sum, bp) => {
      const missions = bp.completed_missions as any[];
      return sum + (missions?.length || 0);
    }, 0) || 0;

    // Get user's hearts given (from purchase_history metadata)
    const { data: heartPurchases, error: heartsError } = await supabase
      .from('purchase_history')
      .select('quantity')
      .eq('user_id', userId)
      .eq('purchase_type', 'fan_hearts');

    if (heartsError) {
      console.error('Error fetching heart purchases:', heartsError);
    }

    const totalHeartsPurchased = heartPurchases?.reduce((sum, h) => sum + (h.quantity || 0), 0) || 0;

    // Get boxes purchased
    const { data: boxPurchases, error: boxError } = await supabase
      .from('purchase_history')
      .select('quantity')
      .eq('user_id', userId)
      .eq('purchase_type', 'random_box');

    if (boxError) {
      console.error('Error fetching box purchases:', boxError);
    }

    const totalBoxes = boxPurchases?.reduce((sum, b) => sum + (b.quantity || 0), 0) || 0;

    // Calculate participation score
    const vriContributed = userVri?.total_vri || 0;
    const participationScore = vriContributed + Math.floor(totalPurchases * 1000);

    console.log('Calculated scores:', {
      vriContributed,
      totalPurchases,
      totalMissions,
      totalBoxes,
      totalHeartsPurchased,
      participationScore
    });

    // Update or insert participant records for all active pools
    const updates = [];
    for (const pool of activePools || []) {
      const { error: upsertError } = await supabase
        .from('pool_participants')
        .upsert({
          pool_id: pool.id,
          user_id: userId,
          participation_score: participationScore,
          vri_contributed: vriContributed,
          hearts_given: 0, // TODO: Track actual hearts given to idols
          hearts_purchased: totalHeartsPurchased,
          missions_completed: totalMissions,
          total_purchases: totalPurchases,
          boxes_purchased: totalBoxes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'pool_id,user_id'
        });

      if (upsertError) {
        console.error(`Error updating pool ${pool.id}:`, upsertError);
      } else {
        console.log(`Updated participant score for pool ${pool.id}`);
        updates.push(pool.id);
      }
    }

    // Update community pool progress if applicable
    for (const pool of activePools || []) {
      if (pool.pool_type === 'community_goal') {
        // Recalculate total progress
        const { data: participants } = await supabase
          .from('pool_participants')
          .select('participation_score, total_purchases')
          .eq('pool_id', pool.id);

        const totalScore = participants?.reduce((sum, p) => sum + (p.participation_score || 0), 0) || 0;
        const totalPurchasesSum = participants?.reduce((sum, p) => sum + parseFloat(p.total_purchases as any || 0), 0) || 0;

        await supabase
          .from('reward_pools')
          .update({
            current_value: totalScore + Math.floor(totalPurchasesSum * 1000)
          })
          .eq('id', pool.id);

        console.log(`Updated community pool ${pool.id} progress to ${totalScore}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        poolsUpdated: updates.length,
        participationScore,
        vriContributed,
        totalPurchases
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-participant-score:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
