import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { PhotocardKeyManager } from '@/components/PhotocardKeyManager';
import { PhotocardKeyService, PhotocardKey } from '@/services/photocardKeyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { ArrowLeft, Camera, Key, Lock, Unlock, Zap, Image, Upload, Palette, Download, Copy } from 'lucide-react';

const PhotocardGenerator = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { loading: authLoading } = useAuthGuard();
  
  const [hasAccess, setHasAccess] = useState(false);
  const [activeKey, setActiveKey] = useState<PhotocardKey | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (user?.wallet_address) {
      checkAccess();
    }
  }, [user]);

  const checkAccess = async () => {
    if (!user?.wallet_address) return;

    setAccessLoading(true);
    try {
      const { hasAccess: access, activeKey: key, error } = await PhotocardKeyService.hasPhotocardAccess(user.wallet_address);
      
      if (access && key) {
        setHasAccess(true);
        setActiveKey(key);
      } else {
        setHasAccess(false);
        setActiveKey(null);
        if (error) {
          console.log('Access check:', error);
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error('권한 확인 중 오류가 발생했습니다.');
    } finally {
      setAccessLoading(false);
    }
  };

  const handleAccessGranted = () => {
    checkAccess();
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-muted-foreground">로딩 중...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 게스트는 미리보기 모드로 접근 가능

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  포토카드 생성기
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI로 나만의 포토카드를 만들어보세요
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isGuest ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  미리보기 모드
                </Badge>
              ) : hasAccess && activeKey ? (
                <>
                  <Badge variant="default" className="flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    접근 허용
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {activeKey.is_unlimited ? (
                      <>
                        <Key className="w-3 h-3" />
                        무제한
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        {activeKey.remaining_credits} 크레딧
                      </>
                    )}
                  </Badge>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isGuest ? (
          // 게스트 모드 - 미리보기
          <div className="space-y-6">
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  미리보기 모드
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  포토카드 생성 기능을 체험해보세요. 실제로 생성하려면 지갑을 연결하고 시리얼 키를 활성화해야 합니다.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">지갑 연결 시 혜택:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✅ NFT 포토카드 실제 생성</li>
                    <li>✅ 블록체인 저장 및 소유권 증명</li>
                    <li>✅ 마켓플레이스 거래 가능</li>
                    <li>✅ 크로스 디바이스 동기화</li>
                  </ul>
                </div>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  지갑 연결하기
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !hasAccess ? (
          // 권한 없음 - 키 관리 화면
          <div className="space-y-6">
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Lock className="w-5 h-5" />
                  포토카드 생성 권한 필요
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300">
                  포토카드 생성 기능을 사용하려면 유효한 시리얼 키가 필요합니다. 
                  아래에서 시리얼 키를 활성화해주세요.
                </p>
              </CardContent>
            </Card>

            <PhotocardKeyManager 
              walletAddress={user!.wallet_address} 
              onAccessGranted={handleAccessGranted}
            />
          </div>
        ) : (
          // 권한 있음 - 포토카드 생성 화면
          <div className="space-y-8">
            {/* 단계 표시 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, title: '이미지 & 멤버 선택', icon: Upload },
                    { step: 2, title: 'SNS 텍스트 생성', icon: Copy },
                    { step: 3, title: '스타일 선택', icon: Palette },
                    { step: 4, title: '접근 제어 관리', icon: Key },
                    { step: 5, title: '생성 & 결과', icon: Download },
                  ].map(({ step, title, icon: Icon }, index) => (
                    <div key={step} className="flex items-center">
                      <div 
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-colors ${
                          currentStep === step 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : currentStep > step
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                        onClick={() => handleStepChange(step)}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {index < 4 && (
                        <div className={`w-16 h-0.5 mx-2 ${
                          currentStep > step ? 'bg-green-500' : 'bg-border'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-medium">
                    {currentStep === 1 && '이미지 & 멤버 선택'}
                    {currentStep === 2 && 'SNS 텍스트 생성'}
                    {currentStep === 3 && '스타일 선택'}
                    {currentStep === 4 && '접근 제어 관리'}
                    {currentStep === 5 && '생성 & 결과'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentStep === 1 && '아이돌 멤버를 선택하거나 이미지를 업로드하세요'}
                    {currentStep === 2 && 'AI가 SNS 포스트를 생성해드립니다'}
                    {currentStep === 3 && '포토그래픽 스타일을 선택하세요'}
                    {currentStep === 4 && '시리얼 키 인증 및 사용량 관리'}
                    {currentStep === 5 && '포토카드를 생성하고 다운로드하세요'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 단계별 컨텐츠 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && '1단계: 이미지 & 멤버 선택'}
                  {currentStep === 2 && '2단계: SNS 텍스트 생성'}
                  {currentStep === 3 && '3단계: 포토그래픽 스타일 선택'}
                  {currentStep === 4 && '4단계: 접근 제어 및 사용량 관리'}
                  {currentStep === 5 && '5단계: 생성 및 결과'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">이미지 업로드 기능</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Normal Mode: IITERNITI 멤버 선택 기능<br/>
                        Advanced Mode: 직접 이미지 업로드 (인물, 의상, 텍스처)
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        구현 예정: 이미지 유효성 검사 (image/*, 최대 7MB)
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <Copy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">SNS 텍스트 생성</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        AI Mode: 날짜, 날씨, 주제 입력으로 자동 생성<br/>
                        Manual Mode: 직접 캡션 작성
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        구현 예정: Gemini API 연동, 캐릭터 페르소나 반영
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">포토그래픽 스타일 선택</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        AI Recommended: 텍스트 기반 자동 스타일 추천<br/>
                        Advanced: 카메라, 앵글, 무드 조명 수동 선택
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        구현 예정: 24가지 컬러 그레이딩 프리셋
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <PhotocardKeyManager 
                      walletAddress={user!.wallet_address} 
                      onAccessGranted={handleAccessGranted}
                    />
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <Download className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">포토카드 생성 및 다운로드</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Gemini API로 하이퍼 리얼리스틱 포토 생성<br/>
                        로딩 상태 표시, 결과 표시, 다운로드 기능
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        구현 예정: 원클릭 복사, JPEG 다운로드
                      </p>
                    </div>
                  </div>
                )}

                {/* 네비게이션 버튼 */}
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    이전
                  </Button>
                  <Button 
                    onClick={() => handleStepChange(Math.min(5, currentStep + 1))}
                    disabled={currentStep === 5}
                  >
                    다음
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotocardGenerator;