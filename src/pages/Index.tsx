import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { secureStorage } from "@/utils/secureStorage";
import PreviewModal from "@/components/PreviewModal";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Settings, Camera, Database, Sparkles } from "lucide-react";
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
            variant="outline" 
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
          <div className="text-center space-y-12 glass-dark p-16 rounded-3xl border border-white/5 shadow-2xl animate-float backdrop-blur-xl relative overflow-hidden">
            {/* 배경 데코레이션 */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {/* 좌상단 라인아트 */}
              <div className="absolute top-0 left-0 w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400">
                  <circle cx="10" cy="10" r="2" fill="currentColor" className="animate-pulse" />
                  <circle cx="30" cy="20" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <circle cx="50" cy="15" r="1" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1s' }} />
                  <path d="M 10 10 Q 30 20 50 15" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
                </svg>
              </div>
              
              {/* 우상단 라인아트 */}
              <div className="absolute top-0 right-0 w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400">
                  <circle cx="90" cy="10" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <circle cx="70" cy="20" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
                  <circle cx="50" cy="15" r="1" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1.3s' }} />
                  <path d="M 90 10 Q 70 20 50 15" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
                </svg>
              </div>
              
              {/* 좌하단 라인아트 */}
              <div className="absolute bottom-0 left-0 w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400">
                  <circle cx="10" cy="90" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <circle cx="30" cy="80" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1.1s' }} />
                  <circle cx="50" cy="85" r="1" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <path d="M 10 90 Q 30 80 50 85" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
                </svg>
              </div>
              
              {/* 우하단 라인아트 */}
              <div className="absolute bottom-0 right-0 w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400">
                  <circle cx="90" cy="90" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
                  <circle cx="70" cy="80" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <circle cx="50" cy="85" r="1" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1.4s' }} />
                  <path d="M 90 90 Q 70 80 50 85" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
                </svg>
              </div>
              
              {/* 중앙 스파클 효과 */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3">
                <div className="w-full h-full bg-yellow-400 rounded-full animate-ping opacity-75" />
              </div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2">
                <div className="w-full h-full bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.7s' }} />
              </div>
              <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5">
                <div className="w-full h-full bg-purple-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1.2s' }} />
              </div>
            </div>
            
            {/* 최애와의 특별한 연결 배지 */}
            <div className="flex justify-center -mt-8 mb-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-100/90 to-pink-200/90 dark:from-pink-900/30 dark:to-pink-800/30 rounded-full border border-pink-300/50 dark:border-pink-700/50 shadow-sm">
                <Sparkles className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                <span className="text-sm md:text-base font-semibold text-pink-700 dark:text-pink-300">최애와의 특별한 연결</span>
              </div>
            </div>
            
            <div className="space-y-8 relative z-10">
              <h1 className="text-7xl md:text-9xl font-black font-blacksword tracking-tight text-foreground">
                SIMKUNG
              </h1>
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold gradient-text">
                  나의 최애, 이상형은 어떤 사람?
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  취향 데이터를 기반으로 AIDOL 찾기
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 items-center relative z-10">
              {/* 1순위: 심쿵톡 (갤러리) */}
              <Button
                onClick={() => navigate('/gallery')}
                variant="default"
                size="lg"
                className="w-full md:w-auto text-xl md:text-2xl py-5 md:py-6 px-8 md:px-12 bg-gradient-primary hover:bg-gradient-secondary text-white font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                💬 심쿵톡 시작하기
              </Button>
              
              {!user && (
                <p className="mt-3 text-xs text-muted-foreground/60 text-center">
                  💡 로그인 없이 바로 체험 가능해요
                </p>
              )}
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="space-y-8 md:space-y-12">
            <div className="text-center space-y-3 md:space-y-4 glass p-4 md:p-8 rounded-xl">
              <h2 className="text-2xl md:text-4xl font-bold gradient-text">PICK · VAULT · RISE</h2>
              <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
                찾고 · 모으고 · 자랑하세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-8">
              <FeatureCard
                title="🎯 PICK"
                description="운명의 아이돌 발견"
                icon={mbtiIcon}
                onClick={() => openPreview('pick')}
                gradient="bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                buttonText="미리보기"
              />
              
              <FeatureCard
                title="🗃️ VAULT"
                description="랜덤박스로 포토카드 수집"
                icon={photocardIcon}
                onClick={() => openPreview('vault')}
                gradient="bg-gradient-to-br from-purple-500/20 to-pink-600/20"
                buttonText="미리보기"
              />
              
               <FeatureCard
                 title="📈 RISE"
                 description="순위 & 마켓플레이스 거래"
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
              <h2 className="text-3xl md:text-5xl font-bold gradient-text leading-tight">
                나만의 최애를<br className="md:hidden" /> 찾아보세요
              </h2>
              <p className="text-lg md:text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
                AI 성격 분석으로 시작하는 특별한 팬덤 여정
              </p>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                아이돌 발견부터 심쿵톡,<br className="md:hidden" /> 포토카드 수집, 팬덤 활동까지<br className="md:hidden" /> 모든 것이 한 곳에
              </p>
            </div>
            
            <div className="flex flex-col gap-6 items-center pt-6">
              <Button
                onClick={() => navigate('/gallery')}
                variant="default"
                size="xl"
                className="min-w-80 text-2xl py-8 bg-gradient-primary hover:bg-gradient-secondary text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                💬 아이돌 갤러리 둘러보기
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