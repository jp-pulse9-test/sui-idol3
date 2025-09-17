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
      
      // 입덕 운명 풀이 생성
      generateFanDestinyAnalysis(personality, appearance);
    } catch (error) {
      toast.error("데이터를 불러올 수 없습니다.");
      navigate('/');
    }
  }, [navigate]);

  const generateFanDestinyAnalysis = (personality: PersonalityProfile, appearance: AppearanceProfile) => {
    const analyses = [
      {
        condition: personality.type.includes("외향") && appearance.type.includes("귀여운"),
        text: "🌟 입덕 운명: 밝은 에너지 마그넷 🌟\n\n당신은 태양 같은 밝은 에너지에 자연스럽게 끌리는 팬 타입입니다! 귀엽고 순수한 매력을 가진 아이돌을 보면 마음이 저절로 따뜻해지며, 그들의 밝은 미소 하나만으로도 하루 종일 행복해질 수 있어요.\n\n💫 입덕 포인트: 순수한 웃음소리, 팬들과의 자연스러운 소통, 무대 위 밝은 에너지\n🎯 추천 아이돌 타입: 비타민 같은 존재감, 친근한 매력, 팬서비스 만점"
      },
      {
        condition: personality.type.includes("내향") && appearance.type.includes("섹시한"),
        text: "🌙 입덕 운명: 카리스마 헌터 🌙\n\n당신은 강렬하고 신비로운 매력에 깊이 빠지는 팬 타입입니다! 한 번의 시선, 한 번의 퍼포먼스만으로도 마음을 완전히 사로잡히며, 그들의 카리스마 넘치는 모든 순간을 놓치고 싶지 않아해요.\n\n💫 입덕 포인트: 강렬한 무대 퍼포먼스, 깊이 있는 눈빛, 예술적 감성\n🎯 추천 아이돌 타입: 무대 장악력, 신비로운 분위기, 감정 표현의 달인"
      },
      {
        condition: appearance.type.includes("카리스마"),
        text: "⚡ 입덕 운명: 리더십 어트랙터 ⚡\n\n당신은 강한 존재감과 리더십을 가진 아이돌에게 끌리는 팬 타입입니다! 자신감 넘치는 모습과 팀을 이끄는 카리스마에 매료되며, 그들의 든든한 리더십에서 안정감과 신뢰를 느껴요.\n\n💫 입덕 포인트: 확신에 찬 무대 매너, 팀원들을 이끄는 모습, 강한 책임감\n🎯 추천 아이돌 타입: 팀의 중심 역할, 무대 장악력, 프로페셔널한 마인드"
      },
      {
        condition: personality.type.includes("감성적") || appearance.type.includes("따뜻한"),
        text: "🌸 입덕 운명: 힐링 시커 🌸\n\n당신은 따뜻하고 진실한 마음을 가진 아이돌에게 자연스럽게 끌리는 팬 타입입니다! 그들의 진심 어린 말 한마디, 따뜻한 행동 하나하나가 마음을 치유해주며, 진정한 위로와 힘을 받아요.\n\n💫 입덕 포인트: 진심이 담긴 소통, 팬들을 향한 세심한 배려, 자연스러운 매력\n🎯 추천 아이돌 타입: 감정적 교감, 따뜻한 성격, 힐링 바이브"
      },
      {
        condition: true, // 기본값
        text: "✨ 입덕 운명: 올라운드 팬 ✨\n\n당신은 아이돌의 다양한 매력에 골고루 끌리는 균형 잡힌 팬 타입입니다! 외모도 중요하지만 실력과 인성, 그리고 진정성을 모두 갖춘 완벽한 아이돌을 찾고 있어요. 깊이 있는 팬덤 활동을 즐기는 타입이에요.\n\n💫 입덕 포인트: 완벽한 실력, 매력적인 성격, 팬들을 향한 진심\n🎯 추천 아이돌 타입: 올라운더, 성실한 노력파, 팬들과의 진실한 소통"
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
          <h1 className="text-4xl font-bold gradient-text">입덕 운명 풀이</h1>
          <p className="text-muted-foreground">당신의 이상형 성향과 입덕 운명이 밝혀졌습니다</p>
        </div>

        {/* 입덕 운명 결과 카드 */}
        <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border-2 border-primary/30">
          <div className="text-center space-y-6">
            <div className="text-6xl">💫</div>
            
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

        {/* 입덕 운명 해석 */}
        <Card className="max-w-3xl mx-auto p-8 bg-card/80 backdrop-blur-sm border-border">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center gradient-text">당신의 입덕 운명</h3>
            
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