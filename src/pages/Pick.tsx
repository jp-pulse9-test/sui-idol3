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

  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const genderOptions = [
    {
      id: 'male',
      title: '소년 아이돌',
      description: '성향 분석 후 101명의 소년 아이돌 중에서 이상형을 찾아보세요',
      emoji: '👦',
      gender: 'male'
    },
    {
      id: 'female',
      title: '소녀 아이돌',
      description: '성향 분석 후 101명의 소녀 아이돌 중에서 이상형을 찾아보세요',
      emoji: '👧',
      gender: 'female'
    }
  ];

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    localStorage.setItem('selectedGender', gender);
    toast.success(`${gender === 'male' ? '소년' : '소녀'} 아이돌을 선택했습니다!`);
    setTimeout(() => {
      navigate('/world-select');
    }, 1000);
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
            성향 분석 + 이상형 월드컵
          </h1>
          <p className="text-xl text-muted-foreground">
            성향 분석을 통해 101명 중 맞춤형 후보들로 이상형 월드컵을 진행해요
          </p>
        </div>

        {/* Gender Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {genderOptions.map((option) => (
            <Card
              key={option.id}
              className={`p-8 glass-dark border-white/10 card-hover group cursor-pointer relative overflow-hidden transition-all duration-300 ${
                selectedGender === option.gender 
                  ? 'ring-2 ring-primary bg-primary/10' 
                  : ''
              }`}
              onClick={() => handleGenderSelect(option.gender)}
            >
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
                  className="w-full btn-modern py-3 text-white hover:text-white"
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