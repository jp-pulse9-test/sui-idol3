import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, TrendingUp, Clock } from 'lucide-react';
import { rewardPoolService, RewardPool, PoolParticipant } from '@/services/rewardPoolService';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityGoalPoolProps {
  poolId?: string;
}

export const CommunityGoalPool = ({ poolId }: CommunityGoalPoolProps) => {
  const { user } = useAuth();
  const [pool, setPool] = useState<RewardPool | null>(null);
  const [participation, setParticipation] = useState<PoolParticipant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoolData();
  }, [poolId, user]);

  const loadPoolData = async () => {
    setLoading(true);
    
    // Get first active community goal pool if no poolId specified
    const pools = await rewardPoolService.getActivePools();
    const communityPool = poolId 
      ? pools.find(p => p.id === poolId)
      : pools.find(p => p.pool_type === 'community_goal');

    if (communityPool) {
      setPool(communityPool);
      
      if (user) {
        const userParticipation = await rewardPoolService.getUserParticipation(communityPool.id);
        setParticipation(userParticipation);
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (!pool) {
    return null;
  }

  const progress = pool.target_value 
    ? ((pool.current_value || 0) / pool.target_value) * 100 
    : 0;

  const daysRemaining = Math.ceil(
    (new Date(pool.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const rewardMetadata = pool.reward_metadata as any || {};

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">{pool.pool_name}</h3>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Community Goal
          </Badge>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{daysRemaining}d remaining</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Community Progress</span>
          <span className="text-primary font-bold">{progress.toFixed(1)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{(pool.current_value || 0).toLocaleString()}</span>
          <span>{pool.target_value?.toLocaleString()} Goal</span>
        </div>
      </div>

      {/* Rewards */}
      <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/50">
        <p className="text-sm font-semibold text-muted-foreground">🎁 Rewards (When Goal Reached)</p>
        <div className="space-y-2 text-sm">
          {rewardMetadata.sui_amount && (
            <div className="flex items-center gap-2">
              <span className="text-primary">💎</span>
              <span>{rewardMetadata.sui_amount} SUI for all participants</span>
            </div>
          )}
          {rewardMetadata.nft_name && (
            <div className="flex items-center gap-2">
              <span className="text-primary">🏆</span>
              <span>{rewardMetadata.nft_name} NFT Badge</span>
            </div>
          )}
          {rewardMetadata.exclusive_idol && (
            <div className="flex items-center gap-2">
              <span className="text-primary">⭐</span>
              <span>Exclusive Limited Idol (Top 100)</span>
            </div>
          )}
        </div>
      </div>

      {/* User Contribution */}
      {participation && (
        <div className="space-y-2 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Your Contribution
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">VRI Contributed</p>
              <p className="font-bold text-lg">{participation.vri_contributed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Purchases</p>
              <p className="font-bold text-lg">{participation.total_purchases.toFixed(2)} SUI</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total Score: {participation.participation_score.toLocaleString()}
          </p>
        </div>
      )}

      {/* Eligibility Status */}
      {user && (
        <div className="text-center text-sm">
          {participation && participation.participation_score >= (pool.min_participation_score || 0) ? (
            <Badge variant="default" className="gap-1">
              ✓ Eligible for Rewards
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              Need {(pool.min_participation_score || 0) - (participation?.participation_score || 0)} more points
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
};
