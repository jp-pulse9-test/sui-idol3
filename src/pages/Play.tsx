import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ChatModal from "@/components/ChatModal";
import { toast } from "sonner";

interface StoryScenario {
  id: string;
  title: string;
  description: string;
  location: string;
  emoji: string;
  unlocked: boolean;
  progress: number;
}

const Play = () => {
  const navigate = useNavigate();
  const [selectedIdol, setSelectedIdol] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string>('');

  const scenarios: StoryScenario[] = [
    {
      id: 'cafe',
      title: '카페에서',
      description: '아이돌과 함께하는 여유로운 카페 데이트',
      location: 'Sweet Coffee',
      emoji: '☕',
      unlocked: true,
      progress: 80
    },
    {
      id: 'school',
      title: '학교에서',
      description: '같은 반 친구로 만나는 설렘',
      location: '선혜고등학교',
      emoji: '🏫',
      unlocked: true,
      progress: 45
    },
    {
      id: 'practice',
      title: '연습실에서',
      description: '데뷔를 위해 열심히 연습하는 모습',
      location: 'SM Practice Room',
      emoji: '🎤',
      unlocked: true,
      progress: 60
    },
    {
      id: 'concert',
      title: '콘서트 무대',
      description: '무대 위 빛나는 아이돌의 모습',
      location: 'KSPO Dome',
      emoji: '🎵',
      unlocked: false,
      progress: 0
    },
    {
      id: 'vacation',
      title: '휴가에서',
      description: '일상을 벗어난 특별한 여행',
      location: 'Jeju Island',
      emoji: '🏖️',
      unlocked: false,
      progress: 0
    },
    {
      id: 'home',
      title: '집에서',
      description: '편안한 일상 속 소소한 행복',
      location: 'Home Sweet Home',
      emoji: '🏠',
      unlocked: true,
      progress: 25
    }
  ];

  useEffect(() => {
    const savedIdol = localStorage.getItem('selectedIdol');
    if (!savedIdol) {
      toast.error("먼저 아이돌을 선택해주세요!");
      navigate('/pick');
      return;
    }
    try {
      setSelectedIdol(JSON.parse(savedIdol));
    } catch (error) {
      console.error('Failed to parse selected idol:', error);
      navigate('/pick');
    }
  }, [navigate]);

  const handleScenarioSelect = (scenario: StoryScenario) => {
    if (!scenario.unlocked) {
      toast.error("아직 잠겨있는 시나리오입니다. 더 많은 추억을 쌓아주세요!");
      return;
    }
    setCurrentScenario(scenario.id);
    setShowChat(true);
  };

  const navigateToCollection = () => {
    navigate('/collection');
  };

  const navigateToGrowth = () => {
    navigate('/growth');
  };

  if (!selectedIdol) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            덕질 (Play)
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedIdol.name}와 함께하는 일상 스토리
          </p>
        </div>

        {/* Idol Profile */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="flex items-center space-x-6">
            <img 
              src={selectedIdol.image} 
              alt={selectedIdol.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h3>
              <p className="text-muted-foreground">{selectedIdol.personality}</p>
              <div className="flex space-x-2">
                <Badge variant="secondary">Trainee</Badge>
                <Badge variant="outline">Level 3</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Story Scenarios */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center gradient-text">일상 스토리</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`p-6 card-hover cursor-pointer ${
                  scenario.unlocked 
                    ? 'glass-dark border-white/10' 
                    : 'glass-dark border-white/5 opacity-60'
                }`}
                onClick={() => handleScenarioSelect(scenario)}
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{scenario.emoji}</div>
                    <h3 className="text-xl font-bold gradient-text">{scenario.title}</h3>
                    <p className="text-sm text-muted-foreground">{scenario.location}</p>
                  </div>
                  <p className="text-muted-foreground text-sm text-center">
                    {scenario.description}
                  </p>
                  {scenario.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">진행도</span>
                        <span className="text-primary">{scenario.progress}%</span>
                      </div>
                      <Progress value={scenario.progress} className="h-2" />
                    </div>
                  )}
                  {!scenario.unlocked && (
                    <div className="text-center">
                      <Badge variant="outline" className="opacity-60">
                        🔒 잠금
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={navigateToCollection}
            variant="secondary"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            📸 포토카드 보관함
          </Button>
          <Button
            onClick={navigateToGrowth}
            variant="secondary"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            📈 성장 현황
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

      {/* Chat Modal */}
      {showChat && selectedIdol && (
        <ChatModal
          character={{
            id: selectedIdol.id || 1,
            name: selectedIdol.name,
            image: selectedIdol.image,
            personality: selectedIdol.personality || '밝고 긍정적'
          }}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default Play;