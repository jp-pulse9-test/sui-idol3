import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Star, Crown, Medal, Heart, Users, TrendingUp, ImageIcon } from "lucide-react";

interface IdolLeaderboardEntry {
  rank: number;
  idolId: string;
  idolName: string;
  personality: string;
  profileImage: string;
  totalFans: number;
  totalHearts: number;
  totalPhotocards: number;
  averageRarity: number;
  weeklyGrowth: number;
  category: string;
  concept: string;
}

interface PhotoCard {
  id: string;
  idolId: string;
  idolName: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  mintedAt: string;
  owner: string;
  isPublic: boolean;
  imageUrl: string;
  floorPrice?: number;
  lastSalePrice?: number;
  heartsReceived?: number;
}

interface LeaderboardProps {
  currentIdol?: IdolLeaderboardEntry;
  globalLeaderboard: IdolLeaderboardEntry[];
  categoryLeaderboard: IdolLeaderboardEntry[];
  selectedCategory?: string;
  allPhotocards?: PhotoCard[];
  onIdolClick?: (idolId: string) => void;
}

export const Leaderboard = ({ 
  currentIdol, 
  globalLeaderboard, 
  categoryLeaderboard,
  selectedCategory,
  allPhotocards = [],
  onIdolClick
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'border-yellow-400 bg-yellow-400/10';
      case 'SR': return 'border-purple-400 bg-purple-400/10';
      case 'R': return 'border-blue-400 bg-blue-400/10';
      case 'N': return 'border-gray-400 bg-gray-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const handleIdolClick = (idolId: string, idolName: string) => {
    onIdolClick?.(idolId);
  };

  const renderIdolEntry = (entry: IdolLeaderboardEntry, isCurrentIdol: boolean = false) => {
    const idolPhotocards = allPhotocards.filter(card => card.idolId === entry.idolId && card.isPublic);
    
    return (
      <Card
        key={entry.idolId}
        className={`p-4 border transition-all duration-300 ${
          isCurrentIdol 
            ? 'glass-dark border-primary/30 bg-primary/5 ring-1 ring-primary/20' 
            : 'glass-dark border-white/10 hover:border-white/20 hover:scale-[1.02]'
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

          {/* Idol Profile & Info */}
          <div className="flex-1 flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full overflow-hidden bg-gradient-primary/20 border-2 border-primary/30 cursor-pointer hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                handleIdolClick(entry.idolId, entry.idolName);
              }}
              title="마켓플레이스에서 포토카드 보기"
            >
              <img 
                src={entry.profileImage} 
                alt={entry.idolName} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span 
                  className="font-bold text-foreground text-lg cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIdolClick(entry.idolId, entry.idolName);
                  }}
                  title="마켓플레이스에서 포토카드 보기"
                >
                  {entry.idolName}
                </span>
                {isCurrentIdol && <Badge variant="secondary" className="text-xs">내 최애</Badge>}
                <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                {idolPhotocards.length > 0 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIdolClick(entry.idolId, entry.idolName);
                    }}
                    title="마켓플레이스에서 포토카드 보기"
                  >
                    <ImageIcon className="w-3 h-3" />
                    {idolPhotocards.length}
                  </Badge>
                )}
              </div>
              <div 
                className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIdolClick(entry.idolId, entry.idolName);
                }}
                title="마켓플레이스에서 포토카드 보기"
              >
                {entry.personality} · {entry.concept}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="text-primary font-semibold">{entry.totalFans.toLocaleString()}</span>
                  <span className="text-muted-foreground">팬</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 font-semibold">{entry.totalHearts.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div 
              className="text-center cursor-pointer hover:bg-primary/20 rounded p-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleIdolClick(entry.idolId, entry.idolName);
              }}
              title="마켓플레이스에서 포토카드 보기"
            >
              <div className="font-semibold text-foreground">{entry.totalPhotocards.toLocaleString()}</div>
              <div className="text-muted-foreground text-xs">포토카드</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${entry.averageRarity >= 4 ? 'text-yellow-400' : entry.averageRarity >= 3 ? 'text-purple-400' : entry.averageRarity >= 2 ? 'text-blue-400' : 'text-gray-400'}`}>
                {entry.averageRarity.toFixed(1)}
              </div>
              <div className="text-muted-foreground text-xs">평균희귀도</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="font-semibold text-green-400">+{entry.weeklyGrowth}%</span>
              </div>
              <div className="text-muted-foreground text-xs">주간성장</div>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">
              {(entry.totalFans * 0.6 + entry.totalHearts * 0.3 + entry.totalPhotocards * 0.1).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">인기점수</div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8" />
          아이돌 리더보드
        </h2>
        <p className="text-muted-foreground">
          팬 수와 하트 수를 기준으로 한 아이돌 인기 랭킹 · 프로필, 이름, 포토카드 수를 클릭하면 마켓플레이스로 이동
        </p>
      </div>

      {/* Current Idol Rank Card */}
      {currentIdol && (
        <Card className="p-6 glass-dark border-primary/20 bg-primary/5">
          <div className="space-y-3">
            <h3 className="text-lg font-bold gradient-text">내 최애 아이돌 랭킹</h3>
            {renderIdolEntry(currentIdol, true)}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">다음 랭크까지</span>
                <span className="text-primary font-semibold">
                  {currentIdol.rank > 1 ? 
                    `${(globalLeaderboard[currentIdol.rank - 2]?.totalFans || 0) - currentIdol.totalFans} 팬` 
                    : "1위 유지!"
                  }
                </span>
              </div>
              <Progress 
                value={currentIdol.rank > 1 ? 
                  (currentIdol.totalFans / (globalLeaderboard[currentIdol.rank - 2]?.totalFans || currentIdol.totalFans + 1)) * 100 
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
          <TabsTrigger value="category" className="data-[state=active]:bg-primary/20">
            📂 카테고리별 랭킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-3 mt-6">
          <div className="space-y-3">
            {globalLeaderboard.slice(0, 50).map((entry) => {
              const idolPhotocards = allPhotocards.filter(card => card.idolId === entry.idolId && card.isPublic);
              return (
                <Dialog key={entry.idolId}>
                  <DialogTrigger asChild>
                    {renderIdolEntry(entry, currentIdol?.idolId === entry.idolId)}
                  </DialogTrigger>
                  {idolPhotocards.length > 0 && (
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" />
                          {entry.idolName}의 포토카드 ({idolPhotocards.length}장)
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {idolPhotocards.map((card) => (
                          <Card key={card.id} className={`p-3 ${getRarityColor(card.rarity)}`}>
                            <div className="space-y-2">
                              <div className="aspect-[3/4] bg-gradient-primary/20 rounded-lg overflow-hidden">
                                <img 
                                  src={card.imageUrl} 
                                  alt={`${card.idolName} ${card.concept}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-sm">
                                <div className="font-semibold">{card.concept}</div>
                                <div className="text-xs text-muted-foreground">{card.season}</div>
                                <div className="flex items-center justify-between mt-1">
                                  <Badge variant="outline" className="text-xs">{card.rarity}</Badge>
                                  <div className="text-xs text-muted-foreground">#{card.serialNo}</div>
                                </div>
                                {card.heartsReceived && card.heartsReceived > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Heart className="w-3 h-3 text-red-400" />
                                    <span className="text-xs text-red-400">{card.heartsReceived}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-3 mt-6">
          {selectedCategory ? (
            <div className="space-y-3">
              <div className="text-center p-4 bg-card/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Badge variant="outline" className="mr-2">{selectedCategory}</Badge>
                  카테고리의 아이돌 랭킹입니다
                </p>
              </div>
              {categoryLeaderboard.slice(0, 50).map((entry) => {
                const idolPhotocards = allPhotocards.filter(card => card.idolId === entry.idolId && card.isPublic);
                return (
                  <Dialog key={entry.idolId}>
                    <DialogTrigger asChild>
                      {renderIdolEntry(entry, currentIdol?.idolId === entry.idolId)}
                    </DialogTrigger>
                    {idolPhotocards.length > 0 && (
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            {entry.idolName}의 포토카드 ({idolPhotocards.length}장)
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                          {idolPhotocards.map((card) => (
                            <Card key={card.id} className={`p-3 ${getRarityColor(card.rarity)}`}>
                              <div className="space-y-2">
                                <div className="aspect-[3/4] bg-gradient-primary/20 rounded-lg overflow-hidden">
                                  <img 
                                    src={card.imageUrl} 
                                    alt={`${card.idolName} ${card.concept}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-sm">
                                  <div className="font-semibold">{card.concept}</div>
                                  <div className="text-xs text-muted-foreground">{card.season}</div>
                                  <div className="flex items-center justify-between mt-1">
                                    <Badge variant="outline" className="text-xs">{card.rarity}</Badge>
                                    <div className="text-xs text-muted-foreground">#{card.serialNo}</div>
                                  </div>
                                  {card.heartsReceived && card.heartsReceived > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Heart className="w-3 h-3 text-red-400" />
                                      <span className="text-xs text-red-400">{card.heartsReceived}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 bg-card/30 rounded-lg">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                카테고리를 선택하면 해당 카테고리의 아이돌 랭킹을 확인할 수 있습니다
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
          <h3 className="text-lg font-bold">월간 아이돌 어워드</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-2xl">👑</div>
              <div className="font-semibold">1위</div>
              <div className="text-muted-foreground">Hall of Fame</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">⭐</div>
              <div className="font-semibold">2-5위</div>
              <div className="text-muted-foreground">Rising Star</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">💎</div>
              <div className="font-semibold">6-20위</div>
              <div className="text-muted-foreground">Popular Choice</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};