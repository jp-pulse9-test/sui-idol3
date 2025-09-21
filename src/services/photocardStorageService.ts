import { walrusService } from './walrusService';

export interface PhotocardMetadata {
  id: string;
  idolId: number;
  idolName: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  mintedAt: string;
  owner: string;
  imageUrl: string;
  personaPrompt?: string;
  seed?: string;
  prompt?: string;
  weather?: string;
  mood?: string;
  theme?: string;
  style?: string;
  isAdvanced?: boolean;
  crossChainInfo?: {
    targetChain: string;
    chainIcon: string;
    txHash: string;
    mintedAt: string;
  };
}

export interface PhotocardStorageResult {
  blobId: string;
  metadata: PhotocardMetadata;
  storageUrl: string;
}

export class PhotocardStorageService {
  private static readonly LOCAL_STORAGE_KEY = 'sui_idol_photocards';

  /**
   * 로컬 스토리지에 포토카드 저장 (Walrus 백업)
   */
  private saveToLocalStorage(metadata: PhotocardMetadata): void {
    try {
      const stored = localStorage.getItem(PhotocardStorageService.LOCAL_STORAGE_KEY);
      const photocards: PhotocardMetadata[] = stored ? JSON.parse(stored) : [];
      
      // 기존 포토카드가 있으면 업데이트, 없으면 추가
      const existingIndex = photocards.findIndex(p => p.id === metadata.id);
      if (existingIndex >= 0) {
        photocards[existingIndex] = metadata;
      } else {
        photocards.push(metadata);
      }
      
      localStorage.setItem(PhotocardStorageService.LOCAL_STORAGE_KEY, JSON.stringify(photocards));
      console.log('포토카드가 로컬 스토리지에 저장되었습니다:', metadata.id);
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
    }
  }

  /**
   * 로컬 스토리지에서 포토카드 불러오기
   */
  private loadFromLocalStorage(): PhotocardMetadata[] {
    try {
      const stored = localStorage.getItem(PhotocardStorageService.LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('로컬 스토리지 로드 실패:', error);
      return [];
    }
  }

  /**
   * 포토카드를 Walrus에 저장합니다 (실패시 로컬 스토리지 백업)
   */
  async storePhotocard(
    metadata: PhotocardMetadata,
    imageData: string | Uint8Array | Blob,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ): Promise<PhotocardStorageResult> {
    const { epochs = 5, deletable = false, account } = options;

    // 이미지 URL을 메타데이터에 포함
    const metadataWithImage = {
      ...metadata,
      imageUrl: typeof imageData === 'string' ? imageData : metadata.imageUrl
    };

    try {
      // 먼저 Walrus에 저장 시도
      const metadataJson = JSON.stringify(metadataWithImage, null, 2);
      
      const result = await walrusService.uploadFile(metadataJson, {
        identifier: `photocard_${metadata.id}_metadata.json`,
        tags: {
          'content-type': 'application/json',
          'photocard-id': metadata.id,
          'idol-id': metadata.idolId.toString(),
          'idol-name': metadata.idolName,
          'rarity': metadata.rarity,
          'concept': metadata.concept,
          'season': metadata.season,
          'owner': metadata.owner,
          'minted-at': metadata.mintedAt,
          'type': 'photocard-metadata'
        },
        epochs,
        deletable,
        account
      });

      // Walrus 저장 성공시 로컬에도 백업
      this.saveToLocalStorage(metadataWithImage);

      return {
        blobId: result.blobId,
        metadata: {
          ...metadataWithImage,
          storageInfo: {
            metadataBlobId: result.blobId,
            imageBlobId: null,
            imageUrl: typeof imageData === 'string' ? imageData : null,
            storedAt: new Date().toISOString(),
            epochs,
            deletable,
            storageType: 'walrus'
          }
        } as PhotocardMetadata & { storageInfo: any },
        storageUrl: `walrus://${result.blobId}`
      };
    } catch (error) {
      console.warn('Walrus 저장 실패, 로컬 스토리지로 폴백:', error);
      
      // Walrus 실패시 로컬 스토리지에 저장
      const localMetadata = {
        ...metadataWithImage,
        storageInfo: {
          metadataBlobId: null,
          imageBlobId: null,
          imageUrl: typeof imageData === 'string' ? imageData : null,
          storedAt: new Date().toISOString(),
          epochs,
          deletable,
          storageType: 'local'
        }
      } as PhotocardMetadata & { storageInfo: any };

      this.saveToLocalStorage(localMetadata);

      return {
        blobId: `local_${metadata.id}`,
        metadata: localMetadata,
        storageUrl: `local://${metadata.id}`
      };
    }
  }

  /**
   * Walrus에서 포토카드를 불러옵니다
   */
  async loadPhotocard(blobId: string): Promise<{
    metadata: PhotocardMetadata;
    imageData: Uint8Array | string | null;
  }> {
    try {
      // Blob에서 파일들 읽기
      const blob = await walrusService.readBlob(blobId);
      // Blob을 텍스트로 읽기 (메타데이터가 JSON으로 저장됨)
      const decoder = new TextDecoder();
      const metadataJson = decoder.decode(blob);
      const metadata = JSON.parse(metadataJson) as PhotocardMetadata & { storageInfo?: any };

      // 이미지 데이터는 메타데이터의 imageUrl에서 가져오기
      const imageData = metadata.imageUrl || null;

      return {
        metadata,
        imageData
      };
    } catch (error) {
      console.error('포토카드 로드 실패:', error);
      throw new Error(`포토카드 로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 여러 포토카드를 일괄 저장합니다
   */
  async storeMultiplePhotocards(
    photocards: Array<{
      metadata: PhotocardMetadata;
      imageData: string | Uint8Array | Blob;
    }>,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ): Promise<PhotocardStorageResult[]> {
    const results: PhotocardStorageResult[] = [];

    for (const photocard of photocards) {
      try {
        const result = await this.storePhotocard(
          photocard.metadata,
          photocard.imageData,
          options
        );
        results.push(result);
      } catch (error) {
        console.error(`포토카드 ${photocard.metadata.id} 저장 실패:`, error);
        // 개별 실패는 무시하고 계속 진행
      }
    }

    return results;
  }

  /**
   * 포토카드 메타데이터만 저장합니다 (이미지는 별도)
   */
  async storePhotocardMetadata(
    metadata: PhotocardMetadata,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ): Promise<{ blobId: string; metadata: PhotocardMetadata }> {
    const { epochs = 5, deletable = false, account } = options;

    try {
      const metadataJson = JSON.stringify(metadata, null, 2);
      
      const result = await walrusService.uploadFile(metadataJson, {
        identifier: `photocard_${metadata.id}_metadata.json`,
        tags: {
          'content-type': 'application/json',
          'photocard-id': metadata.id,
          'idol-id': metadata.idolId.toString(),
          'idol-name': metadata.idolName,
          'rarity': metadata.rarity,
          'concept': metadata.concept,
          'season': metadata.season,
          'owner': metadata.owner,
          'minted-at': metadata.mintedAt,
          'type': 'photocard-metadata'
        },
        epochs,
        deletable,
        account
      });

      return {
        blobId: result.blobId,
        metadata
      };
    } catch (error) {
      console.error('포토카드 메타데이터 저장 실패:', error);
      throw new Error(`포토카드 메타데이터 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 이미지 확장자를 결정합니다
   */
  private getImageExtension(imageData: Uint8Array | Blob | string): string {
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:image/')) {
        const match = imageData.match(/data:image\/([^;]+)/);
        return match ? match[1] : 'jpg';
      }
      return 'jpg'; // 기본값
    }
    
    if (imageData instanceof Blob) {
      const type = imageData.type;
      if (type.includes('png')) return 'png';
      if (type.includes('gif')) return 'gif';
      if (type.includes('webp')) return 'webp';
      return 'jpg'; // 기본값
    }
    
    return 'jpg'; // Uint8Array의 경우 기본값
  }

  /**
   * 이미지 Content-Type을 결정합니다
   */
  private getImageContentType(imageData: Uint8Array | Blob | string): string {
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:image/')) {
        const match = imageData.match(/data:image\/[^;]+/);
        return match ? match[0] : 'image/jpeg';
      }
      return 'image/jpeg';
    }
    
    if (imageData instanceof Blob) {
      return imageData.type || 'image/jpeg';
    }
    
    return 'image/jpeg'; // Uint8Array의 경우 기본값
  }

