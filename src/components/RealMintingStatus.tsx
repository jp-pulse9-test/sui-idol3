import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Coins,
  Zap
} from 'lucide-react';

interface RealMintingStatusProps {
  isMinting: boolean;
  isConnected: boolean;
  hasSufficientBalance: boolean;
  mintingCost: number;
  currentBalance: number;
  className?: string;
}

export const RealMintingStatus: React.FC<RealMintingStatusProps> = ({
  isMinting,
  isConnected,
  hasSufficientBalance,
  mintingCost,
  currentBalance,
  className = '',
}) => {
  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: <XCircle className="w-5 h-5" />,
        title: '지갑 연결 필요',
        message: '민팅을 위해 지갑을 연결해주세요.',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
      };
    }

    if (!hasSufficientBalance) {
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'SUI 잔액 부족',
        message: `민팅에 필요한 SUI가 부족합니다.`,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
      };
    }

    if (isMinting) {
      return {
        icon: <Loader2 className="w-5 h-5 animate-spin" />,
        title: '실제 블록체인 민팅 중',
        message: 'Sui 테스트넷에서 민팅을 진행하고 있습니다...',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
      };
    }

    return {
      icon: <CheckCircle className="w-5 h-5" />,
      title: '민팅 준비 완료',
      message: '실제 블록체인에서 민팅할 수 있습니다.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`w-full glass-dark border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          실제 블록체인 민팅 상태
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 상태 표시 */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          {statusInfo.icon}
          <div>
            <h3 className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {statusInfo.message}
            </p>
          </div>
        </div>

        {/* 잔액 정보 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">SUI 잔액 정보:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-card/50 rounded">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>현재 잔액:</span>
              <span className="font-semibold">{currentBalance.toFixed(4)} SUI</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-card/50 rounded">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>민팅 비용:</span>
              <span className="font-semibold">{mintingCost.toFixed(4)} SUI</span>
            </div>
          </div>
        </div>

        {/* 상태 배지 */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "지갑 연결됨" : "지갑 연결 안됨"}
          </Badge>
          <Badge variant={hasSufficientBalance ? "default" : "destructive"}>
            {hasSufficientBalance ? "잔액 충분" : "잔액 부족"}
          </Badge>
          <Badge variant={isMinting ? "secondary" : "outline"}>
            {isMinting ? "민팅 진행 중" : "대기 중"}
          </Badge>
          <Badge variant="outline" className="text-green-500 border-green-500">
            실제 블록체인
          </Badge>
        </div>

        {/* 네트워크 정보 */}
        <div className="p-2 bg-card/50 rounded text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Sui 테스트넷 연결됨</span>
          </div>
          <div className="mt-1">
            패키지 ID: 0x51bfb8010e6e72c43578eed4d5a940d8de233a9e2b83c166f8879d029bf41cc7
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
