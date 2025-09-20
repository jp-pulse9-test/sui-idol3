// Updated to use dailyFreeStatus instead of dailyFreeAttempts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RandomBox } from "@/components/ui/random-box";
import { PhotoCardGallery } from "@/components/ui/photocard-gallery";
import { Marketplace } from "@/components/ui/marketplace";
import { HeartPurchase } from "@/components/HeartPurchase";
import { IdolPhotocardGenerator } from "@/components/IdolPhotocardGenerator";
import { Heart, Loader2, Crown, RefreshCw } from "lucide-react";
import { isSuperAdmin, SUPER_ADMIN_INITIAL_SUI_COINS, SUPER_ADMIN_INITIAL_FAN_HEARTS, SUPER_ADMIN_DAILY_HEARTS } from "@/utils/adminWallets";
import { applySuperAdminBenefits, autoApplySuperAdminBenefits } from "@/utils/superAdminBenefits";
import { secureStorage } from "@/utils/secureStorage";
import { usePhotoCardMinting } from "@/services/photocardMintingImproved";
import { useIdolCardMinting } from "@/services/idolCardMinting";
import { PhotoCardMintingCard } from "@/components/PhotoCardMintingCard";
import { useWallet } from "@/hooks/useWallet";
import { dailyFreeBoxService } from "@/services/dailyFreeBoxService";
import { useSuiBalance } from "@/services/suiBalanceServiceNew";
import { SuiBalanceCard } from "@/components/SuiBalanceCard";
import { useTransactionHistory } from "@/services/transactionHistoryService";
import { useDataSync } from "@/services/dataSyncService";
import MultiChainTransfer from "@/components/MultiChainTransfer";
import CrossChainTransferModal from "@/components/CrossChainTransferModal";
import { ResponsiveGrid, ResponsiveCard, ResponsiveText, ResponsiveButton, ResponsiveContainer } from "@/components/ResponsiveGrid";
import { FadeIn, SlideIn, ScaleIn, Stagger } from "@/components/Animations";
import { LoadingGrid, LoadingSpinner, LoadingOverlay } from "@/components/LoadingStates";

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
  persona_prompt?: string;
}

interface PhotoCard {
  id: string;
  idolId: string;
  idolName: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  mintedAt: string;
  owner: string;
  isPublic: boolean;
  imageUrl: string;
  floorPrice?: number;
  lastSalePrice?: number;
  heartsReceived?: number;
}

