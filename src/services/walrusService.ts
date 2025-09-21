import type { Transaction } from '@mysten/sui/transactions';

// WASM URL을 CDN에서 로드 (번들 의존성 최소화) - 여러 백업 URL 사용
const WALRUS_WASM_URLS = [
  'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
  'https://cdn.jsdelivr.net/npm/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
  undefined // 기본 로딩 시도
];

export class WalrusService {
  private suiClient: any;
  private walrusClient: any;
  private WalrusFile: any;
  private network: 'testnet' | 'mainnet';
  private initPromise: Promise<void> | null = null;
  private available = true;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
  }

  private async ensureInit() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // 여러 WASM URL 시도
      for (let i = 0; i < WALRUS_WASM_URLS.length; i++) {
        try {
          console.log(`Walrus 초기화 시도 ${i + 1}/${WALRUS_WASM_URLS.length}...`);
          
          // 동적 임포트로 런타임에만 로드 (초기 렌더 충돌 방지)
          const sui = await import('@mysten/sui/client');
          const walrus = await import('@mysten/walrus');

          const { getFullnodeUrl, SuiClient } = sui as any;
          const { WalrusClient, WalrusFile } = walrus as any;

          this.suiClient = new SuiClient({
            url: getFullnodeUrl(this.network),
            network: this.network,
          });

          this.walrusClient = new WalrusClient({
            network: this.network,
            suiClient: this.suiClient,
            wasmUrl: WALRUS_WASM_URLS[i],
            storageNodeClientOptions: {
              timeout: 60_000,
              onError: (error: any) => {
                console.error('Walrus storage node error:', error);
              },
            },
          });

          this.WalrusFile = WalrusFile;
          console.log('Walrus 초기화 성공!');
          return; // 성공하면 루프 종료
        } catch (e) {
          console.error(`Walrus 초기화 시도 ${i + 1} 실패:`, e);
          if (i === WALRUS_WASM_URLS.length - 1) {
            // 모든 시도가 실패한 경우
            console.error('모든 Walrus 초기화 시도 실패');
            this.available = false;
          }
        }
      }
    })();

    return this.initPromise;
  }

  private assertAvailable() {
    if (!this.available) {
      console.error('Walrus 서비스 상태:', {
        available: this.available,
        initPromise: !!this.initPromise,
        walrusClient: !!this.walrusClient,
        suiClient: !!this.suiClient
      });
      throw new Error('Walrus 기능이 현재 비활성화되어 있습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.');
    }
  }

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
    await this.ensureInit();
    this.assertAvailable();

    const { identifier, tags, epochs = 3, deletable = true, account, signTransaction } = options;

    if (!account) {
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

    // WalrusFile 객체 생성 (런타임 클래스 사용)
    const walrusFile = this.WalrusFile.from({
      contents: fileContent,
      identifier: identifier || `file_${Date.now()}`,
      tags: tags || {},
    });

    // 간단한 Signer 객체 구현 (Walrus SDK 호환)
    const signer = signTransaction
      ? { signTransaction, getAddress: () => account.address }
      : undefined;

    const results = await this.walrusClient.writeFiles({
      files: [walrusFile],
      epochs,
      deletable,
      signer,
    });

    return results[0];
  }

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
    await this.ensureInit();
    this.assertAvailable();

    const { epochs = 3, deletable = true, account, signTransaction } = options;

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

        return this.WalrusFile.from({
          contents: content,
          identifier: file.identifier || `file_${Date.now()}_${index}`,
          tags: file.tags || {},
        });
      })
    );

    const signer = signTransaction
      ? { signTransaction, getAddress: () => account.address }
      : undefined;

    return this.walrusClient.writeFiles({ files: walrusFiles, epochs, deletable, signer });
  }

  async downloadFile(blobId: string) {
    await this.ensureInit();
    this.assertAvailable();
    const file = await this.walrusClient.getFiles({ ids: [blobId] });
    return file[0];
  }

  async downloadFiles(blobIds: string[]) {
    await this.ensureInit();
    this.assertAvailable();
    return this.walrusClient.getFiles({ ids: blobIds });
  }

  async readBlob(blobId: string) {
    await this.ensureInit();
    this.assertAvailable();
    return this.walrusClient.readBlob({ blobId });
  }

  async uploadBlob(
    blob: Uint8Array,
    options: {
      epochs?: number;
      deletable?: boolean;
      account?: any;
      signTransaction?: (transaction: Transaction) => Promise<any>;
    }
  ) {
    await this.ensureInit();
    this.assertAvailable();

    const { account, signTransaction } = options;

    const walrusFile = this.WalrusFile.from({
      contents: blob,
      identifier: `blob_${Date.now()}`,
      tags: {},
    });

    const signer = signTransaction
      ? { signTransaction, getAddress: () => account.address }
      : undefined;

    const results = await this.walrusClient.writeFiles({
      files: [walrusFile],
      epochs: options.epochs ?? 3,
      deletable: options.deletable ?? true,
      signer,
    });

    return results[0];
  }

  createUploadFlow(files: any[]) {
    // 플로우 API가 필요할 때만 초기화 시도
    return {
      async init() {
        await this.ensureInit();
        this.assertAvailable();
        return this.walrusClient.writeFilesFlow({ files });
      },
    };
  }

  reset() {
    console.log('Walrus 서비스 리셋 중...');
    try {
      this.walrusClient?.reset?.();
    } catch (e) {
      console.error('Walrus 클라이언트 리셋 오류:', e);
    }
    this.initPromise = null;
    this.available = true;
    this.walrusClient = null;
    this.suiClient = null;
    this.WalrusFile = null;
    console.log('Walrus 서비스 리셋 완료');
  }

  // 강제 재초기화 메서드 추가
  async forceReinit() {
    console.log('Walrus 강제 재초기화 시작...');
    this.reset();
    await this.ensureInit();
    return this.available;
  }

  getSuiClient() {
    return this.suiClient;
  }

  getWalrusClient() {
    return this.walrusClient;
  }
}

export const walrusService = new WalrusService('testnet');