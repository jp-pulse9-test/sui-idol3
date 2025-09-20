import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PhotocardKeyService, PhotocardKey, UserPhotocardKey } from '@/services/photocardKeyService';
import { toast } from 'sonner';
import { Key, CreditCard, Clock, Infinity, Plus, Zap } from 'lucide-react';

interface PhotocardKeyManagerProps {
  walletAddress: string;
  onAccessGranted?: () => void;
}

export const PhotocardKeyManager = ({ walletAddress, onAccessGranted }: PhotocardKeyManagerProps) => {
  const [serialKey, setSerialKey] = useState('');
  const [activeKeys, setActiveKeys] = useState<(UserPhotocardKey & { photocard_keys: PhotocardKey })[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadActiveKeys();
  }, [walletAddress]);

  const loadActiveKeys = async () => {
    try {
      const { keys, error } = await PhotocardKeyService.getUserActiveKeys(walletAddress);
      if (error) {
        toast.error(error);
      } else {
        setActiveKeys(keys);
      }
    } catch (error) {
      console.error('Error loading active keys:', error);
      toast.error('키 정보 로딩 중 오류가 발생했습니다.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleActivateKey = async () => {
    if (!serialKey.trim()) {
      toast.error('시리얼 키를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { success, error } = await PhotocardKeyService.activateSerialKey(walletAddress, serialKey.trim());
      
      if (success) {
        toast.success('시리얼 키가 성공적으로 활성화되었습니다!');
        setSerialKey('');
        await loadActiveKeys();
        onAccessGranted?.();
      } else {
        toast.error(error || '시리얼 키 활성화에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error activating key:', error);
      toast.error('시리얼 키 활성화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getKeyStatus = (key: PhotocardKey) => {
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return { status: 'expired', label: '만료됨', variant: 'destructive' as const };
    }
    if (key.is_unlimited) {
      return { status: 'unlimited', label: '무제한', variant: 'default' as const };
    }
    if (key.remaining_credits > 0) {
      return { status: 'active', label: '활성', variant: 'default' as const };
    }
    return { status: 'depleted', label: '소진됨', variant: 'secondary' as const };
  };

  if (initialLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-muted-foreground">키 정보를 불러오는 중...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 새 키 활성화 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            새 시리얼 키 활성화
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serial-key">시리얼 키</Label>
            <Input
              id="serial-key"
              type="text"
              placeholder="시리얼 키를 입력하세요 (예: TEST-KEY-100)"
              value={serialKey}
              onChange={(e) => setSerialKey(e.target.value.toUpperCase())}
              disabled={loading}
            />
          </div>
          <Button 
            onClick={handleActivateKey} 
            disabled={loading || !serialKey.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                활성화 중...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                시리얼 키 활성화
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 활성화된 키 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            내 포토카드 생성 권한
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">활성화된 키가 없습니다</p>
              <p className="text-sm">포토카드 생성을 위해 시리얼 키를 활성화해주세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeKeys.map((keyData, index) => {
                const key = keyData.photocard_keys;
                const status = getKeyStatus(key);
                
                return (
                  <div key={keyData.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{key.serial_key}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        활성화: {formatDate(keyData.activated_at)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {key.is_unlimited ? (
                          <>
                            <Infinity className="w-4 h-4 text-green-500" />
                            <span>무제한 사용</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span>
                              {key.remaining_credits}/{key.total_credits} 크레딧
                            </span>
                          </>
                        )}
                      </div>
                      
                      {key.expires_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>만료: {formatDate(key.expires_at)}</span>
                        </div>
                      )}
                    </div>
                    
                    {status.status === 'active' || status.status === 'unlimited' && (
                      <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        ✅ 이 키로 포토카드 생성이 가능합니다
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 안내 메시지 */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>💡 <strong>시리얼 키 안내:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• 포토카드 생성을 위해서는 유효한 시리얼 키가 필요합니다</li>
              <li>• 각 생성마다 1크레딧이 소모됩니다 (무제한 키 제외)</li>
              <li>• 테스트용: <code className="bg-muted px-1 rounded">TEST-KEY-100</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};