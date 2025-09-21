import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import { SIGNATURE_SCHEME_TO_FLAG } from '@mysten/sui/cryptography';

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
      account: any;
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
      // 데모 모드: 실제 업로드 대신 시뮬레이션
      console.log('데모 모드: Walrus 업로드 시뮬레이션', {
        identifier,
        account: account?.address,
        epochs,
        deletable
      });

      // 시뮬레이션된 결과 반환
      const simulatedResult = {
        blobId: `demo_blob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        suiRef: {
          objectId: `demo_object_${Date.now()}`,
          version: '1',
          digest: `demo_digest_${Date.now()}`
        },
        info: {
          id: `demo_id_${Date.now()}`,
          storedEpoch: 1,
          blobHash: `demo_hash_${Date.now()}`,
          size: fileContent instanceof Blob ? fileContent.size : fileContent.length,
          encoding: 'raw',
          certified: true
        }
      };

      return simulatedResult;
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
      account: any;
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
      // 데모 모드: 실제 업로드 대신 시뮬레이션
      console.log('데모 모드: Walrus 다중 파일 업로드 시뮬레이션', {
        count: files.length,
        account: account?.address,
        epochs,
        deletable
      });

      // 시뮬레이션된 결과 반환
      const results = files.map((_, index) => ({
        blobId: `demo_blob_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        suiRef: {
          objectId: `demo_object_${Date.now()}_${index}`,
          version: '1',
          digest: `demo_digest_${Date.now()}_${index}`
        },
        info: {
          id: `demo_id_${Date.now()}_${index}`,
          storedEpoch: 1,
          blobHash: `demo_hash_${Date.now()}_${index}`,
          size: 1024,
          encoding: 'raw',
          certified: true
        }
      }));

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
      account: any;
    }
  ) {
    const { epochs = 3, deletable = true, account } = options;

    try {
      // 데모 모드: 실제 업로드 대신 시뮬레이션
      console.log('데모 모드: Walrus Blob 업로드 시뮬레이션', {
        size: blob.length,
        account: account?.address,
        epochs,
        deletable
      });

      // 시뮬레이션된 결과 반환
      const result = {
        blobId: `demo_blob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        suiRef: {
          objectId: `demo_object_${Date.now()}`,
          version: '1',
          digest: `demo_digest_${Date.now()}`
        },
        info: {
          id: `demo_id_${Date.now()}`,
          storedEpoch: 1,
          blobHash: `demo_hash_${Date.now()}`,
          size: blob.length,
          encoding: 'raw',
          certified: true
        }
      };

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
