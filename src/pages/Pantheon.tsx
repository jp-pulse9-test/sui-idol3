import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Crown, Heart, Flame, Sparkles, Star, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { VRI, HopeShard } from "@/types/branch";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  walletAddress: string;
  totalVri: number;
  trustVri: number;
  empathyVri: number;
  loveVri: number;
  clearedBranches: number;
}

const Pantheon = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userVRI, setUserVRI] = useState<VRI>({
    total: 0,
    love: 0,
    trust: 0,
    empathy: 0,
    rank: 0,
    lastUpdated: new Date()
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hopeShards, setHopeShards] = useState<HopeShard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPantheonData();
  }, []);

  const loadPantheonData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.id);

      // Load user VRI
      const { data: vriData } = await supabase
        .from('user_vri')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vriData) {
        setUserVRI({
          total: vriData.total_vri,
          love: vriData.love_vri,
          trust: vriData.trust_vri,
          empathy: vriData.empathy_vri,
          rank: vriData.global_rank,
          lastUpdated: new Date(vriData.last_updated)
        });
      }

      // Load leaderboard
      const { data: leaderboardData } = await supabase
        .from('vri_leaderboard')
        .select('*')
        .order('total_vri', { ascending: false })
        .limit(100);

      if (leaderboardData) {
        const formattedLeaderboard: LeaderboardEntry[] = leaderboardData.map((entry, index) => ({
          rank: index + 1,
          userId: entry.user_id || '',
          walletAddress: entry.wallet_address || '',
          totalVri: entry.total_vri || 0,
          trustVri: entry.trust_vri || 0,
          empathyVri: entry.empathy_vri || 0,
          loveVri: entry.love_vri || 0,
          clearedBranches: Number(entry.cleared_branches) || 0
        }));
        setLeaderboard(formattedLeaderboard);
      }

      // Load hope shards (memory cards with VRI value)
      const { data: vaults } = await supabase
        .from('vaults')
        .select('id')
        .eq('user_id', user.id);

      if (vaults && vaults.length > 0) {
        const { data: memoryCards } = await supabase
          .from('memory_cards')
          .select('*')
          .eq('vault_id', vaults[0].id)
          .order('created_at', { ascending: false });

        if (memoryCards) {
          const shards: HopeShard[] = memoryCards.map(card => ({
            id: card.id,
            photocardId: card.token_id || undefined,
            branchId: card.branch_id || '',
            branchYear: card.branch_year || 2024,
            valueType: (card.value_type as 'love' | 'trust' | 'empathy') || 'love',
            vriValue: card.vri_value || 0,
            title: card.caption || 'Memory Card',
            titleEn: card.caption || 'Memory Card',
            description: `Scene ${card.scene_id}`,
            descriptionEn: `Scene ${card.scene_id}`,
            imageUrl: card.image_url || '',
            rarity: card.rarity === 1 ? 'N' : card.rarity === 2 ? 'R' : card.rarity === 3 ? 'SR' : 'SSR',
            earnedAt: new Date(card.created_at || ''),
            missionId: card.choice_hash
          }));
          setHopeShards(shards);
        }
      }

    } catch (error) {
      console.error('Error loading pantheon data:', error);
      toast.error('Failed to load pantheon data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-700" />;
    return <Star className="w-4 h-4 text-muted-foreground" />;
  };

  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading Pantheon...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-b border-border/50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                The Pantheon
              </h1>
              <p className="text-muted-foreground">
                Hall of Saviors - Rankings, Vault & Collection
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Your Rank</div>
              <div className="flex items-center gap-2">
                {userVRI.rank && getRankIcon(userVRI.rank)}
                <span className="text-2xl font-bold text-primary">
                  #{userVRI.rank || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* User VRI Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total VRI</p>
                    <p className="text-xl font-bold text-foreground">{userVRI.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 text-pink-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Love</p>
                    <p className="text-xl font-bold text-foreground">{userVRI.love}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Trust</p>
                    <p className="text-xl font-bold text-foreground">{userVRI.trust}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Empathy</p>
                    <p className="text-xl font-bold text-foreground">{userVRI.empathy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="rankings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="rankings">
              <Trophy className="w-4 h-4 mr-2" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="vault">
              <Star className="w-4 h-4 mr-2" />
              Vault
            </TabsTrigger>
            <TabsTrigger value="collection">
              <Sparkles className="w-4 h-4 mr-2" />
              Collection
            </TabsTrigger>
          </TabsList>

          {/* Rankings Tab */}
          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle>Global VRI Leaderboard</CardTitle>
                <CardDescription>
                  Top saviors ranked by total Value Restoration Index
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        entry.userId === userId
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-card border-border/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 flex items-center justify-center">
                          {getRankIcon(entry.rank)}
                          {entry.rank > 3 && (
                            <span className="text-sm font-bold text-muted-foreground">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {formatWalletAddress(entry.walletAddress)}
                          </p>
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            <span>❤️ {entry.loveVri}</span>
                            <span>✨ {entry.trustVri}</span>
                            <span>🔥 {entry.empathyVri}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {entry.totalVri}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.clearedBranches}/3 branches
                        </p>
                      </div>
                    </div>
                  ))}

                  {leaderboard.length === 0 && (
                    <div className="text-center py-12">
                      <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        No rankings available yet. Start completing missions!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vault Tab */}
          <TabsContent value="vault">
            <Card>
              <CardHeader>
                <CardTitle>Personal Salvation Vault</CardTitle>
                <CardDescription>
                  Your progress and achievements across all branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Overall Progress</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="text-muted-foreground">Total VRI</span>
                          <span className="font-medium">{userVRI.total} / 3000</span>
                        </div>
                        <Progress value={(userVRI.total / 3000) * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Heart className="w-3 h-3 text-pink-500" />
                            Love VRI
                          </span>
                          <span className="font-medium">{userVRI.love} / 1000</span>
                        </div>
                        <Progress value={(userVRI.love / 1000) * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            Trust VRI
                          </span>
                          <span className="font-medium">{userVRI.trust} / 1000</span>
                        </div>
                        <Progress value={(userVRI.trust / 1000) * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            Empathy VRI
                          </span>
                          <span className="font-medium">{userVRI.empathy} / 1000</span>
                        </div>
                        <Progress value={(userVRI.empathy / 1000) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Achievement Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                        <Trophy className="w-8 h-8 text-primary mb-2" />
                        <p className="text-2xl font-bold text-foreground">{hopeShards.length}</p>
                        <p className="text-xs text-muted-foreground">Hope Shards</p>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                        <Crown className="w-8 h-8 text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold text-foreground">#{userVRI.rank || '-'}</p>
                        <p className="text-xs text-muted-foreground">Global Rank</p>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                        <Star className="w-8 h-8 text-accent mb-2" />
                        <p className="text-2xl font-bold text-foreground">
                          {Math.round((userVRI.total / 3000) * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Completion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collection Tab */}
          <TabsContent value="collection">
            <Card>
              <CardHeader>
                <CardTitle>Hope Shards Collection</CardTitle>
                <CardDescription>
                  NFT photocards earned from salvation missions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hopeShards.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {hopeShards.map((shard) => (
                      <Card key={shard.id} className="overflow-hidden">
                        <div className="aspect-[3/4] bg-muted relative">
                          {shard.imageUrl ? (
                            <img
                              src={shard.imageUrl}
                              alt={shard.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2"
                          >
                            {shard.rarity}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-foreground truncate">
                            {shard.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                              {shard.branchYear}
                            </Badge>
                            <span className="text-xs text-primary font-semibold">
                              +{shard.vriValue} VRI
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Complete missions to earn Hope Shards
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/play')}
            className="flex-1"
          >
            Missions
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pantheon;
