import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Eye, 
  DollarSign,
  History,
  Tag
} from "lucide-react";

interface MarketplaceListing {
  id: string;
  photocardId: string;
  idolName: string;
  concept: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  serialNo: number;
  imageUrl: string;
  price: number;
  seller: string;
  listedAt: string;
  isAuction: boolean;
  auctionEndsAt?: string;
  currentBid?: number;
  totalBids?: number;
}

interface PriceHistory {
  id: string;
  photocardId: string;
  price: number;
  soldAt: string;
  seller: string;
  buyer: string;
}

interface MarketplaceProps {
  listings: MarketplaceListing[];
  priceHistory: PriceHistory[];
  userWallet?: string;
  onPurchase?: (listingId: string) => void;
  onBid?: (listingId: string, amount: number) => void;
  onCreateListing?: (photocardId: string, price: number, isAuction: boolean) => void;
}

export const Marketplace = ({ 
  listings, 
  priceHistory, 
  userWallet, 
  onPurchase, 
  onBid, 
  onCreateListing 
}: MarketplaceProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'rarity' | 'ending'>('date');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterIdol, setFilterIdol] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [bidAmount, setBidAmount] = useState("");

  // Get unique idol names for filter dropdown
  const uniqueIdols = Array.from(new Set(listings.map(l => l.idolName))).sort();

  // Check URL params for idol filter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idolParam = urlParams.get('idol');
    if (idolParam) {
      // Find idol name by ID or use the parameter directly
      const idolListing = listings.find(l => l.photocardId === idolParam || l.idolName.includes(idolParam));
      if (idolListing) {
        setFilterIdol(idolListing.idolName);
        setSearchTerm(idolListing.idolName);
      }
    }
  }, [listings]);

  const rarityColors = {
    'N': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'R': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'SR': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'SSR': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };

  const filteredListings = listings
    .filter(listing => {
      const matchesSearch = listing.idolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           listing.concept.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = filterRarity === 'all' || listing.rarity === filterRarity;
      const matchesIdol = filterIdol === 'all' || listing.idolName === filterIdol;
      const matchesPriceMin = !priceRange.min || listing.price >= Number(priceRange.min);
      const matchesPriceMax = !priceRange.max || listing.price <= Number(priceRange.max);
      
      return matchesSearch && matchesRarity && matchesIdol && matchesPriceMin && matchesPriceMax;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'date':
          return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
        case 'rarity':
          const rarityOrder = { 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'ending':
          if (!a.auctionEndsAt && !b.auctionEndsAt) return 0;
          if (!a.auctionEndsAt) return 1;
          if (!b.auctionEndsAt) return -1;
          return new Date(a.auctionEndsAt).getTime() - new Date(b.auctionEndsAt).getTime();
        default:
          return 0;
      }
    });

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    
    if (diff <= 0) return "경매 종료";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const getFloorPrice = (idolName: string, concept: string, rarity: string) => {
    const samePcListings = listings.filter(l => 
      l.idolName === idolName && l.concept === concept && l.rarity === rarity
    );
    return samePcListings.length > 0 ? Math.min(...samePcListings.map(l => l.price)) : null;
  };

  const handlePurchase = (listing: MarketplaceListing) => {
    if (listing.seller === userWallet) {
      return; // Can't buy from yourself
    }
    onPurchase?.(listing.id);
  };

  const handleBid = (listing: MarketplaceListing) => {
    const amount = Number(bidAmount);
    if (amount > (listing.currentBid || listing.price)) {
      onBid?.(listing.id, amount);
      setBidAmount("");
      setSelectedListing(null);
    }
  };

  const renderListing = (listing: MarketplaceListing) => {
    const isOwnListing = listing.seller === userWallet;
    const floorPrice = getFloorPrice(listing.idolName, listing.concept, listing.rarity);
    const isFloorPrice = floorPrice === listing.price;
    
    return (
      <Card key={listing.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="aspect-[3/4] relative">
          <img
            src={listing.imageUrl}
            alt={`${listing.idolName} ${listing.concept}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Rarity Badge */}
          <Badge className={`absolute top-2 left-2 ${rarityColors[listing.rarity]} border font-bold`}>
            {listing.rarity}
          </Badge>

          {/* Serial Number */}
          <Badge variant="outline" className="absolute top-2 right-2 bg-black/50 text-white border-white/20">
            #{listing.serialNo.toString().padStart(4, '0')}
          </Badge>

          {/* Floor Price Indicator */}
          {isFloorPrice && (
            <Badge className="absolute top-12 left-2 bg-green-500/20 text-green-400 border-green-500/30">
              바닥가
            </Badge>
          )}

          {/* Auction Timer */}
          {listing.isAuction && listing.auctionEndsAt && (
            <Badge className="absolute top-12 right-2 bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeRemaining(listing.auctionEndsAt)}
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-sm truncate">{listing.idolName}</h3>
            <p className="text-xs text-muted-foreground truncate">{listing.concept}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {listing.isAuction ? '현재 입찰가' : '즉시구매가'}
              </span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-primary" />
                <span className="font-bold text-primary">
                  {listing.isAuction ? (listing.currentBid || listing.price) : listing.price} SUI
                </span>
              </div>
            </div>

            {listing.isAuction && listing.totalBids && (
              <div className="text-xs text-muted-foreground">
                {listing.totalBids}번의 입찰
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              판매자: {formatWalletAddress(listing.seller)}
            </div>
          </div>

          <div className="flex gap-2">
            {!isOwnListing && (
              <>
                {listing.isAuction ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1" onClick={() => setSelectedListing(listing)}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        입찰하기
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/95 backdrop-blur-md border-border">
                      <DialogHeader>
                        <DialogTitle>입찰하기</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <img src={listing.imageUrl} alt="" className="w-24 h-32 object-cover mx-auto rounded-lg mb-2" />
                          <p className="font-semibold">{listing.idolName} - {listing.concept}</p>
                          <p className="text-sm text-muted-foreground">
                            현재 최고가: {listing.currentBid || listing.price} SUI
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">입찰 금액 (SUI)</label>
                          <Input
                            type="number"
                            placeholder={`${(listing.currentBid || listing.price) + 0.1} 이상`}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="bg-card/50 border-border"
                          />
                        </div>
                        <Button 
                          onClick={() => handleBid(listing)} 
                          className="w-full"
                          disabled={!bidAmount || Number(bidAmount) <= (listing.currentBid || listing.price)}
                        >
                          입찰하기
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => handlePurchase(listing)}>
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    구매하기
                  </Button>
                )}
              </>
            )}
            
            <Button variant="outline" size="sm">
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderPriceHistoryItem = (item: PriceHistory) => (
    <Card key={item.id} className="p-4 glass-dark border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary/20 flex items-center justify-center">
            <History className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">거래 완료</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.soldAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary">{item.price} SUI</p>
          <p className="text-xs text-muted-foreground">
            {formatWalletAddress(item.seller)} → {formatWalletAddress(item.buyer)}
          </p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          마켓플레이스
        </h2>
        <p className="text-muted-foreground">
          포토카드를 거래하고 컬렉션을 완성하세요 · 로열티 5%는 자동 배분됩니다
        </p>
      </div>

      {/* Market Stats */}
      <Card className="p-6 glass-dark border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold gradient-text">{listings.length}</div>
            <div className="text-sm text-muted-foreground">판매 중</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{priceHistory.length}</div>
            <div className="text-sm text-muted-foreground">총 거래</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {listings.filter(l => l.isAuction).length}
            </div>
            <div className="text-sm text-muted-foreground">경매 중</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.min(...listings.map(l => l.price)).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">최저가 (SUI)</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buy' | 'history')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="buy" className="data-[state=active]:bg-primary/20">
            🛒 구매하기
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
            📊 거래 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-6 mt-6">
          {/* Filters */}
          <Card className="p-4 glass-dark border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Input
                placeholder="아이돌명, 컨셉 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card/50 border-border"
              />
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="bg-card/50 border-border">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                  <SelectItem value="date">최신순</SelectItem>
                  <SelectItem value="price">가격순</SelectItem>
                  <SelectItem value="rarity">레어도순</SelectItem>
                  <SelectItem value="ending">경매 마감순</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterIdol} onValueChange={setFilterIdol}>
                <SelectTrigger className="bg-card/50 border-border">
                  <SelectValue placeholder="아이돌" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                  <SelectItem value="all">전체 아이돌</SelectItem>
                  {uniqueIdols.map((idol) => (
                    <SelectItem key={idol} value={idol}>{idol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterRarity} onValueChange={setFilterRarity}>
                <SelectTrigger className="bg-card/50 border-border">
                  <SelectValue placeholder="레어도" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="SSR">SSR</SelectItem>
                  <SelectItem value="SR">SR</SelectItem>
                  <SelectItem value="R">R</SelectItem>
                  <SelectItem value="N">N</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="최소 가격"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="bg-card/50 border-border"
                type="number"
              />

              <Input
                placeholder="최대 가격"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="bg-card/50 border-border"
                type="number"
              />
            </div>
          </Card>

          {/* Listings Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredListings.map(renderListing)}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                조건에 맞는 판매 상품이 없습니다
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <div className="space-y-3">
            {priceHistory.slice(0, 50).map(renderPriceHistoryItem)}
          </div>
          
          {priceHistory.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                아직 거래 내역이 없습니다
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};