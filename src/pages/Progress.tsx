import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface GrowthStage {
  stage: string;
  level: number;
  title: string;
  description: string;
  requirements: string;
  unlocked: boolean;
  current: boolean;
}

const ProgressPage = () => {
  const navigate = useNavigate();
  const [selectedIdol, setSelectedIdol] = useState<any>(null);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [experience, setExperience] = useState(750);
  const [totalPhotocards, setTotalPhotocards] = useState(12);

  const growthStages: GrowthStage[] = [
    {
      stage: "Trainee",
      level: 1,
      title: "연습생",
      description: "꿈을 향한 첫걸음을 시작했어요",
      requirements: "기본 시나리오 완료",
      unlocked: true,
      current: false
    },
    {
      stage: "Rookie",
      level: 3,
      title: "신인 아이돌",
      description: "무대에 서기 시작한 신인 아이돌이에요",
      requirements: "포토카드 10장 수집",
      unlocked: true,
      current: true
    },
    {
      stage: "Rising Star",
      level: 5,
      title: "떠오르는 스타",
      description: "팬들의 사랑을 받는 인기 아이돌이에요",
      requirements: "일상 스토리 5개 완료",
      unlocked: false,
      current: false
    },
    {
      stage: "Star",
      level: 8,
      title: "스타",
      description: "많은 이들이 인정하는 진정한 스타예요",
      requirements: "특별 이벤트 참여",
      unlocked: false,
      current: false
    },
    {
      stage: "Global Idol",
      level: 10,
      title: "글로벌 아이돌",
      description: "전 세계가 사랑하는 글로벌 아이돌이에요",
      requirements: "레전드 포토카드 획득",
      unlocked: false,
      current: false
    }
  ];

  const achievements = [
    {
      title: "첫 만남",
      description: "아이돌과 첫 대화를 나눴어요",
      completed: true,
      emoji: "💬"
    },
    {
      title: "포토카드 컬렉터",
      description: "포토카드 10장을 수집했어요",
      completed: true,
      emoji: "📸"
    },
    {
      title: "일상 친구",
      description: "카페 시나리오를 완료했어요",
      completed: true,
      emoji: "☕"
    },
    {
      title: "연습실 방문자",
      description: "연습실 시나리오를 진행했어요",
      completed: false,
      emoji: "🎤"
    },
    {
      title: "팬덤 리더",
      description: "커뮤니티 활동에 참여했어요",
      completed: false,
      emoji: "👥"
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

  const getExperiencePercentage = () => {
    const expForCurrentLevel = currentLevel * 300;
    const expForNextLevel = (currentLevel + 1) * 300;
    const currentExp = experience;
    
    return ((currentExp - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel)) * 100;
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            성장 (Progress)
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedIdol.name}의 아이돌 성장 여정
          </p>
        </div>

        {/* Current Status */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <img 
                src={selectedIdol.image} 
                alt={selectedIdol.name}
                className="w-20 h-20 rounded-full object-cover mx-auto"
              />
              <h3 className="text-xl font-bold gradient-text">{selectedIdol.name}</h3>
              <Badge variant="secondary">Level {currentLevel}</Badge>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">경험치</span>
                  <span className="text-primary">{experience} / {(currentLevel + 1) * 300}</span>
                </div>
                <Progress value={getExperiencePercentage()} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{totalPhotocards}</p>
                  <p className="text-sm text-muted-foreground">포토카드</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">3</p>
                  <p className="text-sm text-muted-foreground">레어 카드</p>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-secondary">#127</div>
              <p className="text-sm text-muted-foreground">커뮤니티 랭킹</p>
              <Badge variant="outline" className="bg-gradient-primary text-white">
                상위 15%
              </Badge>
            </div>
          </div>
        </Card>

        {/* Growth Stages */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center gradient-text">성장 단계</h2>
          <div className="space-y-4">
            {growthStages.map((stage, index) => (
              <Card
                key={stage.stage}
                className={`p-4 ${
                  stage.current 
                    ? 'glass-dark border-primary/50 bg-primary/5' 
                    : stage.unlocked 
                      ? 'glass-dark border-white/10' 
                      : 'glass-dark border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    stage.current 
                      ? 'bg-gradient-primary text-white' 
                      : stage.unlocked 
                        ? 'bg-accent text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {stage.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold gradient-text">{stage.title}</h3>
                      {stage.current && <Badge variant="default">현재</Badge>}
                      {!stage.unlocked && <Badge variant="outline">🔒</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm">{stage.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">요구사항: {stage.requirements}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center gradient-text">업적</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className={`p-4 ${
                  achievement.completed 
                    ? 'glass-dark border-accent/50 bg-accent/5' 
                    : 'glass-dark border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-bold gradient-text">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.completed && (
                    <Badge variant="secondary" className="bg-gradient-accent text-white">
                      완료
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/play')}
            variant="secondary"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            일상 스토리로
          </Button>
          <Button
            onClick={() => navigate('/collection')}
            variant="secondary"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            포토카드 보관함
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

export default ProgressPage;