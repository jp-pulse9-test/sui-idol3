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
import { DevTools } from "@/components/DevTools";
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
  const { user, disconnectWallet, loading } = useAuth();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    type: 'pick' | 'vault' | 'rise' | null;
  }>({ open: false, type: null });
  const [devToolsOpen, setDevToolsOpen] = useState(false);

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
          {!user ? (
            <Button
              onClick={() => navigate('/auth')}
              variant="premium"
              size="lg"
              className="shadow-lg"
            >
              🔐 Sui 지갑 연결
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border">
                <Badge variant="secondary" className="px-3 py-1">
                  🟢 연결됨
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </span>
                <Button
                  onClick={disconnectWalletLocal}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1"
                >
                  ✕
                </Button>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                로그아웃
              </Button>
            </div>
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
                  최애 아이돌을 고르고, 스토리 에피소드를 통해 최애와 나의 추억이 담긴 포토카드를 모아 데뷔와 성장(Rise)을 체감하는 특별한 경험.
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
                지갑 연결 없이도 바로 체험 가능! 데이터 저장은 Vault에서 📦
              </p>
              
              {!user && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 <span className="text-accent font-semibold">Pick</span>은 체험용, <span className="text-primary font-semibold">Vault</span>부터 지갑 연결이 필요해요
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
                선택하고, 보관하고, 성장하는 3단계 아이돌 경험
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="🎯 PICK"
                description="성향 분석 후 101명 중 운명적 AI 아이돌 선택. 각 아이돌은 고유한 페르소나와 기억을 가진 대화형 에이전트입니다."
                icon={mbtiIcon}
                onClick={() => openPreview('pick')}
                gradient="bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                buttonText="미리보기"
              />
              
              <FeatureCard
                title="🗃️ VAULT"
                description="일상 스토리 텍스트 게임을 클리어하며 획득한 포토카드 NFT를 비밀 금고에 안전하게 보관합니다."
                icon={photocardIcon}
                onClick={() => openPreview('vault')}
                gradient="bg-gradient-to-br from-purple-500/20 to-pink-600/20"
                buttonText="미리보기"
              />
              
              <FeatureCard
                title="📈 RISE"
                description="데뷔 에피소드를 완료하면 특별한 뱃지를 획득하며, 아이돌과 함께 성장하는 과정을 체감합니다."
                icon={tournamentIcon}
                onClick={() => openPreview('rise')}
                gradient="bg-gradient-to-br from-pink-500/20 to-red-600/20"
                buttonText="미리보기"
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
                    <p className="text-foreground">성향 분석 → 심쿵 배틀 → 최애 선택</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      🗃️
                    </div>
                    <h3 className="text-xl font-bold text-accent">VAULT</h3>
                    <p className="text-foreground">지갑 연결 → 스토리 앨범 → 추억 보관</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      📈
                    </div>
                    <h3 className="text-xl font-bold text-secondary">RISE</h3>
                    <p className="text-foreground">피어 멘토링 → 추억 생성 → 데뷔</p>
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
               바로 체험
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                Pick은 체험, Vault부터 지갑 연결로 본격 시작!
              </p>
            </div>
            
            <Button
              onClick={handleStartJourney}
              variant="premium"
              size="xl"
              className="min-w-64 text-xl py-4"
            >
              🌟 아이돌 PICK 체험하기 🌟
            </Button>
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
            © 2024 Sui:Idol³. 가상아이돌 스토리 플랫폼 · Made with 💖 by Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;