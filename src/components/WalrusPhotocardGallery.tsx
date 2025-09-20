import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePhotocardStorage } from '@/hooks/usePhotocardStorage';
import { useWallet } from '@/hooks/useWallet';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Heart, 
  Star, 
  Loader2, 
  AlertCircle,
  Grid3X3,
  List,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import type { PhotocardMetadata } from '@/services/photocardStorageService';

interface WalrusPhotocardGalleryProps {
  className?: string;
}

export function WalrusPhotocardGallery({ className }: WalrusPhotocardGalleryProps) {
  const { 
    getUserPhotocards, 
    getIdolPhotocards, 
    getPhotocardsByRarity, 
    loadPhotocard,
    isLoading, 
    error, 
    clearError 
  } = usePhotocardStorage();
  const { currentAccount } = useWallet();
  
  const [photocards, setPhotocards] = useState<PhotocardMetadata[]>([]);
  const [filteredPhotocards, setFilteredPhotocards] = useState<PhotocardMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedIdol, setSelectedIdol] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCard, setSelectedCard] = useState<PhotocardMetadata | null>(null);
  const [cardImageData, setCardImageData] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // 사용자 포토카드 로드
  const loadUserPhotocards = async () => {
    if (!currentAccount) {
      toast.error('지갑을 연결해주세요');
      return;
    }

    try {
      clearError();
      const userCards = await getUserPhotocards(currentAccount.address);
      setPhotocards(userCards);
      setFilteredPhotocards(userCards);
    } catch (error) {
      console.error('포토카드 로드 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 포토카드 로드
  useEffect(() => {
    if (currentAccount) {
      loadUserPhotocards();
    }
  }, [currentAccount]);

  // 필터링 로직
  useEffect(() => {
    let filtered = photocards;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.idolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.season.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 등급 필터
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === selectedRarity);
    }

    // 아이돌 필터
    if (selectedIdol !== 'all') {
      filtered = filtered.filter(card => card.idolName === selectedIdol);
    }

    setFilteredPhotocards(filtered);
  }, [photocards, searchTerm, selectedRarity, selectedIdol]);

  // 고유한 아이돌 목록 추출
  const uniqueIdols = Array.from(new Set(photocards.map(card => card.idolName)));

  // 등급별 색상
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'SR': return 'text-purple-400 border-purple-400 bg-purple-400/10';
      case 'R': return 'text-blue-400 border-blue-400 bg-blue-400/10';
      case 'N': return 'text-gray-400 border-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  // 포토카드 이미지 로드
  const handleViewCard = async (card: PhotocardMetadata) => {
    setSelectedCard(card);
    setIsLoadingImage(true);
    setCardImageData(null);

    try {
      // 메타데이터에 저장된 imageUrl 사용
      if (card.imageUrl) {
        setCardImageData(card.imageUrl);
      } else {
        toast.error('이미지 데이터를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('이미지 로드 실패:', error);
      toast.error('이미지 로드에 실패했습니다');
    } finally {
      setIsLoadingImage(false);
    }
  };

  // 포토카드 다운로드
  const handleDownloadCard = async (card: PhotocardMetadata) => {
    try {
      if (cardImageData) {
        // URL인 경우 fetch로 이미지를 가져와서 다운로드
        if (typeof cardImageData === 'string' && cardImageData.startsWith('http')) {
          const response = await fetch(cardImageData);
          if (!response.ok) {
            throw new Error('이미지 다운로드 실패');
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${card.idolName}_${card.concept}_${card.rarity}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // Blob이나 Uint8Array인 경우
          const link = document.createElement('a');
          link.href = cardImageData;
          link.download = `${card.idolName}_${card.concept}_${card.rarity}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        toast.success('포토카드가 다운로드되었습니다');
      } else {
        toast.error('다운로드할 이미지가 없습니다');
      }
    } catch (error) {
      console.error('다운로드 실패:', error);
      toast.error('다운로드에 실패했습니다');
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Database className="w-6 h-6" />
              Walrus 포토카드 갤러리
            </h2>
            <p className="text-muted-foreground">
              분산 스토리지에 저장된 포토카드 컬렉션
            </p>
          </div>
          <Button
            onClick={loadUserPhotocards}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            새로고침
          </Button>
        </div>

        {/* 에러 표시 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 필터 및 검색 */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="아이돌명, 컨셉, 시즌으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="등급 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 등급</SelectItem>
                  <SelectItem value="SSR">SSR</SelectItem>
                  <SelectItem value="SR">SR</SelectItem>
                  <SelectItem value="R">R</SelectItem>
                  <SelectItem value="N">N</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedIdol} onValueChange={setSelectedIdol}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="아이돌 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 아이돌</SelectItem>
                  {uniqueIdols.map((idol) => (
                    <SelectItem key={idol} value={idol}>
                      {idol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 통계 */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>총 {photocards.length}개</span>
              <span>필터링된 {filteredPhotocards.length}개</span>
              {photocards.length > 0 && (
                <>
                  <span>SSR: {photocards.filter(c => c.rarity === 'SSR').length}</span>
                  <span>SR: {photocards.filter(c => c.rarity === 'SR').length}</span>
                  <span>R: {photocards.filter(c => c.rarity === 'R').length}</span>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* 포토카드 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">포토카드를 불러오는 중...</span>
          </div>
        ) : filteredPhotocards.length === 0 ? (
          <Card className="p-12 text-center">
            <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">저장된 포토카드가 없습니다</h3>
            <p className="text-muted-foreground">
              포토카드를 생성하고 Walrus에 저장해보세요!
            </p>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-4'
          }>
            {filteredPhotocards.map((card) => (
              <Card
                key={card.id}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${
                  viewMode === 'list' ? 'p-4' : 'overflow-hidden'
                }`}
                onClick={() => handleViewCard(card)}
              >
                {viewMode === 'grid' ? (
                  <div className="aspect-[3/4] relative">
                    <img
                      src={card.imageUrl}
                      alt={`${card.idolName} ${card.concept}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <Badge className={`absolute top-2 left-2 ${getRarityColor(card.rarity)}`}>
                      {card.rarity}
                    </Badge>
                    
                    <Badge variant="outline" className="absolute top-2 right-2 bg-black/50 text-white border-white/20">
                      #{card.serialNo.toString().padStart(4, '0')}
                    </Badge>

                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="font-bold text-white text-sm truncate">{card.idolName}</h4>
                      <p className="text-white/80 text-xs truncate">{card.concept}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={card.imageUrl}
                        alt={`${card.idolName} ${card.concept}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{card.idolName}</h4>
                        <Badge className={getRarityColor(card.rarity)}>
                          {card.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{card.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.season} • #{card.serialNo.toString().padStart(4, '0')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* 포토카드 상세 모달 */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">포토카드 상세 정보</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCard(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {isLoadingImage ? (
                      <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                        <img
                          src={cardImageData || selectedCard.imageUrl}
                          alt={`${selectedCard.idolName} ${selectedCard.concept}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownloadCard(selectedCard)}
                        className="flex-1"
                        disabled={!cardImageData}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-lg">{selectedCard.idolName}</h4>
                      <Badge className={`mt-1 ${getRarityColor(selectedCard.rarity)}`}>
                        {selectedCard.rarity}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">컨셉:</span>
                        <span>{selectedCard.concept}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">시즌:</span>
                        <span>{selectedCard.season}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">시리얼 번호:</span>
                        <span>#{selectedCard.serialNo.toString().padStart(4, '0')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">총 발행량:</span>
                        <span>{selectedCard.totalSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">생성일:</span>
                        <span>{new Date(selectedCard.mintedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">소유자:</span>
                        <span className="font-mono text-xs">
                          {selectedCard.owner.slice(0, 8)}...{selectedCard.owner.slice(-8)}
                        </span>
                      </div>
                    </div>

                    {selectedCard.prompt && (
                      <div>
                        <h5 className="font-semibold mb-2">생성 프롬프트</h5>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          {selectedCard.prompt}
                        </p>
                      </div>
                    )}

                    {selectedCard.isAdvanced && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        고급 AI 생성
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
