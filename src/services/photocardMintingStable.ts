import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// 포토카드 민팅을 위한 Move 패키지 정보
const PHOTOCARD_PACKAGE_ID = '0x39d1d59ddc953d4ff0c0f80f868d00bb1718e1d1807db6a3e5745fd4f03f79fe';
const PHOTOCARD_MODULE = 'photocard';

export interface PhotoCardMintingData {
  idolId: number;
  idolName: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  imageUrl: string;
  personaPrompt?: string;
}

export const usePhotoCardMinting = () => {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const { user } = useAuth();

  const mintPhotoCard = async (mintingData: PhotoCardMintingData) => {
    if (!currentAccount || !user) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }
    
    try {
      console.log('포토카드 민팅 시작:', mintingData);
      
      const txb = new Transaction();
      // 포토카드 민팅 트랜잭션 구성
      txb.moveCall({
        target: `${PHOTOCARD_PACKAGE_ID}::${PHOTOCARD_MODULE}::mint_photocard`,
        arguments: [
          txb.pure.u64(mintingData.idolId),
          txb.pure.string(mintingData.idolName),
          txb.pure.string(mintingData.rarity),
          txb.pure.string(mintingData.concept),
          txb.pure.string(mintingData.season),
          txb.pure.u64(mintingData.serialNo),
          txb.pure.u64(mintingData.totalSupply),
          txb.pure.string(mintingData.imageUrl),
          txb.pure.string(mintingData.personaPrompt || ''),
        ],
      });

      // 가스비 설정 (0.01 SUI)
      txb.setGasBudget(10000000); // 0.01 SUI = 10,000,000 MIST

      // 트랜잭션 실행
      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txb,
          },
          {
            onSuccess: async (result) => {
              console.log('포토카드 민팅 성공:', result);
              
              try {
                // Supabase에 민팅 기록 저장
                const { data: userVault } = await supabase
                  .from('vaults')
                  .select('id')
                  .eq('user_id', user.id)
                  .single();

                if (userVault) {
                  await supabase
                    .from('debut_cards')
                    .insert({
                      vault_id: userVault.id,
                      token_id: result.digest,
                      tx_digest: result.digest,
                      image_url: mintingData.imageUrl,
                    });
                }

                toast.success('포토카드가 성공적으로 민팅되었습니다!');
                resolve(result);
              } catch (dbError) {
                console.error('민팅 기록 저장 실패:', dbError);
                toast.success('포토카드가 민팅되었지만 기록 저장에 실패했습니다.');
                resolve(result);
              }
            },
            onError: (error) => {
              console.error('포토카드 민팅 실패:', error);
              
              // 가스비 부족 에러 상세 처리
              if (error.message?.includes('No valid gas coins') || 
                  error.message?.includes('gas') ||
                  error.message?.includes('insufficient')) {
                toast.error(
                  '💰 가스비(SUI)가 부족합니다!\n\n' +
                  '지갑에 최소 0.01 SUI가 필요합니다.\n' +
                  'Sui Testnet Faucet에서 테스트 SUI를 받으세요:\n' +
                  'https://faucet.testnet.sui.io/',
                  { duration: 8000 }
                );
              } else if (error.message?.includes('Rejected') || error.message?.includes('User rejected')) {
                toast.error('사용자가 트랜잭션을 취소했습니다.');
              } else if (error.message?.includes('network') || error.message?.includes('connection')) {
                toast.error('네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
              } else {
                toast.error(`포토카드 민팅 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
              }
              
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error('포토카드 민팅 중 오류:', error);
      toast.error('포토카드 민팅 중 오류가 발생했습니다.');
      throw error;
    }
  };

  const mintIdolCard = async (idolData: {
    id: number;
    name: string;
    personality: string;
    image: string;
    persona_prompt: string;
  }) => {
    if (!currentAccount || !user) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }
    
    try {
      console.log('아이돌 카드 민팅 시작:', idolData);
      
      const txb = new Transaction();
      // 아이돌 카드 민팅 트랜잭션 구성
      txb.moveCall({
        target: `${PHOTOCARD_PACKAGE_ID}::${PHOTOCARD_MODULE}::mint_idol_card`,
        arguments: [
          txb.pure.u64(idolData.id),
          txb.pure.string(idolData.name),
          txb.pure.string(idolData.personality),
          txb.pure.string(idolData.image),
          txb.pure.string(idolData.persona_prompt),
        ],
      });

      // 가스비 설정 (0.01 SUI)
      txb.setGasBudget(10000000); // 0.01 SUI = 10,000,000 MIST

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txb,
          },
          {
            onSuccess: async (result) => {
              console.log('아이돌 카드 민팅 성공:', result);
              
              try {
                // Supabase에 민팅 기록 저장
                const { data: userVault } = await supabase
                  .from('vaults')
                  .select('id')
                  .eq('user_id', user.id)
                  .single();

                if (userVault) {
                  await supabase
                    .from('idol_cards')
                    .insert({
                      vault_id: userVault.id,
                      token_id: result.digest,
                      tx_digest: result.digest,
                      minted_at: new Date().toISOString(),
                    });
                }

                toast.success('아이돌 카드가 성공적으로 민팅되었습니다!');
                resolve(result);
              } catch (dbError) {
                console.error('민팅 기록 저장 실패:', dbError);
                toast.success('아이돌 카드가 민팅되었지만 기록 저장에 실패했습니다.');
                resolve(result);
              }
            },
            onError: (error) => {
              console.error('아이돌 카드 민팅 실패:', error);
              
              // 가스비 부족 에러 상세 처리
              if (error.message?.includes('No valid gas coins') || 
                  error.message?.includes('gas') ||
                  error.message?.includes('insufficient')) {
                toast.error(
                  '💰 가스비(SUI)가 부족합니다!\n\n' +
                  '지갑에 최소 0.01 SUI가 필요합니다.\n' +
                  'Sui Testnet Faucet에서 테스트 SUI를 받으세요:\n' +
                  'https://faucet.testnet.sui.io/',
                  { duration: 8000 }
                );
              } else if (error.message?.includes('Rejected') || error.message?.includes('User rejected')) {
                toast.error('사용자가 트랜잭션을 취소했습니다.');
              } else if (error.message?.includes('network') || error.message?.includes('connection')) {
                toast.error('네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
              } else {
                toast.error(`민팅 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
              }
              
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error('아이돌 카드 민팅 중 오류:', error);
      toast.error('아이돌 카드 민팅 중 오류가 발생했습니다.');
      throw error;
    }
  };

  return {
    mintPhotoCard,
    mintIdolCard,
    isPending,
  };
};