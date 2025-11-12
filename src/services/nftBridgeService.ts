/**
 * NFT Bridge Service
 *
 * Bridge existing Sui NFTs to other chains using Wormhole
 */

import { toast } from 'sonner';
import { Transaction } from '@mysten/sui/transactions';
import { evmProofService, EVMProofData } from './evmProofService';
import { SupportedChain } from '../types/crosschain';

interface BridgeNFTData {
  nftObjectId: string;
  photocardId: string;
  idolName: string;
  imageUrl: string;
  rarity: string;
  concept: string;
  serialNo: number;
  targetChain: SupportedChain;
}

interface BridgeResult {
  success: boolean;
  suiTxHash?: string;
  evmTxHash?: string;
  bridgedAddress?: string;
  error?: string;
}

class NFTBridgeService {
  /**
   * Bridge an existing Sui NFT to an EVM chain
   */
  async bridgeToChain(
    bridgeData: BridgeNFTData,
    recipientAddress: string,
    signAndExecuteTransaction: any
  ): Promise<BridgeResult> {
    try {
      toast.info(`🌉 ${bridgeData.targetChain.name}으로 NFT 브릿지를 시작합니다...`);

      // Step 1: Lock/Escrow the NFT on Sui
      const lockResult = await this.lockNFTOnSui(bridgeData, signAndExecuteTransaction);

      if (!lockResult.success) {
        return {
          success: false,
          error: 'Failed to lock NFT on Sui'
        };
      }

      toast.success(`✅ Sui에서 NFT가 락되었습니다! TX: ${lockResult.txHash?.slice(0, 12)}...`);

      // Step 2: Create cross-chain proof
      const proofData: EVMProofData = {
        blobId: bridgeData.nftObjectId,
        storedEpoch: Date.now(),
        certifiedEpoch: Date.now() + 1000,
        fileSize: JSON.stringify(bridgeData).length,
        encodedSlivers: 1,
        sourceChain: 'sui',
        sourceTxHash: lockResult.txHash || '',
        vaaSignature: new Uint8Array(64), // Mock Wormhole signature
      };

      // Step 3: Store proof on target chain
      const proofChainId = this.getProofChainId(bridgeData.targetChain.id);

      if (!proofChainId) {
        toast.error('지원하지 않는 체인입니다.');
        return {
          success: false,
          error: 'Unsupported target chain'
        };
      }

      toast.info('💾 대상 체인에 증명을 저장하는 중...');

      const proofResult = await evmProofService.storeProof(proofChainId, proofData);

      if (!proofResult) {
        return {
          success: false,
          error: 'Failed to store proof on target chain'
        };
      }

      toast.success(`✅ ${bridgeData.targetChain.name}에 증명이 저장되었습니다!`);

      // Step 4: Mint NFT on target chain (in production, this would be done by a relayer)
      // For now, we just save the bridge info
      this.saveBridgeInfo(bridgeData, {
        suiTxHash: lockResult.txHash || '',
        evmTxHash: proofResult.txHash,
        bridgedAddress: recipientAddress,
        bridgedAt: new Date().toISOString(),
      });

      toast.success(`🎉 NFT가 성공적으로 브릿지되었습니다!`);

      return {
        success: true,
        suiTxHash: lockResult.txHash,
        evmTxHash: proofResult.txHash,
        bridgedAddress: recipientAddress
      };

    } catch (error) {
      console.error('NFT bridge failed:', error);
      toast.error('NFT 브릿지에 실패했습니다.');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Lock NFT on Sui blockchain (escrow or burn)
   */
  private async lockNFTOnSui(
    bridgeData: BridgeNFTData,
    signAndExecuteTransaction: any
  ): Promise<{ success: boolean; txHash?: string }> {
    try {
      // In production, this would call a Move module that:
      // 1. Transfers NFT to escrow account, or
      // 2. Burns the NFT and emits an event

      // For now, we simulate this
      console.log('🔒 Locking NFT on Sui:', bridgeData.nftObjectId);

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTxHash = '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      return {
        success: true,
        txHash: mockTxHash
      };

    } catch (error) {
      console.error('Failed to lock NFT on Sui:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Get proof chain ID for bridge target
   */
  private getProofChainId(targetChainId: string): string | null {
    const evmChains = ['ethereum', 'polygon', 'bsc', 'base', 'arbitrum', 'optimism'];
    if (evmChains.includes(targetChainId)) {
      return 'sepolia'; // Use Sepolia for all EVM chains in testnet
    }
    return null;
  }

  /**
   * Save bridge information to localStorage
   */
  private saveBridgeInfo(bridgeData: BridgeNFTData, bridgeResult: any) {
    try {
      const bridgedNFTs = JSON.parse(localStorage.getItem('bridgedNFTs') || '[]');

      const newBridge = {
        nftObjectId: bridgeData.nftObjectId,
        photocardId: bridgeData.photocardId,
        idolName: bridgeData.idolName,
        imageUrl: bridgeData.imageUrl,
        rarity: bridgeData.rarity,
        concept: bridgeData.concept,
        serialNo: bridgeData.serialNo,
        sourceChain: 'sui',
        targetChain: bridgeData.targetChain.name,
        chainIcon: bridgeData.targetChain.icon,
        suiTxHash: bridgeResult.suiTxHash,
        evmTxHash: bridgeResult.evmTxHash,
        bridgedAddress: bridgeResult.bridgedAddress,
        bridgedAt: bridgeResult.bridgedAt,
        status: 'completed'
      };

      bridgedNFTs.push(newBridge);
      localStorage.setItem('bridgedNFTs', JSON.stringify(bridgedNFTs));

      console.log('✅ Bridge info saved:', newBridge);
    } catch (error) {
      console.error('Failed to save bridge info:', error);
    }
  }

  /**
   * Get all bridged NFTs
   */
  getBridgedNFTs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('bridgedNFTs') || '[]');
    } catch (error) {
      console.error('Failed to get bridged NFTs:', error);
      return [];
    }
  }

  /**
   * Check if NFT is bridged
   */
  isBridged(nftObjectId: string): any | null {
    const bridgedNFTs = this.getBridgedNFTs();
    return bridgedNFTs.find(nft => nft.nftObjectId === nftObjectId) || null;
  }
}

export const nftBridgeService = new NFTBridgeService();
