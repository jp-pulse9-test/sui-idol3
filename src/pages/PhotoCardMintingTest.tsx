import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PhotoCardMintingCard } from '@/components/PhotoCardMintingCard';
import { usePhotoCardMinting } from '@/services/photocardMintingImproved';
import { useSuiBalance } from '@/services/suiBalanceServiceNew';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  Loader2, 
  Coins, 
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const PhotoCardMintingTest = () => {
  const { mintPhotoCard, isPending, isConnected } = usePhotoCardMinting();
  const { balance: suiBalance, isLoading: isBalanceLoading, fetchBalance } = useSuiBalance();
  const currentAccount = useCurrentAccount();
  
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // 테스트용 아이돌 데이터
  const testIdol = {
    id: 1,
    name: '테스트 아이돌',
    personality: '활발하고 밝은 성격',
    imageUrl: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Test+Idol',
    personaPrompt: 'A bright and cheerful idol character with vibrant energy',
  };

  const runMintingTest = async () => {
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    setIsTesting(true);
    const results = [];

    try {
      // 테스트 1: 기본 포토카드 민팅
      console.log('테스트 1: 기본 포토카드 민팅 시작');
      const testData1 = {
        idolId: 1,
        idolName: '테스트 아이돌',
        rarity: 'R' as const,
        concept: '스쿨룩',
        season: 'Spring 2024',
        serialNo: Math.floor(Math.random() * 10000) + 1,
        totalSupply: 5000,
        imageUrl: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Test+Card',
        personaPrompt: 'A bright and cheerful idol character',
      };

      const result1 = await mintPhotoCard(testData1);
      results.push({
        test: '기본 포토카드 민팅',
        success: result1.success,
        digest: result1.digest,
        error: result1.error,
      });

      // 테스트 2: SSR 포토카드 민팅
      console.log('테스트 2: SSR 포토카드 민팅 시작');
      const testData2 = {
        idolId: 1,
        idolName: '테스트 아이돌',
        rarity: 'SSR' as const,
        concept: '파티룩',
        season: 'Summer 2024',
        serialNo: Math.floor(Math.random() * 10000) + 1,
        totalSupply: 1000,
        imageUrl: 'https://via.placeholder.com/300x300/FFD700/000000?text=SSR+Card',
        personaPrompt: 'An elegant and sophisticated idol character',
      };

      const result2 = await mintPhotoCard(testData2);
      results.push({
        test: 'SSR 포토카드 민팅',
        success: result2.success,
        digest: result2.digest,
        error: result2.error,
      });

      setTestResults(results);
      toast.success('포토카드 민팅 테스트가 완료되었습니다!');
    } catch (error) {
      console.error('테스트 실패:', error);
      toast.error('테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTesting(false);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const refreshBalance = () => {
    if (currentAccount?.address) {
      fetchBalance(currentAccount.address);
      toast.info('SUI 잔액을 새로고침했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            🎴 포토카드 민팅 테스트
          </h1>
          <p className="text-xl text-muted-foreground">
            포토카드 민팅 기능을 테스트하고 검증합니다
          </p>
        </div>

        {/* SUI 잔액 표시 */}
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              SUI 잔액 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">SUI 잔액:</span>
                  {isBalanceLoading ? (
                    <span className="text-sm text-muted-foreground">로딩 중...</span>
                  ) : (
                    <span className="text-sm font-bold text-green-500">
                      {suiBalance ? (Number(suiBalance) / 1e9).toFixed(2) : 'N/A'} SUI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">지갑 상태:</span>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "연결됨" : "연결 안됨"}
                  </Badge>
                </div>
              </div>
              <Button onClick={refreshBalance} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 포토카드 민팅 카드 */}
        <PhotoCardMintingCard
          selectedIdol={testIdol}
          onMintingComplete={(result) => {
            console.log('포토카드 민팅 완료:', result);
            toast.success('포토카드 민팅이 완료되었습니다!');
          }}
        />

        {/* 테스트 섹션 */}
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5" />
              자동 테스트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={runMintingTest}
                disabled={isTesting || isPending || !isConnected}
                className="btn-modern"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    테스트 진행 중...
                  </>
                ) : (
                  '포토카드 민팅 테스트 실행'
                )}
              </Button>
              <Button
                onClick={clearTestResults}
                variant="outline"
                disabled={testResults.length === 0}
              >
                결과 초기화
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">테스트 결과:</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-card/50 rounded">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "성공" : "실패"}
                    </Badge>
                    {result.digest && (
                      <span className="text-xs text-muted-foreground">
                        Digest: {result.digest.substring(0, 10)}...
                      </span>
                    )}
                    {result.error && (
                      <span className="text-xs text-red-500">
                        오류: {result.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 네비게이션 */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            ← 이전 페이지
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCardMintingTest;
