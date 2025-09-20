import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useZkLoginOfficial } from '@/services/zkLoginServiceOfficial';
import { useZkLoginMintingOfficial } from '@/services/zkLoginMintingOfficial';
import { 
  Shield, 
  User, 
  Copy, 
  Check, 
  Loader2,
  TestTube,
  Zap,
  Star,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const ZkLoginTestOfficial = () => {
  const { user, login, logout, isLoggedIn, isLoading } = useZkLoginOfficial();
  const { mintPhotoCard, mintIdolCard } = useZkLoginMintingOfficial();
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
      toast.error('먼저 공식 zkLogin으로 로그인해주세요.');
      return;
    }

    setIsMinting(true);
    try {
      const mintingData = {
        idolId: 1,
        idolName: 'Test Idol',
        rarity: 'SSR',
        concept: 'Summer',
        season: '2024',
        serialNo: 1,
        totalSupply: 1000,
        imageUrl: 'https://example.com/image.jpg',
        personaPrompt: 'Beautiful K-pop idol'
      };

      const result = await mintPhotoCard(mintingData);
      setMintResult(result);
      toast.success('공식 zkLogin 포토카드 민팅 성공!');
    } catch (error) {
      console.error('민팅 실패:', error);
      toast.error('민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleTestIdolMint = async () => {
    if (!isLoggedIn()) {
      toast.error('먼저 공식 zkLogin으로 로그인해주세요.');
      return;
    }

    setIsMinting(true);
    try {
      const mintingData = {
        idolId: 1,
        idolName: 'Test Idol',
        concept: 'Summer',
        season: '2024',
        imageUrl: 'https://example.com/image.jpg',
        personaPrompt: 'Beautiful K-pop idol'
      };

      const result = await mintIdolCard(mintingData);
      setMintResult(result);
      toast.success('공식 zkLogin 아이돌 카드 민팅 성공!');
    } catch (error) {
      console.error('민팅 실패:', error);
      toast.error('민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">공식 zkLogin 테스트</h1>
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300">
            Sui 공식 문서에 따른 zkLogin 구현 테스트
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <BookOpen className="w-4 h-4 mr-2" />
              공식 가이드 기반 구현
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 로그인 상태 */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">로그인 상태</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <span className="ml-2 text-white">로그인 처리 중...</span>
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-100 font-medium">공식 zkLogin 로그인 완료</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-blue-400"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-300 text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <Label className="text-gray-300 text-sm">zkLogin 주소</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-mono text-sm">
                        {user.address.substring(0, 10)}...{user.address.substring(user.address.length - 10)}
                      </span>
                      <Button
                        onClick={handleCopyAddress}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-gray-700"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <Label className="text-gray-300">Provider</Label>
                      <p className="text-white capitalize">{user.provider}</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <Label className="text-gray-300">Max Epoch</Label>
                      <p className="text-white">{user.maxEpoch}</p>
                    </div>
                  </div>

                  <Button
                    onClick={logout}
                    variant="destructive"
                    className="w-full"
                  >
                    <User className="w-4 h-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-500/20 rounded-lg border border-gray-500/30">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">로그인되지 않음</span>
                </div>

                <Button
                  onClick={login}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  공식 Google로 로그인
                </Button>
              </div>
            )}
          </Card>

          {/* 민팅 테스트 */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-semibold text-white">민팅 테스트</h2>
            </div>

            {isLoggedIn() ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <p className="text-green-100 text-sm">
                    공식 zkLogin으로 로그인되어 있습니다. 민팅을 테스트할 수 있습니다.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleTestMint}
                    disabled={isMinting}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        포토카드 민팅 중...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        포토카드 민팅 테스트
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleTestIdolMint}
                    disabled={isMinting}
                    variant="outline"
                    className="w-full border-blue-400 text-blue-400 hover:bg-blue-400/10"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        아이돌 카드 민팅 중...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        아이돌 카드 민팅 테스트
                      </>
                    )}
                  </Button>
                </div>

                {mintResult && (
                  <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <h3 className="text-blue-100 font-medium mb-2">민팅 결과</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <Label className="text-blue-300">트랜잭션 다이제스트</Label>
                        <p className="text-white font-mono">{mintResult.digest}</p>
                      </div>
                      <div>
                        <Label className="text-blue-300">민팅 시간</Label>
                        <p className="text-white">{new Date(mintResult.mintedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-500/20 rounded-lg border border-gray-500/30">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">로그인이 필요합니다</span>
                </div>

                <p className="text-gray-300 text-sm">
                  민팅을 테스트하려면 먼저 공식 zkLogin으로 로그인해주세요.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* 공식 가이드 정보 */}
        <Card className="mt-6 p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">공식 zkLogin 가이드</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">구현된 기능</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  JWT 디코딩 (jwt-decode 라이브러리)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  사용자 salt 관리 (16바이트 랜덤 값)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  ephemeral 키페어 생성 및 관리
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  제로지식 증명(ZKP) 생성
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  공식 zkLogin 주소 생성
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  세션 스토리지 보안 저장
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-3">공식 가이드 준수</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Sui 시스템 상태 확인
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  maxEpoch 설정 (현재 + 2)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  공식 OAuth URL 구성
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  address seed 생성
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  zkLogin 서명 조립
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  트랜잭션 실행
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-100 text-sm">
              이 구현은 <a href="https://docs.sui.io/guides/developer/cryptography/zklogin-integration" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">Sui 공식 zkLogin 통합 가이드</a>를 기반으로 합니다.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ZkLoginTestOfficial;
