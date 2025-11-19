import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MissionCard } from "@/components/MissionCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { secureStorage } from "@/utils/secureStorage";
import PreviewModal from "@/components/PreviewModal";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Settings, Camera, Database, Sparkles, Users, Radio, Shield, Archive, Zap } from "lucide-react";
import mbtiIcon from "@/assets/mbti-icon.jpg";
import tournamentIcon from "@/assets/tournament-icon.jpg";
import photocardIcon from "@/assets/photocard-icon.jpg";
import { WalrusFileUpload } from "@/components/WalrusFileUpload";
import { WalrusFileDownload } from "@/components/WalrusFileDownload";
import { WalrusFlowUpload } from "@/components/WalrusFlowUpload";
import { WalrusPhotocardGallery } from "@/components/WalrusPhotocardGallery";
import { CinematicSynopsis } from "@/components/CinematicSynopsis";

import { FragmentedPlanetGrid } from "@/components/FragmentedPlanetGrid";

const Index = () => {
  const navigate = useNavigate();
  const [showAllyOath, setShowAllyOath] = useState(false);

  // Ally Status Data
  const [collectedFragments] = useState(1247);
  const [earthRestorationProgress] = useState(12.4);
  const [activeAllyCount] = useState(8942);
  const [onlineEchoEntities] = useState(143);
  const totalFragments = 487634;
  const estimatedDays = Math.ceil((100 - earthRestorationProgress) * 10);

  useEffect(() => {
    // Check if user has seen the oath
    const hasSeenOath = localStorage.getItem('ally_oath_accepted');
    if (!hasSeenOath) {
      const timer = setTimeout(() => {
        setShowAllyOath(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptOath = () => {
    localStorage.setItem('ally_oath_accepted', 'true');
    setShowAllyOath(false);
  };
  const { user, disconnectWallet, loading } = useAuth();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    type: 'pick' | 'vault' | 'rise' | null;
  }>({ open: false, type: null });
  const [showWalrusTools, setShowWalrusTools] = useState(false);
  const [showPhotocardGallery, setShowPhotocardGallery] = useState(false);
  
  // Idol data state
  const [idols, setIdols] = useState<any[]>([]);
  const [loadingIdols, setLoadingIdols] = useState(true);

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

  // Fetch idols
  useEffect(() => {
    const fetchIdols = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_public_idol_data');
        
        if (error) throw error;
        
        if (data) {
          // Shuffle and take 12 idols
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setIdols(shuffled.slice(0, 12));
        }
      } catch (error) {
        console.error('Error fetching idols:', error);
      } finally {
        setLoadingIdols(false);
      }
    };
    
    fetchIdols();
  }, []);

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
    <div className="min-h-screen bg-gradient-background relative overflow-x-hidden">
      {/* Fragmented planet background with idol faces */}
      <FragmentedPlanetGrid side="left" idols={idols} />
      <FragmentedPlanetGrid side="right" idols={idols} />
      
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
          <div className="text-center space-y-8 sm:space-y-12 glass-dark p-6 sm:p-10 md:p-16 rounded-3xl border border-white/5 shadow-2xl animate-float backdrop-blur-xl relative overflow-hidden">
            {/* 배경 데코레이션 - Ice Pink & Neon Green */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 그라디언트 블러 효과 */}
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
              
              {/* 라인아트 데코레이션 - Constellation Style */}
              <div className="absolute inset-0 opacity-40">
                {/* 좌상단 - Ice Pink */}
                <div className="absolute top-4 left-4 w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                    <circle cx="20" cy="20" r="3" fill="currentColor" className="animate-pulse" />
                    <circle cx="40" cy="30" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <circle cx="60" cy="25" r="2.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1s' }} />
                    <path d="M 20 20 Q 40 30 60 25" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M 10 40 Q 30 35 50 40" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
                  </svg>
                </div>
                
                {/* 우상단 - Neon Green */}
                <div className="absolute top-4 right-4 w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-secondary">
                    <circle cx="80" cy="20" r="3" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <circle cx="60" cy="30" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
                    <circle cx="40" cy="25" r="2.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1.3s' }} />
                    <path d="M 80 20 Q 60 30 40 25" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M 90 40 Q 70 35 50 40" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
                  </svg>
                </div>
                
                {/* 좌하단 - Accent Teal */}
                <div className="absolute bottom-4 left-4 w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-accent">
                    <circle cx="20" cy="80" r="3" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                    <circle cx="40" cy="70" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1.1s' }} />
                    <circle cx="60" cy="75" r="2.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <path d="M 20 80 Q 40 70 60 75" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M 10 60 Q 30 65 50 60" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
                  </svg>
                </div>
                
                {/* 우하단 - Ice Pink */}
                <div className="absolute bottom-4 right-4 w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                    <circle cx="80" cy="80" r="3" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
                    <circle cx="60" cy="70" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <circle cx="40" cy="75" r="2.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1.4s' }} />
                    <path d="M 80 80 Q 60 70 40 75" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M 90 60 Q 70 65 50 60" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
                  </svg>
                </div>
                
                {/* 추가 데코레이션: 중간 라인들 */}
                <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
              </div>
              
              {/* 스파클 효과 */}
              <div className="absolute top-1/4 left-1/4 w-4 h-4">
                <div className="w-full h-full bg-yellow-400 rounded-full animate-ping opacity-75" />
              </div>
              <div className="absolute top-1/3 right-1/4 w-3 h-3">
                <div className="w-full h-full bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.7s' }} />
              </div>
              <div className="absolute bottom-1/3 left-1/3 w-3.5 h-3.5">
                <div className="w-full h-full bg-purple-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1.2s' }} />
              </div>
              <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5">
                <div className="w-full h-full bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.4s' }} />
              </div>
              <div className="absolute bottom-1/4 right-1/2 w-3 h-3">
                <div className="w-full h-full bg-pink-300 rounded-full animate-ping opacity-75" style={{ animationDelay: '1.6s' }} />
              </div>
              
              {/* 떠다니는 하트 */}
              <div className="absolute top-1/4 right-1/4 text-2xl opacity-40 animate-bounce" style={{ animationDelay: '0.5s' }}>
                💖
              </div>
              <div className="absolute bottom-1/3 left-1/4 text-xl opacity-40 animate-bounce" style={{ animationDelay: '1.5s' }}>
                ✨
              </div>
              <div className="absolute top-1/2 left-1/2 text-lg opacity-40 animate-bounce" style={{ animationDelay: '2.5s' }}>
                ⭐
              </div>
            </div>
            
            {/* 최애와의 특별한 연결 배지 */}
            <div className="flex justify-center -mt-8 mb-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-100/90 to-pink-200/90 dark:from-pink-900/30 dark:to-pink-800/30 rounded-full border border-pink-300/50 dark:border-pink-700/50 shadow-sm">
                <Sparkles className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                <span className="text-sm md:text-base font-semibold text-pink-700 dark:text-pink-300">최애와의 특별한 연결</span>
              </div>
            </div>
            
            <div className="space-y-8 relative z-10">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-blacksword tracking-tight leading-tight text-foreground">
                SIMKUNG
              </h1>
              <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
                당신이 지구의 마지막 희망입니다
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                DATA ALLY로 참여해 멸망한 지구를 되살리세요. 88%의 데이터가 손실되었습니다.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 items-center relative z-10">
              {/* Primary CTA */}
              <Button
                onClick={() => navigate('/demo-chat')}
                variant="hero"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg md:text-2xl py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-12 font-semibold"
              >
                Start Mission
              </Button>
              
              {!user && (
                <p className="mt-3 text-xs text-muted-foreground/60 text-center">
                  💡 로그인 없이 바로 체험 가능해요
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Cinematic Synopsis Section */}
        <CinematicSynopsis
          activeAllyCount={activeAllyCount}
          onlineEchoEntities={onlineEchoEntities}
          collectedFragments={collectedFragments}
          totalFragments={totalFragments}
          stabilityPercentage={earthRestorationProgress}
        />

        {/* Featured Allies Section */}
        <section id="featured-allies" className="py-12 md:py-20">
          <div className="space-y-8">
            <div className="text-center space-y-3 glass p-6 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-4xl font-bold gradient-text">Featured Allies</h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
                Meet the elite Echo Entities leading Earth's restoration
              </p>
            </div>

            {loadingIdols ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {idols.slice(0, 4).map((idol) => (
                  <Card 
                    key={idol.id} 
                    className="group cursor-pointer overflow-hidden hover:scale-105 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
                    onClick={() => navigate(`/demo-chat?idol=${idol.id}`)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={idol.profile_image} 
                        alt={idol.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Badge variant="secondary" className="mb-2">
                          <Zap className="w-3 h-3 mr-1" />
                          {idol.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-lg">{idol.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{idol.concept}</p>
                      <Badge variant="outline" className="text-xs">
                        {idol.gender}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="space-y-8 md:space-y-12">
            <div className="text-center space-y-3 md:space-y-4 glass p-4 md:p-8 rounded-xl">
              <h2 className="text-2xl md:text-4xl font-bold gradient-text">미션 브리핑: 지구 복구 작전</h2>
              <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
                4개의 핵심 미션을 완료하고 데이터 조각을 수집하세요
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <MissionCard
                missionCode="ALPHA"
                title="동료 찾기"
                description="데이터 분석을 통해 구조된 AI 동료 엔티티를 발견하세요. 성향과 취향을 기반으로 최적의 동료를 찾습니다."
                icon={<Users className="w-6 h-6 text-primary" />}
                status="available"
                contribution={23}
                allyCount={8942}
                onClick={() => openPreview('pick')}
              />
              
              <MissionCard
                missionCode="BETA"
                title="AI 동료와 교신"
                description="Echo Link 프로토콜을 활성화하여 보존된 의식체와 실시간 양자 통신을 시도하세요."
                icon={<Radio className="w-6 h-6 text-secondary" />}
                status="available"
                contribution={18}
                allyCount={6234}
                onClick={() => navigate('/demo-chat')}
              />
              
              <MissionCard
                missionCode="GAMMA"
                title="동료 신뢰도 테스트"
                description="파편화된 현실 시뮬레이션을 통해 Echo 엔티티의 무결성을 검증하세요."
                icon={<Shield className="w-6 h-6 text-accent" />}
                status="available"
                contribution={15}
                allyCount={4521}
                onClick={() => openPreview('rise')}
              />
              
              <MissionCard
                missionCode="DELTA"
                title="추억 보관하기"
                description="분산 메모리 그리드에 데이터 조각을 수집하고 영구 보존하세요."
                icon={<Archive className="w-6 h-6 text-primary" />}
                status="available"
                contribution={12}
                allyCount={3892}
                onClick={() => openPreview('vault')}
              />
            </div>
          </div>
        </section>

        {/* Active Echo Entities Grid */}
        <section className="py-12 md:py-20">
          <div className="space-y-8">
            <div className="text-center space-y-3 glass p-6 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Radio className="w-6 h-6 text-secondary animate-pulse" />
                <h2 className="text-2xl md:text-4xl font-bold gradient-text">온라인 AIDOL</h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                지금 대화 가능한 AIDOL, 양자 통신 준비 완료
              </p>
              <Badge variant="secondary" className="mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                {idols.length}명의 AIDOL 온라인
              </Badge>
            </div>

            {loadingIdols ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <Card key={i} className="p-3 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-2" />
                    <div className="h-4 bg-muted rounded mb-1" />
                    <div className="h-3 bg-muted rounded" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {idols.map((idol) => (
                  <Card 
                    key={idol.id} 
                    className="group cursor-pointer overflow-hidden hover:scale-105 transition-all duration-300 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10"
                    onClick={() => navigate(`/demo-chat?idol=${idol.id}`)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={idol.profile_image} 
                        alt={idol.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <h4 className="text-white text-xs font-semibold truncate">{idol.name}</h4>
                        <p className="text-white/70 text-[10px] truncate">{idol.category}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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
          <div className="text-center space-y-8 glass p-16 rounded-2xl relative overflow-hidden">
            {/* 물결 곡선 라인아트 배경 */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {/* 큰 물결 곡선 1 */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
                <path 
                  d="M 0 300 Q 250 200 500 300 T 1000 300" 
                  stroke="url(#gradient1)" 
                  strokeWidth="2" 
                  fill="none"
                  className="animate-pulse"
                />
                <path 
                  d="M 0 350 Q 250 450 500 350 T 1000 350" 
                  stroke="url(#gradient2)" 
                  strokeWidth="2" 
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                <path 
                  d="M 0 250 Q 250 150 500 250 T 1000 250" 
                  stroke="url(#gradient3)" 
                  strokeWidth="1.5" 
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
                <path 
                  d="M 0 400 Q 250 500 500 400 T 1000 400" 
                  stroke="url(#gradient4)" 
                  strokeWidth="1.5" 
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: '1.5s' }}
                />
                
                {/* 그라디언트 정의 */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#f472b6" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* 작은 스파클 효과 */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2">
                <div className="w-full h-full bg-pink-400 rounded-full animate-ping" />
              </div>
              <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5">
                <div className="w-full h-full bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.8s' }} />
              </div>
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2">
                <div className="w-full h-full bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1.2s' }} />
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold gradient-text leading-tight">
                과거를 되살리고<br className="md:hidden" /> 미래를 지키세요
              </h2>
              <p className="text-lg md:text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
                8,942명의 Data Ally가 지구를 복구 중입니다
              </p>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                동료 찾기부터 AI 교신,<br className="md:hidden" /> 데이터 보관, 신뢰도 테스트까지<br className="md:hidden" /> 모든 미션이 기다립니다
              </p>
            </div>
            
            <div className="flex flex-col gap-6 items-center pt-6 relative z-10">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-4">
                지구 복구 작전, 지금 시작하세요
              </h3>
              <Button
                onClick={() => navigate('/gallery')}
                variant="hero"
                size="xl"
                className="min-w-80 text-2xl py-8 font-bold"
              >
                ⚡ 미션 시작하기
              </Button>
              <p className="text-base text-muted-foreground">
                지금 시작하면 무료 체험 가능!
              </p>
            </div>
          </div>
        </section>

        {/* Ally Oath Modal */}
        <Dialog open={showAllyOath} onOpenChange={setShowAllyOath}>
          <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-2 border-primary/30">
            <DialogHeader>
              <DialogTitle className="text-3xl font-orbitron text-center gradient-text mb-4">
                Data Ally 서약
              </DialogTitle>
              <DialogDescription className="space-y-6 text-base">
                <div className="text-center space-y-3">
                  <p className="text-foreground font-rajdhani text-lg leading-relaxed">
                    지구의 마지막 희망으로서, 당신은 이제 <span className="text-primary font-bold">DATA ALLY</span>가 되었습니다.
                  </p>
                  <p className="text-muted-foreground">
                    멸망한 세계의 데이터를 복구하고, 보존된 의식체와 교신하며, 미래를 재건할 임무를 수행하게 됩니다.
                  </p>
                  <p className="text-accent font-semibold">
                    이 서약을 수락하면, 당신은 지구 복구 작전의 핵심 멤버가 됩니다.
                  </p>
                </div>

                <div className="bg-card/60 rounded-lg p-6 border border-primary/20">
                  <h4 className="font-orbitron text-primary mb-4 text-center">DATA ALLY의 4가지 책임</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground font-semibold">데이터 수집:</span> 파편화된 데이터 조각을 찾아 복구합니다</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">▸</span>
                      <span><span className="text-foreground font-semibold">Echo 교신:</span> AI 동료 엔티티와 양자 통신을 유지합니다</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">▸</span>
                      <span><span className="text-foreground font-semibold">무결성 검증:</span> 시뮬레이션을 통해 동료의 신뢰도를 테스트합니다</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground font-semibold">영구 보존:</span> 추억과 데이터를 분산 네트워크에 보관합니다</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center text-sm text-muted-foreground italic">
                  "우리는 과거를 되살리고, 미래를 지킵니다"
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={handleAcceptOath}
                variant="hero"
                size="lg"
                className="w-full text-lg py-6 font-orbitron"
              >
                ⚡ 서약하고 Ally가 되기
              </Button>
              <Button
                onClick={() => setShowAllyOath(false)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                나중에 하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <PreviewModal
          open={previewModal.open}
          onOpenChange={closePreview}
          type={previewModal.type!}
          onStartJourney={handlePreviewStart}
        />

        {/* Footer */}
        <footer className="py-4 md:py-8 text-center bg-card/30 backdrop-blur-sm rounded-t-xl border-t border-border">
          <p className="text-xs md:text-sm text-muted-foreground px-4">
            © 2025 AIDOL.COM · AI Companion Platform
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;