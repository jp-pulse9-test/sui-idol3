import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const WorldSelect = () => {
  const navigate = useNavigate();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    const selectedGender = localStorage.getItem('selectedGender');
    
    if (!walletAddress) {
      toast.error("먼저 지갑을 연결해주세요!");
      navigate('/');
      return;
    }
    
    if (!selectedGender) {
      toast.error("먼저 성별을 선택해주세요!");
      navigate('/pick');
      return;
    }
  }, [navigate]);

  const worldOptions = [
    {
      id: 'academy',
      title: '학원물',
      description: '청춘과 꿈이 넘치는 아이돌 학원에서의 성장 스토리',
      emoji: '🏫',
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    {
      id: 'beast',
      title: '수인물', 
      description: '신비로운 수인 아이돌들의 환상적인 세계',
      emoji: '🦊',
      gradient: 'from-orange-500/20 to-pink-500/20'
    },
    {
      id: 'apocalypse',
      title: '아포칼립스물',
      description: '종말 이후 세계에서 희망을 전하는 아이돌들',
      emoji: '⚡',
      gradient: 'from-red-500/20 to-gray-700/20'
    },
    {
      id: 'fantasy',
      title: '판타지물',
      description: '마법과 모험이 가득한 판타지 세계의 아이돌들',
      emoji: '🔮',
      gradient: 'from-purple-500/20 to-indigo-500/20'
    },
    {
      id: 'historical',
      title: '역사물',
      description: '궁중의 예의와 전통이 살아있는 조선시대 아이돌 이야기',
      emoji: '👑',
      gradient: 'from-amber-500/20 to-yellow-600/20'
    },
    {
      id: 'regression',
      title: '회귀물',
      description: '시간을 되돌려 운명을 바꾸려는 회귀 아이돌 세계',
      emoji: '⏰',
      gradient: 'from-cyan-500/20 to-teal-600/20'
    }
  ];

  const handleWorldSelect = (worldId: string) => {
    setSelectedWorld(worldId);
    localStorage.setItem('selectedWorld', worldId);
    toast.success(`${worldOptions.find(w => w.id === worldId)?.title} 세계관을 선택했습니다!`);
    setTimeout(() => {
      navigate('/mbti');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            아이돌 세계관 선택
          </h1>
          <p className="text-xl text-muted-foreground">
            어떤 세계관의 아이돌과 함께 하고 싶으신가요?
          </p>
        </div>

        {/* World Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {worldOptions.map((option) => (
            <Card
              key={option.id}
              className={`p-8 glass-dark border-white/10 card-hover group cursor-pointer relative overflow-hidden transition-all duration-300 bg-gradient-to-br ${option.gradient} ${
                selectedWorld === option.id 
                  ? 'ring-2 ring-primary bg-primary/10' 
                  : ''
              }`}
              onClick={() => handleWorldSelect(option.id)}
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
                  className="w-full btn-modern py-3 text-card-foreground hover:text-card-foreground"
                >
                  이 세계관 선택
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            이전 단계로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorldSelect;