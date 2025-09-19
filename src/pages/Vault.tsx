import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Vault as VaultIcon, 
  Play, 
  Trophy, 
  Star, 
  MessageCircle, 
  Image,
  Crown,
  TrendingUp
} from "lucide-react";

interface Idol {
  id: number;
  name: string;
  personality: string;
  description: string;
}

interface VaultData {
  id: string;
  level: number;
  debut_done: boolean;
  rise_points: number;
  idol: Idol;
}

interface MemoryCard {
  id: string;
  caption: string;
  rarity: number;
  created_at: string;
}

const Vault = () => {
  const navigate = useNavigate();
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingStory, setStartingStory] = useState(false);

  useEffect(() => {
    loadVaultData();
  }, []);

  const loadVaultData = async () => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const vaultId = localStorage.getItem('vaultId');
      
      if (!walletAddress || !vaultId) {
        toast.error("먼저 아이돌을 선택해주세요!");
        navigate('/pick');
        return;
      }

      // Vault 데이터 로드
      const { data: vault, error: vaultError } = await supabase
        .from('vaults')
        .select(`
          *,
          idols (
            id,
            name,
            personality,
            description
          )
        `)
        .eq('id', vaultId)
        .single();

      if (vaultError) throw vaultError;

      setVaultData({
        ...vault,
        idol: vault.idols
      });

      // MemoryCard 데이터 로드
      const { data: cards, error: cardsError } = await supabase
        .from('memory_cards')
        .select('*')
        .eq('vault_id', vaultId)
        .order('created_at', { ascending: false });

      if (cardsError) throw cardsError;
      setMemoryCards(cards || []);

    } catch (error) {
      console.error('Vault 데이터 로드 실패:', error);
      toast.error("Vault 데이터를 불러올 수 없습니다.");
      navigate('/pick');
    } finally {
      setLoading(false);
    }
  };

  const startDailyStory = async () => {
    if (!vaultData) return;
    
    setStartingStory(true);
    try {
      toast.info("일상 스토리를 시작합니다...");
      
      // 스토리 세션 생성
      const { data: session, error } = await supabase
        .from('story_sessions')
        .insert({
          vault_id: vaultData.id,
          session_type: 'daily',
          scene_id: 1, // 카페 씬
          current_turn: 0
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('currentSession', JSON.stringify(session));
      navigate('/story');
      
    } catch (error) {
      console.error('스토리 시작 실패:', error);
      toast.error("스토리를 시작할 수 없습니다.");
    } finally {
      setStartingStory(false);
    }
  };

  const startDebutStory = async () => {
    if (!vaultData) return;
    
    if (memoryCards.length === 0) {
      toast.error("먼저 일상 스토리를 완료하여 MemoryCard를 1장 이상 획득해주세요!");
      return;
    }

    if (vaultData.debut_done) {
      toast.info("이미 데뷔를 완료했습니다!");
      return;
    }

    setStartingStory(true);
    try {
      toast.info("데뷔 에피소드를 시작합니다...");
      
      const { data: session, error } = await supabase
        .from('story_sessions')
        .insert({
          vault_id: vaultData.id,
          session_type: 'debut',
          scene_id: 100, // 데뷔 씬
          current_turn: 0
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('currentSession', JSON.stringify(session));
      navigate('/story');
      
    } catch (error) {
      console.error('데뷔 스토리 시작 실패:', error);
      toast.error("데뷔 스토리를 시작할 수 없습니다.");
    } finally {
      setStartingStory(false);
    }
  };

  const getRankBadge = (level: number) => {
    switch (level) {
      case 0: return { name: "Trainee", color: "bg-gray-500", icon: Star };
      case 1: return { name: "Rookie", color: "bg-blue-500", icon: Crown };
      default: return { name: "Trainee", color: "bg-gray-500", icon: Star };
    }
  };

  const getRarityColor = (rarity: number) => {
    return rarity === 0 ? "border-gray-400" : "border-yellow-400";
  };

  const getRarityName = (rarity: number) => {
    return rarity === 0 ? "Normal" : "Rare";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Vault를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!vaultData) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Vault 데이터를 찾을 수 없습니다.</p>
          <Button onClick={() => navigate('/pick')}>아이돌 선택하러 가기</Button>
        </div>
      </div>
    );
  }

  const rank = getRankBadge(vaultData.level);
  const RankIcon = rank.icon;
  const nextLevelPoints = vaultData.level === 0 ? 100 : 500;
  const progressPercent = (vaultData.rise_points / nextLevelPoints) * 100;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pt-4">
          <div className="flex items-center justify-center gap-3">
            <VaultIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">
              {vaultData.idol.name}의 Vault
            </h1>
          </div>
          <p className="text-muted-foreground">
            내일의 무대를 위해, 오늘의 추억을 금고에
          </p>
        </div>

        {/* 프로필 카드 */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* 아이돌 정보 */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{vaultData.idol.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{vaultData.idol.name}</h2>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {vaultData.idol.personality}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground">{vaultData.idol.description}</p>
            </div>

            {/* 레벨 & 진행도 */}
            <div className="space-y-4 text-center min-w-[200px]">
              <div className="flex items-center justify-center gap-2">
                <div className={`p-2 rounded-full ${rank.color}`}>
                  <RankIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">{rank.name}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rise Points</span>
                  <span>{vaultData.rise_points} / {nextLevelPoints}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              {vaultData.debut_done && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                  <Crown className="w-3 h-3 mr-1" />
                  데뷔 완료
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* 액션 버튼들 */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 glass-dark border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold">일상 스토리</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                카페에서의 달콤한 시간을 보내고 MemoryCard를 획득하세요
              </p>
              <Button 
                onClick={startDailyStory}
                disabled={startingStory}
                className="w-full"
                size="lg"
              >
                {startingStory ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    시작 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    스토리 시작
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 glass-dark border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">데뷔 에피소드</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                첫 번째 쇼케이스 무대에서 데뷔의 순간을 맞이하세요
              </p>
              <Button 
                onClick={startDebutStory}
                disabled={startingStory || memoryCards.length === 0 || vaultData.debut_done}
                variant={memoryCards.length === 0 ? "outline" : "default"}
                className="w-full"
                size="lg"
              >
                {vaultData.debut_done ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    데뷔 완료
                  </>
                ) : memoryCards.length === 0 ? (
                  "MemoryCard 1장 필요"
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    데뷔 시작
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Tabs - 앨범과 로그 */}
        <Tabs defaultValue="album" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="album" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              포토카드 앨범 ({memoryCards.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              대화 로그
            </TabsTrigger>
          </TabsList>

          <TabsContent value="album" className="space-y-4">
            {memoryCards.length === 0 ? (
              <Card className="p-8 glass-dark border-white/10 text-center">
                <div className="space-y-4">
                  <Image className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-bold">아직 포토카드가 없습니다</h3>
                    <p className="text-muted-foreground">일상 스토리를 완료하여 첫 번째 MemoryCard를 획득해보세요!</p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memoryCards.map((card) => (
                  <Card key={card.id} className={`p-4 glass-dark border-2 ${getRarityColor(card.rarity)}`}>
                    <div className="space-y-3">
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">
                          {vaultData.idol.name}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className={getRarityColor(card.rarity)}>
                            {getRarityName(card.rarity)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(card.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {card.caption || "특별한 순간의 기억"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card className="p-8 glass-dark border-white/10 text-center">
              <div className="space-y-4">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-bold">대화 로그는 암호화되어 저장됩니다</h3>
                  <p className="text-muted-foreground">
                    {vaultData.idol.name}와의 모든 대화는 안전하게 보호됩니다.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 하단 네비게이션 */}
        <div className="flex justify-center space-x-4 pt-4">
          <Button
            onClick={() => navigate('/pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            다른 아이돌 선택
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Vault;