import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Pick = () => {
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (!savedWallet) {
      toast.error("지갑을 먼저 연결해주세요!");
      navigate('/');
      return;
    }
    setIsWalletConnected(true);
  }, [navigate]);

  const pickOptions = [
    {
      id: 'analysis',
      title: '성향 분석으로 찾기',
      description: 'MBTI와 외형 선호도를 분석해 최적의 아이돌을 추천받아요',
      emoji: '🧠',
      route: '/gender-select',
      recommended: true
    },
    {
      id: 'worldcup',
      title: '이상형 월드컵',
      description: '다양한 아이돌 중에서 직접 선택하며 취향을 발견해요',
      emoji: '🏆',
      route: '/worldcup',
      recommended: false
    },
    {
      id: 'random',
      title: '랜덤 뽑기',
      description: '운명적인 만남! 랜덤으로 아이돌을 선택해요',
      emoji: '🎲',
      route: '/random-pick',
      recommended: false
    },
    {
      id: 'custom',
      title: '직접 생성하기',
      description: '원하는 외형과 성격을 설정해 나만의 아이돌을 만들어요',
      emoji: '✨',
      route: '/custom-create',
      recommended: false
    }
  ];

  const handlePickSelect = (route: string) => {
    navigate(route);
  };

  if (!isWalletConnected) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            고르기 (Pick)
          </h1>
          <p className="text-xl text-muted-foreground">
            어떤 방식으로 AI 아이돌을 선택하시겠어요?
          </p>
        </div>

        {/* Pick Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {pickOptions.map((option) => (
            <Card
              key={option.id}
              className="p-8 glass-dark border-white/10 card-hover group cursor-pointer relative overflow-hidden"
              onClick={() => handlePickSelect(option.route)}
            >
              {option.recommended && (
                <Badge className="absolute top-4 right-4 bg-gradient-primary text-white">
                  추천
                </Badge>
              )}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">{option.emoji}</div>
                  <h3 className="text-2xl font-bold gradient-text">{option.title}</h3>
                </div>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {option.description}
                </p>
                <Button 
                  variant="hero"
                  size="lg"
                  className="w-full btn-modern py-3"
                >
                  선택하기
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
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

export default Pick;