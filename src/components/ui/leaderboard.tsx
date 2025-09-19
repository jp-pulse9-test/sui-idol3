import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Crown, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  fanPoints: number;
  randomBoxOpens: number;
  photocardRarityScore: number;
  tradingContribution: number;
  badges: string[];
  avatar?: string;
}

interface LeaderboardProps {
  currentUser?: LeaderboardEntry;
  globalLeaderboard: LeaderboardEntry[];
  idolSpecificLeaderboard: LeaderboardEntry[];
  selectedIdolId?: string;
}

export const Leaderboard = ({ 
  currentUser, 
  globalLeaderboard, 
  idolSpecificLeaderboard,
  selectedIdolId 
}: LeaderboardProps) => {
  const [activeTab, setActiveTab] = useState("global");

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-4 h-4 text-muted-foreground" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-primary text-white";
    if (rank <= 10) return "bg-accent/20 text-accent";
    return "bg-muted/20 text-muted-foreground";
  };

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, isCurrentUser: boolean = false) => (
    <Card
      key={entry.walletAddress}
      className={`p-4 border transition-all duration-300 ${
        isCurrentUser 
          ? 'glass-dark border-primary/30 bg-primary/5 ring-1 ring-primary/20' 
          : 'glass-dark border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex items-center gap-2">
          {getRankIcon(entry.rank)}
          <Badge className={`${getRankBadgeColor(entry.rank)} font-bold px-3 py-1`}>
            #{entry.rank}
          </Badge>
        </div>

        {/* Avatar & Info */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary/20 flex items-center justify-center">
            {entry.avatar ? (
              <img src={entry.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Star className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-foreground">
              {formatWalletAddress(entry.walletAddress)}
              {isCurrentUser && <Badge variant="secondary" className="ml-2 text-xs">나</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              팬 포인트: {entry.fanPoints.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <div className="text-center">
            <div className="font-semibold text-foreground">{entry.randomBoxOpens}</div>
            <div>박스개봉</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{entry.photocardRarityScore}</div>
            <div>희귀점수</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{entry.tradingContribution}</div>
            <div>거래기여</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-1">
          {entry.badges.slice(0, 3).map((badge, index) => (
            <div key={index} className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
              {badge === "debut" && "🎤"}
              {badge === "collector" && "💎"}
              {badge === "trader" && "💰"}
              {badge === "fan" && "❤️"}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8" />
          팬 리더보드
        </h2>
        <p className="text-muted-foreground">
          주간 팬 포인트 기준 랭킹 · 시즌 보상은 매주 지급됩니다
        </p>
      </div>

      {/* Current User Rank Card */}
      {currentUser && (
        <Card className="p-6 glass-dark border-primary/20 bg-primary/5">
          <div className="space-y-3">
            <h3 className="text-lg font-bold gradient-text">내 랭킹</h3>
            {renderLeaderboardEntry(currentUser, true)}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">다음 랭크까지</span>
                <span className="text-primary font-semibold">
                  {currentUser.rank > 1 ? 
                    `${(globalLeaderboard[currentUser.rank - 2]?.fanPoints || 0) - currentUser.fanPoints} 포인트` 
                    : "1위 유지!"
                  }
                </span>
              </div>
              <Progress 
                value={currentUser.rank > 1 ? 
                  (currentUser.fanPoints / (globalLeaderboard[currentUser.rank - 2]?.fanPoints || currentUser.fanPoints + 1)) * 100 
                  : 100
                } 
                className="h-2"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="global" className="data-[state=active]:bg-primary/20">
            🌍 전체 랭킹
          </TabsTrigger>
          <TabsTrigger value="idol" className="data-[state=active]:bg-primary/20">
            ⭐ 아이돌별 랭킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-3 mt-6">
          <div className="space-y-3">
            {globalLeaderboard.slice(0, 100).map((entry) => 
              renderLeaderboardEntry(entry, currentUser?.walletAddress === entry.walletAddress)
            )}
          </div>
        </TabsContent>

        <TabsContent value="idol" className="space-y-3 mt-6">
          {selectedIdolId ? (
            <div className="space-y-3">
              <div className="text-center p-4 bg-card/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  현재 선택된 아이돌의 팬 랭킹입니다
                </p>
              </div>
              {idolSpecificLeaderboard.slice(0, 100).map((entry) => 
                renderLeaderboardEntry(entry, currentUser?.walletAddress === entry.walletAddress)
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-card/30 rounded-lg">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                아이돌을 선택하면 해당 아이돌의 팬 랭킹을 확인할 수 있습니다
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Season Info */}
      <Card className="p-6 glass-dark border-accent/20 bg-accent/5">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="text-accent border-accent/30">
            🏆 시즌 1 진행 중
          </Badge>
          <h3 className="text-lg font-bold">주간 보상</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-2xl">🥇</div>
              <div className="font-semibold">1위</div>
              <div className="text-muted-foreground">Legend Badge</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🥈</div>
              <div className="font-semibold">2-10위</div>
              <div className="text-muted-foreground">Gold Frame</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🥉</div>
              <div className="font-semibold">11-100위</div>
              <div className="text-muted-foreground">Silver Badge</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};