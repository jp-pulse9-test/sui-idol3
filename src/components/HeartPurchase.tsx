import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Coins, Crown } from "lucide-react";
import { useHeartSystem } from "@/hooks/useHeartSystem";
import { useWallet } from "@/hooks/useWallet";

export const HeartPurchase = () => {
  const { fanHearts, purchaseHearts } = useHeartSystem();
  const { walletAddress } = useWallet();
  const [suiCoins, setSuiCoins] = useState(() => parseFloat(localStorage.getItem('suiCoins') || '0'));

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
            <h3 className="text-xl font-bold gradient-text">💖 Fan Heart Purchase</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Send support to other fans' photocards with fan hearts!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-card/50 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{fanHearts}</div>
            <div className="text-sm text-muted-foreground">Fan Hearts Owned</div>
          </div>
          <div className="p-4 bg-card/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{suiCoins.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">SUI Coins</div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-bold">10 Fan Hearts</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">0.15 SUI</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            = Worth ~$0.70 / Use 10 hearts to support other fans
          </p>
          <Button 
            className="w-full btn-modern"
            onClick={handlePurchaseHearts}
            disabled={suiCoins < 0.15}
          >
            💖 Purchase Fan Hearts
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          • Fan hearts are used to send support to other fans' photocards<br />
          • When your photocards receive hearts, your fan points increase<br />
          • 10 free hearts are provided daily
        </div>
      </div>
    </Card>
  );
};