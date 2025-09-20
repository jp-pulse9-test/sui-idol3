import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVotingService } from '@/services/votingService';
import { useWallet } from '@/hooks/useWallet';
import { useSuiBalance } from '@/services/suiBalanceService';
import { toast } from 'sonner';
import { Loader2, Wallet, Vote, Trophy, Users, Coins } from 'lucide-react';

interface VotingCardProps {
  idolId: number;
  idolName: string;
  idolImage: string;
  onVoteComplete?: (voteData: any) => void;
  className?: string;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  idolId,
  idolName,
  idolImage,
  onVoteComplete,
  className = '',
}) => {
  const { voteForIdol, getVoteCount, isConnected, walletAddress, isPending } = useVotingService();
  const { isConnected: walletConnected } = useWallet();
  const { balance: suiBalance, isLoading: isBalanceLoading } = useSuiBalance();
  const [isVoting, setIsVoting] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const voteAmount = 0.15; // 0.15 SUI

  useEffect(() => {
    // 투표 수 조회
    const currentVoteCount = getVoteCount(idolId);
    setVoteCount(currentVoteCount);

    // 사용자가 이미 투표했는지 확인
    const userVotes = JSON.parse(localStorage.getItem('idolVotes') || '[]');
    const userHasVoted = userVotes.some((vote: any) => 
      vote.idolId === idolId && vote.voterAddress === walletAddress
    );
    setHasVoted(userHasVoted);
  }, [idolId, walletAddress, getVoteCount]);

  const handleVote = async () => {
    if (!isConnected || !walletConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    if (hasVoted) {
      toast.error('이미 이 아이돌에게 투표했습니다!');
      return;
    }

    // SUI 잔액 확인
    const currentBalance = suiBalance ? Number(suiBalance) / 1e9 : 0;
    if (currentBalance < voteAmount) {
      toast.error(`SUI 잔액이 부족합니다. (보유: ${currentBalance.toFixed(2)} SUI, 필요: ${voteAmount} SUI)`);
      return;
    }

    setIsVoting(true);

    try {
      const result = await voteForIdol(idolId, idolName, voteAmount);
      
      if (result.success) {
        setVoteCount(prev => prev + 1);
        setHasVoted(true);
        onVoteComplete?.(result.voteData);
      }
    } catch (error) {
      console.error('투표 실패:', error);
      toast.error('투표에 실패했습니다.');
    } finally {
      setIsVoting(false);
    }
  };

  const getRankBadge = (count: number) => {
    if (count >= 100) return { text: '1위', color: 'bg-yellow-500', icon: Trophy };
    if (count >= 50) return { text: '2위', color: 'bg-gray-400', icon: Trophy };
    if (count >= 20) return { text: '3위', color: 'bg-orange-600', icon: Trophy };
    if (count >= 10) return { text: '인기', color: 'bg-blue-500', icon: Users };
    return { text: '신규', color: 'bg-green-500', icon: Users };
  };

  const rankInfo = getRankBadge(voteCount);
  const RankIcon = rankInfo.icon;

  return (
    <Card className={`w-full max-w-sm mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Vote className="w-5 h-5 text-purple-500" />
          아이돌 투표
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 아이돌 정보 */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-primary/20">
            <img
              src={idolImage}
              alt={idolName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">{idolName}</h3>
            <Badge className={`${rankInfo.color} text-white mt-2`}>
              <RankIcon className="w-3 h-3 mr-1" />
              {rankInfo.text}
            </Badge>
          </div>
        </div>

        {/* 투표 통계 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-card/50 rounded-lg text-center">
            <div className="font-bold text-primary">총 투표수</div>
            <div className="text-xl font-bold">{voteCount}</div>
          </div>
          <div className="p-3 bg-card/50 rounded-lg text-center">
            <div className="font-bold text-accent">투표 금액</div>
            <div className="text-xl font-bold">{voteAmount} SUI</div>
          </div>
        </div>

        {/* 지갑 연결 상태 */}
        <div className="flex items-center justify-center gap-2">
          {isConnected && walletConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              지갑 연결됨
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              지갑 연결 필요
            </Badge>
          )}
        </div>

        {/* SUI 잔액 표시 */}
        {suiBalance && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Coins className="w-3 h-3" />
              보유: {(Number(suiBalance) / 1e9).toFixed(2)} SUI
            </div>
          </div>
        )}

        {/* 투표 버튼 */}
        <Button
          onClick={handleVote}
          disabled={!isConnected || !walletConnected || isVoting || isPending || hasVoted}
          className="w-full"
          size="lg"
          variant={hasVoted ? "outline" : "default"}
        >
          {isVoting || isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              투표 중...
            </>
          ) : hasVoted ? (
            <>
              <Vote className="w-4 h-4 mr-2" />
              투표 완료
            </>
          ) : (
            <>
              <Vote className="w-4 h-4 mr-2" />
              {voteAmount} SUI 투표하기
            </>
          )}
        </Button>

        {/* 설명 */}
        <div className="text-center text-sm text-muted-foreground">
          {hasVoted ? (
            <p>이미 이 아이돌에게 투표했습니다.</p>
          ) : (
            <>
              <p>아이돌에게 {voteAmount} SUI를 투표합니다.</p>
              <p className="mt-1">투표는 블록체인에 기록됩니다.</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
