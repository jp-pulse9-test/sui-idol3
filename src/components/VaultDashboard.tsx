import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Coins, Gift, TrendingUp } from "lucide-react";

interface VaultDashboardProps {
  photoCardCount: number;
  todayCards: number;
  rarityStats: {
    N: number;
    R: number;
    SR: number;
    SSR: number;
  };
  dailyFreeStatus: {
    canClaim: boolean;
    userHasClaimedToday: boolean;
  };
  suiCoins: number;
  fanHearts: number;
}

export const VaultDashboard = ({
  photoCardCount,
  todayCards,
  rarityStats,
  dailyFreeStatus,
  suiCoins,
  fanHearts
}: VaultDashboardProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Total Cards</span>
          </div>
          <p className="text-2xl font-bold">{photoCardCount}</p>
          {todayCards > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{todayCards} today
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Coins className="w-4 h-4" />
            <span>SUI Coins</span>
          </div>
          <p className="text-2xl font-bold">{suiCoins.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Heart className="w-4 h-4" />
            <span>Fan Hearts</span>
          </div>
          <p className="text-2xl font-bold">{fanHearts}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Gift className="w-4 h-4" />
            <span>Free Box</span>
          </div>
          <p className="text-xl font-bold">
            {dailyFreeStatus.canClaim ? '✅ Available' : '❌ Used'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
