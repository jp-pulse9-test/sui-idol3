import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  voice: string;
  dance: string;
  fashion: string;
  manner: string;
  charm: string;
  concept: string;
  type: string;
  gender: string;
  world: string;
}

export const ResultAnalysisEnhanced = () => {
  const navigate = useNavigate();
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [appearanceProfile, setAppearanceProfile] = useState<AppearanceProfile | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const personalityData = localStorage.getItem('personalityProfile');
        const appearanceData = localStorage.getItem('appearanceProfile');
        
        if (!personalityData || !appearanceData) {
          toast.error("프로필 데이터가 없습니다. 처음부터 다시 시작해주세요.");
          navigate('/pick');
          return;
        }

        const personality = JSON.parse(personalityData);
        const appearance = JSON.parse(appearanceData);
        
        setPersonalityProfile(personality);
        setAppearanceProfile(appearance);
        
        // Gemini를 사용하여 팬 성향 분석 생성
        await generateFanAnalysisWithGemini(personality, appearance);
        
      } catch (error) {
        console.error('프로필 로딩 중 에러:', error);
        toast.error("프로필을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [navigate]);

  const generateFanAnalysisWithGemini = async (personality: PersonalityProfile, appearance: AppearanceProfile) => {
    try {
      const selectedGender = localStorage.getItem('selectedGender');
      const selectedWorld = localStorage.getItem('selectedWorld');
      
      const prompt = `당신은 K-POP 아이돌 팬 분석 전문가입니다. 다음 정보를 바탕으로 창의적이고 재미있는 팬 운명 분석을 생성해주세요:

성격 분석:
- MBTI 타입: ${personality.type}
- 특성: ${personality.traits.join(', ')}
- 설명: ${personality.description}

외모 취향:
- 선호 타입: ${appearance.type}
- 헤어: ${appearance.hair}
- 눈매: ${appearance.eyes}
- 체형: ${appearance.body}
- 스타일: ${appearance.style}
- 표정: ${appearance.expression}

세계관: ${selectedWorld}
성별: ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌

요구사항:
1. 웹소설 형태의 창작적인 스토리텔링으로 작성
2. 선택한 세계관(${selectedWorld})을 적극 반영
3. 구체적이고 재미있는 팬 운명 시나리오 제시
4. 한국어로 작성
5. 300-500자 내외로 작성
6. 감정적이고 몰입감 있게 작성

팬 운명 분석을 시작해주세요.`;

      const { data, error } = await supabase.functions.invoke('generate-fan-analysis', {
        body: { prompt }
      });

      if (error) throw error;
      
      if (data?.analysis) {
        setAnalysis(data.analysis);
        localStorage.setItem('fanAnalysis', data.analysis);
      } else {
        // 백업 분석
        setAnalysis(generateBackupAnalysis(personality, appearance, selectedWorld, selectedGender));
      }
    } catch (error) {
      console.error('Gemini 팬 분석 생성 실패:', error);
      // 백업 분석 사용
      const selectedWorld = localStorage.getItem('selectedWorld');
      const selectedGender = localStorage.getItem('selectedGender');
      setAnalysis(generateBackupAnalysis(personality, appearance, selectedWorld, selectedGender));
    }
  };

  const generateBackupAnalysis = (personality: PersonalityProfile, appearance: AppearanceProfile, world: string | null, gender: string | null) => {
    const genderText = gender === 'male' ? '소년' : '소녀';
    const worldText = getWorldDescription(world);
    
    return `${worldText}에서 ${personality.type} 성격의 당신은 ${appearance.type}에게 운명적으로 끌리게 됩니다. 
${personality.traits.join(', ')} 성향을 가진 당신의 마음을 사로잡는 ${genderText} 아이돌과의 특별한 만남이 기다리고 있어요. 
${personality.description} 이런 당신의 특성이 완벽하게 조화를 이루는 운명의 상대방과 곧 만나게 될 것입니다!`;
  };

  const getWorldDescription = (world: string | null) => {
    switch(world) {
      case 'academy': return '청춘과 꿈이 넘치는 아이돌 학원';
      case 'beast': return '신비로운 수인들의 환상적인 세계';
      case 'apocalypse': return '종말 이후 희망을 전하는 세계';
      case 'fantasy': return '마법과 모험이 가득한 판타지 세계';
      default: return '현대적인 아이돌 세계';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">AI가 당신의 팬 운명을 분석하고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">3. 팬 운명 분석 결과</h1>
          <p className="text-xl text-muted-foreground">
            AI가 분석한 당신만의 특별한 팬 운명이에요
          </p>
        </div>

        {personalityProfile && (
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="text-2xl font-bold mb-4 gradient-text">성격 분석</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {personalityProfile.type}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {personalityProfile.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {personalityProfile.description}
              </p>
            </div>
          </Card>
        )}

        {appearanceProfile && (
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="text-2xl font-bold mb-4 gradient-text">외모 취향</h3>
            <div className="space-y-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {appearanceProfile.type}
              </Badge>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>헤어: {appearanceProfile.hair}</div>
                <div>눈매: {appearanceProfile.eyes}</div>
                <div>체형: {appearanceProfile.body}</div>
                <div>스타일: {appearanceProfile.style}</div>
                <div>표정: {appearanceProfile.expression}</div>
                <div>컨셉: {appearanceProfile.concept}</div>
              </div>
            </div>
          </Card>
        )}

        {analysis && (
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-6 gradient-text flex items-center gap-2">
              ✨ AI 팬 운명 분석
            </h3>
            <div className="bg-card/50 p-6 rounded-lg border border-border">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {analysis}
              </p>
            </div>
          </Card>
        )}

        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/appearance')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            이전 단계로
          </Button>
          <Button
            onClick={() => navigate('/final-pick')}
            variant="hero"
            size="lg"
            className="bg-gradient-primary text-primary-foreground px-8"
          >
            이상형 월드컵 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultAnalysisEnhanced;