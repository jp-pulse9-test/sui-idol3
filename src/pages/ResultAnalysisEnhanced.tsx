import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Heart, Star } from "lucide-react";

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
  const [tarotImage, setTarotImage] = useState<string | null>(null);
  const [tarotLoading, setTarotLoading] = useState(false);

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
        
        // 타로카드 이미지 생성
        await generateTarotCard();
        
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

성별: ${selectedGender === 'male' ? '소년' : '소녀'} 아이돌

요구사항:
1. 웹소설 형태의 창작적인 스토리텔링으로 작성
2. 현대적인 아이돌 세계관을 반영
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
        setAnalysis(generateBackupAnalysis(personality, appearance, 'modern', selectedGender));
      }
    } catch (error) {
      console.error('Gemini 팬 분석 생성 실패:', error);
      // 백업 분석 사용
      const selectedGender = localStorage.getItem('selectedGender');
      setAnalysis(generateBackupAnalysis(personality, appearance, 'modern', selectedGender));
    }
  };

  const generateTarotCard = async () => {
    try {
      setTarotLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-idol-image', {
        body: { 
          type: 'tarot'
        }
      });

      if (error) throw error;
      
      if (data?.imageUrl) {
        setTarotImage(data.imageUrl);
      }
    } catch (error) {
      console.error('타로카드 생성 실패:', error);
      // 실패해도 조용히 넘어감 (선택적 기능)
    } finally {
      setTarotLoading(false);
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold gradient-text">팬 운명 분석 결과</h1>
          <p className="text-base text-muted-foreground">
            AI가 분석한 당신만의 특별한 팬 운명
          </p>
        </div>

        {personalityProfile && (
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="text-xl font-bold mb-3 gradient-text flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              성격 분석
            </h3>
            <div className="space-y-3">
              <Badge variant="outline" className="text-base px-3 py-1">
                {personalityProfile.type}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {personalityProfile.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {appearanceProfile && (
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
            <h3 className="text-xl font-bold mb-3 gradient-text flex items-center gap-2">
              <Heart className="w-5 h-5" />
              외모 취향
            </h3>
            <div className="space-y-3">
              <Badge variant="outline" className="text-base px-3 py-1">
                {appearanceProfile.type}
              </Badge>
            </div>
          </Card>
        )}

        {analysis && (
          <Card className="p-0 bg-black border border-white/10 overflow-hidden shadow-lg">
            {/* 헤더 */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ✨ AI 팬 운명 분석
              </h3>
            </div>
            
            {/* 타로카드 이미지 */}
            <div className="relative w-full bg-gradient-to-b from-purple-900/30 to-pink-900/30 p-8 flex items-center justify-center">
              {tarotLoading ? (
                <div className="w-40 h-60 bg-black/40 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
                    <p className="text-xs text-gray-300">카드 준비 중...</p>
                  </div>
                </div>
              ) : tarotImage ? (
                <img 
                  src={tarotImage} 
                  alt="운명의 타로카드" 
                  className="w-48 h-72 object-cover rounded-lg shadow-xl"
                />
              ) : (
                <div className="w-40 h-60 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-xl">
                  <div className="absolute inset-0 bg-black/20 rounded-lg" />
                  <div className="absolute inset-2 border-2 border-white/30 rounded-lg" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Star className="w-12 h-12 text-yellow-300" fill="currentColor" />
                    <Heart className="w-10 h-10 text-pink-200" fill="currentColor" />
                    <p className="text-white font-bold text-base">運命</p>
                    <p className="text-white/80 text-xs">DESTINY</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 본문 */}
            <div className="p-6 bg-gradient-to-b from-black to-gray-900">
              <div className="space-y-4 text-sm text-gray-100 leading-relaxed">
                {analysis.split('\n').map((line, idx) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-3 first:mt-0">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-base font-semibold text-gray-200 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                  }
                  if (line.trim() === '') {
                    return <div key={idx} className="h-2" />;
                  }
                  const processedLine = line
                    .split(/(\*\*.*?\*\*|\*.*?\*)/)
                    .map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                      }
                      if (part.startsWith('*') && part.endsWith('*')) {
                        return <em key={i} className="italic text-gray-300">{part.slice(1, -1)}</em>;
                      }
                      return part;
                    });
                  return <p key={idx} className="text-sm leading-relaxed">{processedLine}</p>;
                })}
              </div>
            </div>
            
            {/* 푸터 */}
            <div className="px-6 pb-5 pt-2 bg-black/50">
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  💡 AI가 생성한 창작 콘텐츠
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-center space-x-4 pt-6 pb-8">
          <Button
            onClick={() => navigate('/appearance')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            이전 단계로
          </Button>
          <Button
            onClick={() => navigate('/idol-gallery')}
            variant="hero"
            size="lg"
            className="bg-gradient-primary text-primary-foreground px-8"
          >
            분석 결과에 맞는 AIDOL 추천받기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultAnalysisEnhanced;