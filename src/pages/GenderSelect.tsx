import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const GenderSelect = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      toast.error("먼저 지갑을 연결해주세요!");
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    localStorage.setItem('selectedGender', gender);
    toast.success(`${gender === 'male' ? '소년' : '소녀'} 아이돌을 선택했습니다!`);
    setTimeout(() => {
      navigate('/mbti');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-black gradient-text">
            이상형 선택
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            어떤 타입의 아이돌에게 더 끌리시나요?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card 
            className={`p-8 cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
              selectedGender === 'male' 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-card/80 hover:border-primary/50'
            } backdrop-blur-sm`}
            onClick={() => handleGenderSelect('male')}
          >
            <div className="space-y-6">
              <div className="text-8xl">👨‍🎤</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">소년 아이돌</h3>
                <p className="text-muted-foreground">
                  카리스마 넘치는 남성 아이돌의 매력
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className={`p-8 cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
              selectedGender === 'female' 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-card/80 hover:border-primary/50'
            } backdrop-blur-sm`}
            onClick={() => handleGenderSelect('female')}
          >
            <div className="space-y-6">
              <div className="text-8xl">👩‍🎤</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">소녀 아이돌</h3>
                <p className="text-muted-foreground">
                  사랑스러운 여성 아이돌의 매력
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
        >
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default GenderSelect;