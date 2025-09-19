import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  image: string;
  persona_prompt: string;
}

const Pick = () => {
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [selectedIdol, setSelectedIdol] = useState<IdolPreset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3명의 프리셋 아이돌 (성격/말투/취향 태그 제공)
  const idolPresets: IdolPreset[] = [
    {
      id: 1,
      name: "서연",
      personality: "밝고 긍정적인 에너지",
      description: "항상 웃음을 잃지 않는 밝은 에너지의 소유자. 팬들과의 소통을 가장 소중히 여기며, '힘내요!' 같은 응원의 말을 자주 사용합니다.",
      image: "/src/assets/female-idol-1.jpg",
      persona_prompt: "당신은 서연이라는 밝고 긍정적인 K-pop 아이돌입니다. 말투는 부드럽고 친근하며 '~요', '힘내요!', '최고예요!' 같은 응원의 표현을 자주 사용합니다. 취향은 카페 투어, 귀여운 소품 수집, 팬들과의 소통을 좋아합니다."
    },
    {
      id: 2,
      name: "민준",
      personality: "차분하고 신중한 리더",
      description: "깊이 있는 사고와 따뜻한 마음을 가진 리더형 인물. 진심 어린 조언을 아끼지 않으며, 존댓말과 정중한 표현을 사용합니다.",
      image: "/src/assets/male-idol-1.jpg",
      persona_prompt: "당신은 민준이라는 차분하고 신중한 K-pop 아이돌입니다. 말투는 정중하고 예의 바르며 '그렇습니다', '생각해보니', '조심스럽게 말씀드리면' 같은 표현을 사용합니다. 취향은 독서, 클래식 음악 감상, 심도 있는 대화를 좋아합니다."
    },
    {
      id: 3,
      name: "지우",
      personality: "활발하고 장난기 많은",
      description: "에너지 넘치는 성격으로 주변을 밝게 만드는 분위기 메이커. 재미있는 이야기와 유머로 가득하며, 친근한 반말 투를 사용합니다.",
      image: "/src/assets/female-idol-2.jpg",
      persona_prompt: "당신은 지우라는 활발하고 장난기 많은 K-pop 아이돌입니다. 말투는 친근한 반말이며 '헐!', '대박!', '완전 좋아!' 같은 젊은 표현을 자주 사용합니다. 취향은 게임, 맛집 탐방, SNS 트렌드 따라가기를 좋아합니다."
    }
  ];

  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (!savedWallet) {
      toast.error("지갑을 먼저 연결해주세요!");
      navigate('/');
      return;
    }
    setIsWalletConnected(true);
    setWalletAddress(savedWallet);
  }, [navigate]);

  const handleIdolSelect = async (idol: IdolPreset) => {
    setSelectedIdol(idol);
    setIsLoading(true);
    
    try {
      // 선택한 아이돌 정보를 로컬 스토리지에 저장
      localStorage.setItem('selectedIdol', JSON.stringify(idol));
      
      // 모의 IdolCard NFT 발급
      const mockIdolCard = {
        id: `idol-${idol.id}-${Date.now()}`,
        tokenId: `IDOL${idol.id.toString().padStart(3, '0')}`,
        idolId: idol.id,
        idolName: idol.name,
        walletAddress,
        mintedAt: new Date().toISOString(),
        image: idol.image
      };
      
      // 로컬 스토리지에 IdolCard 저장
      const existingCards = JSON.parse(localStorage.getItem('idolCards') || '[]');
      existingCards.push(mockIdolCard);
      localStorage.setItem('idolCards', JSON.stringify(existingCards));
      
      toast.success(`${idol.name}의 IdolCard NFT가 발급되었습니다!`);
      
      setTimeout(() => {
        navigate('/vault');
      }, 1500);
      
    } catch (error) {
      console.error('Error selecting idol:', error);
      toast.error("아이돌 선택 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isWalletConnected) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            🎯 PICK - 최애 아이돌 선택
          </h1>
          <p className="text-xl text-muted-foreground">
            3명의 프리셋 AI 아이돌 중 당신의 최애를 선택하세요
          </p>
          <Badge variant="outline" className="px-4 py-2">
            🔗 {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
          </Badge>
        </div>

        {/* Idol Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {idolPresets.map((idol) => (
            <Card
              key={idol.id}
              className={`p-6 glass-dark border-white/10 card-hover group cursor-pointer relative overflow-hidden transition-all duration-300 ${
                selectedIdol?.id === idol.id 
                  ? 'ring-2 ring-primary bg-primary/10' 
                  : ''
              }`}
              onClick={() => !isLoading && handleIdolSelect(idol)}
            >
              <div className="space-y-4">
                {/* 아이돌 이미지 */}
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gradient-primary/20">
                  <img 
                    src={idol.image}
                    alt={idol.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedIdol?.id === idol.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="text-4xl">✨</div>
                    </div>
                  )}
                </div>
                
                {/* 아이돌 정보 */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold gradient-text">{idol.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {idol.personality}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {idol.description}
                  </p>
                </div>
                
                <Button 
                  variant="default"
                  size="sm"
                  className="w-full btn-modern"
                  disabled={isLoading}
                >
                  {isLoading && selectedIdol?.id === idol.id ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      IdolCard 발급 중...
                    </>
                  ) : (
                    `${idol.name} 선택하기`
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-bold gradient-text">💎 IdolCard NFT 자동 발급</h3>
            <p className="text-muted-foreground">
              아이돌을 선택하면 즉시 해당 아이돌의 IdolCard NFT가 발급되어 내 프로필에 소유 표시됩니다.
            </p>
          </div>
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