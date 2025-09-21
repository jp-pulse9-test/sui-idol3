// Updated to use dailyFreeStatus instead of dailyFreeAttempts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RandomBox } from "@/components/ui/random-box";
import { PhotoCardGallery } from "@/components/ui/photocard-gallery";
import { Marketplace } from "@/components/ui/marketplace";
import { HeartPurchase } from "@/components/HeartPurchase";
import { IdolPhotocardGenerator } from "@/components/IdolPhotocardGenerator";
import { Heart } from "lucide-react";
import { secureStorage } from "@/utils/secureStorage";
import { usePhotoCardMinting } from "@/services/photocardMintingSimple";
import { useWallet } from "@/hooks/useWallet";
import { dailyFreeBoxService } from "@/services/dailyFreeBoxService";

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
  const { isConnected, walletAddress: currentWalletAddress } = useWallet();
  
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [suiCoins, setSuiCoins] = useState(1.0);
  const [fanHearts, setFanHearts] = useState(100); // Allow concept selection with default heart allocation
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
  const [activeTab, setActiveTab] = useState<'storage' | 'randombox' | 'collection' | 'generator' | 'marketplace'>('storage');
  const [isMinting, setIsMinting] = useState(false);
  const [hasAdvancedAccess, setHasAdvancedAccess] = useState(false);

  // Check URL params for tab and filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['storage', 'randombox', 'collection', 'generator', 'marketplace'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  useEffect(() => {
    console.log('Vault useEffect triggered - User:', user, 'Loading:', loading);
    
    // Execute only when user exists (wallet connection verified by AuthContext)
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
    
    // Load photocards from local storage
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    setPhotoCards(savedCards);
    
    // Load SUI coins
    const savedSuiCoins = localStorage.getItem('suiCoins');
    if (savedSuiCoins) {
      setSuiCoins(parseFloat(savedSuiCoins));
    } else {
      setSuiCoins(1.0); // Default value
      localStorage.setItem('suiCoins', '1.0');
    }
    
    const savedFanHearts = localStorage.getItem('fanHearts');
    if (savedFanHearts) {
      setFanHearts(parseInt(savedFanHearts));
    } else {
      // Default value: Provide sufficient hearts for photocard generation
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
    
    // Load daily free box status (handle asynchronously to prevent rendering blocking)
    setTimeout(() => {
      loadDailyFreeStatus(user.wallet_address);
    }, 0);

    // Load advanced access permissions
    const savedAdvancedAccess = localStorage.getItem('hasAdvancedAccess');
    if (savedAdvancedAccess === 'true') {
      setHasAdvancedAccess(true);
    }
    
    // Check daily heart reset (every midnight)
    const lastHeartReset = localStorage.getItem('lastHeartReset');
    const today = new Date().toDateString();
    if (lastHeartReset !== today) {
      const dailyAmount = 10;
      setDailyHearts(dailyAmount);
      localStorage.setItem('dailyHearts', dailyAmount.toString());
      localStorage.setItem('lastHeartReset', today);
    }
  }, [user]);

  const loadDailyFreeStatus = async (walletAddress: string) => {
    try {
      console.log('Loading daily free status for:', walletAddress);
      const status = await dailyFreeBoxService.getStatus(walletAddress);
      console.log('Daily free status loaded:', status);
      setDailyFreeStatus(status);
    } catch (error) {
      console.error('Error loading daily free status:', error);
      // Continue with default values even if error occurs
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
  
  if (!user) {
    return null;
  }

  const handleOpenRandomBox = async (type: "free" | "paid", boxCost?: number) => {
    // Random box opening logic
    if (type === 'free' && !dailyFreeStatus.canClaim) {
      if (dailyFreeStatus.userHasClaimedToday) {
        toast.error('You have already opened a free box today.');
      } else {
        toast.error('Today\'s limited free boxes have been depleted.');
      }
      return;
    }
    
    const cost = type === 'free' ? 0 : (boxCost || 0.15); // Based on SUI coins
    if (type !== 'free' && suiCoins < cost) {
      toast.error('Insufficient SUI coins.');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first!');
      return;
    }

    setIsMinting(true);

    try {
      // Handle claim for free box
      if (type === 'free') {
        const claimResult = await dailyFreeBoxService.claimFreeBox(walletAddress);
        if (!claimResult.success) {
          toast.error(claimResult.error || 'Failed to claim free box.');
          setIsMinting(false);
          return;
        }
        
        // Update status
        setDailyFreeStatus(prev => ({
          ...prev,
          userHasClaimedToday: true,
          canClaim: false,
          totalClaimsToday: claimResult.totalClaimsToday,
          remainingSlots: claimResult.remainingSlots
        }));
      }
      // Grant advanced generation permission for ultra box
      if (type === 'paid' && cost >= 0.45) {
        setHasAdvancedAccess(true);
        localStorage.setItem('hasAdvancedAccess', 'true');
        toast.success('🎉 You have acquired advanced photocard generation permission!');
      }

      // Random photocard quantity (1-10 cards)
      const cardCount = Math.floor(Math.random() * 10) + 1;
      const newPhotoCards: PhotoCard[] = [];
      
      const rarities = ['N', 'R', 'SR', 'SSR'] as const;
      const rarityWeights = { 'N': 50, 'R': 30, 'SR': 15, 'SSR': 5 };
      const concepts = ['Summer Dream', 'Winter Story', 'Spring Love', 'Autumn Wind'];

      for (let i = 0; i < cardCount; i++) {
        // Rarity weight-based selection
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

        // Actual photocard minting
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

      // Update status
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

      toast.success(`🎉 Minted ${cardCount} photocards!`);
    } catch (error) {
      console.error('Photocard minting failed:', error);
      toast.error('Failed to mint photocards.');
    } finally {
      setIsMinting(false);
    }
  };

  // Allow Vault access even if idol is not selected (limited features)
  const showLimitedAccess = !selectedIdol;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            🗃️ VAULT
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedIdol ? `Photocard collection journey with ${selectedIdol.name}` : 'Photocard collection journey'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              🔗 {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : 'Connecting wallet...'}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              💰 {suiCoins.toFixed(2)} SUI
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              ❤️ {fanHearts} Fan Hearts
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              💝 {dailyHearts}/10 Daily Hearts
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              📦 {photoCards.length} Owned
            </Badge>
          </div>
        </div>

        {/* Selected idol information */}
        {selectedIdol ? (
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
                Go to RISE →
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 glass-dark border-amber-400/30 bg-amber-400/5">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-amber-400">Please select an idol</h2>
              <p className="text-muted-foreground">
                You need to select an idol first to use photocard generation and some features.
              </p>
              <Button
                onClick={() => navigate('/pick')}
                className="bg-amber-400 hover:bg-amber-500 text-black"
              >
                Go select an idol
              </Button>
            </div>
          </Card>
        )}

        {/* Vault Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'storage' | 'randombox' | 'collection' | 'generator' | 'marketplace')} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="storage" className="data-[state=active]:bg-primary/20">
              🗃️ Idol Storage
            </TabsTrigger>
            <TabsTrigger value="generator" className="data-[state=active]:bg-primary/20">
              📷 Card Generation
            </TabsTrigger>
            <TabsTrigger value="randombox" className="data-[state=active]:bg-primary/20">
              📦 Random Box
            </TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-primary/20">
              🎴 Card Collection
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary/20">
              🛒 Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="storage" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Idol storage status */}
              <Card className="p-6 glass-dark border-white/10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold gradient-text">Idol Storage Status</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>Stored Idol</span>
                      <Badge variant={selectedIdol ? "default" : "outline"}>
                        {selectedIdol ? selectedIdol.name : 'Not selected'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>Owned Photocards</span>
                      <Badge variant="secondary">{photoCards.length} cards</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>Owned SUI Coins</span>
                      <Badge variant="outline">{suiCoins.toFixed(2)} 💰</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>Fan Heart Points</span>
                      <Badge variant="outline">{fanHearts} ❤️</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>First-come Free Box</span>
                      <Badge variant="outline">
                        {dailyFreeStatus.canClaim ? 'Available' : dailyFreeStatus.userHasClaimedToday ? 'Completed' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Idol profile */}
              <Card className="p-6 glass-dark border-white/10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold gradient-text">Idol Profile</h3>

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
                          <div className="font-bold text-primary">Collection Rate</div>
                          <div className="text-xl">{Math.min(photoCards.length * 5, 100)}%</div>
                        </div>
                        <div className="p-3 bg-card/50 rounded-lg">
                          <div className="font-bold text-accent">Rarity</div>
                          <div className="text-xl">
                            {photoCards.filter(card => card.rarity === 'SSR').length > 0 ? 'SSR' :
                             photoCards.filter(card => card.rarity === 'SR').length > 0 ? 'SR' :
                             photoCards.filter(card => card.rarity === 'R').length > 0 ? 'R' : 'N'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-primary/20 flex items-center justify-center">
                        <span className="text-4xl">🎭</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-muted-foreground">No Idol Selected</h4>
                        <p className="text-muted-foreground">Profile will be displayed when an idol is selected</p>
                      </div>

                      <Button
                        onClick={() => navigate('/pick')}
                        variant="outline"
                        size="sm"
                      >
                        Select Idol
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
                  userCoins={suiCoins}
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
                  onNavigateToCollection={() => setActiveTab('collection')}
                />
              ) : (
                <Card className="p-8 glass-dark border-white/10">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold">Idol Selection Required</h3>
                    <p className="text-muted-foreground">
                      Please select an idol first to generate photocards.
                    </p>
                    <Button onClick={() => navigate('/pick')}>
                      Go select an idol
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

          <TabsContent value="randombox" className="mt-8">
            <RandomBox
              dailyFreeCount={dailyFreeStatus.totalClaimsToday}
              maxDailyFree={dailyFreeStatus.maxDailyClaims}
              userCoins={suiCoins}
              pityCounter={pityCounters}
              onOpenBox={handleOpenRandomBox}
              isOpening={isMinting}
            />
          </TabsContent>

          <TabsContent value="collection" className="mt-8">
            <PhotoCardGallery
              photocards={photoCards}
              selectedIdolId={selectedIdol?.id.toString() || ''}
            />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-8">
            <Marketplace
              listings={[]} // Will be fetched from API in the future
              priceHistory={[]} // Will be fetched from API in the future
              userWallet={walletAddress}
              onPurchase={(listingId) => console.log('Purchase:', listingId)}
              onBid={(listingId, amount) => console.log('Bid:', listingId, amount)}
              onCreateListing={(photocardId, price, isAuction) => console.log('Create listing:', photocardId, price, isAuction)}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            ← Select Idol
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Vault;