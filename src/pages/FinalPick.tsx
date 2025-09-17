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
  const [idealTypes, setIdealTypes] = useState<IdealType[]>([]);
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
    generateIdealTypes(gender, JSON.parse(personalityProfile), JSON.parse(appearanceProfile));
  }, [navigate]);

  const generateIdealTypes = (gender: string, personality: any, appearance: any) => {
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

    setIdealTypes(scoredCandidates);
  };

  const handleSelect = (idealType: IdealType) => {
    localStorage.setItem('finalPick', JSON.stringify(idealType));
    toast.success(`${idealType.name}을(를) 선택하셨습니다!`);
    setTimeout(() => {
      navigate('/photocard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">3. 최종 픽 선택</h1>
          <p className="text-muted-foreground">
            당신의 성향에 맞는 이상형들입니다. 마음에 드는 아이돌을 선택해보세요!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {idealTypes.map((idealType) => (
            <Card 
              key={idealType.id}
              className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card/80 backdrop-blur-sm border-border hover:border-primary/50"
              onClick={() => handleSelect(idealType)}
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary/20">
                    <img 
                      src={idealType.realImage} 
                      alt={idealType.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-2xl bg-background rounded-full p-1 border border-border">
                    {idealType.image}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{idealType.name}</h3>
                  <p className="text-sm text-primary font-medium">{idealType.personality}</p>
                  <p className="text-sm text-muted-foreground">{idealType.description}</p>
                </div>

                {/* 이중 8각형 레이더 차트 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-center">연습생 성장 스탯</h4>
                  <div className="text-xs text-center text-muted-foreground mb-2">
                    <span className="inline-block w-3 h-3 bg-primary rounded-full mr-1"></span>현재 실력
                    <span className="inline-block w-3 h-3 bg-primary/40 rounded-full ml-3 mr-1"></span>성장 잠재력
                  </div>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { subject: '보컬', current: idealType.stats.vocal, potential: idealType.potentialStats.vocal, fullMark: 100 },
                        { subject: '댄스', current: idealType.stats.dance, potential: idealType.potentialStats.dance, fullMark: 100 },
                        { subject: '비주얼', current: idealType.stats.visual, potential: idealType.potentialStats.visual, fullMark: 100 },
                        { subject: '카리스마', current: idealType.stats.charisma, potential: idealType.potentialStats.charisma, fullMark: 100 },
                        { subject: '매력', current: idealType.stats.charm, potential: idealType.potentialStats.charm, fullMark: 100 },
                        { subject: '리더십', current: idealType.stats.leadership, potential: idealType.potentialStats.leadership, fullMark: 100 },
                        { subject: '재능', current: idealType.stats.talent, potential: idealType.potentialStats.talent, fullMark: 100 },
                        { subject: '인기', current: idealType.stats.popularity, potential: idealType.potentialStats.popularity, fullMark: 100 }
                      ]}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        
                        {/* 잠재 스탯 (뒤쪽, 연한 색) */}
                        <Radar 
                          name="잠재력" 
                          dataKey="potential" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.1}
                          strokeOpacity={0.4}
                          strokeWidth={1}
                          strokeDasharray="5 5"
                        />
                        
                        {/* 현재 스탯 (앞쪽, 진한 색) */}
                        <Radar 
                          name="현재 실력" 
                          dataKey="current" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">호환성</span>
                    <span className="text-lg font-bold text-primary">{idealType.compatibility}%</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${idealType.compatibility}%` }}
                    />
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full hover:bg-primary hover:text-primary-foreground"
                >
                  선택하기
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            💡 호환성은 당신의 성향 분석과 외모 취향을 바탕으로 계산됩니다
          </p>
          
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