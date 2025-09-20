import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import type { Signer } from '@mysten/sui/transactions';
import type { SuiAccount } from '@mysten/dapp-kit';

// WASM URL을 CDN에서 로드
const WALRUS_WASM_URL = 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm';

export class WalrusService {
  private suiClient: SuiClient;
  private walrusClient: WalrusClient;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(network),
      network,
    });

    this.walrusClient = new WalrusClient({
      network,
      suiClient: this.suiClient,
      wasmUrl: WALRUS_WASM_URL,
      storageNodeClientOptions: {
        timeout: 60_000,
        onError: (error) => {
          console.error('Walrus storage node error:', error);
        },
      },
    });
  }

  /**
   * 파일을 Walrus에 업로드합니다
   */
  async uploadFile(
    content: Uint8Array | Blob | string,
    options: {
      identifier?: string;
      tags?: Record<string, string>;
      epochs?: number;
      deletable?: boolean;
      account: SuiAccount;
    }
  ) {
    const { identifier, tags, epochs = 3, deletable = true, account } = options;

    // string을 Uint8Array로 변환
    let fileContent: Uint8Array | Blob;
    if (typeof content === 'string') {
      fileContent = new TextEncoder().encode(content);
    } else {
      fileContent = content;
    }

    const file = WalrusFile.from({
      contents: fileContent,
      identifier,
      tags,
    });

    try {
      // Walrus SDK가 실제로 signer를 어떻게 사용하는지 확인
      // 일단 기본적인 signer 구조만 제공
      const signer = {
        toSuiAddress: () => account.address,
        signTransactionBlock: async (transactionBlock: any) => {
          console.log('Walrus SDK가 트랜잭션 서명을 요청했습니다:', transactionBlock);
          // 실제 구현에서는 지갑과 연동해야 하지만, 
          // 일단 기본 구조만 제공하여 오류를 방지
          throw new Error('지갑 서명이 필요합니다. 현재는 데모 모드입니다.');
        }
      } as Signer;

      const results = await this.walrusClient.writeFiles({
        files: [file],
        epochs,
        deletable,
        signer,
      });

      return results[0];
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 여러 파일을 Walrus에 업로드합니다
   */
  async uploadFiles(
    files: Array<{
      content: Uint8Array | Blob | string;
      identifier?: string;
      tags?: Record<string, string>;
    }>,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: SuiAccount;
    }
  ) {
    const { epochs = 3, deletable = true, account } = options;

    const walrusFiles = files.map(file => {
      // string을 Uint8Array로 변환
      let content: Uint8Array | Blob;
      if (typeof file.content === 'string') {
        content = new TextEncoder().encode(file.content);
      } else {
        content = file.content;
      }
      
      return WalrusFile.from({
        contents: content,
        identifier: file.identifier,
        tags: file.tags,
      });
    });

    try {
      // Walrus SDK가 실제로 signer를 어떻게 사용하는지 확인
      // 일단 기본적인 signer 구조만 제공
      const signer = {
        toSuiAddress: () => account.address,
        signTransactionBlock: async (transactionBlock: any) => {
          console.log('Walrus SDK가 트랜잭션 서명을 요청했습니다:', transactionBlock);
          // 실제 구현에서는 지갑과 연동해야 하지만, 
          // 일단 기본 구조만 제공하여 오류를 방지
          throw new Error('지갑 서명이 필요합니다. 현재는 데모 모드입니다.');
        }
      } as Signer;

      const results = await this.walrusClient.writeFiles({
        files: walrusFiles,
        epochs,
        deletable,
        signer,
      });

      return results;
    } catch (error) {
      console.error('파일들 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 파일을 Walrus에서 다운로드합니다
   */
  async downloadFile(blobId: string) {
    try {
      const file = await this.walrusClient.getFiles({ ids: [blobId] });
      return file[0];
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      throw error;
    }
  }

  /**
   * 여러 파일을 Walrus에서 다운로드합니다
   */
  async downloadFiles(blobIds: string[]) {
    try {
      const files = await this.walrusClient.getFiles({ ids: blobIds });
      return files;
    } catch (error) {
      console.error('파일들 다운로드 실패:', error);
      throw error;
    }
  }

  /**
   * Blob을 직접 읽습니다
   */
  async readBlob(blobId: string) {
    try {
      const blob = await this.walrusClient.readBlob({ blobId });
      return blob;
    } catch (error) {
      console.error('Blob 읽기 실패:', error);
      throw error;
    }
  }

  /**
   * Blob을 직접 업로드합니다
   */
  async uploadBlob(
    blob: Uint8Array,
    options: {
      epochs?: number;
      deletable?: boolean;
      signer: Signer;
    }
  ) {
    const { epochs = 3, deletable = true, signer } = options;

    try {
      const result = await this.walrusClient.writeBlob({
        blob,
        epochs,
        deletable,
        signer,
      });

      return result;
    } catch (error) {
      console.error('Blob 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 브라우저 환경에서 파일 업로드 플로우를 시작합니다
   */
  createUploadFlow(files: WalrusFile[]) {
    return this.walrusClient.writeFilesFlow({ files });
  }

  /**
   * 클라이언트를 리셋합니다 (에러 복구용)
   */
  reset() {
    this.walrusClient.reset();
  }

  /**
   * Sui 클라이언트 인스턴스를 반환합니다
   */
  getSuiClient() {
    return this.suiClient;
  }

  /**
   * Walrus 클라이언트 인스턴스를 반환합니다
   */
  getWalrusClient() {
    return this.walrusClient;
  }
}

// 싱글톤 인스턴스
export const walrusService = new WalrusService('testnet');
