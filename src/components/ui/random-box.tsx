import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Sparkles, Star, Coins } from "lucide-react";

interface RandomBoxProps {
  dailyFreeCount: number;
  maxDailyFree: number;
  userCoins: number;
  pityCounter: { sr: number; ssr: number };
  onOpenBox: (type: 'free' | 'paid', boxCost?: number) => void;
  isOpening: boolean;
}

interface BoxType {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
  rates: {
    N: number;
    R: number;
    SR: number;
    SSR: number;
  };
}

export const RandomBox = ({ 
  dailyFreeCount, 
  maxDailyFree, 
  userCoins, 
  pityCounter, 
  onOpenBox, 
  isOpening 
}: RandomBoxProps) => {
  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null);

  const boxTypes: BoxType[] = [
    {
      id: 'standard',
      name: 'Standard Box',
      cost: 0,
      icon: '📦',
      description: 'Basic box that can be opened for free daily',
      rates: { N: 70, R: 25, SR: 4, SSR: 1 }
    },
    {
      id: 'premium',
      name: 'Premium Box',
      cost: 0.15,
      icon: '✨',
      description: 'Premium box with higher rare probability (0.15 SUI)',
      rates: { N: 50, R: 35, SR: 12, SSR: 3 }
    },
    {
      id: 'ultra',
      name: 'Ultra Box',
      cost: 0.45,
      icon: '💎',
      description: 'Pro photocard generation access (advanced AI features included)',
      rates: { N: 30, R: 40, SR: 20, SSR: 10 }
    }
  ];

  const canOpenFree = dailyFreeCount < maxDailyFree;
  const srPityRemaining = Math.max(0, 10 - pityCounter.sr);
  const ssrPityRemaining = Math.max(0, 30 - pityCounter.ssr);

  const handleOpenBox = useCallback((boxType: BoxType) => {
    if (boxType.cost === 0 && canOpenFree) {
      onOpenBox('free');
    } else if (boxType.cost > 0 && userCoins >= boxType.cost) {
      onOpenBox('paid', boxType.cost);
    }
  }, [canOpenFree, userCoins, onOpenBox]);

  const getRarityColor = (rarity: string, rate: number) => {
    const opacity = Math.max(0.3, rate / 100);
    switch (rarity) {
      case 'SSR':
        return `rgba(255, 215, 0, ${opacity})`; // Gold
      case 'SR':
        return `rgba(147, 51, 234, ${opacity})`; // Purple
      case 'R':
        return `rgba(59, 130, 246, ${opacity})`; // Blue
      case 'N':
        return `rgba(107, 114, 128, ${opacity})`; // Gray
      default:
        return `rgba(107, 114, 128, ${opacity})`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <Gift className="w-8 h-8" />
          Random Box
        </h2>
        <p className="text-muted-foreground">
          Open special boxes to obtain photocards
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="px-4 py-2">
            💰 Coins Owned: {userCoins.toLocaleString()}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            🎁 Daily Free: {dailyFreeCount}/{maxDailyFree}
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            🏃‍♂️ Remaining: {maxDailyFree - dailyFreeCount}
          </Badge>
        </div>
      </div>

      {/* Pity System Info */}
      <Card className="p-6 glass-dark border-white/10">
        <div className="space-y-4">
          <h3 className="text-lg font-bold gradient-text flex items-center gap-2">
            <Star className="w-5 h-5" />
            Pity System
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-400">Until SR Guaranteed</span>
                <span className="font-semibold">{srPityRemaining} pulls</span>
              </div>
              <Progress 
                value={((10 - srPityRemaining) / 10) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                SR or higher guaranteed within 10 pulls
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-400">Until SSR Guaranteed</span>
                <span className="font-semibold">{ssrPityRemaining} pulls</span>
              </div>
              <Progress 
                value={((30 - ssrPityRemaining) / 30) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                SSR guaranteed within 30 pulls
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Box Selection */}
      <div className="grid md:grid-cols-3 gap-6">
        {boxTypes.map((box) => {
          const canOpen = box.cost === 0 ? canOpenFree : userCoins >= box.cost;
          const isSelected = selectedBox?.id === box.id;
          
          return (
            <Card
              key={box.id}
              className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'ring-2 ring-primary/50 scale-105' 
                  : 'hover:scale-102'
              } ${
                !canOpen 
                  ? 'opacity-50 grayscale' 
                  : 'glass-dark border-white/10 hover:border-white/20'
              }`}
              onClick={() => canOpen && setSelectedBox(box)}
            >
              <div className="p-6 space-y-4">
                {/* Box Header */}
                <div className="text-center space-y-2">
                  <div className="text-4xl animate-pulse">{box.icon}</div>
                  <h3 className="text-xl font-bold gradient-text">{box.name}</h3>
                  <p className="text-sm text-muted-foreground">{box.description}</p>
                </div>

                {/* Cost */}
                <div className="text-center">
                  {box.cost === 0 ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
                      🎁 FREE
                    </Badge>
                  ) : (
                     <Badge variant="outline" className="text-lg px-4 py-2 flex items-center gap-1 mx-auto w-fit">
                       <Coins className="w-4 h-4" />
                       {box.cost} SUI
                     </Badge>
                  )}
                </div>


                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={box.cost === 0 ? "default" : "outline"}
                  disabled={!canOpen || isOpening}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBox(box);
                  }}
                >
                  {isOpening ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin">⭐</div>
                      Opening...
                    </div>
                  ) : box.cost === 0 ? (
                    canOpenFree ? (
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Open for Free
                      </div>
                    ) : (
                      "Daily free limit reached"
                    )
                  ) : userCoins >= box.cost ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Purchase and Open
                    </div>
                   ) : (
                     "Insufficient SUI"
                   )}
                </Button>

                {/* Special Effects for Selected Box */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Opening Animation Area */}
      {isOpening && (
        <Card className="p-8 glass-dark border-white/10">
          <div className="text-center space-y-6">
            <div className="text-6xl animate-bounce">📦</div>
            <h3 className="text-2xl font-bold gradient-text">
              Opening the box...
            </h3>
            <div className="space-y-2">
              <Progress value={75} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground">
                New photocards will appear soon!
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 glass-dark border-accent/20 bg-accent/5">
        <div className="space-y-2">
          <h4 className="font-semibold text-accent flex items-center gap-2">
            <Star className="w-4 h-4" />
            Random Box Guide
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Daily free boxes available for first {maxDailyFree} users</li>
            <li>• Get 1-10 photocards per opening</li>
            <li>• SR+ guaranteed within 10 pulls, SSR within 30 pulls</li>
            <li>• Premium/Ultra boxes have higher rare probability</li>
            <li>• Receiving hearts on photocards increases fan points</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};