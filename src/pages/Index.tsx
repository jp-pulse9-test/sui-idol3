import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import mbtiIcon from "@/assets/mbti-icon.jpg";
import tournamentIcon from "@/assets/tournament-icon.jpg";
import photocardIcon from "@/assets/photocard-icon.jpg";

import idolFacesGrid from "@/assets/idol-faces-grid.jpg";
import maleIdolFaces from "@/assets/male-idol-faces.jpg";

// 배경 아이돌 그리드 컴포넌트
const IdolGrid = ({ side }: { side: 'left' | 'right' }) => {
  const backgroundImage = side === 'left' ? maleIdolFaces : idolFacesGrid;
  
  return (
    <div className={`
      fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-64
      overflow-hidden opacity-30
    `}>
      <div 
        className="w-full h-full bg-cover bg-center bg-repeat-y animate-pulse"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          filter: 'blur(1px) brightness(0.8)'
        }}
      />
      <div className={`absolute inset-0 ${side === 'left' ? 'bg-gradient-to-r from-purple-900/50 to-transparent' : 'bg-gradient-to-l from-background/50 to-transparent'}`}></div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      setIsWalletConnected(true);
      setWalletAddress(savedWallet);
    }
  }, []);

  const connectWallet = async () => {
    try {
      // 실제 구현에서는 MetaMask 등의 지갑 연결
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
      setWalletAddress(mockAddress);
      setIsWalletConnected(true);
      localStorage.setItem('walletAddress', mockAddress);
      toast.success("지갑이 연결되었습니다!");
    } catch (error) {
      toast.error("지갑 연결에 실패했습니다.");
    }
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
    localStorage.removeItem('walletAddress');
    toast.success("지갑 연결이 해제되었습니다.");
  };

  const handleStartJourney = () => {
    if (!isWalletConnected) {
      toast.error("먼저 지갑을 연결해주세요!");
      return;
    }
    navigate('/pick');
  };

  return (
    <div className="min-h-screen bg-gradient-background relative overflow-hidden">
      {/* 좌우 아이돌 그리드 배경 */}
      <IdolGrid side="left" />
      <IdolGrid side="right" />
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {/* 상단 지갑 연결 영역 */}
        <div className="fixed top-4 right-4 z-20">
          {!isWalletConnected ? (
            <Button
              onClick={connectWallet}
              variant="premium"
              size="lg"
              className="shadow-lg"
            >
              🔗 지갑으로 참여
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border">
              <Badge variant="secondary" className="px-3 py-1">
                🟢 연결됨
              </Badge>
              <span className="text-sm text-muted-foreground">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </span>
              <Button
                onClick={disconnectWallet}
                variant="ghost"
                size="sm"
                className="h-auto p-1"
              >
                ✕
              </Button>
            </div>
          )}
        </div>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-12 glass-dark p-16 rounded-3xl border border-white/5 shadow-2xl animate-float backdrop-blur-xl">
            <div className="space-y-8">
              <h1 className="text-7xl md:text-9xl font-black font-blacksword tracking-tight text-foreground">
                Sui:AIdol³
              </h1>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                  가상아이돌 이상형 찾기
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  당신의 성향과 맞는 최애 아이돌을 찾고, 아이돌의 일상속 숨은 모습을 수집해보세요.<br />
                  당신의 관심으로 아이돌이 성장합니다.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 items-center">
              {!isWalletConnected ? (
                <>
                  <Button
                    onClick={connectWallet}
                    variant="premium"
                    size="xl"
                    className="min-w-80 text-2xl py-6"
                  >
                    🔗 지갑 연결하고 시작하기
                  </Button>
                  <p className="text-lg text-muted-foreground">
                    웹3 지갑을 연결하여 나만의 아이돌 여정을 시작하세요
                  </p>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleStartJourney}
                    variant="default"
                    size="xl"
                    className="min-w-80 text-2xl py-6 bg-gradient-primary hover:bg-gradient-secondary text-white font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    AI 아이돌 고르러 가기
                  </Button>
                  <p className="text-lg text-muted-foreground">
                    8개 질문으로 당신의 입덕 성향을 분석해보세요
                  </p>
                </>
              )}
            </div>
            
            {/* 시즌 정보 */}
            <div className="mt-12 p-8 glass rounded-2xl border border-white/10 shadow-lg">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold gradient-text">2025 AI심쿵챌린지</h3>
                <p className="text-5xl font-black text-foreground">101</p>
                <p className="text-lg text-muted-foreground">SEASON 1, 당신의 픽으로 만든 새로운 아이돌</p>
                <p className="text-base text-muted-foreground">
                  당신의 이상형을 찾아가는 특별한 여정
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-4 bg-card/60 backdrop-blur-sm p-8 rounded-xl border border-border">
              <h2 className="text-4xl font-bold gradient-text">Pick · Vault · Rise</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                선택하고, 보관하고, 성장하는 3단계 아이돌 경험
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="PICK"
                description="성향 분석과 이상형 월드컵을 통해 101명 중 당신만의 AI 아이돌을 선택하세요."
                icon={mbtiIcon}
                onClick={() => isWalletConnected ? navigate('/pick') : toast.error("먼저 지갑을 연결해주세요!")}
                gradient="bg-gradient-to-br from-blue-500/20 to-purple-600/20"
              />
              
              <FeatureCard
                title="VAULT"
                description="픽한 아이돌들과 포토카드를 안전하게 보관하고 관리하세요."
                icon={photocardIcon}
                onClick={() => navigate('/collection')}
                gradient="bg-gradient-to-br from-purple-500/20 to-pink-600/20"
              />
              
              <FeatureCard
                title="RISE"
                description="아이돌과 함께 성장하며 특별한 추억과 스토리를 만들어가세요."
                icon={tournamentIcon}
                onClick={() => navigate('/progress')}
                gradient="bg-gradient-to-br from-pink-500/20 to-red-600/20"
              />
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-8 bg-gradient-primary/20 backdrop-blur-sm p-12 rounded-2xl border border-primary/30">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold gradient-text">
                  Pick · Vault · Rise 플로우
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      🎯
                    </div>
                    <h3 className="text-xl font-bold text-primary">PICK</h3>
                    <p className="text-foreground">성향 분석 → 이상형 월드컵 → 최종 선택</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      🗃️
                    </div>
                    <h3 className="text-xl font-bold text-accent">VAULT</h3>
                    <p className="text-foreground">프로필 카드 → 포토카드 → 안전한 보관</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      📈
                    </div>
                    <h3 className="text-xl font-bold text-secondary">RISE</h3>
                    <p className="text-foreground">함께 성장 → 추억 생성 → 특별한 스토리</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="text-center space-y-8 bg-gradient-primary/20 backdrop-blur-sm p-12 rounded-2xl border border-primary/30">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold gradient-text">
                지금 바로 시작해보세요!
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                몇 번의 선택으로, 당신만의 가상아이돌을 찾으세요.
              </p>
            </div>
            
            <Button
              onClick={() => isWalletConnected ? navigate('/pick') : toast.error("먼저 지갑을 연결해주세요!")}
              variant="premium"
              size="xl"
              className="min-w-64 text-xl py-4"
            >
              🌟 AI 아이돌 여정 시작하기 🌟
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center bg-card/30 backdrop-blur-sm rounded-t-xl border-t border-border">
          <p className="text-muted-foreground">
            © 2024 Sui:AIdol³. Made with 💖 by Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;