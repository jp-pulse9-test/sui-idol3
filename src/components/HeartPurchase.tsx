import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Coins, Crown } from "lucide-react";
import { useHeartSystem } from "@/hooks/useHeartSystem";
import { secureStorage } from "@/utils/secureStorage";

export const HeartPurchase = () => {
  const { fanHearts, purchaseHearts } = useHeartSystem();
  const [suiCoins, setSuiCoins] = useState(() => parseFloat(localStorage.getItem('suiCoins') || '0'));
  const currentWallet = secureStorage.getWalletAddress() || '';

  const handlePurchaseHearts = () => {
    if (purchaseHearts(10)) {
      setSuiCoins(parseFloat(localStorage.getItem('suiCoins') || '0'));
    }
  };

  return (
    <Card className="p-6 glass-dark border-white/10">
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold gradient-text">💖 팬 하트 구매</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            팬 하트로 다른 팬들의 포카에 응원을 보내세요!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-card/50 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{fanHearts}</div>
            <div className="text-sm text-muted-foreground">보유 팬 하트</div>
          </div>
          <div className="p-4 bg-card/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{suiCoins.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">SUI 코인</div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-bold">10 팬 하트</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">0.15 SUI</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            = 700원 상당 / 10개의 하트로 다른 팬들을 응원하세요
          </p>
          <Button 
            className="w-full btn-modern"
            onClick={handlePurchaseHearts}
            disabled={suiCoins < 0.15}
          >
            💖 팬 하트 구매하기
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          • 팬 하트는 다른 팬들의 포카에 응원을 보낼 때 사용됩니다<br />
          • 내 포카가 하트를 받으면 팬 포인트가 증가합니다<br />
          • 매일 10개의 무료 하트가 지급됩니다
        </div>
      </div>
    </Card>
  );
};