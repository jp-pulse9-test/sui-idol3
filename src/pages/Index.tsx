import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { secureStorage } from "@/utils/secureStorage";
import PreviewModal from "@/components/PreviewModal";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ZkLoginButton } from "@/components/ZkLoginButton";
import { Settings, Shield, Camera, Wallet, Coins, Crown } from "lucide-react";
import mbtiIcon from "@/assets/mbti-icon.jpg";
import tournamentIcon from "@/assets/tournament-icon.jpg";
import photocardIcon from "@/assets/photocard-icon.jpg";
import { autoApplySuperAdminBenefits } from "@/utils/superAdminBenefits";

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
  const { user, disconnectWallet, loading } = useAuth();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    type: 'pick' | 'vault' | 'rise' | null;
  }>({ open: false, type: null });

  useEffect(() => {
    const savedWallet = secureStorage.getWalletAddress();
    if (savedWallet) {
      setIsWalletConnected(true);
      setWalletAddress(savedWallet);
    }
  }, []);

  // Sync wallet state with auth context
  useEffect(() => {
    if (user?.wallet_address) {
      setIsWalletConnected(true);
      setWalletAddress(user.wallet_address);
    } else {
      setIsWalletConnected(false);
      setWalletAddress("");
    }
    
    // 수퍼어드민 특권 자동 적용
    if (user?.wallet_address) {
      autoApplySuperAdminBenefits();
    }
  }, [user]);

  const connectWallet = async () => {
    navigate('/auth');
  };

  const disconnectWalletLocal = () => {
    disconnectWallet();
    setIsWalletConnected(false);
    setWalletAddress("");
    toast.success("지갑 연결이 해제되었습니다.");
  };

  const handleStartJourney = () => {
    navigate('/pick');
  };

  const handleVaultAccess = () => {
    if (!user) {
      toast.error("Vault 이용을 위해 Sui 지갑 연결이 필요합니다!");
      navigate('/auth');
      return;
    }
    navigate('/vault');
  };

  const handleRiseAccess = () => {
    if (!user) {
      toast.error("Rise 이용을 위해 Sui 지갑 연결이 필요합니다!");
      navigate('/auth');
      return;
    }
    navigate('/rise');
  };

  const handleSignOut = async () => {
    await disconnectWallet();
    disconnectWalletLocal();
    toast.success("로그아웃되었습니다.");
  };

  const openPreview = (type: 'pick' | 'vault' | 'rise') => {
    setPreviewModal({ open: true, type });
  };

  const closePreview = () => {
    setPreviewModal({ open: false, type: null });
  };

  const handlePreviewStart = () => {
    closePreview();
    if (previewModal.type === 'pick') {
      handleStartJourney();
    } else if (previewModal.type === 'vault') {
      handleVaultAccess();
    } else if (previewModal.type === 'rise') {
      handleRiseAccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background relative overflow-hidden">
      {/* 좌우 아이돌 그리드 배경 */}
      <IdolGrid side="left" />
      <IdolGrid side="right" />
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {/* 상단 인증 및 지갑 연결 영역 */}
        <div className="fixed top-4 right-4 z-20 flex gap-2">
          <WalletConnectButton 
            variant="premium" 
            size="lg" 
            className="shadow-lg"
          />
          <ZkLoginButton 
            variant="outline" 
            size="lg" 
            className="shadow-lg"
          />
          {user && (
            <>
              <Button
                onClick={() => navigate('/photocard-generator')}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title="포토카드 생성기"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-12 glass-dark p-16 rounded-3xl border border-white/5 shadow-2xl animate-float backdrop-blur-xl">
            <div className="space-y-8">
              <h1 className="text-7xl md:text-9xl font-black font-blacksword tracking-tight text-foreground">
                Sui:Idol³
              </h1>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                  가상아이돌 스토리 플랫폼
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  성향 분석으로 나와 잘 맞는 아이돌을 찾고, 랜덤박스로 포토카드를 수집하며, 리더보드에서 다른 팬들과 경쟁하는 완전한 팬덤 경험.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 items-center">
              <Button
                onClick={handleStartJourney}
                variant="default"
                size="xl"
                className="min-w-80 text-2xl py-6 bg-gradient-primary hover:bg-gradient-secondary text-white font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🎮 나의 아이돌 PICK 하러가기
              </Button>
              <p className="text-lg text-muted-foreground">
                Pick은 체험, Vault는 수집, Rise는 경쟁과 거래!
              </p>
              <p className="text-base text-muted-foreground">
                심쿵 배틀로 최애를 고르고 → 랜덤박스로 포카 만들고 → 리더보드와 마켓에서 빛나세요.
              </p>
              
              {!user && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 지갑 연결 없이도 바로 체험 가능! Vault부터 본격 수집과 거래 시작
                  </p>
                </div>
              )}
            </div>
            
            {/* 시즌 정보 */}
            <div className="mt-12 p-8 glass rounded-2xl border border-white/10 shadow-lg">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold gradient-text">2025 AI심쿵챌린지</h3>
                <p className="text-5xl font-black text-foreground">101</p>
                <p className="text-lg text-muted-foreground">SEASON 1, 당신의 픽으로 탄생하는 K-POP 아이돌</p>
                <p className="text-base text-muted-foreground">
                  최애의 성장과 추억을 만드는 특별한 여정
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
                선택하고, 수집하고, 경쟁하는 3단계 팬덤 경험
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="🎯 PICK"
                description="3가지 방식 성향 분석 후 16강 심쿵 배틀로 운명의 아이돌 선택. 각 아이돌은 고유한 매력과 개성을 가진 AI 캐릭터입니다."
                icon={mbtiIcon}
                onClick={() => openPreview('pick')}
                gradient="bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                buttonText="미리보기"
              />
              
              <FeatureCard
                title="🗃️ VAULT"
                description="최애를 안전하게 수납하고 랜덤박스로 포토카드를 수집하세요. 희귀한 카드일수록 더 높은 가치를 가집니다."
                icon={photocardIcon}
                onClick={() => openPreview('vault')}
                gradient="bg-gradient-to-br from-purple-500/20 to-pink-600/20"
                buttonText="미리보기"
              />
              
               <FeatureCard
                title="📈 RISE"
                description="아이돌 리더보드에서 인기 순위를 확인하고, 공개 갤러리에서 모든 유저의 포카를 구경하며, 마켓플레이스에서 자유롭게 거래하세요."
                icon={tournamentIcon}
                onClick={() => openPreview('rise')}
                gradient="bg-gradient-to-br from-pink-500/20 to-red-600/20"
                buttonText="미리보기"
              />
              
              <FeatureCard
                title="🖼️ 공개 갤러리"
                description="모든 유저들이 만든 아이돌 포토카드를 인물별로 탐색하고, 마음에 드는 작품에 하트를 보내세요."
                icon={photocardIcon}
                onClick={() => navigate('/gallery')}
                gradient="bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                buttonText="갤러리 보기"
              />
            </div>

            {/* zkLogin 테스트 링크 */}
            <div className="mt-8 text-center space-y-3">
              <Button
                onClick={() => navigate('/zklogin-test')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                zkLogin 테스트
              </Button>
              <Button
                onClick={() => navigate('/zklogin-test-official')}
                variant="outline"
                className="flex items-center gap-2 bg-blue-600/20 border-blue-400 text-blue-400 hover:bg-blue-600/30"
              >
                <Shield className="w-4 h-4" />
                공식 zkLogin 테스트
              </Button>
              <Button
                onClick={() => navigate('/zklogin-test-working')}
                variant="outline"
                className="flex items-center gap-2 bg-green-600/20 border-green-400 text-green-400 hover:bg-green-600/30"
              >
                <Shield className="w-4 h-4" />
                실제 작동 zkLogin 테스트
              </Button>
              <Button
                onClick={() => navigate('/sui-balance-test')}
                variant="outline"
                className="flex items-center gap-2 bg-purple-600/20 border-purple-400 text-purple-400 hover:bg-purple-600/30"
              >
                <Wallet className="w-4 h-4" />
                SUI 잔액 API 테스트
              </Button>
              <Button
                onClick={() => navigate('/photocard-minting-test')}
                variant="outline"
                className="flex items-center gap-2 bg-yellow-600/20 border-yellow-400 text-yellow-400 hover:bg-yellow-600/30"
              >
                <Coins className="w-4 h-4" />
                포토카드 민팅 테스트
              </Button>
              <Button
                onClick={() => navigate('/idolcard-minting-test')}
                variant="outline"
                className="flex items-center gap-2 bg-pink-600/20 border-pink-400 text-pink-400 hover:bg-pink-600/30"
              >
                <Crown className="w-4 h-4" />
                아이돌 카드 민팅 테스트
              </Button>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-8 bg-gradient-primary/20 backdrop-blur-sm p-12 rounded-2xl border border-primary/30">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold gradient-text">
                  Pick · Vault · Rise · Gallery 플로우
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      🎯
                    </div>
                    <h3 className="text-xl font-bold text-primary">PICK</h3>
                    <p className="text-foreground">성향 분석 → 심쿵 배틀 → 최애 민팅</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      🗃️
                    </div>
                    <h3 className="text-xl font-bold text-accent">VAULT</h3>
                    <p className="text-foreground">최애 수납 → 랜덤박스 → 포카 수집</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      📈
                    </div>
                    <h3 className="text-xl font-bold text-secondary">RISE</h3>
                    <p className="text-foreground">리더보드 → 갤러리 → 거래소</p>
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
               바로 즐겨! Pick에서 심쿵 픽
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                 내가 PICK한 아이돌, 포카는 랜박으로, 자랑은 리더보드로!
               </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleStartJourney}
                variant="premium"
                size="xl"
                className="min-w-64 text-xl py-4"
              >
                🌟 성향 분석으로 최애 PICK하기 🌟
              </Button>
              <Button
                onClick={() => navigate('/gallery')}
                variant="outline"
                size="xl"
                className="min-w-64 text-xl py-4 border-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                🖼️ 공개 갤러리 둘러보기
              </Button>
            </div>
          </div>
        </section>

        {/* Preview Modal */}
        <PreviewModal
          open={previewModal.open}
          onOpenChange={closePreview}
          type={previewModal.type!}
          onStartJourney={handlePreviewStart}
        />

        {/* Footer */}
        <footer className="py-8 text-center bg-card/30 backdrop-blur-sm rounded-t-xl border-t border-border">
          <p className="text-muted-foreground">
            © 2024 Sui:Idol³. K-POP 팬덤 플랫폼 · Made with 💖 by Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;