import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount } from '@mysten/dapp-kit';

const PACKAGE_ID = '0x0709fa964224865db203e618c89c101c203d7b6b1ff9a6f13dfae4dccda5cba9';

export interface RandomBox {
  id: string;
  boxType: 'daily' | 'premium' | 'legendary';
  price: number;
  maxClaimsPerDay: number;
  pityThreshold: number;
}

export interface RandomBoxResult {
  boxId: string;
  boxType: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  photocardId: string;
  owner: string;
  timestamp: number;
}

export const useRandomBoxService = () => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  // 랜덤박스 생성
  const createRandomBox = async (
    boxType: 'daily' | 'premium' | 'legendary',
    price: number,
    maxClaimsPerDay: number,
    pityThreshold: number
  ) => {
    if (!account?.address) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    const txb = new Transaction();
    
    txb.moveCall({
      target: `${PACKAGE_ID}::photocard::create_random_box`,
      arguments: [
        txb.pure.string(boxType),
        txb.pure.u64(price),
        txb.pure.u64(maxClaimsPerDay),
        txb.pure.u64(pityThreshold),
      ],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        {
          transactionBlock: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('랜덤박스 생성 성공:', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('랜덤박스 생성 실패:', error);
            reject(error);
          },
        }
      );
    });
  };

  // 랜덤박스 오픈
  const openRandomBox = async (
    randomBoxId: string,
    globalStateId: string,
    paymentAmount: number
  ): Promise<RandomBoxResult> => {
    if (!account?.address) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    const txb = new Transaction();
    
    // SUI 코인 분할
    const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(paymentAmount)]);
    
    txb.moveCall({
      target: `${PACKAGE_ID}::photocard::open_random_box`,
      arguments: [
        txb.object(randomBoxId),
        txb.object(globalStateId),
        coin,
      ],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        {
          transactionBlock: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
            showEvents: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('랜덤박스 오픈 성공:', result);
            
            // 이벤트에서 결과 추출
            const events = result.events || [];
            const randomBoxEvent = events.find(
              (event: any) => event.type.includes('RandomBoxOpened')
            );
            
            if (randomBoxEvent) {
              const parsedEvent: RandomBoxResult = {
                boxId: randomBoxEvent.parsedJson.box_id,
                boxType: randomBoxEvent.parsedJson.box_type,
                rarity: randomBoxEvent.parsedJson.rarity,
                photocardId: randomBoxEvent.parsedJson.photocard_id,
                owner: randomBoxEvent.parsedJson.owner,
                timestamp: randomBoxEvent.parsedJson.timestamp,
              };
              resolve(parsedEvent);
            } else {
              // 기본값 반환
              resolve({
                boxId: '',
                boxType: 'daily',
                rarity: 'N',
                photocardId: '',
                owner: account.address,
                timestamp: Date.now(),
              });
            }
          },
          onError: (error) => {
            console.error('랜덤박스 오픈 실패:', error);
            reject(error);
          },
        }
      );
    });
  };

  // 글로벌 상태 초기화
  const initGlobalState = async () => {
    if (!account?.address) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    const txb = new Transaction();
    
    txb.moveCall({
      target: `${PACKAGE_ID}::photocard::init_global_state`,
      arguments: [],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        {
          transactionBlock: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('글로벌 상태 초기화 성공:', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('글로벌 상태 초기화 실패:', error);
            reject(error);
          },
        }
      );
    });
  };

  // 랜덤박스 타입별 기본 설정
  const getRandomBoxConfig = (boxType: 'daily' | 'premium' | 'legendary') => {
    const configs = {
      daily: {
        price: 0, // 무료
        maxClaimsPerDay: 10,
        pityThreshold: 50,
      },
      premium: {
        price: 1000000000, // 1 SUI
        maxClaimsPerDay: 100,
        pityThreshold: 30,
      },
      legendary: {
        price: 5000000000, // 5 SUI
        maxClaimsPerDay: 1000,
        pityThreshold: 10,
      },
    };
    return configs[boxType];
  };

  return {
    createRandomBox,
    openRandomBox,
    initGlobalState,
    getRandomBoxConfig,
  };
};