const Vault = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthGuard('/', true);
  const { mintPhotoCard } = usePhotoCardMinting();
  const { mintIdolCard } = useIdolCardMinting();
  const { isConnected, walletAddress: currentWalletAddress } = useWallet();
  const { balance: suiBalance, isLoading: isBalanceLoading, error: balanceError, fetchBalance } = useSuiBalance();
  
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [suiCoins, setSuiCoins] = useState(1.0);
  const [fanHearts, setFanHearts] = useState(0);
  const [dailyHearts, setDailyHearts] = useState(10);
  const [dailyFreeStatus, setDailyFreeStatus] = useState({
    canClaim: false,
    remainingSlots: 0,
    totalClaimsToday: 0,
    userHasClaimedToday: false,
    maxDailyClaims: 10
  });
  const [pityCounters, setPityCounters] = useState({
    sr: 0,
    ssr: 0
  });
  const [photoCards, setPhotoCards] = useState<PhotoCard[]>([]);
  const [activeTab, setActiveTab] = useState<'storage' | 'randombox' | 'collection' | 'generator' | 'marketplace' | 'multichain'>('storage');
  const [isMinting, setIsMinting] = useState(false);
  const [hasAdvancedAccess, setHasAdvancedAccess] = useState(false);
  
  // 마켓플레이스 데이터
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  
  // 트랜잭션 히스토리 및 데이터 동기화
  const { addTransaction, updateTransaction } = useTransactionHistory();
  const { markAsPending, syncData } = useDataSync();
  
  // 멀티체인 전송 모달 상태
  const [selectedPhotoCard, setSelectedPhotoCard] = useState<PhotoCard | null>(null);
  const [showMultiChainModal, setShowMultiChainModal] = useState(false);
  const [showCrossChainModal, setShowCrossChainModal] = useState(false);

  // 크로스 체인 전송 핸들러
  const handleCrossChainTransfer = () => {
    setShowCrossChainModal(true);
  };

  // SUI 잔액 표시 함수
  const getDisplaySuiBalance = () => {
    if (isBalanceLoading) return '로딩 중...';
    if (balanceError) return '오류';
    if (suiBalance) return (Number(suiBalance) / 1e9).toFixed(2);
    return suiCoins.toFixed(2);
  };

  // SUI 잔액 숫자 값 (계산용)
  const getSuiBalanceValue = () => {
    if (suiBalance) return Number(suiBalance) / 1e9;
    return suiCoins;
  };

  // SUI 잔액 새로고침
  const refreshSuiBalance = () => {
    if (currentWalletAddress) {
      fetchBalance(currentWalletAddress);
    }
  };

  // 마켓플레이스 핸들러 함수들
  const handlePurchase = async (listingId: string) => {
    const listing = marketplaceListings.find(l => l.id === listingId);
    if (!listing) return;

    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    if (getSuiBalanceValue() < listing.price) {
      toast.error('SUI 잔액이 부족합니다!');
      return;
    }

    try {
      // 실제 구매 로직 (블록체인 트랜잭션)
      toast.success(`${listing.idolName} 포토카드를 구매했습니다!`);
      
      // 트랜잭션 히스토리 기록
      addTransaction({
        type: 'purchase',
        status: 'success',
        from: currentWalletAddress || walletAddress,
        to: listing.seller,
        amount: listing.price,
        tokenId: listing.photocardId,
        description: `${listing.idolName} ${listing.concept} 포토카드 구매 (${listing.rarity})`,
        metadata: {
          listingId: listing.id,
          idolName: listing.idolName,
          concept: listing.concept,
          rarity: listing.rarity,
          serialNo: listing.serialNo,
        }
      });
      markAsPending();
      
      // 구매한 포토카드를 컬렉션에 추가
      const newPhotoCard: PhotoCard = {
        id: `pc-${Date.now()}`,
        idolId: listing.photocardId,
        idolName: listing.idolName,
        rarity: listing.rarity,
        concept: listing.concept,
        season: 'Season 1',
        serialNo: listing.serialNo,
        totalSupply: 5000,
        mintedAt: new Date().toISOString(),
        owner: currentWalletAddress || walletAddress,
        isPublic: true,
        imageUrl: listing.imageUrl,
        floorPrice: listing.price,
        lastSalePrice: listing.price,
        heartsReceived: 0,
      };

      const updatedCards = [...photoCards, newPhotoCard];
      setPhotoCards(updatedCards);
      localStorage.setItem('photoCards', JSON.stringify(updatedCards));

      // 마켓플레이스에서 제거
      setMarketplaceListings(prev => prev.filter(l => l.id !== listingId));
      
      // 가격 히스토리에 추가
      setPriceHistory(prev => [{
        id: `history-${Date.now()}`,
        photocardId: listing.photocardId,
        price: listing.price,
        soldAt: new Date().toISOString(),
        seller: listing.seller,
        buyer: currentWalletAddress || walletAddress,
      }, ...prev]);

    } catch (error) {
      console.error('구매 실패:', error);
      toast.error('구매에 실패했습니다.');
    }
  };

  const handleBid = async (listingId: string, amount: number) => {
    const listing = marketplaceListings.find(l => l.id === listingId);
    if (!listing) return;

    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    try {
      // 실제 입찰 로직 (블록체인 트랜잭션)
      toast.success(`${amount} SUI로 입찰했습니다!`);
      
      // 입찰 정보 업데이트
      setMarketplaceListings(prev => prev.map(l => 
        l.id === listingId 
          ? { ...l, currentBid: amount, totalBids: (l.totalBids || 0) + 1 }
          : l
      ));

    } catch (error) {
      console.error('입찰 실패:', error);
      toast.error('입찰에 실패했습니다.');
    }
  };

  const handleCreateListing = async (photocardId: string, price: number, isAuction: boolean) => {
    const photocard = photoCards.find(pc => pc.id === photocardId);
    if (!photocard) return;

    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    try {
      // 실제 리스팅 생성 로직 (블록체인 트랜잭션)
      const newListing = {
        id: `listing-${Date.now()}`,
        photocardId: photocard.id,
        idolName: photocard.idolName,
        concept: photocard.concept,
        rarity: photocard.rarity,
        serialNo: photocard.serialNo,
        imageUrl: photocard.imageUrl,
        price: price,
        seller: currentWalletAddress || walletAddress,
        listedAt: new Date().toISOString(),
        isAuction: isAuction,
        ...(isAuction && {
          auctionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
          currentBid: price,
          totalBids: 0,
        }),
      };

      setMarketplaceListings(prev => [newListing, ...prev]);
      toast.success('마켓플레이스에 등록했습니다!');

    } catch (error) {
      console.error('리스팅 생성 실패:', error);
      toast.error('등록에 실패했습니다.');
    }
  };

  // IdolCard 민팅 함수
  const handleMintIdolCard = async () => {
    if (!selectedIdol) {
      toast.error('선택된 아이돌이 없습니다.');
      return;
    }
    
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }
  
    setIsMinting(true);

    try {
      await mintIdolCard({
        idolId: selectedIdol.id,
        name: selectedIdol.name,
        personality: selectedIdol.personality,
        imageUrl: selectedIdol.image,
        personaPrompt: selectedIdol.persona_prompt || '',
      });

      toast.success(`🎉 ${selectedIdol.name} IdolCard NFT가 성공적으로 민팅되었습니다!`);
    } catch (error) {
      console.error('IdolCard 민팅 실패:', error);
      toast.error('IdolCard 민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  // Check URL params for tab and filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['storage', 'randombox', 'collection', 'generator', 'marketplace', 'multichain'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  // 마켓플레이스 데이터 초기화
  useEffect(() => {
    // 샘플 마켓플레이스 데이터 생성
    const sampleListings = [
      {
        id: 'listing-1',
        photocardId: 'pc-1',
        idolName: '아이돌 A',
        concept: 'School Look',
        rarity: 'SSR' as const,
        serialNo: 1,
        imageUrl: 'https://via.placeholder.com/300x400/FFD700/000000?text=SSR+Card',
        price: 2.5,
        seller: '0x1234...5678',
        listedAt: new Date().toISOString(),
        isAuction: false,
      },
      {
        id: 'listing-2',
        photocardId: 'pc-2',
        idolName: '아이돌 B',
        concept: 'Casual',
        rarity: 'SR' as const,
        serialNo: 15,
        imageUrl: 'https://via.placeholder.com/300x400/9C27B0/FFFFFF?text=SR+Card',
        price: 1.2,
        seller: '0x2345...6789',
        listedAt: new Date(Date.now() - 86400000).toISOString(),
        isAuction: true,
        auctionEndsAt: new Date(Date.now() + 86400000).toISOString(),
        currentBid: 1.5,
        totalBids: 3,
      },
      {
        id: 'listing-3',
        photocardId: 'pc-3',
        idolName: '아이돌 C',
        concept: 'Formal',
        rarity: 'R' as const,
        serialNo: 42,
        imageUrl: 'https://via.placeholder.com/300x400/2196F3/FFFFFF?text=R+Card',
        price: 0.8,
        seller: '0x3456...7890',
        listedAt: new Date(Date.now() - 172800000).toISOString(),
        isAuction: false,
      },
    ];

    const samplePriceHistory = [
      {
        id: 'history-1',
        photocardId: 'pc-old-1',
        price: 3.2,
        soldAt: new Date(Date.now() - 259200000).toISOString(),
        seller: '0x1111...2222',
        buyer: '0x3333...4444',
      },
      {
        id: 'history-2',
        photocardId: 'pc-old-2',
        price: 1.8,
        soldAt: new Date(Date.now() - 345600000).toISOString(),
        seller: '0x5555...6666',
        buyer: '0x7777...8888',
      },
    ];

    setMarketplaceListings(sampleListings);
    setPriceHistory(samplePriceHistory);
  }, []);

  useEffect(() => {
    // user가 있을 때만 실행 (AuthContext에서 지갑 연결 확인됨)
    if (!user) return;

    console.log('Vault useEffect - User:', user);

    const savedIdol = localStorage.getItem('selectedIdol');
    console.log('Vault useEffect - Saved Idol:', savedIdol);

    setWalletAddress(user.wallet_address);

    if (!savedIdol) {
      console.log('No idol selected - user can still access vault but some features will be limited');
      setSelectedIdol(null);
    } else {
      try {
        const parsedIdol = JSON.parse(savedIdol);
        console.log('Parsed Idol:', parsedIdol);
        setSelectedIdol(parsedIdol);
      } catch (error) {
        console.error('Error parsing saved idol:', error);
        setSelectedIdol(null);
      }
    }
    
    // 로컬 스토리지에서 포카 불러오기
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    setPhotoCards(savedCards);
    
    // 수이 코인, 팬 하트, 일일 하트 불러오기 (수퍼어드민 특별 지급)
    const isAdmin = isSuperAdmin(user.wallet_address);
    
    const savedSuiCoins = localStorage.getItem('suiCoins');
    if (savedSuiCoins) {
      setSuiCoins(parseFloat(savedSuiCoins));
    } else if (isAdmin) {
      // 수퍼어드민 첫 로그인 시 특별 지급
      setSuiCoins(SUPER_ADMIN_INITIAL_SUI_COINS);
      localStorage.setItem('suiCoins', SUPER_ADMIN_INITIAL_SUI_COINS.toString());
      toast.success(`🎉 수퍼어드민 특별 지급! ${SUPER_ADMIN_INITIAL_SUI_COINS} SUI 코인 획득!`);
    } else {
      setSuiCoins(1.0); // 일반 유저 기본값
      localStorage.setItem('suiCoins', '1.0');
    }
    
    const savedFanHearts = localStorage.getItem('fanHearts');
    if (savedFanHearts) {
      setFanHearts(parseInt(savedFanHearts));
    } else if (isAdmin) {
      // 수퍼어드민 첫 로그인 시 특별 지급
      setFanHearts(SUPER_ADMIN_INITIAL_FAN_HEARTS);
      localStorage.setItem('fanHearts', SUPER_ADMIN_INITIAL_FAN_HEARTS.toString());
      toast.success(`💖 수퍼어드민 특별 지급! ${SUPER_ADMIN_INITIAL_FAN_HEARTS} 팬 하트 획득!`);
    }
    
    const savedDailyHearts = localStorage.getItem('dailyHearts');
    if (savedDailyHearts) {
      setDailyHearts(parseInt(savedDailyHearts));
    } else if (isAdmin) {
      setDailyHearts(SUPER_ADMIN_DAILY_HEARTS);
      localStorage.setItem('dailyHearts', SUPER_ADMIN_DAILY_HEARTS.toString());
    }
    
    // 매일 무료 박스 상태 로드
    loadDailyFreeStatus(user.wallet_address);

    // 고급 접근 권한 로드
    const savedAdvancedAccess = localStorage.getItem('hasAdvancedAccess');
    if (savedAdvancedAccess === 'true') {
      setHasAdvancedAccess(true);
    }
    
    // 일일 하트 리셋 체크 (매일 자정) - 수퍼어드민은 더 많이 지급
    const lastHeartReset = localStorage.getItem('lastHeartReset');
    const today = new Date().toDateString();
    if (lastHeartReset !== today) {
      const dailyAmount = isAdmin ? SUPER_ADMIN_DAILY_HEARTS : 10;
      setDailyHearts(dailyAmount);
      localStorage.setItem('dailyHearts', dailyAmount.toString());
      localStorage.setItem('lastHeartReset', today);
    }

    // 수퍼어드민 특권 자동 적용
    autoApplySuperAdminBenefits();
  }, [navigate, user]);

  const loadDailyFreeStatus = async (walletAddress: string) => {
    try {
      const status = await dailyFreeBoxService.getStatus(walletAddress);
      setDailyFreeStatus(status);
    } catch (error) {
      console.error('Error loading daily free status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <LoadingOverlay isVisible={true} message="Vault를 불러오는 중..." />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  const handleOpenRandomBox = async (type: "free" | "paid", boxCost?: number) => {
    // 랜덤박스 개봉 로직
    if (type === 'free' && !dailyFreeStatus.canClaim) {
      if (dailyFreeStatus.userHasClaimedToday) {
        toast.error('이미 오늘 무료 박스를 개봉했습니다.');
      } else {
        toast.error('오늘의 무료 박스 한정 수량이 소진되었습니다.');
      }
      return;
    }
    
    const cost = type === 'free' ? 0 : (boxCost || 0.15); // SUI 코인 기준
    const currentBalance = getSuiBalanceValue();
    if (type !== 'free' && currentBalance < cost) {
      toast.error(`SUI 코인이 부족합니다. (보유: ${getDisplaySuiBalance()} SUI, 필요: ${cost} SUI)`);
      return;
    }

    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    setIsMinting(true);

    try {
      // 무료 박스인 경우 클레임 처리
      if (type === 'free') {
        const claimResult = await dailyFreeBoxService.claimFreeBox(walletAddress);
        if (!claimResult.success) {
          toast.error(claimResult.error || '무료 박스 클레임에 실패했습니다.');
          setIsMinting(false);
          return;
        }
        
        // 상태 업데이트
        setDailyFreeStatus(prev => ({
          ...prev,
          userHasClaimedToday: true,
          canClaim: false,
          totalClaimsToday: claimResult.totalClaimsToday,
          remainingSlots: claimResult.remainingSlots
        }));
      }
      // 울트라 박스인 경우 고급 생성 권한 부여
      if (type === 'paid' && cost >= 0.45) {
        setHasAdvancedAccess(true);
        localStorage.setItem('hasAdvancedAccess', 'true');
        toast.success('🎉 고급 포토카드 생성 권한을 획득했습니다!');
    }

    // 랜덤 포카 수량 (1-10개)
    const cardCount = Math.floor(Math.random() * 10) + 1;
    const newPhotoCards: PhotoCard[] = [];
    
    const rarities = ['N', 'R', 'SR', 'SSR'] as const;
    const rarityWeights = { 'N': 50, 'R': 30, 'SR': 15, 'SSR': 5 };
    const concepts = ['Summer Dream', 'Winter Story', 'Spring Love', 'Autumn Wind', 'School Look', 'Casual', 'Formal', 'Party', 'Sports', 'Fashion'];
    const idolNames = ['아이돌 A', '아이돌 B', '아이돌 C', '아이돌 D', '아이돌 E', '아이돌 F', '아이돌 G', '아이돌 H'];
    const idolImages = [
      'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Idol+A',
      'https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Idol+B',
      'https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Idol+C',
      'https://via.placeholder.com/300x400/96CEB4/FFFFFF?text=Idol+D',
      'https://via.placeholder.com/300x400/FFEAA7/000000?text=Idol+E',
      'https://via.placeholder.com/300x400/DDA0DD/FFFFFF?text=Idol+F',
      'https://via.placeholder.com/300x400/98D8C8/FFFFFF?text=Idol+G',
      'https://via.placeholder.com/300x400/F7DC6F/000000?text=Idol+H',
    ];

    for (let i = 0; i < cardCount; i++) {
      // 희귀도 가중치 기반 선택
      const random = Math.random() * 100;
      let rarity: typeof rarities[number] = 'N';
      let cumulativeWeight = 0;
      
      for (const [r, weight] of Object.entries(rarityWeights)) {
        cumulativeWeight += weight;
        if (random <= cumulativeWeight) {
          rarity = r as typeof rarities[number];
          break;
        }
      }

      const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
      const randomIdolIndex = Math.floor(Math.random() * idolNames.length);
      const randomIdolName = idolNames[randomIdolIndex];
      const randomIdolImage = idolImages[randomIdolIndex];

        const mintingData = {
          idolId: randomIdolIndex + 1,
          idolName: randomIdolName,
          rarity: rarity,
          concept: randomConcept,
          season: 'Season 1',
          serialNo: Math.floor(Math.random() * 10000) + 1,
          totalSupply: 5000,
          imageUrl: randomIdolImage,
          personaPrompt: `${randomIdolName}의 ${randomConcept} 컨셉`,
        };

        // 실제 포토카드 민팅
        const mintedCard = await mintPhotoCard(mintingData);
        
        // 트랜잭션 히스토리 기록
        if (mintedCard.success) {
          addTransaction({
            type: 'mint',
            status: 'success',
            hash: mintedCard.digest,
            from: currentWalletAddress || walletAddress,
            to: currentWalletAddress || walletAddress,
            amount: cost,
            tokenId: `pc-${Date.now()}-${i}`,
            description: `${randomIdolName} ${randomConcept} 포토카드 민팅 (${rarity})`,
            metadata: {
              idolName: randomIdolName,
              concept: randomConcept,
              rarity: rarity,
              serialNo: mintingData.serialNo,
            }
          });
          markAsPending();
        } else {
          addTransaction({
            type: 'mint',
            status: 'failed',
            from: currentWalletAddress || walletAddress,
            to: currentWalletAddress || walletAddress,
            amount: cost,
            description: `${randomIdolName} ${randomConcept} 포토카드 민팅 실패 (${rarity})`,
            metadata: {
              error: '민팅 실패',
              idolName: randomIdolName,
              concept: randomConcept,
              rarity: rarity,
            }
          });
        }

        // 민팅된 카드 정보를 PhotoCard 형식으로 변환
      const newPhotoCard: PhotoCard = {
        id: `pc-${Date.now()}-${i}`,
        idolId: (randomIdolIndex + 1).toString(),
        idolName: randomIdolName,
        rarity: rarity,
        concept: randomConcept,
        season: 'Season 1',
        serialNo: Math.floor(Math.random() * 10000) + 1,
        totalSupply: 5000,
        mintedAt: new Date().toISOString(),
        owner: currentWalletAddress || walletAddress,
        isPublic: true,
        imageUrl: randomIdolImage,
        floorPrice: Math.random() * 5 + 1,
        lastSalePrice: Math.random() * 8 + 2,
        heartsReceived: 0
      };

      newPhotoCards.push(newPhotoCard);
    }

    // 상태 업데이트
    const updatedCards = [...photoCards, ...newPhotoCards];
    setPhotoCards(updatedCards);
    localStorage.setItem('photoCards', JSON.stringify(updatedCards));

      if (type !== 'free') {
      setSuiCoins(prev => {
        const newValue = prev - cost;
        localStorage.setItem('suiCoins', newValue.toFixed(2));
        return newValue;
      });
    }

      toast.success(`🎉 ${cardCount}장의 포토카드를 민팅했습니다!`);
    } catch (error) {
      console.error('포토카드 민팅 실패:', error);
      toast.error('포토카드 민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  if (!selectedIdol) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <ResponsiveContainer maxWidth="full" padding="none">
        <div className="space-y-8">
        {/* Header */}
        <FadeIn delay={100}>
        <div className="text-center space-y-4 pt-8">
            <ResponsiveText size="4xl" weight="bold" className="gradient-text">
              🗃️ VAULT
            </ResponsiveText>
            <ResponsiveText size="xl" className="text-muted-foreground">
              {selectedIdol ? `${selectedIdol.name}와 함께하는 포토카드 수집 여정` : '포토카드 수집 여정'}
            </ResponsiveText>
          
            {/* SUI 잔액 카드 */}
            <ScaleIn delay={300}>
              <div className="flex justify-center">
                <SuiBalanceCard 
                  compact={false}
                  showRefreshButton={true}
                  showAllTokens={true}
                  className="max-w-md"
                />
              </div>
            </ScaleIn>
          </div>
        </FadeIn>
        
        <SlideIn delay={500} direction="up">
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              🔗 {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : '지갑 연결 중...'}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              ❤️ {fanHearts} 팬 하트
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              💝 {dailyHearts}/10 일일 하트
            </Badge>
            {isSuperAdmin(walletAddress) && (
              <Button
                onClick={() => {
                  applySuperAdminBenefits();
                  // 페이지 새로고침으로 상태 반영
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
              >
                👑 수퍼어드민 특권 적용
              </Button>
            )}
            <Badge variant="secondary" className="px-4 py-2">
              📦 {photoCards.length}장 보유
            </Badge>
          </div>
        </SlideIn>

        {/* 선택된 아이돌 정보 */}
        {selectedIdol ? (
        <FadeIn delay={700}>
        <Card className="p-6 glass-dark border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-primary/20">
              <img 
                src={selectedIdol.image}
                alt={selectedIdol.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
              <p className="text-muted-foreground">{selectedIdol.personality}</p>
            </div>
            <Button
              onClick={() => navigate('/rise')}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/20"
            >
              RISE로 이동 →
            </Button>
          </div>
        </Card>
        </FadeIn>
        ) : (
          <FadeIn delay={700}>
            <Card className="p-6 glass-dark border-amber-400/30 bg-amber-400/5">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-amber-400">아이돌을 선택해주세요</h2>
              <p className="text-muted-foreground">
                포토카드 생성과 일부 기능을 사용하려면 먼저 아이돌을 선택해야 합니다.
              </p>
              <Button
                onClick={() => navigate('/pick')}
                className="bg-amber-400 hover:bg-amber-500 text-black"
              >
                아이돌 선택하러 가기
              </Button>
            </div>
            </Card>
          </FadeIn>
        )}

        {/* Vault Tabs */}
        <SlideIn delay={900} direction="up">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'storage' | 'randombox' | 'collection' | 'generator' | 'marketplace' | 'multichain')} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="storage" className="data-[state=active]:bg-primary/20">
              🗃️ 최애 수납
            </TabsTrigger>
            <TabsTrigger value="generator" className="data-[state=active]:bg-primary/20">
              📷 포카 생성
            </TabsTrigger>
            <TabsTrigger value="randombox" className="data-[state=active]:bg-primary/20">
              📦 랜덤박스
            </TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-primary/20">
              🎴 포카 보관함
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary/20">
              🛒 마켓플레이스
            </TabsTrigger>
            <TabsTrigger value="multichain" className="data-[state=active]:bg-primary/20">
              🌐 크로스 체인
            </TabsTrigger>
          </TabsList>

          <TabsContent value="storage" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 최애 수납 현황 */}
              <Card className="p-6 glass-dark border-white/10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold gradient-text">최애 수납 현황</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>수납된 아이돌</span>
                      <Badge variant={selectedIdol ? "default" : "outline"}>
                        {selectedIdol ? selectedIdol.name : '선택 안됨'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>보유 포토카드</span>
                      <Badge variant="secondary">{photoCards.length}장</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>보유 SUI 코인</span>
                      <Badge variant="outline">
                        {getDisplaySuiBalance()} 💰
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>팬 하트 포인트</span>
                      <Badge variant="outline">{fanHearts} ❤️</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>선착순 무료 박스</span>
                      <Badge variant="outline">
                        {dailyFreeStatus.canClaim ? '신청가능' : dailyFreeStatus.userHasClaimedToday ? '완료' : '마감'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 최애 프로필 */}
              <Card className="p-6 glass-dark border-white/10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold gradient-text">최애 프로필</h3>
                  
                  {selectedIdol ? (
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-primary/20">
                      <img 
                        src={selectedIdol.image}
                        alt={selectedIdol.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{selectedIdol.name}</h4>
                      <p className="text-muted-foreground">{selectedIdol.personality}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-card/50 rounded-lg">
                        <div className="font-bold text-primary">수집률</div>
                          <div className="text-xl">{Math.min(photoCards.length * 5, 100)}%</div>
                      </div>
                      <div className="p-3 bg-card/50 rounded-lg">
                        <div className="font-bold text-accent">희귀도</div>
                        <div className="text-xl">
                          {photoCards.filter(card => card.rarity === 'SSR').length > 0 ? 'SSR' : 
                           photoCards.filter(card => card.rarity === 'SR').length > 0 ? 'SR' : 
                           photoCards.filter(card => card.rarity === 'R').length > 0 ? 'R' : 'N'}
                        </div>
                      </div>
                    </div>

                      {/* IdolCard 민팅 버튼 */}
                      <Button
                        onClick={handleMintIdolCard}
                        disabled={!isConnected || isMinting}
                        className="w-full"
                        variant="outline"
                      >
                        {isMinting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            IdolCard 민팅 중...
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            IdolCard NFT 민팅
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-primary/20 flex items-center justify-center">
                        <span className="text-4xl">🎭</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-muted-foreground">아이돌 미선택</h4>
                        <p className="text-muted-foreground">아이돌을 선택하면 프로필이 표시됩니다</p>
                      </div>

                      <Button
                        onClick={() => navigate('/pick')}
                        variant="outline"
                        size="sm"
                      >
                        아이돌 선택하기
                      </Button>
                  </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

            <TabsContent value="generator" className="mt-8">
              {selectedIdol ? (
                <IdolPhotocardGenerator
                  selectedIdol={selectedIdol}
                  userCoins={getSuiBalanceValue()}
                  fanHearts={fanHearts}
                  hasAdvancedAccess={hasAdvancedAccess}
                  onCostDeduction={(suiCost, heartCost) => {
                    setSuiCoins(prev => {
                      const newValue = prev - suiCost;
                      localStorage.setItem('suiCoins', newValue.toFixed(2));
                      return newValue;
                    });
                    setFanHearts(prev => {
                      const newValue = prev - heartCost;
                      localStorage.setItem('fanHearts', newValue.toString());
                      return newValue;
                    });
                  }}
                />
              ) : (
                <Card className="p-8 glass-dark border-white/10">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold">아이돌 선택 필요</h3>
                    <p className="text-muted-foreground">
                      포토카드를 생성하려면 먼저 아이돌을 선택해주세요.
                    </p>
                    <Button onClick={() => navigate('/pick')}>
                      아이돌 선택하러 가기
                    </Button>
                  </div>
                </Card>
              )}
          </TabsContent>

          <TabsContent value="randombox" className="mt-8">
            <RandomBox
              dailyFreeCount={dailyFreeStatus.totalClaimsToday}
              maxDailyFree={dailyFreeStatus.maxDailyClaims}
              userCoins={getSuiBalanceValue()}
              pityCounter={pityCounters}
              onOpenBox={handleOpenRandomBox}
              isOpening={isMinting}
            />
          </TabsContent>

          <TabsContent value="collection" className="mt-8">
            <PhotoCardGallery
              photocards={photoCards}
              selectedIdolId={selectedIdol?.id.toString() || ''}
              onToggleVisibility={(cardId) => {
                const updatedCards = photoCards.map(card => 
                  card.id === cardId ? { ...card, isPublic: !card.isPublic } : card
                );
                setPhotoCards(updatedCards);
                localStorage.setItem('photoCards', JSON.stringify(updatedCards));
                toast.success('포토카드 공개 설정이 변경되었습니다.');
              }}
              onViewCard={(card) => {
                console.log('포토카드 상세보기:', card);
                // 포토카드 상세 모달이나 페이지로 이동
              }}
              isOwner={true}
            />
          </TabsContent>


          <TabsContent value="marketplace" className="mt-8">
            <Marketplace
              listings={marketplaceListings}
              priceHistory={priceHistory}
              userWallet={currentWalletAddress || walletAddress}
              onPurchase={handlePurchase}
              onBid={handleBid}
              onCreateListing={handleCreateListing}
            />
          </TabsContent>

          <TabsContent value="multichain" className="mt-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold gradient-text mb-4">
                  🌐 크로스 체인 전송
                </h3>
                <p className="text-muted-foreground mb-6">
                  Wormhole NTT를 사용하여 SUI 토큰을 다른 체인으로 안전하게 전송하세요
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SUI 토큰 전송 */}
                <Card className="p-6 glass-dark border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">SUI 토큰 전송</h4>
                        <p className="text-sm text-muted-foreground">
                          SUI를 다른 체인으로 전송
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>현재 잔액:</span>
                        <span className="font-medium text-yellow-500">
                          {suiBalance ? (Number(suiBalance) / 1e9).toFixed(4) : '0.0000'} SUI
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>지원 체인:</span>
                        <span className="font-medium">8개 체인</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleCrossChainTransfer}
                      className="w-full btn-modern"
                      disabled={!suiBalance || Number(suiBalance) === 0}
                    >
                      SUI 토큰 전송하기
                    </Button>
                  </div>
                </Card>

                {/* 포토카드 전송 */}
                <Card className="p-6 glass-dark border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎴</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">포토카드 전송</h4>
                        <p className="text-sm text-muted-foreground">
                          NFT 포토카드를 다른 체인으로 전송
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>보유 포토카드:</span>
                        <span className="font-medium">{photoCards.length}개</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>지원 체인:</span>
                        <span className="font-medium">8개 체인</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (photoCards.length > 0) {
                          setSelectedPhotoCard(photoCards[0]);
                          setShowMultiChainModal(true);
                        }
                      }}
                      className="w-full btn-modern"
                      disabled={photoCards.length === 0}
                    >
                      {photoCards.length > 0 ? '포토카드 전송하기' : '보유한 포토카드가 없습니다'}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* 지원되는 체인 목록 */}
              <Card className="p-6 glass-dark border-white/10">
                <h4 className="text-lg font-semibold mb-4">지원되는 체인</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Sui', icon: '🟢', status: 'Source' },
                    { name: 'Ethereum', icon: '🔷', status: 'Supported' },
                    { name: 'BSC', icon: '🟡', status: 'Supported' },
                    { name: 'Polygon', icon: '🟣', status: 'Supported' },
                    { name: 'Arbitrum', icon: '🔵', status: 'Supported' },
                    { name: 'Optimism', icon: '🔴', status: 'Supported' },
                    { name: 'Base', icon: '🔵', status: 'Supported' },
                    { name: 'Avalanche', icon: '🔴', status: 'Supported' },
                  ].map((chain) => (
                    <div key={chain.name} className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                      <span className="text-lg">{chain.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{chain.name}</p>
                        <p className="text-xs text-muted-foreground">{chain.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 주의사항 */}
              <Card className="p-6 glass-dark border-yellow-500/20 border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-500">⚠️</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-500">중요한 주의사항</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 크로스 체인 전송은 되돌릴 수 없습니다</li>
                      <li>• 수신자 주소를 정확히 확인해주세요</li>
                      <li>• 전송 완료까지 2-10분 정도 소요될 수 있습니다</li>
                      <li>• 네트워크 상황에 따라 시간이 더 걸릴 수 있습니다</li>
                      <li>• 전송 전에 충분한 가스비를 확보해주세요</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </SlideIn>

        {/* 멀티체인 전송 모달 */}
        {showMultiChainModal && selectedPhotoCard && (
          <Dialog open={showMultiChainModal} onOpenChange={setShowMultiChainModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  🌐 멀티체인 전송
                </DialogTitle>
              </DialogHeader>
              <MultiChainTransfer
                photoCard={selectedPhotoCard}
                onTransferComplete={(result) => {
                  console.log('멀티체인 전송 완료:', result);
                  setShowMultiChainModal(false);
                  setSelectedPhotoCard(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* 크로스 체인 전송 모달 */}
        <CrossChainTransferModal
          isOpen={showCrossChainModal}
          onClose={() => setShowCrossChainModal(false)}
          selectedPhotoCard={selectedPhotoCard}
        />

        {/* Navigation */}
        <FadeIn delay={1100}>
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            ← 아이돌 선택
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            홈으로 돌아가기
          </Button>
        </div>
        </FadeIn>
      </div>
      </ResponsiveContainer>
    </div>
  );
};

export default Vault;