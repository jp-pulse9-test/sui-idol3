import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import femaleIdol1 from "@/assets/female-idol-1.jpg";
import femaleIdol2 from "@/assets/female-idol-2.jpg";
import maleIdol1 from "@/assets/male-idol-1.jpg";
import maleIdol2 from "@/assets/male-idol-2.jpg";

interface IdealType {
  id: number;
  name: string;
  image: string;
  realImage: string;
  personality: string;
  description: string;
  compatibility: number;
  stats: {
    vocal: number;
    dance: number;
    visual: number;
    charisma: number;
    charm: number;
    leadership: number;
    talent: number;
    popularity: number;
  };
  potentialStats: {
    vocal: number;
    dance: number;
    visual: number;
    charisma: number;
    charm: number;
    leadership: number;
    talent: number;
    popularity: number;
  };
}

export const FinalPick = () => {
  const navigate = useNavigate();
  const [contestants, setContestants] = useState<IdealType[]>([]);
  const [currentPair, setCurrentPair] = useState<[IdealType, IdealType] | null>(null);
  const [winners, setWinners] = useState<IdealType[]>([]);
  const [round, setRound] = useState(1);
  const [selectedGender, setSelectedGender] = useState<string>("");

  useEffect(() => {
    const gender = localStorage.getItem('selectedGender');
    const personalityProfile = localStorage.getItem('personalityProfile');
    const appearanceProfile = localStorage.getItem('appearanceProfile');
    
    if (!gender || !personalityProfile || !appearanceProfile) {
      toast.error("프로필 데이터가 없습니다. 처음부터 시작해주세요.");
      navigate('/gender-select');
      return;
    }

    setSelectedGender(gender);
    
    const candidates = generateIdealTypes(gender, JSON.parse(personalityProfile), JSON.parse(appearanceProfile));
    setContestants(candidates);
    setCurrentPair([candidates[0], candidates[1]]);
  }, [navigate]);

  const generateIdealTypes = (gender: string, personality: any, appearance: any): IdealType[] => {
    const maleIdols = [
      { 
        id: 1, 
        name: "지훈", 
        image: "🎤", 
        realImage: maleIdol1,
        personality: "카리스마틱", 
        description: "무대 위의 강렬한 존재감",
        stats: { vocal: 70, dance: 60, visual: 65, charisma: 85, charm: 50, leadership: 90, talent: 75, popularity: 55 },
        potentialStats: { vocal: 88, dance: 80, visual: 85, charisma: 98, charm: 70, leadership: 95, talent: 90, popularity: 85 }
      },
      { 
        id: 2, 
        name: "민우", 
        image: "🌟", 
        realImage: maleIdol2,
        personality: "밝고 긍정적", 
        description: "햇살 같은 따뜻한 미소",
        stats: { vocal: 65, dance: 70, visual: 60, charisma: 55, charm: 85, leadership: 65, talent: 60, popularity: 80 },
        potentialStats: { vocal: 80, dance: 85, visual: 78, charisma: 75, charm: 95, leadership: 82, talent: 78, popularity: 92 }
      },
      { 
        id: 3, 
        name: "현수", 
        image: "🎭", 
        realImage: maleIdol1,
        personality: "신비로운", 
        description: "깊이 있는 감성과 예술혼",
        stats: { vocal: 80, dance: 45, visual: 90, charisma: 70, charm: 75, leadership: 40, talent: 85, popularity: 50 },
        potentialStats: { vocal: 95, dance: 65, visual: 98, charisma: 88, charm: 90, leadership: 60, talent: 96, popularity: 75 }
      },
      { 
        id: 4, 
        name: "태영", 
        image: "⚡", 
        realImage: maleIdol2,
        personality: "에너지틱", 
        description: "끝없는 열정과 활력",
        stats: { vocal: 50, dance: 90, visual: 55, charisma: 75, charm: 70, leadership: 60, talent: 65, popularity: 75 },
        potentialStats: { vocal: 70, dance: 98, visual: 75, charisma: 90, charm: 88, leadership: 80, talent: 82, popularity: 90 }
      }
    ];

    const femaleIdols = [
      { 
        id: 1, 
        name: "소희", 
        image: "🎀", 
        realImage: femaleIdol1,
        personality: "사랑스러운", 
        description: "순수하고 귀여운 매력",
        stats: { vocal: 60, dance: 65, visual: 85, charisma: 50, charm: 90, leadership: 45, talent: 55, popularity: 80 },
        potentialStats: { vocal: 78, dance: 82, visual: 95, charisma: 70, charm: 98, leadership: 65, talent: 75, popularity: 92 }
      },
      { 
        id: 2, 
        name: "예린", 
        image: "💫", 
        realImage: femaleIdol2,
        personality: "우아한", 
        description: "고급스럽고 세련된 분위기",
        stats: { vocal: 85, dance: 55, visual: 80, charisma: 75, charm: 70, leadership: 80, talent: 80, popularity: 60 },
        potentialStats: { vocal: 96, dance: 75, visual: 92, charisma: 90, charm: 85, leadership: 95, talent: 92, popularity: 80 }
      },
      { 
        id: 3, 
        name: "지안", 
        image: "🌸", 
        realImage: femaleIdol1,
        personality: "상큼한", 
        description: "밝고 발랄한 에너지",
        stats: { vocal: 55, dance: 85, visual: 70, charisma: 65, charm: 80, leadership: 70, talent: 60, popularity: 85 },
        potentialStats: { vocal: 75, dance: 95, visual: 85, charisma: 82, charm: 92, leadership: 85, talent: 78, popularity: 96 }
      },
      { 
        id: 4, 
        name: "하은", 
        image: "🌙", 
        realImage: femaleIdol2,
        personality: "신비로운", 
        description: "몽환적이고 매혹적인 아우라",
        stats: { vocal: 75, dance: 50, visual: 95, charisma: 85, charm: 65, leadership: 45, talent: 80, popularity: 55 },
        potentialStats: { vocal: 90, dance: 70, visual: 98, charisma: 96, charm: 82, leadership: 65, talent: 94, popularity: 78 }
      }
    ];

    const candidates = gender === 'male' ? maleIdols : femaleIdols;
    
    // 호환성 점수 계산 (간단한 로직)
    const scoredCandidates = candidates.map(candidate => ({
      ...candidate,
      compatibility: Math.floor(Math.random() * 30) + 70 // 70-100% 호환성
    })).sort((a, b) => b.compatibility - a.compatibility);

    return scoredCandidates;
  };

  const handleChoice = (chosen: IdealType) => {
    const newWinners = [...winners, chosen];
    setWinners(newWinners);

    const remainingContestants = contestants.slice(2);
    
    if (remainingContestants.length >= 2) {
      setCurrentPair([remainingContestants[0], remainingContestants[1]]);
      setContestants(remainingContestants);
    } else if (remainingContestants.length === 1) {
      // Last contestant automatically advances
      const finalWinners = [...newWinners, remainingContestants[0]];
      if (finalWinners.length === 1) {
        // Tournament complete
        localStorage.setItem('finalPick', JSON.stringify(finalWinners[0]));
        toast.success(`${finalWinners[0].name}이(가) 최종 선택되었습니다!`);
        setTimeout(() => {
          navigate('/photocard');
        }, 1000);
      } else {
        // Start next round
        setContestants(finalWinners);
        setWinners([]);
        setCurrentPair([finalWinners[0], finalWinners[1]]);
        setRound(round + 1);
      }
    } else {
      // Start next round with winners
      if (newWinners.length === 1) {
        localStorage.setItem('finalPick', JSON.stringify(newWinners[0]));
        toast.success(`${newWinners[0].name}이(가) 최종 선택되었습니다!`);
        setTimeout(() => {
          navigate('/photocard');
        }, 1000);
      } else {
        setContestants(newWinners);
        setWinners([]);
        setCurrentPair([newWinners[0], newWinners[1]]);
        setRound(round + 1);
      }
    }
  };

  const handleSelect = (idealType: IdealType) => {
    localStorage.setItem('finalPick', JSON.stringify(idealType));
    toast.success(`${idealType.name}을(를) 선택하셨습니다!`);
    setTimeout(() => {
      navigate('/photocard');
    }, 1000);
  };

  if (!currentPair) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">아이돌 월드컵을 준비중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">3. 최종 픽 선택 (하이브리드 월드컵)</h1>
          <p className="text-muted-foreground">
            당신의 성향에 맞는 아이돌들 중에서 이상형을 찾아보세요!
          </p>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 inline-block">
            <p className="text-sm font-medium">Round {round}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {currentPair.map((idealType) => (
            <Card 
              key={idealType.id}
              className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 cursor-pointer card-hover"
              onClick={() => handleChoice(idealType)}
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary/20">
                    <img 
                      src={idealType.realImage} 
                      alt={idealType.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-3xl bg-background rounded-full p-2 border border-border">
                    {idealType.image}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">{idealType.name}</h3>
                  <p className="text-primary font-medium">{idealType.personality}</p>
                  <p className="text-muted-foreground">{idealType.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">호환성</span>
                    <span className="text-lg font-bold text-primary">{idealType.compatibility}%</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${idealType.compatibility}%` }}
                    />
                  </div>
                </div>

                <Button 
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  선택하기
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => navigate('/result-analysis')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            이전 단계로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalPick;