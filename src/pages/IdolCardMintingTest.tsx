import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIdolCardMinting } from '@/services/idolCardMinting';
import { useSuiBalance } from '@/services/suiBalanceServiceNew';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { RealMintingStatus } from '@/components/RealMintingStatus';
import { MintingResultDisplay } from '@/components/MintingResultDisplay';
import { 
  Loader2, 
  Coins, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Crown,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const IdolCardMintingTest = () => {
  const { mintIdolCard, isPending, isConnected } = useIdolCardMinting();
  const { balance: suiBalance, isLoading: isBalanceLoading, fetchBalance } = useSuiBalance();
  const currentAccount = useCurrentAccount();
  
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [singleMintingResult, setSingleMintingResult] = useState<any>(null);

  // 테스트용 아이돌 데이터
  const [testData, setTestData] = useState({
    idolId: 1,
    name: '테스트 아이돌',
    personality: '활발하고 밝은 성격',
    imageUrl: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Test+Idol',
    personaPrompt: 'A bright and cheerful idol character with vibrant energy',
  });

  const runMintingTest = async () => {
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    setIsTesting(true);
    const results = [];

    try {
      // 테스트 1: 기본 아이돌 카드 민팅
      console.log('테스트 1: 기본 아이돌 카드 민팅 시작');
      const result1 = await mintIdolCard(testData);
      results.push({
        test: '기본 아이돌 카드 민팅',
        success: result1.success,
        digest: result1.digest,
        error: result1.error,
      });

      // 테스트 2: 다른 아이돌 카드 민팅
      console.log('테스트 2: 다른 아이돌 카드 민팅 시작');
      const testData2 = {
        ...testData,
        idolId: 2,
        name: '테스트 아이돌 2',
        personality: '차분하고 우아한 성격',
        personaPrompt: 'A calm and elegant idol character with graceful charm',
      };
      
      const result2 = await mintIdolCard(testData2);
      results.push({
        test: '다른 아이돌 카드 민팅',
        success: result2.success,
        digest: result2.digest,
        error: result2.error,
      });

      setTestResults(results);
      toast.success('아이돌 카드 민팅 테스트가 완료되었습니다!');
    } catch (error) {
      console.error('테스트 실패:', error);
      toast.error('테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTesting(false);
    }
  };

  const runSingleMintingTest = async () => {
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    setIsTesting(true);
    setSingleMintingResult(null);
    try {
      const result = await mintIdolCard(testData);
      setSingleMintingResult(result);
      if (result.success) {
        toast.success('아이돌 카드 민팅이 성공했습니다!');
      } else {
        toast.error('아이돌 카드 민팅이 실패했습니다.');
      }
    } catch (error) {
      console.error('단일 테스트 실패:', error);
      setSingleMintingResult({ success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' });
      toast.error('민팅 중 오류가 발생했습니다.');
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            👑 아이돌 카드 민팅 테스트
          </h1>
          <p className="text-xl text-muted-foreground">
            아이돌 카드 민팅 기능을 테스트하고 검증합니다
          </p>
        </div>

        {/* 실제 민팅 상태 */}
        <RealMintingStatus
          isMinting={isTesting || isPending}
          isConnected={isConnected}
          hasSufficientBalance={suiBalance ? Number(suiBalance) / 1e9 >= 0.1 : false}
          mintingCost={0.1}
          currentBalance={suiBalance ? Number(suiBalance) / 1e9 : 0}
        />

        {/* 테스트 데이터 입력 */}
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              테스트 데이터 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idolId">아이돌 ID</Label>
                <Input
                  id="idolId"
                  type="number"
                  value={testData.idolId}
                  onChange={(e) => setTestData(prev => ({ ...prev, idolId: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">아이돌 이름</Label>
                <Input
                  id="name"
                  value={testData.name}
                  onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personality">성격</Label>
                <Input
                  id="personality"
                  value={testData.personality}
                  onChange={(e) => setTestData(prev => ({ ...prev, personality: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  value={testData.imageUrl}
                  onChange={(e) => setTestData(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="personaPrompt">페르소나 프롬프트</Label>
              <Textarea
                id="personaPrompt"
                value={testData.personaPrompt}
                onChange={(e) => setTestData(prev => ({ ...prev, personaPrompt: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 테스트 섹션 */}
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              아이돌 카드 민팅 테스트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={runSingleMintingTest}
                disabled={isTesting || isPending || !isConnected}
                className="btn-modern"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    민팅 진행 중...
                  </>
                ) : (
                  '단일 아이돌 카드 민팅'
                )}
              </Button>
              <Button
                onClick={runMintingTest}
                disabled={isTesting || isPending || !isConnected}
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    테스트 진행 중...
                  </>
                ) : (
                  '자동 테스트 실행'
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

        {/* 단일 민팅 결과 */}
        {singleMintingResult && (
          <MintingResultDisplay
            result={singleMintingResult}
            type="idolcard"
            onClose={() => setSingleMintingResult(null)}
          />
        )}

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

export default IdolCardMintingTest;
