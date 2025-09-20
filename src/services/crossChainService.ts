import { toast } from "sonner";
import { SupportedChain, CrossChainMintingData, CrossChainTransaction } from "../types/crosschain";

class CrossChainService {
  private transactions: Map<string, CrossChainTransaction> = new Map();

  async mintToChain(mintingData: CrossChainMintingData): Promise<string> {
    try {
      toast.info(`${mintingData.targetChain.icon} ${mintingData.targetChain.name}으로 민팅을 시작합니다...`);

      // 시뮬레이션을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 트랜잭션 ID 생성
      const txId = this.generateTransactionId();
      const txHash = this.generateMockTxHash();

      // 트랜잭션 기록
      const transaction: CrossChainTransaction = {
        id: txId,
        photocardId: mintingData.photocardId,
        sourceChain: 'sui',
        targetChain: mintingData.targetChain.id,
        txHash,
        status: 'pending',
        timestamp: Date.now()
      };

      this.transactions.set(txId, transaction);

      // 민팅 성공 시뮬레이션
      setTimeout(() => {
        const tx = this.transactions.get(txId);
        if (tx) {
          tx.status = 'confirmed';
          this.transactions.set(txId, tx);
          
          // 크로스체인 민팅된 포토카드 정보를 로컬 스토리지에 저장
          this.saveCrossChainPhotocard(mintingData, txHash);
          
          toast.success(`✅ ${mintingData.targetChain.name}에서 민팅이 완료되었습니다!`);
        }
      }, 3000);

      toast.success(`🚀 크로스체인 민팅이 시작되었습니다! TX: ${txHash.substring(0, 10)}...`);
      return txHash;

    } catch (error) {
      console.error('Cross-chain minting failed:', error);
      toast.error('크로스체인 민팅에 실패했습니다.');
      throw error;
    }
  }

  async getTransactionStatus(txId: string): Promise<CrossChainTransaction | null> {
    return this.transactions.get(txId) || null;
  }

  async getAllTransactions(): Promise<CrossChainTransaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  private generateTransactionId(): string {
    return `cross_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateMockTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  async estimateGasFee(targetChain: SupportedChain): Promise<{ fee: string; currency: string }> {
    // 가스비 추정 시뮬레이션
    const baseFees = {
      ethereum: { min: 0.005, max: 0.02 },
      polygon: { min: 0.001, max: 0.005 },
      bsc: { min: 0.002, max: 0.008 },
      base: { min: 0.001, max: 0.004 }
    };

    const feeRange = baseFees[targetChain.id as keyof typeof baseFees] || { min: 0.001, max: 0.01 };
    const estimatedFee = (Math.random() * (feeRange.max - feeRange.min) + feeRange.min).toFixed(4);

    return {
      fee: estimatedFee,
      currency: targetChain.symbol
    };
  }

  private saveCrossChainPhotocard(mintingData: CrossChainMintingData, txHash: string) {
    try {
      const existingCards = JSON.parse(localStorage.getItem('crossChainPhotocards') || '[]');
      const newCard = {
        photocardId: mintingData.photocardId,
        targetChain: mintingData.targetChain.name,
        chainIcon: mintingData.targetChain.icon,
        txHash,
        mintedAt: new Date().toISOString(),
        idolName: mintingData.idolName,
        imageUrl: mintingData.imageUrl
      };
      
      existingCards.push(newCard);
      localStorage.setItem('crossChainPhotocards', JSON.stringify(existingCards));
      console.log('✅ Cross-chain photocard saved to localStorage:', newCard);
    } catch (error) {
      console.error('Failed to save cross-chain photocard:', error);
    }
  }

  getCrossChainPhotocards(): any[] {
    try {
      return JSON.parse(localStorage.getItem('crossChainPhotocards') || '[]');
    } catch (error) {
      console.error('Failed to get cross-chain photocards:', error);
      return [];
    }
  }

  isCrossChainPhotocard(photocardId: string): any | null {
    const crossChainCards = this.getCrossChainPhotocards();
    return crossChainCards.find(card => card.photocardId === photocardId) || null;
  }
}

export const crossChainService = new CrossChainService();