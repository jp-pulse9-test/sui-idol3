import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface PersonalityProfile {
  type: string;
  traits: string[];
  description: string;
}

interface AppearanceProfile {
  hair: string;
  eyes: string;
  body: string;
  style: string;
  expression: string;
  type: string;
}

export const ResultAnalysis = () => {
  const navigate = useNavigate();
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [appearanceProfile, setAppearanceProfile] = useState<AppearanceProfile | null>(null);
  const [analysis, setAnalysis] = useState<string>("");

  useEffect(() => {
    const storedPersonality = localStorage.getItem('personalityProfile');
    const storedAppearance = localStorage.getItem('appearanceProfile');
    
    if (!storedPersonality || !storedAppearance) {
      toast.error("분석 데이터가 없습니다. 처음부터 시작해주세요.");
      navigate('/gender-select');
      return;
    }

    try {
      const personality = JSON.parse(storedPersonality);
      const appearance = JSON.parse(storedAppearance);
      
      setPersonalityProfile(personality);
      setAppearanceProfile(appearance);
      
      // 타로카드 스타일 해설 생성
      generateTarotAnalysis(personality, appearance);
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generateTarotAnalysis = (personality: PersonalityProfile, appearance: AppearanceProfile) => {
    const analyses = [
      {
        condition: personality.type.includes("외향") && appearance.type.includes("귀여운"),
        text: "🌟 당신의 운명의 카드: 태양 🌟\n\n밝고 긍정적인 에너지를 가진 당신은 귀여운 매력에 끌립니다. 당신이 찾는 이상형은 햇살 같은 미소로 주변을 밝히는 사람입니다. 이들은 순수하고 자연스러운 매력으로 당신의 마음을 사로잡을 것입니다.\n\n💫 추천 포인트: 밝은 에너지, 순수한 미소, 자연스러운 매력"
      },
      {
        condition: personality.type.includes("내향") && appearance.type.includes("섹시한"),
        text: "🌙 당신의 운명의 카드: 달 🌙\n\n신비롭고 깊이 있는 당신은 강렬한 매력에 끌립니다. 당신이 찾는 이상형은 한 번의 시선으로도 강한 인상을 남기는 카리스마 있는 사람입니다. 이들의 신비로운 매력이 당신의 숨겨진 열정을 깨워줄 것입니다.\n\n💫 추천 포인트: 강렬한 눈빛, 카리스마, 신비로운 분위기"
      },
      {
        condition: appearance.type.includes("카리스마"),
        text: "⚡ 당신의 운명의 카드: 힘 ⚡\n\n강하고 당당한 매력에 끌리는 당신! 당신이 찾는 이상형은 무대 위에서 모든 시선을 사로잡는 강력한 존재감을 가진 사람입니다. 이들의 확신에 찬 모습과 리더십이 당신을 매료시킬 것입니다.\n\n💫 추천 포인트: 강한 존재감, 리더십, 자신감 넘치는 모습"
      },
      {
        condition: true, // 기본값
        text: "✨ 당신의 운명의 카드: 별 ✨\n\n균형잡힌 감성을 가진 당신은 자연스럽고 편안한 매력에 끌립니다. 당신이 찾는 이상형은 특별하지 않은 순간에도 특별함을 만들어내는 사람입니다. 이들의 따뜻하고 진실한 마음이 당신에게 안정감을 줄 것입니다.\n\n💫 추천 포인트: 자연스러운 매력, 따뜻한 성격, 진실한 마음"
      }
    ];

    const selectedAnalysis = analyses.find(analysis => analysis.condition)?.text || analyses[analyses.length - 1].text;
    setAnalysis(selectedAnalysis);
  };

  const handleContinue = () => {
    navigate('/final-pick');
  };

  if (!personalityProfile || !appearanceProfile) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">분석 결과를 생성중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">타로 운명 해석</h1>
          <p className="text-muted-foreground">당신의 이상형 성향이 밝혀졌습니다</p>
        </div>

        {/* 타로카드 스타일 결과 카드 */}
        <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border-2 border-primary/30">
          <div className="text-center space-y-6">
            <div className="text-6xl">🔮</div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">당신의 이상형 프로필</h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2">
                  <h3 className="font-bold text-primary">내면 성향</h3>
                  <p className="text-sm text-muted-foreground">{personalityProfile.type}</p>
                  <p className="text-sm">{personalityProfile.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-primary">외모 취향</h3>
                  <p className="text-sm text-muted-foreground">{appearanceProfile.type}</p>
                  <p className="text-sm">
                    헤어: {appearanceProfile.hair} | 
                    스타일: {appearanceProfile.style}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 타로카드 해석 */}
        <Card className="max-w-3xl mx-auto p-8 bg-card/80 backdrop-blur-sm border-border">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center gradient-text">운명의 해석</h3>
            
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {analysis}
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center space-y-4">
          <Button
            onClick={handleContinue}
            variant="premium"
            size="lg"
            className="min-w-48"
          >
            🎯 최종 픽 선택하기
          </Button>
          
          <div>
            <Button
              onClick={() => navigate('/appearance')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              이전 단계로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultAnalysis;