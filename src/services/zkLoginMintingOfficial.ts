import { useZkLoginOfficial } from './zkLoginServiceOfficial';
import { toast } from 'sonner';

// Transaction 클래스 (조건부 import)
let Transaction: any;

try {
  const transactionModule = await import('@mysten/sui/transactions');
  Transaction = transactionModule.Transaction;
  console.log('공식 Transaction 클래스 로드 성공');
} catch (error) {
  console.warn('공식 Transaction 클래스 로드 실패, 폴백 구현 사용:', error);
  
  // 폴백 Transaction 생성자 함수
  Transaction = function() {
    this.moves = [];
    this.signature = null;
    this.sender = null;
    
    console.log('폴백 Transaction 객체 생성');
    
    this.setSender = function(address: string) {
      console.log('폴백 Transaction sender 설정:', address);
      this.sender = address;
      return this;
    };
    
    this.moveCall = function(params: any) {
      console.log('폴백 Move 호출 추가:', params);
      this.moves.push({
        type: 'moveCall',
        target: params.target,
        arguments: params.arguments,
        timestamp: Date.now(),
      });
      return this;
    };

    this.pure = {
      u64: (value: number) => {
        console.log('폴백 Pure u64 값:', value);
        return { type: 'u64', value };
      },
      string: (value: string) => {
        console.log('폴백 Pure string 값:', value);
        return { type: 'string', value };
      },
      address: (value: string) => {
        console.log('폴백 Pure address 값:', value);
        return { type: 'address', value };
      },
      bool: (value: boolean) => {
        console.log('폴백 Pure bool 값:', value);
        return { type: 'bool', value };
      },
    };

    this.sign = async function(params: any) {
      console.log('폴백 트랜잭션 서명:', params);
      const signature = 'signature-' + Date.now() + '-' + Math.random().toString(16).substr(2, 8);
      const bytes = 'transaction-bytes-' + Date.now();
      return { bytes, signature };
    };

    this.serialize = function() {
      return {
        moves: this.moves,
        signature: this.signature,
        sender: this.sender,
        timestamp: Date.now(),
      };
    };
  };
}

// 공식 zkLogin을 사용한 포토카드 민팅 서비스
export interface ZkLoginPhotoCardMintingData {
  idolId: number;
  idolName: string;
  rarity: string; // N, R, SR, SSR
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  imageUrl: string;
  personaPrompt?: string;
}

export const useZkLoginMintingOfficial = () => {
  const { user, signTransaction, isLoggedIn } = useZkLoginOfficial();

  const mintPhotoCard = async (mintingData: ZkLoginPhotoCardMintingData) => {
    if (!isLoggedIn()) {
      throw new Error('공식 zkLogin으로 로그인해주세요.');
    }

    try {
      console.log('공식 zkLogin 포토카드 민팅 시작:', mintingData);
      
      // 공식 트랜잭션 객체 생성
      const tx = new Transaction();

      // 공식 포토카드 민팅 트랜잭션 구성
      tx.moveCall({
        target: '0x39d1d59ddc953d4ff0c0f80f868d00bb1718e1d1807db6a3e5745fd4f03f79fe::photocard::mint_photocard',
        arguments: [
          tx.pure.u64(mintingData.idolId),
          tx.pure.string(mintingData.idolName),
          tx.pure.string(mintingData.rarity),
          tx.pure.string(mintingData.concept),
          tx.pure.string(mintingData.season),
          tx.pure.u64(mintingData.serialNo),
          tx.pure.u64(mintingData.totalSupply),
          tx.pure.string(mintingData.imageUrl),
          tx.pure.string(mintingData.personaPrompt || ''),
        ],
      });

      console.log('공식 포토카드 민팅 트랜잭션 구성 완료');

      // 공식 zkLogin으로 트랜잭션 서명 및 실행
      const digest = await signTransaction(tx);

      console.log('공식 포토카드 민팅 완료, 다이제스트:', digest);

      toast.success('공식 zkLogin으로 포토카드가 성공적으로 민팅되었습니다!');
      
      return {
        digest,
        user: user,
        mintingData,
        mintedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('공식 zkLogin 포토카드 민팅 실패:', error);
      toast.error('포토카드 민팅에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
      throw error;
    }
  };

  const mintIdolCard = async (mintingData: {
    idolId: number;
    idolName: string;
    concept: string;
    season: string;
    imageUrl: string;
    personaPrompt?: string;
  }) => {
    if (!isLoggedIn()) {
      throw new Error('공식 zkLogin으로 로그인해주세요.');
    }

    try {
      console.log('공식 zkLogin 아이돌 카드 민팅 시작:', mintingData);
      
      // 공식 트랜잭션 객체 생성
      const tx = new Transaction();

      // 공식 아이돌 카드 민팅 트랜잭션 구성
      tx.moveCall({
        target: '0x39d1d59ddc953d4ff0c0f80f868d00bb1718e1d1807db6a3e5745fd4f03f79fe::photocard::mint_idol_card',
        arguments: [
          tx.pure.u64(mintingData.idolId),
          tx.pure.string(mintingData.idolName),
          tx.pure.string(mintingData.concept),
          tx.pure.string(mintingData.season),
          tx.pure.string(mintingData.imageUrl),
          tx.pure.string(mintingData.personaPrompt || ''),
        ],
      });

      console.log('공식 아이돌 카드 민팅 트랜잭션 구성 완료');

      // 공식 zkLogin으로 트랜잭션 서명 및 실행
      const digest = await signTransaction(tx);

      console.log('공식 아이돌 카드 민팅 완료, 다이제스트:', digest);

      toast.success('공식 zkLogin으로 아이돌 카드가 성공적으로 민팅되었습니다!');
      
      return {
        digest,
        user: user,
        mintingData,
        mintedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('공식 zkLogin 아이돌 카드 민팅 실패:', error);
      toast.error('아이돌 카드 민팅에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
      throw error;
    }
  };

  return { 
    mintPhotoCard, 
    mintIdolCard, 
    isLoggedIn,
    user 
  };
};
