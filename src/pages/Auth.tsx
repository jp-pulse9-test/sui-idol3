import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Shield, Zap } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const { connectWallet, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleWalletConnect = async () => {
    setLoading(true);
    
    const { error } = await connectWallet();
    
    if (error) {
      toast({
        title: "지갑 연결 실패",
        description: "지갑 연결 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "환영합니다!",
        description: "Sui 지갑이 성공적으로 연결되었습니다.",
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">Sui 지갑으로 시작하기</CardTitle>
          <CardDescription className="text-lg">
            Sui 블록체인 지갑을 연결하여 아이돌 여정을 시작하세요
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 지갑 연결 혜택 소개 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold text-primary">안전한 데이터 보관</h4>
                <p className="text-sm text-muted-foreground">모든 포토카드와 게임 데이터가 블록체인에 안전하게 저장됩니다</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
              <Zap className="w-6 h-6 text-accent" />
              <div>
                <h4 className="font-semibold text-accent">즉시 시작</h4>
                <p className="text-sm text-muted-foreground">복잡한 회원가입 없이 지갑 연결만으로 바로 이용 가능합니다</p>
              </div>
            </div>
          </div>

          {/* 지갑 연결 버튼 */}
          <Button 
            onClick={handleWalletConnect}
            disabled={loading}
            size="xl"
            className="w-full bg-gradient-to-r from-accent via-primary to-secondary 
              hover:from-primary hover:via-accent hover:to-primary
              text-white font-bold text-lg py-6
              shadow-lg hover:shadow-xl
              border border-white/20 hover:border-white/30
              transition-all duration-300 ease-in-out
              hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                지갑 연결 중...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Sui 지갑 연결하기
              </div>
            )}
          </Button>

          {/* 지원 지갑 안내 */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">지원 지갑</p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="px-3 py-1 bg-muted rounded-full">Sui Wallet</span>
              <span className="px-3 py-1 bg-muted rounded-full">Suiet Wallet</span>
              <span className="px-3 py-1 bg-muted rounded-full">Ethos Wallet</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;