import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Search, Filter, TrendingUp, TrendingDown, Heart } from "lucide-react";
import { useHeartSystem } from "@/hooks/useHeartSystem";
import { toast } from "sonner";

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

interface PhotoCardGalleryProps {
  photocards: PhotoCard[];
  selectedIdolId?: string;
  onToggleVisibility?: (cardId: string) => void;
  onViewCard?: (card: PhotoCard) => void;
  isOwner?: boolean;
  isPinterestMode?: boolean;
}

export const PhotoCardGallery = ({ 
  photocards, 
  selectedIdolId, 
  onToggleVisibility, 
  onViewCard,
  isOwner = false,
  isPinterestMode = false
}: PhotoCardGalleryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'rarity' | 'date' | 'price' | 'serial' | 'hearts'>('hearts');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterConcept, setFilterConcept] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'owned'>('catalog');
  
  const { dailyHearts, giveHeart, hasGivenHeart } = useHeartSystem();
  const currentWallet = localStorage.getItem('walletAddress');

  const rarityOrder = { 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
  const rarityColors = {
    'N': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'R': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'SR': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'SSR': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };

  const filteredAndSortedCards = photocards
    .filter(card => {
      const matchesSearch = card.idolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.concept.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = filterRarity === 'all' || card.rarity === filterRarity;
      const matchesConcept = filterConcept === 'all' || card.concept === filterConcept;
      const matchesIdol = !selectedIdolId || card.idolId === selectedIdolId;
      const matchesTab = activeTab === 'catalog' || (activeTab === 'owned' && isOwner);
      
      return matchesSearch && matchesRarity && matchesConcept && matchesIdol && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'date':
          return new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime();
        case 'price':
          return (b.floorPrice || 0) - (a.floorPrice || 0);
        case 'serial':
          return a.serialNo - b.serialNo;
        case 'hearts':
          return (b.heartsReceived || 0) - (a.heartsReceived || 0);
        default:
          return 0;
      }
    });

  const uniqueConcepts = [...new Set(photocards.map(card => card.concept))];
  const stats = {
    total: photocards.length,
    byRarity: {
      SSR: photocards.filter(c => c.rarity === 'SSR').length,
      SR: photocards.filter(c => c.rarity === 'SR').length,
      R: photocards.filter(c => c.rarity === 'R').length,
      N: photocards.filter(c => c.rarity === 'N').length,
    }
  };

  const handleHeartClick = (card: PhotoCard, e: React.MouseEvent) => {
    e.stopPropagation();
    giveHeart(card.id, card.owner);
  };

  const renderPhotoCard = (card: PhotoCard) => (
    <Card
      key={card.id}
      className={`group relative overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 ${
        !card.isPublic && isOwner ? 'opacity-70' : ''
      } ${isPinterestMode ? 'break-inside-avoid mb-4' : ''}`}
      onClick={() => onViewCard?.(card)}
    >
      <div className={`${isPinterestMode ? 'aspect-auto' : 'aspect-[3/4]'} relative`}>
        <img
          src={card.imageUrl}
          alt={`${card.idolName} ${card.concept}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Rarity Badge */}
        <Badge className={`absolute top-2 left-2 ${rarityColors[card.rarity]} border font-bold`}>
          {card.rarity}
        </Badge>

        {/* Serial Number */}
        <Badge variant="outline" className="absolute top-2 right-2 bg-black/50 text-white border-white/20">
          #{card.serialNo.toString().padStart(4, '0')}
        </Badge>

        {/* Heart Button for Pinterest Mode */}
        {isPinterestMode && card.owner !== currentWallet && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-12 transition-all duration-300 ${
              hasGivenHeart(card.id) 
                ? 'bg-red-500/80 text-white' 
                : 'bg-black/50 hover:bg-red-500/50 text-white hover:text-red-200'
            }`}
            onClick={(e) => handleHeartClick(card, e)}
            disabled={hasGivenHeart(card.id) || dailyHearts <= 0}
          >
            <Heart className={`w-4 h-4 ${hasGivenHeart(card.id) ? 'fill-current' : ''}`} />
          </Button>
        )}

        {/* Heart Count */}
        {(card.heartsReceived || 0) > 0 && (
          <Badge className="absolute bottom-14 right-2 bg-red-500/80 text-white border-red-400">
            ❤️ {card.heartsReceived}
          </Badge>
        )}

        {/* Privacy Toggle for Owner */}
        {isOwner && onToggleVisibility && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(card.id);
            }}
          >
            {card.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        )}

        {/* Card Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-bold text-sm truncate">{card.idolName}</h3>
          <p className="text-xs text-white/80 truncate">{card.concept}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-white/60">{card.season}</span>
            {card.floorPrice && (
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>{card.floorPrice} SUI</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text">
          📸 포토카드 갤러리
        </h2>
        {selectedIdolId ? (
          <p className="text-muted-foreground">
            선택한 아이돌의 포토카드 컬렉션
          </p>
        ) : (
          <p className="text-muted-foreground">
            모든 아이돌의 포토카드를 둘러보세요
          </p>
        )}
      </div>

      {/* Stats Overview */}
      <Card className="p-6 glass-dark border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold gradient-text">{stats.total}</div>
            <div className="text-sm text-muted-foreground">총 발행량</div>
          </div>
          {Object.entries(stats.byRarity).map(([rarity, count]) => (
            <div key={rarity}>
              <div className={`text-2xl font-bold ${rarityColors[rarity as keyof typeof rarityColors].split(' ')[1]}`}>
                {count}
              </div>
              <div className="text-sm text-muted-foreground">{rarity} 등급</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-4 glass-dark border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="아이돌명, 컨셉 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="bg-card/50 border-border">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-md border-border">
              <SelectItem value="hearts">하트순</SelectItem>
              <SelectItem value="rarity">레어도순</SelectItem>
              <SelectItem value="date">최신순</SelectItem>
              <SelectItem value="price">가격순</SelectItem>
              <SelectItem value="serial">시리얼순</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRarity} onValueChange={setFilterRarity}>
            <SelectTrigger className="bg-card/50 border-border">
              <SelectValue placeholder="레어도 필터" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-md border-border">
              <SelectItem value="all">전체 레어도</SelectItem>
              <SelectItem value="SSR">SSR</SelectItem>
              <SelectItem value="SR">SR</SelectItem>
              <SelectItem value="R">R</SelectItem>
              <SelectItem value="N">N</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterConcept} onValueChange={setFilterConcept}>
            <SelectTrigger className="bg-card/50 border-border">
              <SelectValue placeholder="컨셉 필터" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-md border-border">
              <SelectItem value="all">전체 컨셉</SelectItem>
              {uniqueConcepts.map(concept => (
                <SelectItem key={concept} value={concept}>{concept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Gallery Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'catalog' | 'owned')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="catalog" className="data-[state=active]:bg-primary/20">
            📚 카탈로그
          </TabsTrigger>
          <TabsTrigger value="owned" className="data-[state=active]:bg-primary/20" disabled={!isOwner}>
            💎 내 소장품
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          {isPinterestMode ? (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {filteredAndSortedCards.map(renderPhotoCard)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredAndSortedCards.map(renderPhotoCard)}
            </div>
          )}
          {filteredAndSortedCards.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                조건에 맞는 포토카드가 없습니다
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="owned" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAndSortedCards.filter(card => isOwner).map(renderPhotoCard)}
          </div>
          {filteredAndSortedCards.filter(card => isOwner).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💎</div>
              <p className="text-muted-foreground">
                아직 소장한 포토카드가 없습니다
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};