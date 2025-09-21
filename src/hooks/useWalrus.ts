import { useState, useCallback } from 'react';
import { walrusService } from '@/services/walrusService';
import { WalrusFile } from '@mysten/walrus';
import { useWalletSigner } from './useWalletSigner';

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  result?: any;
}

export interface UseWalrusReturn {
  // 파일 업로드
  uploadFile: (
    content: Uint8Array | Blob | string,
    options?: {
      identifier?: string;
      tags?: Record<string, string>;
      epochs?: number;
      deletable?: boolean;
    }
  ) => Promise<any>;
  
  // 여러 파일 업로드
  uploadFiles: (
    files: Array<{
      content: Uint8Array | Blob | string;
      identifier?: string;
      tags?: Record<string, string>;
    }>,
    options?: {
      epochs?: number;
      deletable?: boolean;
    }
  ) => Promise<any[]>;
  
  // 파일 다운로드
  downloadFile: (blobId: string) => Promise<WalrusFile>;
  
  // 여러 파일 다운로드
  downloadFiles: (blobIds: string[]) => Promise<WalrusFile[]>;
  
  // Blob 읽기
  readBlob: (blobId: string) => Promise<Uint8Array>;
  
  // Blob 업로드
  uploadBlob: (
    blob: Uint8Array,
    options?: {
      epochs?: number;
      deletable?: boolean;
    }
  ) => Promise<any>;
  
  // 브라우저 업로드 플로우
  createUploadFlow: (files: WalrusFile[]) => any;
  
  // 상태
  uploadProgress: UploadProgress;
  isLoading: boolean;
  error: string | null;
  
  // 유틸리티
  reset: () => void;
  clearError: () => void;
}

export function useWalrus(): UseWalrusReturn {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 지갑 서명 훅 사용 - 조건부가 아닌 항상 호출
  const walletSigner = useWalletSigner();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setUploadProgress({ status: 'idle' });
    setIsLoading(false);
    setError(null);
    walrusService.reset();
  }, []);

  const uploadFile = useCallback(async (
    content: Uint8Array | Blob | string,
    options: {
      identifier?: string;
      tags?: Record<string, string>;
      epochs?: number;
      deletable?: boolean;
    } = {}
  ) => {
    if (!walletSigner.isReady) {
      throw new Error('지갑이 연결되지 않았습니다');
    }

    setIsLoading(true);
    setUploadProgress({ status: 'uploading' });
    setError(null);

    try {
      const signer = walletSigner.createSigner();
      const result = await walrusService.uploadFile(content, {
        ...options,
        account: signer.account,
        signTransaction: signer.signTransaction,
      });
      setUploadProgress({ status: 'success', result });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다';
      setError(errorMessage);
      setUploadProgress({ status: 'error', error: errorMessage });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletSigner]);

  const uploadFiles = useCallback(async (
    files: Array<{
      content: Uint8Array | Blob | string;
      identifier?: string;
      tags?: Record<string, string>;
    }>,
    options: {
      epochs?: number;
      deletable?: boolean;
    } = {}
  ) => {
    if (!walletSigner.isReady) {
      throw new Error('지갑이 연결되지 않았습니다');
    }

    setIsLoading(true);
    setUploadProgress({ status: 'uploading' });
    setError(null);

    try {
      const signer = walletSigner.createSigner();
      const results = await walrusService.uploadFiles(files, {
        ...options,
        account: signer.account,
        signTransaction: signer.signTransaction,
      });
      setUploadProgress({ status: 'success', result: results });
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '파일들 업로드 중 오류가 발생했습니다';
      setError(errorMessage);
      setUploadProgress({ status: 'error', error: errorMessage });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletSigner]);

  const downloadFile = useCallback(async (blobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const file = await walrusService.downloadFile(blobId);
      return file;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '파일 다운로드 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadFiles = useCallback(async (blobIds: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const files = await walrusService.downloadFiles(blobIds);
      return files;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '파일들 다운로드 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const readBlob = useCallback(async (blobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const blob = await walrusService.readBlob(blobId);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Blob 읽기 중 오류가 발생했습니다';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadBlob = useCallback(async (
    blob: Uint8Array,
    options: {
      epochs?: number;
      deletable?: boolean;
    } = {}
  ) => {
    if (!walletSigner.isReady) {
      throw new Error('지갑이 연결되지 않았습니다');
    }

    setIsLoading(true);
    setUploadProgress({ status: 'uploading' });
    setError(null);

    try {
      const signer = walletSigner.createSigner();
      const result = await walrusService.uploadBlob(blob, {
        ...options,
        account: signer.account,
        signTransaction: signer.signTransaction,
      });
      setUploadProgress({ status: 'success', result });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Blob 업로드 중 오류가 발생했습니다';
      setError(errorMessage);
      setUploadProgress({ status: 'error', error: errorMessage });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletSigner]);

  const createUploadFlow = useCallback((files: WalrusFile[]) => {
    return walrusService.createUploadFlow(files);
  }, []);

  return {
    uploadFile,
    uploadFiles,
    downloadFile,
    downloadFiles,
    readBlob,
    uploadBlob,
    createUploadFlow,
    uploadProgress,
    isLoading,
    error,
    reset,
    clearError,
  };
}