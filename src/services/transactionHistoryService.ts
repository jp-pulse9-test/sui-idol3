import React from 'react';
import { toast } from 'sonner';

export interface TransactionRecord {
  id: string;
  type: 'mint' | 'purchase' | 'sale' | 'bid' | 'claim';
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  hash?: string;
  from?: string;
  to?: string;
  amount?: number;
  tokenId?: string;
  description: string;
  metadata?: any;
}

class TransactionHistoryService {
  private transactions: TransactionRecord[] = [];
  private listeners: Set<(transactions: TransactionRecord[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('transactionHistory');
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      this.transactions = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('transactionHistory', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Failed to save transaction history:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.transactions]));
  }

  addTransaction(transaction: Omit<TransactionRecord, 'id' | 'timestamp'>) {
    const newTransaction: TransactionRecord = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.transactions.unshift(newTransaction);
    
    // 최대 100개까지만 저장
    if (this.transactions.length > 100) {
      this.transactions = this.transactions.slice(0, 100);
    }

    this.saveToStorage();
    this.notifyListeners();

    // 성공한 트랜잭션에 대해 토스트 알림
    if (newTransaction.status === 'success') {
      toast.success(`✅ ${newTransaction.description}`);
    } else if (newTransaction.status === 'failed') {
      toast.error(`❌ ${newTransaction.description}`);
    }

    return newTransaction;
  }

  updateTransaction(id: string, updates: Partial<TransactionRecord>) {
    const index = this.transactions.findIndex(tx => tx.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  getTransactions() {
    return [...this.transactions];
  }

  getTransactionsByType(type: TransactionRecord['type']) {
    return this.transactions.filter(tx => tx.type === type);
  }

  getTransactionsByStatus(status: TransactionRecord['status']) {
    return this.transactions.filter(tx => tx.status === status);
  }

  getPendingTransactions() {
    return this.transactions.filter(tx => tx.status === 'pending');
  }

  subscribe(listener: (transactions: TransactionRecord[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clearHistory() {
    this.transactions = [];
    this.saveToStorage();
    this.notifyListeners();
    toast.info('거래 내역이 초기화되었습니다.');
  }

  // 트랜잭션 상태를 주기적으로 확인하는 메서드
  async checkTransactionStatus(hash: string): Promise<'success' | 'failed' | 'pending'> {
    try {
      // 실제 구현에서는 Sui RPC를 통해 트랜잭션 상태 확인
      // 여기서는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 90% 확률로 성공
      return Math.random() > 0.1 ? 'success' : 'failed';
    } catch (error) {
      console.error('Failed to check transaction status:', error);
      return 'failed';
    }
  }

  // 트랜잭션 상세 정보 가져오기
  getTransactionDetails(hash: string) {
    return {
      hash,
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: Math.floor(Math.random() * 1000000),
      gasPrice: '0.000001',
      timestamp: new Date().toISOString(),
      explorerUrl: `https://suiexplorer.com/txblock/${hash}?network=testnet`,
    };
  }
}

export const transactionHistoryService = new TransactionHistoryService();

// React Hook
export const useTransactionHistory = () => {
  const [transactions, setTransactions] = React.useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setTransactions(transactionHistoryService.getTransactions());
    
    const unsubscribe = transactionHistoryService.subscribe(setTransactions);
    return unsubscribe;
  }, []);

  const addTransaction = React.useCallback((transaction: Omit<TransactionRecord, 'id' | 'timestamp'>) => {
    return transactionHistoryService.addTransaction(transaction);
  }, []);

  const updateTransaction = React.useCallback((id: string, updates: Partial<TransactionRecord>) => {
    transactionHistoryService.updateTransaction(id, updates);
  }, []);

  const clearHistory = React.useCallback(() => {
    transactionHistoryService.clearHistory();
  }, []);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    clearHistory,
    getTransactionsByType: transactionHistoryService.getTransactionsByType.bind(transactionHistoryService),
    getTransactionsByStatus: transactionHistoryService.getTransactionsByStatus.bind(transactionHistoryService),
    getPendingTransactions: transactionHistoryService.getPendingTransactions.bind(transactionHistoryService),
  };
};
