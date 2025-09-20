import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface MockIdolCardData {
  id: number;
  name: string;
  personality: string;
  image: string;
  persona_prompt: string;
}

export interface MockMintingResult {
  success: boolean;
  txDigest?: string;
  tokenId?: string;
  error?: string;
}

/**
 * 개발/테스트용 모의 민팅 시스템
 * 실제 지갑이 없는 환경에서 민팅 프로세스를 시뮬레이션합니다.
 */
export const useMockMinting = () => {
  
  const mockMintIdolCard = async (idolData: MockIdolCardData): Promise<MockMintingResult> => {
    try {
      console.log('🎮 모의 민팅 시작:', idolData);
      
      // 지갑 연결 상태 확인
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error('지갑이 연결되지 않았습니다.');
      }
      
      // 코인 차감 시뮬레이션
      const currentCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
      if (currentCoins < 0.15) {
        throw new Error('수이 코인이 부족합니다.');
      }
      
      // 민팅 프로세스 시뮬레이션 (3초)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 모의 트랜잭션 데이터 생성
      const mockTxDigest = `0x${Math.random().toString(16).substring(2, 66)}`;
      const mockTokenId = `0x${Math.random().toString(16).substring(2, 42)}`;
      
      // 코인 차감
      localStorage.setItem('suiCoins', (currentCoins - 0.15).toFixed(2));
      
      // 성공적인 민팅 결과 반환
      const result: MockMintingResult = {
        success: true,
        txDigest: mockTxDigest,
        tokenId: mockTokenId
      };
      
      console.log('✅ 모의 민팅 완료:', result);
      toast.success('🎉 IdolCard NFT 모의 민팅이 완료되었습니다!');
      
      return result;
      
    } catch (error) {
      console.error('❌ 모의 민팅 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      toast.error(`민팅 실패: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };
  
  const checkMockWalletConnection = (): boolean => {
    const walletAddress = localStorage.getItem('walletAddress');
    const isMockWallet = localStorage.getItem('isMockWallet') === 'true';
    
    return !!(walletAddress && isMockWallet);
  };
  
  const getMockWalletInfo = () => {
    const walletAddress = localStorage.getItem('walletAddress');
    const suiCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    const isMockWallet = localStorage.getItem('isMockWallet') === 'true';
    
    return {
      walletAddress,
      suiCoins,
      isMockWallet,
      isConnected: !!(walletAddress && isMockWallet)
    };
  };
  
  return {
    mockMintIdolCard,
    checkMockWalletConnection,
    getMockWalletInfo
  };
};