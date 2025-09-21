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
              title="View photocards in marketplace"
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
                  title="View photocards in marketplace"
                >
                  {entry.idolName}
                </span>
                {isCurrentIdol && <Badge variant="secondary" className="text-xs">My Bias</Badge>}
                <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                {idolPhotocards.length > 0 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIdolClick(entry.idolId, entry.idolName);
                    }}
                    title="View photocards in marketplace"
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
                title="View photocards in marketplace"
              >
                {entry.personality} · {entry.concept}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="text-primary font-semibold">{entry.totalFans.toLocaleString()}</span>
                  <span className="text-muted-foreground">fans</span>
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
              title="View photocards in marketplace"
            >
              <div className="font-semibold text-foreground">{entry.totalPhotocards.toLocaleString()}</div>
              <div className="text-muted-foreground text-xs">photocards</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${entry.averageRarity >= 4 ? 'text-yellow-400' : entry.averageRarity >= 3 ? 'text-purple-400' : entry.averageRarity >= 2 ? 'text-blue-400' : 'text-gray-400'}`}>
                {entry.averageRarity.toFixed(1)}
              </div>
              <div className="text-muted-foreground text-xs">avg rarity</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="font-semibold text-green-400">+{entry.weeklyGrowth}%</span>
              </div>
              <div className="text-muted-foreground text-xs">weekly growth</div>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">
              {(entry.totalFans * 0.6 + entry.totalHearts * 0.3 + entry.totalPhotocards * 0.1).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">popularity score</div>
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
          Idol Leaderboard
        </h2>
        <p className="text-muted-foreground">
          Idol popularity ranking based on fan count and hearts · Click profile, name, or photocard count to go to marketplace
        </p>
      </div>

      {/* Current Idol Rank Card */}
      {currentIdol && (
        <Card className="p-6 glass-dark border-primary/20 bg-primary/5">
          <div className="space-y-3">
            <h3 className="text-lg font-bold gradient-text">My Bias Idol Ranking</h3>
            {renderIdolEntry(currentIdol, true)}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To next rank</span>
                <span className="text-primary font-semibold">
                  {currentIdol.rank > 1 ? 
                    `${(globalLeaderboard[currentIdol.rank - 2]?.totalFans || 0) - currentIdol.totalFans} fans` 
                    : "Stay #1!"
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
            🌍 Global Ranking
          </TabsTrigger>
          <TabsTrigger value="category" className="data-[state=active]:bg-primary/20">
            📂 Category Ranking
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
                          {entry.idolName}'s Photocards ({idolPhotocards.length} cards)
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
                  category idol ranking
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
                            {entry.idolName}'s Photocards ({idolPhotocards.length} cards)
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
                Select a category to view idol rankings for that category
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Season Info */}
      <Card className="p-6 glass-dark border-accent/20 bg-accent/5">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="text-accent border-accent/30">
            🏆 Season 1 In Progress
          </Badge>
          <h3 className="text-lg font-bold">Monthly Idol Awards</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-2xl">👑</div>
              <div className="font-semibold">1st Place</div>
              <div className="text-muted-foreground">Hall of Fame</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">⭐</div>
              <div className="font-semibold">2nd-5th Place</div>
              <div className="text-muted-foreground">Rising Star</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">💎</div>
              <div className="font-semibold">6th-20th Place</div>
              <div className="text-muted-foreground">Popular Choice</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};