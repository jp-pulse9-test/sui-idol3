import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RandomBox } from "@/components/ui/random-box";
import { PhotoCardGallery } from "@/components/ui/photocard-gallery";
import { Marketplace } from "@/components/ui/marketplace";
import { HeartPurchase } from "@/components/HeartPurchase";
import { IdolPhotocardGenerator } from "@/components/IdolPhotocardGenerator";
import { PhotocardVideoGallery } from "@/components/PhotocardVideoGallery";
import { CommunityGoalPool } from "@/components/CommunityGoalPool";
import { VaultDashboard } from "@/components/VaultDashboard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { CollectionPreview } from "@/components/CollectionPreview";
import { SectionHeader } from "@/components/SectionHeader";
import { Heart, Lock, Info, Gift, Sparkles, Store, Video, Award } from "lucide-react";
import { usePhotoCardMinting } from "@/services/photocardMintingSimple";
import { useWallet } from "@/hooks/useWallet";
import { dailyFreeBoxService } from "@/services/dailyFreeBoxService";
import { purchaseHistoryService } from "@/services/purchaseHistoryService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { user, loading, isGuest } = useAuthGuard('/', false);
  const { mintPhotoCard } = usePhotoCardMinting();
  const { isConnected, walletAddress: currentWalletAddress, balance } = useWallet();

  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [suiCoins, setSuiCoins] = useState(1.0);
  const [fanHearts, setFanHearts] = useState(100);
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
  const [isMinting, setIsMinting] = useState(false);
  const [hasAdvancedAccess, setHasAdvancedAccess] = useState(false);
  const [walrusUnavailable, setWalrusUnavailable] = useState(false);
  const [todayCardsCount, setTodayCardsCount] = useState(0);

  useEffect(() => {
    const savedIdol = localStorage.getItem('selectedIdol');

    if (user) {
      setWalletAddress(user.wallet_address);
    } else {
      setWalletAddress('');
    }

    if (!savedIdol) {
      setSelectedIdol(null);
    } else {
      try {
        setSelectedIdol(JSON.parse(savedIdol));
      } catch (error) {
        console.error('Error parsing saved idol:', error);
        setSelectedIdol(null);
      }
    }
    
    const loadPhotocards = async () => {
      if (user?.wallet_address) {
        try {
          const { data, error } = await supabase
            .from('photocards')
            .select('*')
            .eq('user_wallet', user.wallet_address)
            .order('created_at', { ascending: false });
          
          if (data && !error) {
            setPhotoCards(data as any);
            localStorage.setItem('photoCards', JSON.stringify(data));
            return;
          }
        } catch (error) {
          console.error('Failed to load photocards from Supabase:', error);
        }
      }
      
      const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
      setPhotoCards(savedCards);
    };
    
    loadPhotocards();
    
    const today = new Date().toDateString();
    const todayCards = JSON.parse(localStorage.getItem('photoCards') || '[]').filter(
      (card: PhotoCard) => new Date(card.mintedAt).toDateString() === today
    );
    setTodayCardsCount(todayCards.length);

    if (isGuest) {
      const guestBalance = localStorage.getItem('guestWalletBalance');
      if (guestBalance) {
        setSuiCoins(parseFloat(guestBalance));
      } else {
        setSuiCoins(1.0);
        localStorage.setItem('guestWalletBalance', '1.0');
      }
    }
    
    const savedFanHearts = localStorage.getItem('fanHearts');
    if (savedFanHearts) {
      setFanHearts(parseInt(savedFanHearts));
    } else {
      setFanHearts(100);
      localStorage.setItem('fanHearts', '100');
      toast.success('💖 Welcome! You received 100 fan hearts!');
    }
    
    const savedDailyHearts = localStorage.getItem('dailyHearts');
    if (savedDailyHearts) {
      setDailyHearts(parseInt(savedDailyHearts));
    } else {
      setDailyHearts(10);
      localStorage.setItem('dailyHearts', '10');
    }
    
    if (user?.wallet_address) {
      setTimeout(() => {
        loadDailyFreeStatus(user.wallet_address);
      }, 0);
    } else {
      const guestFreeBoxClaimed = localStorage.getItem('guestFreeBoxClaimed');
      const lastClaimed = localStorage.getItem('guestLastFreeBoxDate');
      
      if (lastClaimed === today && guestFreeBoxClaimed === 'true') {
        setDailyFreeStatus({
          canClaim: false,
          remainingSlots: 0,
          totalClaimsToday: 10,
          userHasClaimedToday: true,
          maxDailyClaims: 10
        });
      } else {
        setDailyFreeStatus({
          canClaim: true,
          remainingSlots: 10,
          totalClaimsToday: 0,
          userHasClaimedToday: false,
          maxDailyClaims: 10
        });
      }
    }

    const savedAdvancedAccess = localStorage.getItem('hasAdvancedAccess');
    if (savedAdvancedAccess === 'true') {
      setHasAdvancedAccess(true);
    }
    
    const lastHeartReset = localStorage.getItem('lastHeartReset');
    if (lastHeartReset !== today) {
      const dailyAmount = 10;
      setDailyHearts(dailyAmount);
      localStorage.setItem('dailyHearts', dailyAmount.toString());
      localStorage.setItem('lastHeartReset', today);
    }
  }, [user, loading, isGuest]);

  const loadDailyFreeStatus = async (walletAddress: string) => {
    try {
      const status = await dailyFreeBoxService.getStatus(walletAddress);
      setDailyFreeStatus(status);
    } catch (error) {
      console.error('Error loading daily free status:', error);
      setDailyFreeStatus({
        canClaim: false,
        remainingSlots: 0,
        totalClaimsToday: 10,
        userHasClaimedToday: true,
        maxDailyClaims: 10
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const handleOpenRandomBox = async (type: "free" | "paid", boxCost?: number) => {
    if (!isConnected && type === 'paid') {
      toast.error('💎 Paid boxes require wallet connection', {
        description: 'Free boxes work in guest mode too'
      });
      navigate('/auth');
      return;
    }

    if (type === 'free' && !dailyFreeStatus.canClaim) {
      if (dailyFreeStatus.userHasClaimedToday) {
        toast.error('You already claimed today\'s free box');
      } else {
        toast.error('Daily free boxes are sold out');
      }
      return;
    }
    
    const cost = type === 'free' ? 0 : (boxCost || 0.15);
    const currentBalance = isGuest ? suiCoins : parseFloat(balance);
    
    if (type !== 'free' && currentBalance < cost) {
      toast.error(`Insufficient SUI. Need: ${cost} SUI, Have: ${currentBalance} SUI`);
      return;
    }

    setIsMinting(true);

    try {
      if (type === 'free') {
        if (isGuest) {
          const today = new Date().toDateString();
          localStorage.setItem('guestFreeBoxClaimed', 'true');
          localStorage.setItem('guestLastFreeBoxDate', today);
          
          setDailyFreeStatus(prev => ({
            ...prev,
            userHasClaimedToday: true,
            canClaim: false
          }));
          
          toast.success('🎁 Guest mode free box opened!');
        } else {
          const claimResult = await dailyFreeBoxService.claimFreeBox(walletAddress);
          if (!claimResult.success) {
            toast.error(claimResult.error || 'Failed to claim free box');
            setIsMinting(false);
            return;
          }
          
          setDailyFreeStatus(prev => ({
            ...prev,
            userHasClaimedToday: true,
            canClaim: false,
            totalClaimsToday: claimResult.totalClaimsToday,
            remainingSlots: claimResult.remainingSlots
          }));
        }
      }

      if (type === 'paid' && cost >= 0.45) {
        setHasAdvancedAccess(true);
        localStorage.setItem('hasAdvancedAccess', 'true');
        toast.success('🎉 You got advanced photocard generation access!');
      }

      const cardCount = Math.floor(Math.random() * 10) + 1;
      const newPhotoCards: PhotoCard[] = [];
      
      const rarities = ['N', 'R', 'SR', 'SSR'] as const;
      const rarityWeights = { 'N': 50, 'R': 30, 'SR': 15, 'SSR': 5 };
      const concepts = ['Summer Dream', 'Winter Story', 'Spring Love', 'Autumn Wind'];

      for (let i = 0; i < cardCount; i++) {
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

        const mintingData = {
          idolId: selectedIdol?.id || 1,
          idolName: selectedIdol?.name || 'Unknown',
          rarity: rarity,
          concept: randomConcept,
          season: 'Season 1',
          serialNo: Math.floor(Math.random() * 10000) + 1,
          totalSupply: 5000,
          imageUrl: selectedIdol?.image || '',
          personaPrompt: selectedIdol?.persona_prompt || '',
        };

        await mintPhotoCard(mintingData);

        const newPhotoCard: PhotoCard = {
          id: `pc-${Date.now()}-${i}`,
          idolId: selectedIdol?.id.toString() || '1',
          idolName: selectedIdol?.name || 'Unknown',
          rarity: rarity,
          concept: randomConcept,
          season: 'Season 1',
          serialNo: Math.floor(Math.random() * 10000) + 1,
          totalSupply: 5000,
          mintedAt: new Date().toISOString(),
          owner: currentWalletAddress || walletAddress,
          isPublic: true,
          imageUrl: selectedIdol?.image || '',
          floorPrice: Math.random() * 5 + 1,
          lastSalePrice: Math.random() * 8 + 2,
          heartsReceived: 0
        };

        newPhotoCards.push(newPhotoCard);
      }

      const updatedCards = [...photoCards, ...newPhotoCards];
      setPhotoCards(updatedCards);
      localStorage.setItem('photoCards', JSON.stringify(updatedCards));

      if (isGuest && type !== 'free') {
        const newBalance = currentBalance - cost;
        setSuiCoins(newBalance);
        localStorage.setItem('guestWalletBalance', newBalance.toString());
      }

      if (type === 'paid' && user) {
        await purchaseHistoryService.recordPurchase({
          purchase_type: 'random_box',
          item_name: `Random Box (${cost} SUI)`,
          amount_sui: cost,
          quantity: cardCount,
          metadata: { idol_id: selectedIdol?.id, cards_received: cardCount }
        });
      }
      
      toast.success(`🎉 Received ${cardCount} photocards!`);
    } catch (error) {
      console.error('Photocard minting failed:', error);
      toast.error('Failed to mint photocards');
    } finally {
      setIsMinting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const rarityStats = {
    N: photoCards.filter(c => c.rarity === 'N').length,
    R: photoCards.filter(c => c.rarity === 'R').length,
    SR: photoCards.filter(c => c.rarity === 'SR').length,
    SSR: photoCards.filter(c => c.rarity === 'SSR').length,
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">🗃️ VAULT</h1>
              <p className="text-sm text-muted-foreground">
                {selectedIdol ? `${selectedIdol.name}'s Collection` : 'Your Collection Hub'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                💎 {(isGuest ? suiCoins : parseFloat(balance)).toFixed(2)} SUI
              </Badge>
              <Badge variant="outline" className="gap-1">
                ❤️ {fanHearts} Hearts
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          {/* Alerts */}
          {isGuest && (
            <Alert className="border-primary/50 bg-primary/5">
              <Lock className="h-5 w-5 text-primary" />
              <AlertTitle>Guest Mode</AlertTitle>
              <AlertDescription>
                Connect your wallet for blockchain storage, NFT minting, and marketplace access
                <Button onClick={() => navigate('/auth')} variant="default" size="sm" className="ml-4">
                  Connect Wallet
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {walrusUnavailable && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <Info className="h-5 w-5 text-amber-500" />
              <AlertTitle className="text-amber-500">Walrus Storage Unavailable</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                Walrus is currently unavailable. You can still use random boxes and collection features.
              </AlertDescription>
            </Alert>
          )}

          {!selectedIdol && (
            <Alert className="border-amber-500/50 bg-amber-500/5">
              <Info className="w-5 h-5 text-amber-500" />
              <AlertTitle className="text-amber-500">No Idol Selected</AlertTitle>
              <AlertDescription>
                Some features require an idol. Select your idol to unlock photocard generation.
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => navigate('/pick')} size="sm">
                    Select Idol
                  </Button>
                  <Button onClick={() => navigate('/')} variant="outline" size="sm">
                    Go Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Dashboard Stats */}
          <VaultDashboard
            photoCardCount={photoCards.length}
            todayCards={todayCardsCount}
            rarityStats={rarityStats}
            dailyFreeStatus={dailyFreeStatus}
            suiCoins={isGuest ? suiCoins : parseFloat(balance)}
            fanHearts={fanHearts}
          />

          {/* SECTION 1: GET */}
          <section className="space-y-6">
            <SectionHeader 
              emoji="🎁"
              title="GET Photocards"
              description="Collect photocards through free boxes, premium boxes, or AI generation"
              id="get-section"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <QuickActionCard
                  icon={Gift}
                  title="Daily Free Box"
                  description={dailyFreeStatus.canClaim ? "Open your free box today! Get 1-10 random photocards" : "You've already claimed today's free box"}
                  status={dailyFreeStatus.canClaim ? "✅ Available Now" : "❌ Already Claimed"}
                  actionLabel={dailyFreeStatus.canClaim ? "Open Free Box" : "Come Back Tomorrow"}
                  onClick={() => scrollToSection('randombox-section')}
                  disabled={!dailyFreeStatus.canClaim}
                  variant="primary"
                />
              </div>

              <QuickActionCard
                icon={Sparkles}
                title="AI Photocard Generator"
                description={selectedIdol ? `Create custom ${selectedIdol.name} photocards with AI` : "Select an idol first"}
                cost={{ sui: 0.05, hearts: 10 }}
                actionLabel="Create Photocard"
                onClick={() => scrollToSection('generator-section')}
                disabled={!selectedIdol}
                variant="secondary"
              />

              <QuickActionCard
                icon={Store}
                title="Premium Boxes"
                description="Higher rarity rates and exclusive photocards"
                cost={{ sui: 0.15 }}
                actionLabel="View Boxes"
                onClick={() => scrollToSection('randombox-section')}
                variant="secondary"
              />
            </div>

            <div id="randombox-section" className="scroll-mt-24">
              <RandomBox 
                dailyFreeCount={dailyFreeStatus.userHasClaimedToday ? 10 : 0}
                maxDailyFree={10}
                userCoins={isGuest ? suiCoins : parseFloat(balance)}
                pityCounter={pityCounters}
                onOpenBox={handleOpenRandomBox}
                isOpening={isMinting}
              />
            </div>
          </section>

          {/* SECTION 2: MANAGE */}
          <section className="space-y-6">
            <SectionHeader 
              icon={Store}
              title="MANAGE Collection"
              description="View and manage your photocard collection"
              id="manage-section"
            />

            <CollectionPreview
              photocards={photoCards}
              onViewAll={() => scrollToSection('collection-section')}
            />

            <div id="collection-section" className="scroll-mt-24">
              <PhotoCardGallery 
                photocards={photoCards}
                selectedIdolId={selectedIdol?.id.toString() || ''}
              />
            </div>

            <div id="videos-section" className="scroll-mt-24">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold gradient-text flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  Video Clips Gallery
                </h3>
                <PhotocardVideoGallery />
              </div>
            </div>
          </section>

          {/* SECTION 3: GROW */}
          <section className="space-y-6">
            <SectionHeader 
              icon={Award}
              title="GROW & Trade"
              description="Marketplace, achievements, and community features"
              id="grow-section"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <QuickActionCard
                icon={Store}
                title="Marketplace"
                description="Trade photocards with other collectors"
                actionLabel="Browse Market"
                onClick={() => scrollToSection('marketplace-section')}
                variant="secondary"
              />

              <QuickActionCard
                icon={Heart}
                title="Purchase Hearts"
                description="Buy fan hearts to support your idol"
                cost={{ sui: 0.1 }}
                actionLabel="Buy Hearts"
                onClick={() => scrollToSection('hearts-section')}
                variant="secondary"
              />
            </div>

            {selectedIdol && (
              <div id="generator-section" className="scroll-mt-24">
                <IdolPhotocardGenerator 
                  selectedIdol={selectedIdol}
                  userCoins={isGuest ? suiCoins : parseFloat(balance)}
                  fanHearts={fanHearts}
                  hasAdvancedAccess={hasAdvancedAccess}
                  onCostDeduction={(suiCost, heartCost) => {
                    if (isGuest) {
                      setSuiCoins(prev => prev - suiCost);
                      localStorage.setItem('guestWalletBalance', (suiCoins - suiCost).toString());
                    }
                    setFanHearts(prev => prev - heartCost);
                    localStorage.setItem('fanHearts', (fanHearts - heartCost).toString());
                  }}
                  onNavigateToCollection={() => scrollToSection('collection-section')}
                  onWalrusError={() => setWalrusUnavailable(true)}
                />
              </div>
            )}

            <div id="marketplace-section" className="scroll-mt-24">
              <Marketplace 
                listings={[]}
                priceHistory={[]}
                userWallet={walletAddress}
                onPurchase={(listingId) => console.log('Purchase:', listingId)}
                onBid={(listingId, amount) => console.log('Bid:', listingId, amount)}
                onCreateListing={(photocardId, price, isAuction) => console.log('Create listing:', photocardId, price, isAuction)}
              />
            </div>

            <div id="hearts-section" className="scroll-mt-24">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Purchase Fan Hearts</h3>
                  <p className="text-sm text-muted-foreground">Buy hearts to support your idol and unlock features</p>
                </CardContent>
              </Card>
            </div>

            <div className="pt-6">
              <CommunityGoalPool />
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Vault;
