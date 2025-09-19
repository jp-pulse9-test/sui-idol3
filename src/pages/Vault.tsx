import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { MessageCircle, Trophy, Gift, Lock } from "lucide-react";
import StoryGameModal from "@/components/StoryGameModal";

interface StoryEpisode {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  turns: number;
  unlocked: boolean;
  completed: boolean;
  memoryCardEarned?: boolean;
}

interface MemoryCard {
  id: string;
  episodeId: string;
  title: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  image: string;
  earnedAt: string;
}

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
  persona_prompt?: string;
}

const Vault = () => {
  const navigate = useNavigate();
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [currentEpisode, setCurrentEpisode] = useState<StoryEpisode | null>(null);
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  // 일상 스토리 에피소드들 (6-8턴)
  const storyEpisodes: StoryEpisode[] = [
    {
      id: "ep1",
      title: "첫 만남",
      description: "아이돌과의 첫 만남에서 벌어지는 설렘 가득한 이야기",
      category: "일상",
      difficulty: "Easy",
      turns: 6,
      unlocked: true,
      completed: false
    },
    {
      id: "ep2", 
      title: "연습실에서",
      description: "늦은 밤 연습실에서 함께하는 특별한 시간",
      category: "연습",
      difficulty: "Normal",
      turns: 7,
      unlocked: true,
      completed: false
    },
    {
      id: "ep3",
      title: "무대 뒤에서",
      description: "콘서트 무대 뒤에서 벌어지는 긴장감 넘치는 순간들",
      category: "공연",
      difficulty: "Normal", 
      turns: 8,
      unlocked: false,
      completed: false
    },
    {
      id: "ep4",
      title: "휴식의 시간",
      description: "바쁜 스케줄 사이의 소중한 휴식 시간",
      category: "일상",
      difficulty: "Easy",
      turns: 6,
      unlocked: false,
      completed: false
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
    
    // 로컬 스토리지에서 메모리카드 불러오기
    const savedCards = JSON.parse(localStorage.getItem('memoryCards') || '[]');
    setMemoryCards(savedCards);
  }, [navigate]);

  const handleEpisodeStart = (episode: StoryEpisode) => {
    if (!episode.unlocked) {
      toast.error("아직 해금되지 않은 에피소드입니다.");
      return;
    }
    
    setCurrentEpisode(episode);
    setIsGameModalOpen(true);
  };

  const handleGameComplete = (newMemoryCard: MemoryCard) => {
    const updatedCards = [...memoryCards, newMemoryCard];
    setMemoryCards(updatedCards);
    localStorage.setItem('memoryCards', JSON.stringify(updatedCards));
    
    // 에피소드 완료 상태 업데이트
    const updatedEpisodes = storyEpisodes.map(ep => 
      ep.id === currentEpisode?.id ? { ...ep, completed: true } : ep
    );
    localStorage.setItem('completedEpisodes', JSON.stringify(updatedEpisodes));
    
    setIsGameModalOpen(false);
    setCurrentEpisode(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'SR': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'R': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Normal': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
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
            🗃️ VAULT - 비밀 금고
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedIdol.name}와의 스토리 플레이 & 추억 수집
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              🔗 {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              💎 MemoryCard {memoryCards.length}장
            </Badge>
          </div>
        </div>

        {/* 선택된 아이돌 정보 */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-primary/20">
              <img 
                src={selectedIdol.image}
                alt={selectedIdol.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
              <p className="text-muted-foreground">{selectedIdol.personality}</p>
            </div>
            <Button
              onClick={() => navigate('/rise')}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/20"
            >
              데뷔하러 가기 →
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 스토리 에피소드 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              일상 스토리 에피소드
            </h2>
            
            <div className="space-y-4">
              {storyEpisodes.map((episode) => (
                <Card
                  key={episode.id}
                  className={`p-4 border transition-all duration-300 ${
                    episode.unlocked 
                      ? 'glass-dark border-white/10 card-hover cursor-pointer'
                      : 'bg-muted/20 border-muted/30 opacity-50'
                  }`}
                  onClick={() => episode.unlocked && handleEpisodeStart(episode)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{episode.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(episode.difficulty)}>
                          {episode.difficulty}
                        </Badge>
                        <Badge variant="secondary">
                          {episode.turns}턴
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm">
                      {episode.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {episode.category}
                      </Badge>
                      
                      {episode.completed ? (
                        <Badge variant="default" className="bg-green-500/20 text-green-400">
                          완료
                        </Badge>
                      ) : episode.unlocked ? (
                        <Button variant="outline" size="sm">
                          시작하기
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="opacity-50">
                          잠김
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 메모리카드 컬렉션 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Gift className="w-6 h-6" />
              MemoryCard 컬렉션
            </h2>
            
            {memoryCards.length === 0 ? (
              <Card className="p-8 text-center glass-dark border-white/10">
                <div className="space-y-4">
                  <div className="text-4xl">📱</div>
                  <h3 className="text-xl font-bold">아직 획득한 카드가 없습니다</h3>
                  <p className="text-muted-foreground">
                    스토리 에피소드를 완료하여 첫 번째 MemoryCard를 획득하세요!
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {memoryCards.map((card) => (
                  <Card key={card.id} className="p-4 glass-dark border-white/10">
                    <div className="space-y-3">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gradient-primary/20">
                        <img 
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">{card.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRarityColor(card.rarity)}`}
                          >
                            {card.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(card.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 스토리 게임 모달 */}
        {currentEpisode && selectedIdol && (
          <StoryGameModal
            isOpen={isGameModalOpen}
            onClose={() => {
              setIsGameModalOpen(false);
              setCurrentEpisode(null);
            }}
            episode={currentEpisode}
            idol={{
              name: selectedIdol.name,
              personality: selectedIdol.personality,
              persona_prompt: selectedIdol.persona_prompt || ""
            }}
            onComplete={handleGameComplete}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            ← 아이돌 선택
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

export default Vault;