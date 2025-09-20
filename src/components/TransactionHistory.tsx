import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  History, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Filter
} from 'lucide-react';
import { useTransactionHistory, TransactionRecord } from '@/services/transactionHistoryService';
import { useDataSync } from '@/services/dataSyncService';
import { toast } from 'sonner';

const TransactionHistory: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    clearHistory,
    getTransactionsByType,
    getTransactionsByStatus 
  } = useTransactionHistory();
  
  const { syncStatus, syncData, createBackup, restoreBackup, clearAllData } = useDataSync();
  
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filterType === 'all' || tx.type === filterType;
    const statusMatch = filterStatus === 'all' || tx.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getStatusIcon = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'mint':
        return '🎨';
      case 'purchase':
        return '🛒';
      case 'sale':
        return '💰';
      case 'bid':
        return '📈';
      case 'claim':
        return '🎁';
      default:
        return '📄';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return date.toLocaleDateString();
  };

  const handleRefresh = async () => {
    await syncData();
    toast.info('거래 내역을 새로고침했습니다.');
  };

  const handleBackup = async () => {
    try {
      await createBackup();
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = e.target?.result as string;
        await restoreBackup(backupData);
      } catch (error) {
        console.error('Restore failed:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearHistory = () => {
    if (window.confirm('정말로 모든 거래 내역을 삭제하시겠습니까?')) {
      clearHistory();
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <History className="w-8 h-8" />
          거래 내역
        </h2>
        <p className="text-muted-foreground">
          모든 블록체인 거래와 동기화 상태를 확인하세요
        </p>
      </div>

      {/* 동기화 상태 */}
      <Card className="p-6 glass-dark border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold gradient-text">동기화 상태</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={syncStatus.isSyncing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button onClick={handleBackup} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              백업
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  복원
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${syncStatus.isSyncing ? 'text-blue-400' : 'text-green-400'}`}>
              {syncStatus.isSyncing ? '동기화 중' : '동기화 완료'}
            </div>
            <div className="text-sm text-muted-foreground">상태</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {syncStatus.lastSyncTime ? formatTime(syncStatus.lastSyncTime) : '없음'}
            </div>
            <div className="text-sm text-muted-foreground">마지막 동기화</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {syncStatus.pendingChanges}
            </div>
            <div className="text-sm text-muted-foreground">대기 중인 변경사항</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {transactions.filter(tx => tx.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">실패한 거래</div>
          </div>
        </div>

        {syncStatus.syncError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">동기화 오류: {syncStatus.syncError}</p>
          </div>
        )}
      </Card>

      {/* 필터 및 통계 */}
      <Card className="p-4 glass-dark border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">필터:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-card/50 border border-border rounded-md text-sm"
          >
            <option value="all">전체 타입</option>
            <option value="mint">민팅</option>
            <option value="purchase">구매</option>
            <option value="sale">판매</option>
            <option value="bid">입찰</option>
            <option value="claim">클레임</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 bg-card/50 border border-border rounded-md text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="success">성공</option>
            <option value="failed">실패</option>
            <option value="pending">대기 중</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline">
              총 {transactions.length}개
            </Badge>
            <Button
              onClick={handleClearHistory}
              variant="outline"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              내역 삭제
            </Button>
          </div>
        </div>
      </Card>

      {/* 거래 내역 목록 */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 glass-dark border-white/10">
            <div className="text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">거래 내역이 없습니다.</p>
            </div>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="p-4 glass-dark border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              onClick={() => setSelectedTransaction(transaction)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                  <div>
                    <h4 className="font-semibold">{transaction.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(transaction.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusIcon(transaction.status)}
                    <span className="ml-1 capitalize">{transaction.status}</span>
                  </Badge>
                  
                  {transaction.amount && (
                    <Badge variant="outline">
                      {transaction.amount} SUI
                    </Badge>
                  )}
                  
                  {transaction.hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://suiexplorer.com/txblock/${transaction.hash}?network=testnet`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 거래 상세 모달 */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTransaction && getTypeIcon(selectedTransaction.type)}
              거래 상세 정보
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">타입</label>
                  <p className="font-semibold capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">상태</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="capitalize">{selectedTransaction.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">시간</label>
                  <p>{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">설명</label>
                <p className="font-semibold">{selectedTransaction.description}</p>
              </div>
              
              {selectedTransaction.amount && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">금액</label>
                  <p className="font-semibold text-primary">{selectedTransaction.amount} SUI</p>
                </div>
              )}
              
              {selectedTransaction.hash && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">트랜잭션 해시</label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm break-all">{selectedTransaction.hash}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://suiexplorer.com/txblock/${selectedTransaction.hash}?network=testnet`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedTransaction.metadata && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">메타데이터</label>
                  <pre className="bg-card/50 p-3 rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionHistory;
