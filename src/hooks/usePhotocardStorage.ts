import { useState, useCallback } from 'react';
import { photocardStorageService, type PhotocardMetadata, type PhotocardStorageResult } from '@/services/photocardStorageService';

export interface UsePhotocardStorageReturn {
  // 포토카드 저장
  storePhotocard: (
    metadata: PhotocardMetadata,
    imageData: string | Uint8Array | Blob,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ) => Promise<PhotocardStorageResult>;
  
  // 여러 포토카드 저장
  storeMultiplePhotocards: (
    photocards: Array<{
      metadata: PhotocardMetadata;
      imageData: string | Uint8Array | Blob;
    }>,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ) => Promise<PhotocardStorageResult[]>;
  
  // 포토카드 로드
  loadPhotocard: (blobId: string) => Promise<{
    metadata: PhotocardMetadata;
    imageData: Uint8Array | string | null;
  }>;
  
  // 메타데이터만 저장
  storePhotocardMetadata: (
    metadata: PhotocardMetadata,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ) => Promise<{ blobId: string; metadata: PhotocardMetadata }>;
  
  // 검색 기능
  searchPhotocardsByTag: (tag: string, value: string) => Promise<PhotocardMetadata[]>;
  getUserPhotocards: (owner: string) => Promise<PhotocardMetadata[]>;
  getIdolPhotocards: (idolId: number) => Promise<PhotocardMetadata[]>;
  getPhotocardsByRarity: (rarity: 'N' | 'R' | 'SR' | 'SSR') => Promise<PhotocardMetadata[]>;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  storedPhotocards: PhotocardStorageResult[];
  
  // 유틸리티
  clearError: () => void;
  clearStoredPhotocards: () => void;
}

export function usePhotocardStorage(): UsePhotocardStorageReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedPhotocards, setStoredPhotocards] = useState<PhotocardStorageResult[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearStoredPhotocards = useCallback(() => {
    setStoredPhotocards([]);
  }, []);

  const storePhotocard = useCallback(async (
    metadata: PhotocardMetadata,
    imageData: string | Uint8Array | Blob,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await photocardStorageService.storePhotocard(metadata, imageData, options);
      setStoredPhotocards(prev => [...prev, result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '포토카드 저장 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const storeMultiplePhotocards = useCallback(async (
    photocards: Array<{
      metadata: PhotocardMetadata;
      imageData: string | Uint8Array | Blob;
    }>,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await photocardStorageService.storeMultiplePhotocards(photocards, options);
      setStoredPhotocards(prev => [...prev, ...results]);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '포토카드들 저장 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPhotocard = useCallback(async (blobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await photocardStorageService.loadPhotocard(blobId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '포토카드 로드 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const storePhotocardMetadata = useCallback(async (
    metadata: PhotocardMetadata,
    options: {
      epochs?: number;
      deletable?: boolean;
      account: any;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await photocardStorageService.storePhotocardMetadata(metadata, options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '포토카드 메타데이터 저장 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPhotocardsByTag = useCallback(async (tag: string, value: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await photocardStorageService.searchPhotocardsByTag(tag, value);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '포토카드 검색 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserPhotocards = useCallback(async (owner: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await photocardStorageService.getUserPhotocards(owner);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 포토카드 로드 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getIdolPhotocards = useCallback(async (idolId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await photocardStorageService.getIdolPhotocards(idolId);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '아이돌 포토카드 로드 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPhotocardsByRarity = useCallback(async (rarity: 'N' | 'R' | 'SR' | 'SSR') => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await photocardStorageService.getPhotocardsByRarity(rarity);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '등급별 포토카드 로드 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    storePhotocard,
    storeMultiplePhotocards,
    loadPhotocard,
    storePhotocardMetadata,
    searchPhotocardsByTag,
    getUserPhotocards,
    getIdolPhotocards,
    getPhotocardsByRarity,
    isLoading,
    error,
    storedPhotocards,
    clearError,
    clearStoredPhotocards,
  };
}