  /**
   * 포토카드 ID로 검색합니다
   */
  async searchPhotocardsByTag(tag: string, value: string): Promise<PhotocardMetadata[]> {
    try {
      // 이 기능은 Walrus의 태그 검색 기능을 활용
      // 실제 구현에서는 Walrus SDK의 검색 기능을 사용해야 함
      console.log(`태그 검색: ${tag} = ${value}`);
      
      // TODO: Walrus SDK의 태그 검색 기능 구현
      return [];
    } catch (error) {
      console.error('포토카드 검색 실패:', error);
      throw new Error(`포토카드 검색에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 사용자의 모든 포토카드를 불러옵니다 (Walrus + 로컬 스토리지)
   */
  async getUserPhotocards(owner: string): Promise<PhotocardMetadata[]> {
    try {
      // 먼저 Walrus에서 시도
      const walrusPhotocards = await this.searchPhotocardsByTag('owner', owner);
      
      // 로컬 스토리지에서도 불러오기
      const localPhotocards = this.loadFromLocalStorage().filter(p => p.owner === owner);
      
      // 중복 제거 (ID 기준)
      const allPhotocards = [...walrusPhotocards];
      localPhotocards.forEach(local => {
        if (!allPhotocards.find(p => p.id === local.id)) {
          allPhotocards.push(local);
        }
      });
      
      return allPhotocards;
    } catch (error) {
      console.warn('Walrus에서 포토카드 로드 실패, 로컬 스토리지만 사용:', error);
      // Walrus 실패시 로컬 스토리지만 사용
      return this.loadFromLocalStorage().filter(p => p.owner === owner);
    }
  }

  /**
   * 특정 아이돌의 포토카드들을 불러옵니다
   */
  async getIdolPhotocards(idolId: number): Promise<PhotocardMetadata[]> {
    return this.searchPhotocardsByTag('idol-id', idolId.toString());
  }

  /**
   * 특정 등급의 포토카드들을 불러옵니다
   */
  async getPhotocardsByRarity(rarity: 'N' | 'R' | 'SR' | 'SSR'): Promise<PhotocardMetadata[]> {
    return this.searchPhotocardsByTag('rarity', rarity);
  }
}

// 싱글톤 인스턴스
export const photocardStorageService = new PhotocardStorageService();
