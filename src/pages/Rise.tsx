import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Trophy, Star, Crown, Gift } from "lucide-react";

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
}

interface DebutEpisode {
  id: string;
  title: string;
  description: string;
  turns: number;
  unlocked: boolean;
  completed: boolean;
}

interface DebutProgress {
  level: number;
  experience: number;
  maxExperience: number;
  badges: string[];
  rank: string;
}

const Rise = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuthGuard('/auth', true);
  
  // All hooks must be called before any conditional returns
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [memoryCardCount, setMemoryCardCount] = useState(0);
  const [debutProgress, setDebutProgress] = useState<DebutProgress>({
    level: 1,
    experience: 0,
    maxExperience: 100,
    badges: [],
    rank: "Trainee"
  });
  const [isDebutPlaying, setIsDebutPlaying] = useState(false);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }

  // 데뷔 에피소드 (4-6턴)
  const debutEpisode: DebutEpisode = {
    id: "debut",
    title: "첫 번째 데뷔 무대",
    description: "드디어 꿈꿔왔던 데뷔 무대에 오르는 특별한 순간",
    turns: 5,
    unlocked: memoryCardCount >= 1,
    completed: debutProgress.badges.includes("debut")
  };

  const achievements = [
    {
      id: "first_memory",
      title: "첫 추억",
      description: "첫 번째 MemoryCard 획득",
      icon: "💎",
      completed: memoryCardCount >= 1,
      requirement: "MemoryCard 1장"
    },
    {
      id: "memory_collector",
      title: "추억 수집가",
      description: "MemoryCard 5장 수집",
      icon: "🎯",
      completed: memoryCardCount >= 5,
      requirement: "MemoryCard 5장"
    },
    {
      id: "debut_complete",
      title: "성공적인 데뷔",
      description: "데뷔 에피소드 완료",
      icon: "🎤",
      completed: debutProgress.badges.includes("debut"),
      requirement: "데뷔 에피소드 클리어"
    },
    {
      id: "rookie_rank",
      title: "루키 아이돌",
      description: "Rookie 랭크 달성",
      icon: "⭐",
      completed: debutProgress.rank === "Rookie",
      requirement: "데뷔 후 첫 번째 승급"
    }
  ];

  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    const savedIdol = localStorage.getItem('selectedIdol');
    
    if (!savedWallet) {
      toast.error("지갑을 먼저 연결해주세요!");
      navigate('/');
      return;
    }
    
    if (!savedIdol) {
      toast.error("먼저 아이돌을 선택해주세요!");
      navigate('/pick');
      return;
    }

    setWalletAddress(savedWallet);
    setSelectedIdol(JSON.parse(savedIdol));
    
    // 메모리카드 개수 확인
    const savedCards = JSON.parse(localStorage.getItem('memoryCards') || '[]');
    setMemoryCardCount(savedCards.length);
    
    // 데뷔 진행상황 불러오기
    const savedProgress = JSON.parse(localStorage.getItem('debutProgress') || '{}');
    if (savedProgress.level) {
      setDebutProgress(savedProgress);
    }
  }, [navigate]);

  const handleDebutStart = () => {
    if (!debutEpisode.unlocked) {
      toast.error("데뷔 에피소드는 MemoryCard 1장 이상 보유 시 해금됩니다.");
      return;
    }
    
    if (debutEpisode.completed) {
      toast.error("이미 완료한 데뷔 에피소드입니다.");
      return;
    }
    
    setIsDebutPlaying(true);
    
    // 모의 데뷔 에피소드 플레이
    setTimeout(() => {
      // 데뷔 완료 시 DebutCard + Debut Badge 지급
      const newProgress: DebutProgress = {
        level: 2,
        experience: 50,
        maxExperience: 200,
        badges: [...debutProgress.badges, "debut"],
        rank: "Rookie"
      };
      
      setDebutProgress(newProgress);
      localStorage.setItem('debutProgress', JSON.stringify(newProgress));
      
      // 모의 DebutCard NFT 생성
      const debutCard = {
        id: `debut-${Date.now()}`,
        tokenId: `DEBUT${selectedIdol?.id.toString().padStart(3, '0')}`,
        idolId: selectedIdol?.id,
        type: "DebutCard",
        earnedAt: new Date().toISOString()
      };
      
      const existingDebutCards = JSON.parse(localStorage.getItem('debutCards') || '[]');
      existingDebutCards.push(debutCard);
      localStorage.setItem('debutCards', JSON.stringify(existingDebutCards));
      
      toast.success("🎉 데뷔 성공! DebutCard + Debut Badge를 획득했습니다!");
      toast.success("🌟 Rookie 랭크로 승급했습니다!");
      
      setIsDebutPlaying(false);
    }, 4000);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Rookie": return "text-green-400";
      case "Star": return "text-blue-400";
      case "Superstar": return "text-purple-400";
      case "Legend": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "Rookie": return "⭐";
      case "Star": return "🌟";
      case "Superstar": return "💫";
      case "Legend": return "👑";
      default: return "🎯";
    }
  };

  if (!selectedIdol) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            📈 RISE - 데뷔 & 성장
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedIdol.name}와 함께하는 성장 여정
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              🔗 {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              💎 MemoryCard {memoryCardCount}장
            </Badge>
          </div>
        </div>

        {/* 성장 상태 카드 */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 아이돌 프로필 */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-primary/20 relative">
                <img 
                  src={selectedIdol.image}
                  alt={selectedIdol.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                  {debutProgress.level}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${getRankColor(debutProgress.rank)}`}>
                    {getRankIcon(debutProgress.rank)} {debutProgress.rank}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 레벨 & 경험치 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level {debutProgress.level}</span>
                <span className="text-sm text-muted-foreground">
                  {debutProgress.experience}/{debutProgress.maxExperience} EXP
                </span>
              </div>
              <Progress 
                value={(debutProgress.experience / debutProgress.maxExperience) * 100} 
                className="w-full h-3"
              />
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  획득 배지: {debutProgress.badges.length}개
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 데뷔 에피소드 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Star className="w-6 h-6" />
              데뷔 에피소드
            </h2>
            
            <Card
              className={`p-6 border transition-all duration-300 ${
                debutEpisode.unlocked 
                  ? 'glass-dark border-white/10 card-hover cursor-pointer'
                  : 'bg-muted/20 border-muted/30 opacity-50'
              }`}
              onClick={() => debutEpisode.unlocked && !debutEpisode.completed && handleDebutStart()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold gradient-text">{debutEpisode.title}</h3>
                  <Badge variant="outline" className="text-accent">
                    {debutEpisode.turns}턴
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">
                  {debutEpisode.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">보상: DebutCard NFT + Debut Badge (SBT)</span>
                  </div>
                  
                  {!debutEpisode.unlocked ? (
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        💎 MemoryCard 1장 이상 보유 시 해금됩니다
                      </p>
                    </div>
                  ) : debutEpisode.completed ? (
                    <Badge variant="default" className="bg-green-500/20 text-green-400 w-full justify-center py-3">
                      ✅ 완료 - Rookie 랭크 달성
                    </Badge>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full btn-modern"
                      onClick={handleDebutStart}
                    >
                      🎤 데뷔 에피소드 시작하기
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* 성취 현황 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Crown className="w-6 h-6" />
              성취 현황
            </h2>
            
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`p-4 border transition-all duration-300 ${
                    achievement.completed
                      ? 'glass-dark border-primary/30 bg-primary/5'
                      : 'bg-muted/20 border-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        요구사항: {achievement.requirement}
                      </p>
                    </div>
                    <div>
                      {achievement.completed ? (
                        <Badge variant="default" className="bg-green-500/20 text-green-400">
                          완료
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="opacity-50">
                          진행 중
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* 데뷔 진행 중 모달 */}
        {isDebutPlaying && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-8 glass-dark border-white/10 max-w-lg w-full mx-4">
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-bold gradient-text">
                  🎤 데뷔 무대 진행 중
                </h3>
                <div className="space-y-4">
                  <div className="animate-pulse text-6xl">⭐</div>
                  <p className="text-muted-foreground">
                    {selectedIdol.name}의 첫 번째 데뷔 무대가 진행되고 있습니다...
                  </p>
                  <Progress value={75} className="w-full" />
                  <p className="text-sm text-primary">
                    곧 DebutCard와 Debut Badge를 획득합니다!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/vault')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            ← Vault로 돌아가기
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rise;