import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import { Transaction } from '@mysten/sui/transactions';

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
      account?: any;
      signTransaction?: (transaction: Transaction) => Promise<any>;
    }
  ) {
    const { identifier, tags, epochs = 3, deletable = true, account, signTransaction } = options;

    if (!account || !signTransaction) {
      throw new Error('지갑 연결이 필요합니다');
    }

    // string을 Uint8Array로 변환
    let fileContent: Uint8Array;
    if (typeof content === 'string') {
      fileContent = new TextEncoder().encode(content);
    } else if (content instanceof Blob) {
      fileContent = new Uint8Array(await content.arrayBuffer());
    } else {
      fileContent = content;
    }

    try {
      console.log('Walrus 파일 업로드 시작:', {
        identifier,
        account: account?.address,
        epochs,
        deletable,
        contentSize: fileContent.length
      });

      // WalrusFile 객체 생성
      const walrusFile = WalrusFile.from({
        contents: fileContent,
        identifier: identifier || `file_${Date.now()}`,
        tags: tags || {},
      });

      // 간단한 Signer 객체 구현 (Walrus SDK 호환)
      const signer = {
        signTransaction,
        getAddress: () => account.address,
      } as any;

      // Walrus에 파일 업로드
      const results = await this.walrusClient.writeFiles({
        files: [walrusFile],
        epochs,
        deletable,
        signer,
      });

      console.log('Walrus 업로드 성공:', results[0]);
      return results[0];
    } catch (error) {
      console.error('Walrus 파일 업로드 실패:', error);
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
      account?: any;
      signTransaction?: (transaction: Transaction) => Promise<any>;
    }
  ) {
    const { epochs = 3, deletable = true, account, signTransaction } = options;

    if (!account || !signTransaction) {
      throw new Error('지갑 연결이 필요합니다');
    }

    try {
      console.log('Walrus 다중 파일 업로드 시작:', {
        count: files.length,
        account: account?.address,
        epochs,
        deletable
      });

      // WalrusFile 객체들 생성
      const walrusFiles = await Promise.all(
        files.map(async (file, index) => {
          let content: Uint8Array;
          if (typeof file.content === 'string') {
            content = new TextEncoder().encode(file.content);
          } else if (file.content instanceof Blob) {
            content = new Uint8Array(await file.content.arrayBuffer());
          } else {
            content = file.content;
          }

          return WalrusFile.from({
            contents: content,
            identifier: file.identifier || `file_${Date.now()}_${index}`,
            tags: file.tags || {},
          });
        })
      );

      // 간단한 Signer 객체 구현 (Walrus SDK 호환)
      const signer = {
        signTransaction,
        getAddress: () => account.address,
      } as any;

      // Walrus에 파일들 업로드
      const results = await this.walrusClient.writeFiles({
        files: walrusFiles,
        epochs,
        deletable,
        signer,
      });

      console.log('Walrus 다중 업로드 성공:', results);
      return results;
    } catch (error) {
      console.error('Walrus 파일들 업로드 실패:', error);
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
      account?: any;
      signTransaction?: (transaction: Transaction) => Promise<any>;
    }
  ) {
    const { epochs = 3, deletable = true, account, signTransaction } = options;

    if (!account || !signTransaction) {
      throw new Error('지갑 연결이 필요합니다');
    }

    try {
      console.log('Walrus Blob 업로드 시작:', {
        size: blob.length,
        account: account?.address,
        epochs,
        deletable
      });

      // WalrusFile 객체 생성
      const walrusFile = WalrusFile.from({
        contents: blob,
        identifier: `blob_${Date.now()}`,
        tags: {},
      });

      // 간단한 Signer 객체 구현 (Walrus SDK 호환)
      const signer = {
        signTransaction,
        getAddress: () => account.address,
      } as any;

      // Walrus에 Blob 업로드
      const results = await this.walrusClient.writeFiles({
        files: [walrusFile],
        epochs,
        deletable,
        signer,
      });

      console.log('Walrus Blob 업로드 성공:', results[0]);
      return results[0];
    } catch (error) {
      console.error('Walrus Blob 업로드 실패:', error);
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