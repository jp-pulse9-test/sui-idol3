import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Collection = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [collection, setCollection] = useState<any[]>([]);
  const navigate = useNavigate();

  const connectWallet = () => {
    // 실제 월렛 연결 로직은 Web3 백엔드가 필요합니다
    toast.info("월렛 연결 기능은 Supabase 연동 후 구현됩니다");
    setIsWalletConnected(true);
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">My Collection</h1>
          <p className="text-muted-foreground">나만의 포토카드 컬렉션을 관리하세요</p>
        </div>

        {/* Wallet Connection */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">월렛 연결</h3>
              <p className="text-muted-foreground">
                {isWalletConnected 
                  ? "월렛이 연결되었습니다" 
                  : "포토카드를 수집하려면 월렛을 연결하세요"
                }
              </p>
            </div>
            {!isWalletConnected ? (
              <Button onClick={connectWallet} variant="neon" size="lg">
                월렛 연결
              </Button>
            ) : (
              <Badge variant="secondary" className="px-4 py-2">
                연결됨
              </Badge>
            )}
          </div>
        </Card>

        {/* Collection Grid */}
        {isWalletConnected ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">내 포토카드</h2>
            {collection.length === 0 ? (
              <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-border">
                <div className="space-y-4">
                  <div className="text-6xl">📱</div>
                  <h3 className="text-xl font-bold">컬렉션이 비어있습니다</h3>
                  <p className="text-muted-foreground">
                    첫 번째 포토카드를 만들어보세요!
                  </p>
                  <Button 
                    onClick={() => navigate('/mbti')}
                    variant="hero"
                    size="lg"
                  >
                    포토카드 만들기
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* 포토카드들이 여기에 표시됩니다 */}
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-border">
            <div className="space-y-4">
              <div className="text-6xl">🔒</div>
              <h3 className="text-xl font-bold">월렛을 연결해주세요</h3>
              <p className="text-muted-foreground">
                포토카드 컬렉션을 보려면 월렛 연결이 필요합니다
              </p>
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
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
  );
};

export default Collection;