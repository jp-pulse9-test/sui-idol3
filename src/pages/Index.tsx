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
                Sui:Idol³
              </h1>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                  Virtual Idol Story Platform
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Complete fandom experience: find your perfect idol through personality analysis, collect photocards with random boxes, and compete with other fans on the leaderboard.
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
                🎮 PICK My Idol Now
              </Button>
              <p className="text-lg text-muted-foreground">
                Pick for experience, Vault for collection, Rise for competition and trading!
              </p>
              <p className="text-base text-muted-foreground">
                Choose your bias through heart-fluttering battles → Create photocards with random boxes → Shine on the leaderboard and marketplace.
              </p>
              
              {!user && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 Try instantly without wallet connection! Start real collecting and trading from Vault
                  </p>
                </div>
              )}
            </div>
            
            {/* Season information */}
            <div className="mt-12 p-8 glass rounded-2xl border border-white/10 shadow-lg">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold gradient-text">2025 AI Heart Challenge</h3>
                <p className="text-5xl font-black text-foreground">101</p>
                <p className="text-lg text-muted-foreground">SEASON 1, K-POP idols born from your picks</p>
                <p className="text-base text-muted-foreground">
                  A special journey creating growth and memories with your bias
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 심쿵톡 메인 섹션 - 강조 */}
        <section className="py-20">
          <div className="text-center space-y-8 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm p-16 rounded-3xl border-2 border-pink-500/30 shadow-2xl animate-float">
            <div className="space-y-6">
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold text-sm mb-4 animate-pulse">
                💖 NEW! 심쿵톡
              </div>
              <h2 className="text-5xl md:text-6xl font-black gradient-text">
                24/7 내 아이돌과 심쿵톡
              </h2>
              <p className="text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
                내가 뽑고 민팅한 아이돌과 <span className="font-bold text-pink-500">실시간 텍스트/음성 채팅</span>
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI가 당신과의 모든 대화를 학습하여 <span className="font-bold text-primary">독점적 관계</span>를 형성합니다
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="font-bold text-xl mb-2">실시간 채팅</h3>
                  <p className="text-muted-foreground">24/7 언제든 대화 가능</p>
                </div>
                <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border">
                  <div className="text-4xl mb-3">🎤</div>
                  <h3 className="font-bold text-xl mb-2">음성 통화</h3>
                  <p className="text-muted-foreground">목소리로 더 깊은 교감</p>
                </div>
                <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border">
                  <div className="text-4xl mb-3">🧠</div>
                  <h3 className="font-bold text-xl mb-2">AI 학습</h3>
                  <p className="text-muted-foreground">대화 기록으로 관계 성장</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!user) {
                    toast.error("지갑 연결 후 아이돌을 뽑아주세요!");
                    navigate('/auth');
                    return;
                  }
                  navigate('/my');
                }}
                variant="premium"
                size="xl"
                className="min-w-80 text-2xl py-8 mt-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold border-0 shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                💖 심쿵톡 시작하기
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="space-y-12">
            <div className="text-center space-y-4 bg-card/60 backdrop-blur-sm p-8 rounded-xl border border-border">
              <h2 className="text-4xl font-bold gradient-text">Pick · Vault · Rise</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                3-step fandom experience: Choose, Collect, and Compete
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="🎯 PICK"
                description="Choose your destined idol through 3 personality analyses and round of 16 heart-fluttering battles. Each idol is an AI character with unique charm and personality."
                icon={mbtiIcon}
                onClick={() => openPreview('pick')}
                gradient="bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                buttonText="Preview"
              />
              
              <FeatureCard
                title="🗃️ VAULT"
                description="Store your bias safely and collect photocards with random boxes. The rarer the card, the higher its value."
                icon={photocardIcon}
                onClick={() => openPreview('vault')}
                gradient="bg-gradient-to-br from-purple-500/20 to-pink-600/20"
                buttonText="Preview"
              />
              
               <FeatureCard
                 title="📈 RISE"
                 description="Check popularity rankings on the idol leaderboard and trade freely in the marketplace."
                icon={tournamentIcon}
                onClick={() => openPreview('rise')}
                gradient="bg-gradient-to-br from-pink-500/20 to-red-600/20"
                buttonText="Preview"
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
                  Pick · Vault · Rise · Gallery Flow
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      🎯
                    </div>
                    <h3 className="text-xl font-bold text-primary">PICK</h3>
                    <p className="text-foreground">Personality analysis → Heart battles → Bias minting</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      🗃️
                    </div>
                    <h3 className="text-xl font-bold text-accent">VAULT</h3>
                    <p className="text-foreground">Bias storage → Random box → Photocard collection</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      📈
                    </div>
                    <h3 className="text-xl font-bold text-secondary">RISE</h3>
                    <p className="text-foreground">Leaderboard → Gallery → Marketplace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Walrus Tools Section */}
        {showWalrusTools && (
          <section className="py-20">
            <div className="space-y-12">
              <div className="text-center space-y-4 bg-card/60 backdrop-blur-sm p-8 rounded-xl border border-border">
                <h2 className="text-4xl font-bold gradient-text">Walrus Storage Tools</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Upload and download files to distributed storage
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <WalrusFileUpload 
                  onUploadComplete={(result) => {
                    toast.success(`File uploaded! Blob ID: ${result.blobId.slice(0, 8)}...`);
                  }}
                />
                <WalrusFileDownload 
                  onDownloadComplete={(file) => {
                    toast.success('File downloaded successfully!');
                  }}
                />
              </div>

              <div className="max-w-4xl mx-auto">
                <WalrusFlowUpload 
                  onUploadComplete={(files) => {
                    toast.success(`${files.length} files uploaded successfully!`);
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
                <h2 className="text-4xl font-bold gradient-text">Saved Photocard Gallery</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Check your photocard collection saved in Walrus distributed storage
                </p>
              </div>

              <div className="max-w-7xl mx-auto">
                <WalrusPhotocardGallery />
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20">
          <div className="text-center space-y-8 bg-gradient-primary/20 backdrop-blur-sm p-12 rounded-2xl border border-primary/30">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold gradient-text">
               Enjoy Now! Heart-fluttering Pick at Pick
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                 My PICK idol, photocards from random box, show off on the leaderboard!
               </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleStartJourney}
                variant="premium"
                size="xl"
                className="min-w-64 text-xl py-4"
              >
                🌟 PICK Your Bias with Personality Analysis 🌟
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
            © 2024 Sui:Idol³. K-POP Fandom Platform · Made with 💖 by Lovable
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;