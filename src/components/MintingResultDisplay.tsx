import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Crown,
  Star,
  Sparkles,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';

interface MintingResult {
  success: boolean;
  digest?: string;
  objectChanges?: any[];
  effects?: any;
  error?: string;
}

interface MintingResultDisplayProps {
  result: MintingResult;
  type: 'idolcard' | 'photocard';
  onClose?: () => void;
  className?: string;
}

export const MintingResultDisplay: React.FC<MintingResultDisplayProps> = ({
  result,
  type,
  onClose,
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyDigest = async () => {
    if (result.digest) {
      try {
        await navigator.clipboard.writeText(result.digest);
        setCopied(true);
        toast.success('트랜잭션 해시가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('복사 실패:', err);
        toast.error('복사에 실패했습니다.');
      }
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'N': return <Hash className="w-4 h-4" />;
      case 'R': return <Star className="w-4 h-4" />;
      case 'SR': return <Sparkles className="w-4 h-4" />;
      case 'SSR': return <Crown className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'N': return 'bg-gray-500';
      case 'R': return 'bg-blue-500';
      case 'SR': return 'bg-purple-500';
      case 'SSR': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeInfo = () => {
    if (type === 'idolcard') {
      return {
        title: '아이돌 카드 민팅',
        icon: <Crown className="w-6 h-6" />,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/20',
      };
    } else {
      return {
        title: '포토카드 민팅',
        icon: <Star className="w-6 h-6" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
      };
    }
  };

  const typeInfo = getTypeInfo();

  if (!result.success) {
    return (
      <Card className={`w-full max-w-md mx-auto glass-dark border-red-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
              ✕
            </div>
            민팅 실패
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-500 font-medium">
              {result.error || '알 수 없는 오류가 발생했습니다.'}
            </p>
            {onClose && (
              <Button onClick={onClose} variant="outline" className="w-full">
                닫기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto glass-dark border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${typeInfo.bgColor} flex items-center justify-center ${typeInfo.color}`}>
            {typeInfo.icon}
          </div>
          {typeInfo.title} 성공!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 성공 메시지 */}
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-500 font-medium">
            블록체인에서 성공적으로 민팅되었습니다!
          </span>
        </div>

        {/* 트랜잭션 정보 */}
        {result.digest && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">트랜잭션 해시:</h4>
            <div className="flex items-center gap-2 p-2 bg-card/50 rounded border">
              <code className="text-xs font-mono flex-1 truncate">
                {result.digest}
              </code>
              <Button
                onClick={handleCopyDigest}
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                title="복사"
              >
                {copied ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
              <Button
                onClick={() => window.open(`https://suiexplorer.com/txblock/${result.digest}?network=testnet`, '_blank')}
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                title="Sui Explorer에서 보기"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* 객체 변경사항 */}
        {result.objectChanges && result.objectChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">생성된 객체:</h4>
            <div className="space-y-1">
              {result.objectChanges
                .filter((change: any) => change.type === 'created')
                .map((change: any, index: number) => (
                  <div key={index} className="p-2 bg-card/50 rounded border text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {change.objectType?.includes('IdolCard') ? 'IdolCard' : 'PhotoCard'}
                      </Badge>
                      <code className="font-mono truncate flex-1">
                        {change.objectId}
                      </code>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 가스 정보 */}
        {result.effects?.gasUsed && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">가스 사용량:</h4>
            <div className="p-2 bg-card/50 rounded border text-sm">
              <div className="flex justify-between">
                <span>계산 비용:</span>
                <span>{(result.effects.gasUsed.computationCost / 1e9).toFixed(4)} SUI</span>
              </div>
              <div className="flex justify-between">
                <span>저장 비용:</span>
                <span>{(result.effects.gasUsed.storageCost / 1e9).toFixed(4)} SUI</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>총 비용:</span>
                <span>{((result.effects.gasUsed.computationCost + result.effects.gasUsed.storageCost) / 1e9).toFixed(4)} SUI</span>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          {result.digest && (
            <Button
              onClick={() => window.open(`https://suiexplorer.com/txblock/${result.digest}?network=testnet`, '_blank')}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Explorer에서 보기
            </Button>
          )}
          {onClose && (
            <Button onClick={onClose} variant="default" className="flex-1">
              완료
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
