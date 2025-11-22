import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ticket, Coins } from "lucide-react";
import { useFreeInputTickets } from "@/hooks/useFreeInputTickets";

export const FreeInputTicketPurchase = () => {
  const { tickets, purchaseTickets } = useFreeInputTickets();
  const [suiCoins, setSuiCoins] = useState(() => parseFloat(localStorage.getItem('suiCoins') || '0'));

  const handlePurchase = async (quantity: number) => {
    const success = await purchaseTickets(quantity);
    if (success) {
      setSuiCoins(parseFloat(localStorage.getItem('suiCoins') || '0'));
    }
  };

  const packages = [
    { quantity: 1, price: 0.10, discount: null },
    { quantity: 5, price: 0.40, discount: '20% 할인' },
    { quantity: 10, price: 0.70, discount: '30% 할인' },
  ];

  return (
    <Card className="p-6 glass-dark border-white/10">
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold gradient-text">🎫 Free Input Ticket Purchase</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            선택지 상황에서 자유롭게 원하는 답변을 입력할 수 있습니다
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-card/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{tickets}</div>
            <div className="text-sm text-muted-foreground">보유 티켓</div>
          </div>
          <div className="p-4 bg-card/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{suiCoins.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">SUI Coins</div>
          </div>
        </div>

        <div className="space-y-3">
          {packages.map((pkg) => (
            <div key={pkg.quantity} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-400" />
                  <span className="font-bold">{pkg.quantity} Ticket{pkg.quantity > 1 ? 's' : ''}</span>
                  {pkg.discount && (
                    <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                      {pkg.discount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold">{pkg.price} SUI</span>
                </div>
              </div>
              <Button 
                className="w-full btn-modern"
                onClick={() => handlePurchase(pkg.quantity)}
                disabled={suiCoins < pkg.price}
              >
                🎫 Purchase {pkg.quantity} Ticket{pkg.quantity > 1 ? 's' : ''}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>• 선택지가 제공될 때 자유 입력권을 사용하여 원하는 답변 입력 가능</div>
          <div>• 1개 티켓 = 1회 자유 입력</div>
          <div>• 대량 구매 시 할인 혜택</div>
        </div>
      </div>
    </Card>
  );
};
