import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet, Sparkles, Heart, Trophy, Gamepad2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // 임시 지갑 주소 생성 (실제로는 지갑 연결 구현 필요)
      const tempWalletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      localStorage.setItem('walletAddress', tempWalletAddress);
      
      toast.success("지갑이 연결되었습니다!");
      
      setTimeout(() => {
        navigate('/pick');
      }, 1000);
      
    } catch (error) {
      toast.error("지갑 연결에 실패했습니다.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black gradient-text leading-tight">
              최애 아이돌을 고르고,<br />
              추억을 모으세요
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              최애 아이돌을 고르고, 스토리 에피소드를 통해 최애와 나의 추억이 담긴 포토카드를 모아 데뷔와 성장(Rise)을 체감하는 특별한 경험.
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="space-y-4">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="lg"
              className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-200"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  연결 중...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  나의 아이돌 PICK 하러가기
                </>
              )}
            </Button>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            당신의 성향을 분석하고 운명적 아이돌을 만나세요
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4 p-6 glass rounded-2xl border border-white/10">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">아이돌 Pick</h3>
            <p className="text-muted-foreground">
              3명의 매력적인 아이돌 중 당신의 최애를 선택하고 IdolCard NFT를 받아보세요
            </p>
          </div>

          <div className="text-center space-y-4 p-6 glass rounded-2xl border border-white/10">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
              <Gamepad2 className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold">일상 스토리</h3>
            <p className="text-muted-foreground">
              아이돌과 함께하는 달콤한 일상 스토리를 플레이하고 MemoryCard를 수집하세요
            </p>
          </div>

          <div className="text-center space-y-4 p-6 glass rounded-2xl border border-white/10">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold">데뷔 & Rise</h3>
            <p className="text-muted-foreground">
              데뷔 에피소드를 완료하고 Rookie로 승급하며 성장을 체감하세요
            </p>
          </div>
        </div>
      </div>

      {/* 시즌 정보 */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center p-8 glass rounded-2xl border border-white/10 shadow-lg">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold gradient-text">2025 AI심쿵챌린지</h3>
              <p className="text-5xl font-black text-foreground">101</p>
              <p className="text-lg text-muted-foreground">SEASON 1, 당신의 픽으로 탄생하는 K-POP 아이돌</p>
              <p className="text-base text-muted-foreground">
                최애의 성장과 추억을 만드는 특별한 여정
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 설명 */}
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold gradient-text">
            "내일의 무대를 위해, 오늘의 추억을 금고에."
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                핵심 경험
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 아이돌 Pick → IdolCard NFT 발급</li>
                <li>• 일상 스토리 클리어 → MemoryCard 획득</li>
                <li>• 데뷔 에피소드 해금 → Rookie 승급</li>
                <li>• Vault에서 안전한 추억 보관</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                특별한 기능
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 암호화된 대화 로그 보관</li>
                <li>• NFT 포토카드 수집 시스템</li>
                <li>• Rise Point로 성장 추적</li>
                <li>• SBT 데뷔 배지 (Soul Bound Token)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;