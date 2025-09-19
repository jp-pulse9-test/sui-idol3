import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Choice {
  id: string;
  text: string;
  emotion: 'positive' | 'neutral' | 'playful';
}

interface StoryTurn {
  turn: number;
  idolMessage: string;
  choices: Choice[];
}

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
  caption?: string;
  summary?: string;
  choicePath?: string;
  momentHash?: string;
  earnedAt: string;
  metadata?: any;
}

interface StoryGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: StoryEpisode;
  idol: {
    name: string;
    personality: string;
    persona_prompt: string;
  };
  onComplete: (memoryCard: MemoryCard) => void;
}

const StoryGameModal = ({ isOpen, onClose, episode, idol, onComplete }: StoryGameModalProps) => {
  const [currentTurn, setCurrentTurn] = useState(1);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [currentStory, setCurrentStory] = useState<StoryTurn | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초

  // 모의 스토리 데이터 (실제로는 AI가 생성)
  const generateStoryTurn = (turn: number): StoryTurn => {
    const scenarios = [
      {
        turn: 1,
        idolMessage: `안녕! 나는 ${idol.name}이야. 오늘 처음 만나게 되어서 정말 설레! 어떤 이야기를 나누고 싶어?`,
        choices: [
          { id: "1a", text: "취미나 관심사에 대해 이야기하고 싶어요", emotion: "neutral" as const },
          { id: "1b", text: "당신의 꿈에 대해 들어보고 싶어요", emotion: "positive" as const },
          { id: "1c", text: "재미있는 농담 한번 해줄래요?", emotion: "playful" as const }
        ]
      },
      {
        turn: 2,
        idolMessage: `와, 정말 좋은 선택이야! 나도 그런 얘기 좋아해. 사실 나는 요즘에...`,
        choices: [
          { id: "2a", text: "더 자세히 말해주세요!", emotion: "positive" as const },
          { id: "2b", text: "저도 비슷한 경험이 있어요", emotion: "neutral" as const },
          { id: "2c", text: "그럼 같이 해볼까요?", emotion: "playful" as const }
        ]
      }
    ];

    return scenarios[turn - 1] || {
      turn,
      idolMessage: `${idol.name}: 이런 시간이 정말 소중해. 너와 함께 있으니 행복해!`,
      choices: [
        { id: `${turn}a`, text: "저도 즐거워요", emotion: "positive" as const },
        { id: `${turn}b`, text: "더 많은 시간을 보내고 싶어요", emotion: "neutral" as const },
        { id: `${turn}c`, text: "다음엔 뭘 할까요?", emotion: "playful" as const }
      ]
    };
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentTurn(1);
      setGameHistory([]);
      setTimeLeft(180);
      setCurrentStory(generateStoryTurn(1));
      
      // 타이머 시작
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleChoice = async (choice: Choice) => {
    setIsLoading(true);
    
    // 선택 기록
    const newHistory = [...gameHistory, `선택 ${currentTurn}: ${choice.text}`];
    setGameHistory(newHistory);
    
    if (currentTurn >= episode.turns) {
      // 게임 완료
      handleGameComplete();
    } else {
      // 다음 턴으로
      setTimeout(() => {
        setCurrentTurn(currentTurn + 1);
        setCurrentStory(generateStoryTurn(currentTurn + 1));
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleGameComplete = () => {
    setIsLoading(false);
    
    // 엔딩 요약과 장면 캡션 자동 생성 (모의)
    const endingSummary = `${idol.name}와의 특별한 시간이었습니다. 서로에 대해 더 알아가는 소중한 순간들이 담긴 추억이 완성되었습니다.`;
    const sceneCaption = `"${idol.name}와 함께한 따뜻한 대화의 순간"`;
    
    // MemoryCard 생성 (N/R 등급)
    const memoryCard: MemoryCard = {
      id: `memory-${episode.id}-${Date.now()}`,
      episodeId: episode.id,
      title: `${episode.title} - 추억의 순간`,
      rarity: Math.random() > 0.7 ? 'R' : 'N', // 30% 확률로 R등급
      image: "/src/assets/female-idol-1.jpg", // 실제로는 생성된 이미지
      caption: sceneCaption,
      summary: endingSummary,
      choicePath: gameHistory.join(" → "),
      momentHash: `${episode.id}_${Date.now()}`,
      earnedAt: new Date().toISOString(),
      metadata: {
        idol_id: idol.name,
        scene_id: episode.id,
        choice_path: gameHistory,
        rarity: Math.random() > 0.7 ? 'R' : 'N',
        timestamp: Date.now()
      }
    };
    
    onComplete(memoryCard);
    onClose();
    
    toast.success(`${memoryCard.rarity}등급 MemoryCard를 획득했습니다!`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-dark border-white/10">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold gradient-text">{episode.title}</h2>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-primary">
                  턴 {currentTurn}/{episode.turns}
                </Badge>
                <Badge variant="secondary" className={timeLeft < 60 ? "text-red-400" : ""}>
                  ⏰ {formatTime(timeLeft)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <Progress value={(currentTurn / episode.turns) * 100} className="w-full" />

          {/* Story Content */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                  {idol.name[0]}
                </div>
                <div className="flex-1">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm leading-relaxed">{currentStory.idolMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Choices */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              당신의 선택 (2-3개 선택지)
            </h3>
            <div className="space-y-2">
              {currentStory.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3 border-border hover:bg-primary/10 hover:border-primary/30"
                  onClick={() => handleChoice(choice)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      choice.emotion === 'positive' ? 'bg-green-400' :
                      choice.emotion === 'playful' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-sm">{choice.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                {idol.name}이 응답하고 있습니다...
              </p>
            </div>
          )}

          {/* Game Info */}
          <div className="bg-muted/20 border border-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              💡 {episode.turns}턴 완료 시 엔딩 도달 → MemoryCard(포토카드 NFT) 자동 발급
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StoryGameModal;