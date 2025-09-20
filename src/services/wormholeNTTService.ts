import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'sonner';

// Wormhole NTT 관련 상수
const WORMHOLE_NTT_PACKAGE_ID = '0x...'; // 실제 NTT 패키지 ID로 교체
const NTT_MANAGER_ID = '0x...'; // 실제 NTT 매니저 ID로 교체

export interface NTTTransferParams {
  tokenId: string;
  destinationChain: number;
  recipientAddress: string;
  amount?: number; // 포토카드의 경우 1
}

export interface NTTTransferResult {
  success: boolean;
  transactionDigest?: string;
  sequenceNumber?: string;
  error?: string;
}

class WormholeNTTService {
  private client: SuiClient;

  constructor() {
    this.client = new SuiClient({ url: getFullnodeUrl('testnet') });
  }

  /**
   * 포토카드 NFT를 다른 체인으로 전송
   */
  async transferPhotoCard(params: NTTTransferParams): Promise<NTTTransferResult> {
    try {
      const txb = new Transaction();

      // NTT transfer 함수 호출
      txb.moveCall({
        target: `${WORMHOLE_NTT_PACKAGE_ID}::ntt::transfer`,
        arguments: [
          txb.object(NTT_MANAGER_ID),
          txb.object(params.tokenId), // 포토카드 NFT ID
          txb.pure.u16(params.destinationChain), // 목적지 체인 ID
          txb.pure.vector('u8', this.encodeAddress(params.recipientAddress)), // 수신자 주소
          txb.pure.u64(1), // 포토카드는 항상 1개
        ],
      });

      // 트랜잭션 실행
      const result = await this.client.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        signer: this.getSigner(), // 실제 서명자 설정 필요
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      if (result.effects?.status?.status === 'success') {
        // 시퀀스 번호 추출 (Wormhole VAA 생성에 필요)
        const sequenceNumber = this.extractSequenceNumber(result);
        
        toast.success('포토카드가 성공적으로 다른 체인으로 전송되었습니다!');
        
        return {
          success: true,
          transactionDigest: result.digest,
          sequenceNumber,
        };
      } else {
        throw new Error('트랜잭션 실행 실패');
      }
    } catch (error) {
      console.error('NTT 전송 실패:', error);
      toast.error('포토카드 전송에 실패했습니다.');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 다른 체인에서 포토카드 NFT 수신
   */
  async receivePhotoCard(vaa: string): Promise<NTTTransferResult> {
    try {
      const txb = new Transaction();

      // VAA를 사용하여 토큰 수신
      txb.moveCall({
        target: `${WORMHOLE_NTT_PACKAGE_ID}::ntt::receive`,
        arguments: [
          txb.object(NTT_MANAGER_ID),
          txb.pure.vector('u8', this.hexToBytes(vaa)), // VAA 데이터
        ],
      });

      const result = await this.client.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        signer: this.getSigner(),
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      if (result.effects?.status?.status === 'success') {
        toast.success('다른 체인에서 포토카드를 성공적으로 수신했습니다!');
        
        return {
          success: true,
          transactionDigest: result.digest,
        };
      } else {
        throw new Error('토큰 수신 실패');
      }
    } catch (error) {
      console.error('NTT 수신 실패:', error);
      toast.error('포토카드 수신에 실패했습니다.');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 지원되는 체인 목록 조회
   */
  getSupportedChains() {
    return [
      { id: 1, name: 'Ethereum', symbol: 'ETH' },
      { id: 2, name: 'Solana', symbol: 'SOL' },
      { id: 3, name: 'Polygon', symbol: 'MATIC' },
      { id: 4, name: 'BSC', symbol: 'BNB' },
      { id: 5, name: 'Avalanche', symbol: 'AVAX' },
      { id: 6, name: 'Fantom', symbol: 'FTM' },
      { id: 7, name: 'Arbitrum', symbol: 'ARB' },
      { id: 8, name: 'Optimism', symbol: 'OP' },
      { id: 9, name: 'Base', symbol: 'BASE' },
      { id: 10, name: 'Sui', symbol: 'SUI' },
    ];
  }

  /**
   * 체인 ID로 체인 정보 조회
   */
  getChainInfo(chainId: number) {
    return this.getSupportedChains().find(chain => chain.id === chainId);
  }

  /**
   * 주소를 Wormhole 형식으로 인코딩
   */
  private encodeAddress(address: string): number[] {
    // 실제 구현에서는 체인별 주소 인코딩 로직 필요
    return Array.from(Buffer.from(address, 'hex'));
  }

  /**
   * 16진수 문자열을 바이트 배열로 변환
   */
  private hexToBytes(hex: string): number[] {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  /**
   * 트랜잭션 결과에서 시퀀스 번호 추출
   */
  private extractSequenceNumber(result: any): string {
    // 실제 구현에서는 이벤트 로그에서 시퀀스 번호 추출
    return '0'; // 임시값
  }

  /**
   * 서명자 가져오기 (실제 구현 필요)
   */
  private getSigner() {
    // 실제 구현에서는 연결된 지갑의 서명자 반환
    throw new Error('서명자 설정이 필요합니다');
  }

  /**
   * VAA 상태 확인
   */
  async checkVAAStatus(sequenceNumber: string, chainId: number): Promise<{
    isReady: boolean;
    vaa?: string;
  }> {
    try {
      // Wormhole API를 통해 VAA 상태 확인
      const response = await fetch(
        `https://api.wormholescan.io/api/v1/vaa/${chainId}/${sequenceNumber}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          isReady: true,
          vaa: data.vaa,
        };
      } else {
        return { isReady: false };
      }
    } catch (error) {
      console.error('VAA 상태 확인 실패:', error);
      return { isReady: false };
    }
  }
}

export const wormholeNTTService = new WormholeNTTService();
