import React from 'react';
import { toast } from 'sonner';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  pendingChanges: number;
}

export interface PhotoCardData {
  id: string;
  idolId: string;
  idolName: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  mintedAt: string;
  owner: string;
  isPublic: boolean;
  imageUrl: string;
  floorPrice?: number;
  lastSalePrice?: number;
  heartsReceived?: number;
  blockchainId?: string; // 실제 블록체인 NFT ID
  isSynced?: boolean; // 블록체인과 동기화 여부
}

class DataSyncService {
  private syncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    pendingChanges: 0,
  };
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadSyncStatus();
    this.startAutoSync();
  }

  private loadSyncStatus() {
    try {
      const stored = localStorage.getItem('syncStatus');
      if (stored) {
        this.syncStatus = { ...this.syncStatus, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }

  private saveSyncStatus() {
    try {
      localStorage.setItem('syncStatus', JSON.stringify(this.syncStatus));
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.syncStatus }));
  }

  private startAutoSync() {
    // 5분마다 자동 동기화
    this.syncInterval = setInterval(() => {
      if (this.syncStatus.pendingChanges > 0 && !this.syncStatus.isSyncing) {
        this.syncData();
      }
    }, 5 * 60 * 1000);
  }

  private stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncData(): Promise<boolean> {
    if (this.syncStatus.isSyncing) {
      return false;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.syncError = null;
    this.notifyListeners();

    try {
      // 로컬 데이터 가져오기
      const localPhotoCards = this.getLocalPhotoCards();
      const unsyncedCards = localPhotoCards.filter(card => !card.isSynced);

      if (unsyncedCards.length === 0) {
        this.syncStatus.isSyncing = false;
        this.syncStatus.lastSyncTime = new Date().toISOString();
        this.syncStatus.pendingChanges = 0;
        this.saveSyncStatus();
        this.notifyListeners();
        return true;
      }

      // 블록체인과 동기화 시뮬레이션
      for (const card of unsyncedCards) {
        await this.syncPhotoCard(card);
      }

      this.syncStatus.isSyncing = false;
      this.syncStatus.lastSyncTime = new Date().toISOString();
      this.syncStatus.pendingChanges = 0;
      this.syncStatus.syncError = null;
      
      this.saveSyncStatus();
      this.notifyListeners();
      
      toast.success(`✅ ${unsyncedCards.length}개 포토카드가 동기화되었습니다.`);
      return true;

    } catch (error) {
      this.syncStatus.isSyncing = false;
      this.syncStatus.syncError = error instanceof Error ? error.message : '동기화 실패';
      this.saveSyncStatus();
      this.notifyListeners();
      
      toast.error(`❌ 동기화 실패: ${this.syncStatus.syncError}`);
      return false;
    }
  }

  private async syncPhotoCard(card: PhotoCardData): Promise<void> {
    // 실제 구현에서는 블록체인 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 시뮬레이션: 90% 확률로 성공
    if (Math.random() > 0.1) {
      card.isSynced = true;
      card.blockchainId = `0x${Math.random().toString(16).substr(2, 40)}`;
      this.updateLocalPhotoCard(card);
    } else {
      throw new Error('블록체인 동기화 실패');
    }
  }

  private getLocalPhotoCards(): PhotoCardData[] {
    try {
      const stored = localStorage.getItem('photoCards');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get local photo cards:', error);
      return [];
    }
  }

  private updateLocalPhotoCard(card: PhotoCardData) {
    try {
      const cards = this.getLocalPhotoCards();
      const index = cards.findIndex(c => c.id === card.id);
      if (index !== -1) {
        cards[index] = card;
        localStorage.setItem('photoCards', JSON.stringify(cards));
      }
    } catch (error) {
      console.error('Failed to update local photo card:', error);
    }
  }

  markAsPending() {
    this.syncStatus.pendingChanges++;
    this.saveSyncStatus();
    this.notifyListeners();
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 백업 생성
  async createBackup(): Promise<string> {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        photoCards: this.getLocalPhotoCards(),
        syncStatus: this.syncStatus,
        version: '1.0.0',
      };

      const backupData = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 다운로드 링크 생성
      const a = document.createElement('a');
      a.href = url;
      a.download = `sui-idol-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('백업 파일이 다운로드되었습니다.');
      return backupData;
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast.error('백업 생성에 실패했습니다.');
      throw error;
    }
  }

  // 백업 복원
  async restoreBackup(backupData: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.photoCards || !Array.isArray(backup.photoCards)) {
        throw new Error('잘못된 백업 파일 형식입니다.');
      }

      // 기존 데이터 백업
      const currentBackup = JSON.stringify({
        timestamp: new Date().toISOString(),
        photoCards: this.getLocalPhotoCards(),
        syncStatus: this.syncStatus,
      });

      try {
        // 새 데이터로 복원
        localStorage.setItem('photoCards', JSON.stringify(backup.photoCards));
        if (backup.syncStatus) {
          localStorage.setItem('syncStatus', JSON.stringify(backup.syncStatus));
        }

        toast.success('백업이 성공적으로 복원되었습니다.');
        return true;
      } catch (error) {
        // 복원 실패 시 원래 데이터로 되돌리기
        const originalData = JSON.parse(currentBackup);
        localStorage.setItem('photoCards', JSON.stringify(originalData.photoCards));
        localStorage.setItem('syncStatus', JSON.stringify(originalData.syncStatus));
        throw error;
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      toast.error('백업 복원에 실패했습니다.');
      return false;
    }
  }

  // 데이터 초기화
  clearAllData() {
    try {
      localStorage.removeItem('photoCards');
      localStorage.removeItem('syncStatus');
      localStorage.removeItem('transactionHistory');
      
      this.syncStatus = {
        isSyncing: false,
        lastSyncTime: null,
        syncError: null,
        pendingChanges: 0,
      };
      
      this.saveSyncStatus();
      this.notifyListeners();
      
      toast.success('모든 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast.error('데이터 초기화에 실패했습니다.');
    }
  }

  destroy() {
    this.stopAutoSync();
    this.listeners.clear();
  }
}

export const dataSyncService = new DataSyncService();

// React Hook
export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(dataSyncService.getSyncStatus());

  React.useEffect(() => {
    const unsubscribe = dataSyncService.subscribe(setSyncStatus);
    return unsubscribe;
  }, []);

  const syncData = React.useCallback(() => {
    return dataSyncService.syncData();
  }, []);

  const markAsPending = React.useCallback(() => {
    dataSyncService.markAsPending();
  }, []);

  const createBackup = React.useCallback(() => {
    return dataSyncService.createBackup();
  }, []);

  const restoreBackup = React.useCallback((backupData: string) => {
    return dataSyncService.restoreBackup(backupData);
  }, []);

  const clearAllData = React.useCallback(() => {
    dataSyncService.clearAllData();
  }, []);

  return {
    syncStatus,
    syncData,
    markAsPending,
    createBackup,
    restoreBackup,
    clearAllData,
  };
};
