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
import { Settings, Camera, Database } from "lucide-react";
import mbtiIcon from "@/assets/mbti-icon.jpg";
import tournamentIcon from "@/assets/tournament-icon.jpg";
import photocardIcon from "@/assets/photocard-icon.jpg";
import { WalrusFileUpload } from "@/components/WalrusFileUpload";
import { WalrusFileDownload } from "@/components/WalrusFileDownload";
import { WalrusFlowUpload } from "@/components/WalrusFlowUpload";
import { WalrusPhotocardGallery } from "@/components/WalrusPhotocardGallery";


import idolFacesGrid from "@/assets/idol-faces-grid.jpg";
import maleIdolFaces from "@/assets/male-idol-faces.jpg";

// Background idol grid component
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
  const [showWalrusTools, setShowWalrusTools] = useState(false);
  const [showPhotocardGallery, setShowPhotocardGallery] = useState(false);

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
    
    // Automatically apply super admin privileges
    if (user?.wallet_address) {
      // Admin features removed
    }
  }, [user]);

  const connectWallet = async () => {
    navigate('/auth');
  };

  const disconnectWalletLocal = () => {
    disconnectWallet();
    setIsWalletConnected(false);
    setWalletAddress("");
    toast.success("Wallet disconnected successfully.");
  };

  const handleStartJourney = () => {
    navigate('/pick');
  };

  const handleVaultAccess = () => {
    if (!user) {
      toast.error("Sui wallet connection required for Vault access!");
      navigate('/auth');
      return;
    }
    navigate('/vault');
  };

  const handleRiseAccess = () => {
    if (!user) {
      toast.error("Sui wallet connection required for Rise access!");
      navigate('/auth');
      return;
    }
    navigate('/rise');
  };

  const handleSignOut = async () => {
    await disconnectWallet();
    disconnectWalletLocal();
    toast.success("Logged out successfully.");
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
      {/* Left and right idol grid background */}
      <IdolGrid side="left" />
      <IdolGrid side="right" />
      
      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {/* Top authentication and wallet connection area */}
        <div className="fixed top-4 right-4 z-20 flex gap-2">
          <WalletConnectButton 
            variant="premium" 
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
                title="Photocard Generator"
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
                AIDOL
              </h1>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                  AI 아이돌 팬덤 플랫폼
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  AI 심쿵톡으로 24/7 대화하며 나만의 아이돌을 찾고, 포토카드를 수집하고 거래하세요.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 items-center">
              <Button
                onClick={() => navigate('/demo-chat')}
                variant="default"
                size="xl"
                className="min-w-80 text-2xl py-6 bg-gradient-primary hover:bg-gradient-secondary text-white font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                💖 AI 심쿵톡 무료 체험
              </Button>
              
              {!user && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 지갑 연결 없이 바로 체험 가능! AI와 대화하며 당신의 성향을 분석해보세요
                  </p>
                </div>
              )}
            </div>
            
            {/* Season information */}
            <div className="mt-12 p-8 glass rounded-2xl border border-white/10 shadow-lg">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold gradient-text">2025 AI 심쿵 챌린지</h3>
                <p className="text-5xl font-black text-foreground">101</p>
                <p className="text-lg text-muted-foreground">시즌 1, 당신의 픽으로 탄생한 K-POP 아이돌들</p>
                <p className="text-base text-muted-foreground">
                  최애와 함께 성장하고 추억을 만드는 특별한 여정
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 이상형 월드컵 섹션 */}
        <section className="py-20">
          <div className="text-center space-y-6 glass p-12 rounded-2xl">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold gradient-text">
                이상형 월드컵으로 최애 찾기
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                16강 심쿵 배틀 · 성격 테스트 · 운명의 아이돌 발견
              </p>
              <Button
                onClick={handleStartJourney}
                variant="outline"
                size="lg"
                className="font-semibold text-base px-8 py-4 mt-4"
              >
                🎯 최애 찾기 시작
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-4 glass p-8 rounded-xl">
              <h2 className="text-4xl font-bold gradient-text">PICK · VAULT · RISE</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                아이돌 발견 → 포토카드 수집 → 팬덤 경쟁
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="🎯 PICK"
                description="성격 테스트와 16강 심쿵 배틀로 운명의 아이돌 발견"
                icon={mbtiIcon}
                onClick={() => openPreview('pick')}
                gradient="bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                buttonText="미리보기"
              />
              
              <FeatureCard
                title="🗃️ VAULT"
                description="랜덤박스로 희귀 포토카드 수집 및 보관"
                icon={photocardIcon}
                onClick={() => openPreview('vault')}
                gradient="bg-gradient-to-br from-purple-500/20 to-pink-600/20"
                buttonText="미리보기"
              />
              
               <FeatureCard
                 title="📈 RISE"
                 description="리더보드 순위 확인 및 마켓플레이스 거래"
                icon={tournamentIcon}
                onClick={() => openPreview('rise')}
                gradient="bg-gradient-to-br from-pink-500/20 to-red-600/20"
                buttonText="미리보기"
              />
              
            </div>
          </div>
        </section>


        {/* Walrus Tools Section */}
        {showWalrusTools && (
          <section className="py-20">
            <div className="space-y-12">
              <div className="text-center space-y-4 bg-card/60 backdrop-blur-sm p-8 rounded-xl border border-border">
                <h2 className="text-4xl font-bold gradient-text">월러스 스토리지 도구</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  분산 스토리지에 파일 업로드 및 다운로드
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <WalrusFileUpload 
                  onUploadComplete={(result) => {
                    toast.success(`파일이 업로드되었습니다! Blob ID: ${result.blobId.slice(0, 8)}...`);
                  }}
                />
                <WalrusFileDownload 
                  onDownloadComplete={(file) => {
                    toast.success('파일이 성공적으로 다운로드되었습니다!');
                  }}
                />
              </div>

              <div className="max-w-4xl mx-auto">
                <WalrusFlowUpload 
                  onUploadComplete={(files) => {
                    toast.success(`${files.length}개의 파일이 성공적으로 업로드되었습니다!`);
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Walrus Photocard Gallery Section */}
        {showPhotocardGallery && (
          <section className="py-20">
            <div className="space-y-12">
              <div className="text-center space-y-4 bg-card/60 backdrop-blur-sm p-8 rounded-xl border border-border">
                <h2 className="text-4xl font-bold gradient-text">저장된 포토카드 갤러리</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  월러스 분산 스토리지에 저장된 포토카드 컬렉션을 확인하세요
                </p>
              </div>

              <div className="max-w-7xl mx-auto">
                <WalrusPhotocardGallery />
              </div>
            </div>
          </section>
        )}

        {/* Final CTA Section */}
        <section className="py-20">
          <div className="text-center space-y-8 glass p-16 rounded-2xl">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold gradient-text">
                나만의 최애를 찾아보세요
              </h2>
              <p className="text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
                AI 성격 분석으로 시작하는 특별한 팬덤 여정
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                아이돌 발견부터 심쿵톡, 포토카드 수집, 팬덤 활동까지 모든 것이 한 곳에
              </p>
            </div>
            
            <div className="flex flex-col gap-6 items-center pt-6">
              <Button
                onClick={handleStartJourney}
                variant="default"
                size="xl"
                className="min-w-80 text-2xl py-8 bg-gradient-primary hover:bg-gradient-secondary text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                💖 최애 찾으러 가기
              </Button>
              <p className="text-base text-muted-foreground">
                지금 시작하면 무료 체험 가능!
              </p>
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
            © 2024 Sui:Idol³. K-POP Fandom Platform · Made with 💖 by Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;