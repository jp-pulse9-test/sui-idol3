import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useZkLogin } from '@/services/zkLoginService';
import { useZkLoginMinting } from '@/services/zkLoginMinting';
import { 
  Shield, 
  User, 
  Copy, 
  Check, 
  Loader2,
  TestTube,
  Zap,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const ZkLoginTest = () => {
  const { user, login, logout, isLoggedIn, isLoading } = useZkLogin();
  const { mintPhotoCard, mintIdolCard } = useZkLoginMinting();
  const [copied, setCopied] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);

  const handleCopyAddress = async () => {
    if (user?.address) {
      try {
        await navigator.clipboard.writeText(user.address);
        setCopied(true);
        toast.success('주소가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('복사 실패:', error);
        toast.error('주소 복사에 실패했습니다.');
      }
    }
  };

  const handleTestMint = async () => {
    if (!isLoggedIn()) {
      toast.error('먼저 zkLogin으로 로그인해주세요.');
      return;
    }

    setIsMinting(true);
    try {
      const result = await mintPhotoCard({
        idolId: 1,
        idolName: 'Test Idol',
        rarity: 'R',
        concept: 'Test Concept',
        season: 'Season 1',
        serialNo: Math.floor(Math.random() * 10000) + 1,
        totalSupply: 5000,
        imageUrl: 'https://via.placeholder.com/300',
        personaPrompt: 'Test persona prompt',
      });

      setMintResult(result);
      toast.success('테스트 민팅이 완료되었습니다!');
    } catch (error) {
      console.error('테스트 민팅 실패:', error);
      toast.error('테스트 민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleTestIdolMint = async () => {
    if (!isLoggedIn()) {
      toast.error('먼저 zkLogin으로 로그인해주세요.');
      return;
    }

    setIsMinting(true);
    try {
      const result = await mintIdolCard({
        id: 1,
        name: 'Test Idol',
        personality: 'Friendly and energetic',
        image: 'https://via.placeholder.com/300',
        persona_prompt: 'Test persona prompt',
      });

      setMintResult(result);
      toast.success('테스트 아이돌 민팅이 완료되었습니다!');
    } catch (error) {
      console.error('테스트 아이돌 민팅 실패:', error);
      toast.error('테스트 아이돌 민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <TestTube className="w-8 h-8" />
            zkLogin 테스트
          </h1>
          <p className="text-muted-foreground">
            zkLogin 기능을 테스트하고 블록체인 트랜잭션을 시도해보세요.
          </p>
        </div>

        {/* 로그인 상태 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">로그인 상태</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>로딩 중...</span>
            </div>
          ) : isLoggedIn() && user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  zkLogin 연결됨
                </Badge>
                <Badge variant="outline">
                  {user.provider}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>사용자 이름</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{user.name}</span>
                  </div>
                </div>

                <div>
                  <Label>이메일</Label>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>zkLogin 주소</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="font-mono text-sm flex-1">
                      {user.address}
                    </span>
                    <Button
                      onClick={handleCopyAddress}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={logout} variant="outline">
                  로그아웃
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                zkLogin으로 로그인하여 테스트를 시작하세요.
              </p>
              <Button onClick={login} className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Google로 zkLogin
              </Button>
            </div>
          )}
        </Card>

        {/* 트랜잭션 테스트 */}
        {isLoggedIn() && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">트랜잭션 테스트</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                zkLogin으로 블록체인 트랜잭션을 테스트해보세요.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleTestMint}
                  disabled={isMinting}
                  className="flex items-center gap-2"
                >
                  {isMinting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                  포토카드 민팅 테스트
                </Button>

                <Button
                  onClick={handleTestIdolMint}
                  disabled={isMinting}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isMinting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  아이돌 카드 민팅 테스트
                </Button>
              </div>

              {mintResult && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    민팅 성공!
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">트랜잭션 해시:</span>
                      <span className="font-mono ml-2">{mintResult.digest}</span>
                    </div>
                    <div>
                      <span className="font-medium">민팅 시간:</span>
                      <span className="ml-2">{new Date(mintResult.mintedAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">사용자:</span>
                      <span className="ml-2">{mintResult.user.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">zkLogin 정보</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>zkLogin</strong>은 Zero-Knowledge 증명을 사용하여 소셜 계정으로 
              블록체인에 로그인할 수 있게 해주는 기술입니다.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>지갑 설치 불필요</li>
              <li>Google 계정으로 원클릭 로그인</li>
              <li>프라이버시 보호 (개인정보는 블록체인에 저장되지 않음)</li>
              <li>일반 지갑과 동일한 블록체인 기능 제공</li>
            </ul>
            <p className="text-xs">
              실제 Google OAuth 설정이 필요합니다. 환경 변수 VITE_GOOGLE_CLIENT_ID를 설정해주세요.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ZkLoginTest;
