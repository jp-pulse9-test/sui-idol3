import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SavedCard {
  id: number;
  name: string;
  image: string;
  personality: string;
  customText: string;
  borderColor: string;
  createdAt: string;
}

const Collection = () => {
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cards = JSON.parse(localStorage.getItem('savedCards') || '[]');
    setSavedCards(cards);
  }, []);

  const deleteCard = (id: number) => {
    const updatedCards = savedCards.filter(card => card.id !== id);
    setSavedCards(updatedCards);
    localStorage.setItem('savedCards', JSON.stringify(updatedCards));
    toast.success("프로필카드가 삭제되었습니다!");
  };

  const downloadCard = (card: SavedCard) => {
    const link = document.createElement('a');
    link.download = `${card.name}-profile-card.png`;
    link.href = card.image;
    link.click();
    toast.success("프로필카드가 다운로드되었습니다!");
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">내 프로필카드 보관함</h1>
          <p className="text-muted-foreground">생성한 프로필카드들을 모아서 관리하세요</p>
          <Badge variant="secondary" className="px-4 py-2">
            총 {savedCards.length}개의 카드
          </Badge>
        </div>

        {/* Collection Grid */}
        <div className="space-y-6">
          {savedCards.length === 0 ? (
            <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-border">
              <div className="space-y-4">
                <div className="text-6xl">📱</div>
                <h3 className="text-xl font-bold">보관함이 비어있습니다</h3>
                <p className="text-muted-foreground">
                  첫 번째 프로필카드를 만들어보세요!
                </p>
                <Button 
                  onClick={() => navigate('/gender-select')}
                  variant="premium"
                  size="lg"
                >
                  프로필카드 만들기
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedCards.map((card) => (
                <Card key={card.id} className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
                  <div className="space-y-4">
                    {/* 카드 이미지 */}
                    <div className="relative group">
                      <img 
                        src={card.image} 
                        alt={`${card.name} 프로필카드`}
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => downloadCard(card)}
                            variant="outline"
                            size="sm"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                          >
                            📥
                          </Button>
                          <Button
                            onClick={() => deleteCard(card.id)}
                            variant="outline"
                            size="sm"
                            className="bg-red-500/20 backdrop-blur-sm border-red-300/30 text-white hover:bg-red-500/30"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* 카드 정보 */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">{card.name}</h3>
                      <p className="text-sm text-primary">{card.personality}</p>
                      <p className="text-xs text-muted-foreground">"{card.customText}"</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: card.borderColor }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(card.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button
            onClick={() => navigate('/gender-select')}
            variant="premium"
            size="lg"
            className="min-w-48"
          >
            ✨ 새 프로필카드 만들기
          </Button>
          
          <div>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;