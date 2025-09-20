import { useState, useCallback } from 'react';
import { walrusService } from '@/services/walrusService';
import { WalrusFile } from '@mysten/walrus';
import type { Signer } from '@mysten/sui/transactions';

export interface FlowStep {
  step: 'encode' | 'register' | 'upload' | 'certify' | 'complete';
  status: 'pending' | 'in_progress' | 'success' | 'error';
  error?: string;
  result?: any;
}

export interface UseWalrusFlowReturn {
  // 플로우 상태
  currentStep: FlowStep['step'];
  steps: FlowStep[];
  isFlowActive: boolean;
  
  // 플로우 시작
  startFlow: (files: WalrusFile[]) => Promise<void>;
  
  // 각 단계 실행
  executeEncode: () => Promise<void>;
  executeRegister: (options: {
    epochs: number;
    owner: string;
    deletable: boolean;
    signer: Signer;
  }) => Promise<string>;
  executeUpload: () => Promise<void>;
  executeCertify: (signer: Signer) => Promise<string>;
  
  // 플로우 완료
  completeFlow: () => Promise<WalrusFile[]>;
  
  // 플로우 리셋
  resetFlow: () => void;
  
  // 에러 처리
  error: string | null;
  clearError: () => void;
}

export function useWalrusFlow(): UseWalrusFlowReturn {
  const [currentStep, setCurrentStep] = useState<FlowStep['step']>('encode');
  const [steps, setSteps] = useState<FlowStep[]>([
    { step: 'encode', status: 'pending' },
    { step: 'register', status: 'pending' },
    { step: 'upload', status: 'pending' },
    { step: 'certify', status: 'pending' },
    { step: 'complete', status: 'pending' },
  ]);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<any>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateStepStatus = useCallback((step: FlowStep['step'], status: FlowStep['status'], error?: string, result?: any) => {
    setSteps(prev => prev.map(s => 
      s.step === step 
        ? { ...s, status, error, result }
        : s
    ));
  }, []);

  const resetFlow = useCallback(() => {
    setCurrentStep('encode');
    setSteps([
      { step: 'encode', status: 'pending' },
      { step: 'register', status: 'pending' },
      { step: 'upload', status: 'pending' },
      { step: 'certify', status: 'pending' },
      { step: 'complete', status: 'pending' },
    ]);
    setIsFlowActive(false);
    setError(null);
    setFlow(null);
  }, []);

  const startFlow = useCallback(async (files: WalrusFile[]) => {
    try {
      setError(null);
      setIsFlowActive(true);
      setCurrentStep('encode');
      
      const newFlow = walrusService.createUploadFlow(files);
      setFlow(newFlow);
      
      updateStepStatus('encode', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '플로우 시작 중 오류가 발생했습니다';
      setError(errorMessage);
      updateStepStatus('encode', 'error', errorMessage);
      setIsFlowActive(false);
      throw err;
    }
  }, [updateStepStatus]);

  const executeEncode = useCallback(async () => {
    if (!flow) {
      throw new Error('플로우가 시작되지 않았습니다');
    }

    try {
      setCurrentStep('encode');
      updateStepStatus('encode', 'in_progress');
      
      await flow.encode();
      
      updateStepStatus('encode', 'success');
      setCurrentStep('register');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '인코딩 중 오류가 발생했습니다';
      setError(errorMessage);
      updateStepStatus('encode', 'error', errorMessage);
      throw err;
    }
  }, [flow, updateStepStatus]);

  const executeRegister = useCallback(async (options: {
    epochs: number;
    owner: string;
    deletable: boolean;
    signer: Signer;
  }) => {
    if (!flow) {
      throw new Error('플로우가 시작되지 않았습니다');
    }

    try {
      setCurrentStep('register');
      updateStepStatus('register', 'in_progress');
      
      const registerTx = flow.register(options);
      const { digest } = await options.signer.signAndExecuteTransaction({ 
        transaction: registerTx 
      });
      
      updateStepStatus('register', 'success', undefined, { digest });
      setCurrentStep('upload');
      
      return digest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '등록 중 오류가 발생했습니다';
      setError(errorMessage);
      updateStepStatus('register', 'error', errorMessage);
      throw err;
    }
  }, [flow, updateStepStatus]);

  const executeUpload = useCallback(async () => {
    if (!flow) {
      throw new Error('플로우가 시작되지 않았습니다');
    }

    try {
      setCurrentStep('upload');
      updateStepStatus('upload', 'in_progress');
      
      await flow.upload();
      
      updateStepStatus('upload', 'success');
      setCurrentStep('certify');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다';
      setError(errorMessage);
      updateStepStatus('upload', 'error', errorMessage);
      throw err;
    }
  }, [flow, updateStepStatus]);

  const executeCertify = useCallback(async (signer: Signer) => {
    if (!flow) {
      throw new Error('플로우가 시작되지 않았습니다');
    }

    try {
      setCurrentStep('certify');
      updateStepStatus('certify', 'in_progress');
      
      const certifyTx = flow.certify();
      const { digest } = await signer.signAndExecuteTransaction({ 
        transaction: certifyTx 
      });
      
      updateStepStatus('certify', 'success', undefined, { digest });
      setCurrentStep('complete');
      
      return digest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '인증 중 오류가 발생했습니다';
      setError(errorMessage);
      updateStepStatus('certify', 'error', errorMessage);
      throw err;
    }
  }, [flow, updateStepStatus]);

  const completeFlow = useCallback(async () => {
    if (!flow) {
      throw new Error('플로우가 시작되지 않았습니다');
    }

    try {
      setCurrentStep('complete');
      updateStepStatus('complete', 'in_progress');
      
      const files = await flow.listFiles();
      
      updateStepStatus('complete', 'success', undefined, files);
      setIsFlowActive(false);
      
      return files;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '플로우 완료 중 오류가 발생했습니다';
      setError(errorMessage);
      updateStepStatus('complete', 'error', errorMessage);
      throw err;
    }
  }, [flow, updateStepStatus]);

  return {
    currentStep,
    steps,
    isFlowActive,
    startFlow,
    executeEncode,
    executeRegister,
    executeUpload,
    executeCertify,
    completeFlow,
    resetFlow,
    error,
    clearError,
  };
}
