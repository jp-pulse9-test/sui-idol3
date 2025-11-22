import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';
import { DataSyncDialog } from '@/components/DataSyncDialog';
import { toast } from 'sonner';

interface AuthContextType {
  user: { id: string; wallet_address: string } | null;
  loading: boolean;
  isGuest: boolean;
  connectWallet: () => Promise<{ error: any }>;
  disconnectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; wallet_address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [pendingSyncData, setPendingSyncData] = useState<{
    localData: any;
    blockchainData: any;
    walletAddress: string;
  } | null>(null);
  
  // 지갑 상태를 안전하게 가져오기
  const walletHook = useWallet();
  const { isConnected, walletAddress, connectWallet: dappKitConnect, disconnectWallet: dappKitDisconnect } = walletHook;

  useEffect(() => {
    // Let wallet library handle persistence via autoConnect
    setLoading(false);
  }, []);

  // Sync wallet connection state (wallet library handles persistence)
  useEffect(() => {
    try {
      if (isConnected && walletAddress) {
        const userId = 'user_' + walletAddress.slice(-12);
        setUser({ id: userId, wallet_address: walletAddress });
        setIsGuest(false);
        console.log('Wallet connected:', walletAddress);
        setWalletError(null);
      } else if (isConnected === false) {
        setUser(null);
        setIsGuest(true);
        console.log('Guest mode - no wallet connected');
      }
    } catch (error) {
      console.error('Wallet sync error:', error);
      setWalletError(error instanceof Error ? error.message : 'Wallet sync error');
    }
  }, [isConnected, walletAddress]);

  const connectWallet = async () => {
    try {
      console.log('🔥 dapp-kit 지갑 연결 시도...');
      
      if (!dappKitConnect) {
        throw new Error('지갑 연결 기능을 사용할 수 없습니다');
      }
      
      const result = await dappKitConnect();
      
      if (result.success && walletAddress) {
        console.log('✅ dapp-kit 지갑 연결 성공:', walletAddress);
        
        // 게스트 데이터 확인
        const hasLocalData = checkLocalGuestData();
        
        // Supabase에 사용자 정보 저장 및 기존 데이터 확인
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('wallet_address', walletAddress)
            .maybeSingle();

          if (!existingUser) {
            // 새 사용자 생성
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([{ wallet_address: walletAddress }])
              .select()
              .single();

            if (insertError && insertError.code !== '23505') {
              console.error('❌ 사용자 생성 오류:', insertError);
            } else {
              console.log('✅ 새 사용자 생성:', newUser?.id);
            }
          }

          // 블록체인 데이터 확인
          const hasBlockchainData = await checkBlockchainData(walletAddress);

          // 둘 다 데이터가 있으면 동기화 다이얼로그 표시
          if (hasLocalData && hasBlockchainData.exists) {
            const localData = getLocalDataSummary();
            setPendingSyncData({
              localData,
              blockchainData: hasBlockchainData.data,
              walletAddress
            });
            setShowSyncDialog(true);
          } else if (hasLocalData && !hasBlockchainData.exists) {
            // 로컬 데이터만 있으면 자동 업로드
            await syncLocalToBlockchain(walletAddress);
            toast.success('게스트 데이터가 블록체인에 저장되었습니다!');
          } else if (!hasLocalData && hasBlockchainData.exists) {
            // 블록체인 데이터만 있으면 자동 다운로드
            toast.info('블록체인 데이터를 불러왔습니다');
          }
        } catch (dbError) {
          console.error('❌ DB 저장 오류:', dbError);
        }
        
        return { error: null };
      } else {
        return { error: result.error || '지갑 연결 실패' };
      }
    } catch (error) {
      console.error('❌ 지갑 연결 오류:', error);
      return { error };
    }
  };

  const checkLocalGuestData = (): boolean => {
    const guestVRI = localStorage.getItem('guestVRI');
    const guestProgress = localStorage.getItem('guestProgress');
    const photoCards = localStorage.getItem('photoCards');
    
    return !!(guestVRI || guestProgress || photoCards);
  };

  const checkBlockchainData = async (walletAddress: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (!userData) return { exists: false, data: null };

      const [vriResult, progressResult, cardsResult] = await Promise.all([
        supabase.from('user_vri').select('*').eq('user_id', userData.id).maybeSingle(),
        supabase.from('branch_progress').select('*').eq('user_id', userData.id),
        supabase.from('debut_cards').select('*').eq('vault_id', userData.id)
      ]);

      const hasData = !!(vriResult.data || (progressResult.data && progressResult.data.length > 0) || (cardsResult.data && cardsResult.data.length > 0));

      return {
        exists: hasData,
        data: {
          vri: vriResult.data?.total_vri || 0,
          progress: progressResult.data ? Math.round((progressResult.data.filter((p: any) => p.is_cleared).length / progressResult.data.length) * 100) : 0,
          photocards: cardsResult.data?.length || 0
        }
      };
    } catch (error) {
      console.error('Error checking blockchain data:', error);
      return { exists: false, data: null };
    }
  };

  const getLocalDataSummary = () => {
    const guestVRI = localStorage.getItem('guestVRI');
    const guestProgress = localStorage.getItem('guestProgress');
    const photoCards = localStorage.getItem('photoCards');

    const vri = guestVRI ? JSON.parse(guestVRI).total : 0;
    const progress = guestProgress ? JSON.parse(guestProgress) : [];
    const cards = photoCards ? JSON.parse(photoCards).length : 0;

    return {
      vri,
      progress: progress.length > 0 ? Math.round((progress.filter((p: any) => p.isCleared).length / progress.length) * 100) : 0,
      photocards: cards
    };
  };

  const syncLocalToBlockchain = async (walletAddress: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!userData) return;

      const guestVRI = localStorage.getItem('guestVRI');
      const guestProgress = localStorage.getItem('guestProgress');

      if (guestVRI) {
        const vriData = JSON.parse(guestVRI);
        await supabase.from('user_vri').upsert({
          user_id: userData.id,
          total_vri: vriData.total,
          love_vri: vriData.love,
          trust_vri: vriData.trust,
          empathy_vri: vriData.empathy
        });
      }

      if (guestProgress) {
        const progressData = JSON.parse(guestProgress);
        for (const progress of progressData) {
          await supabase.from('branch_progress').upsert({
            user_id: userData.id,
            branch_id: progress.branchId,
            current_vri: progress.currentVRI,
            max_vri: progress.maxVRI,
            completed_missions: progress.completedMissions,
            is_cleared: progress.isCleared
          });
        }
      }
    } catch (error) {
      console.error('Error syncing to blockchain:', error);
      throw error;
    }
  };

  const handleSyncConfirm = async (action: 'keep-local' | 'use-blockchain' | 'merge') => {
    if (!pendingSyncData) return;

    try {
      const { walletAddress } = pendingSyncData;
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!userData) return;

      if (action === 'keep-local') {
        // 로컬 데이터를 블록체인으로
        await syncLocalToBlockchain(walletAddress);
        toast.success('로컬 데이터가 블록체인에 저장되었습니다!');
      } else if (action === 'use-blockchain') {
        // 로컬 데이터 삭제
        localStorage.removeItem('guestVRI');
        localStorage.removeItem('guestProgress');
        localStorage.removeItem('photoCards');
        toast.success('블록체인 데이터를 사용합니다');
      } else if (action === 'merge') {
        // 데이터 병합
        const guestVRI = localStorage.getItem('guestVRI');
        const guestProgress = localStorage.getItem('guestProgress');

        if (guestVRI) {
          const localVri = JSON.parse(guestVRI);
          const { data: blockchainVri } = await supabase
            .from('user_vri')
            .select('*')
            .eq('user_id', userData.id)
            .maybeSingle();

          await supabase.from('user_vri').upsert({
            user_id: userData.id,
            total_vri: (blockchainVri?.total_vri || 0) + localVri.total,
            love_vri: (blockchainVri?.love_vri || 0) + localVri.love,
            trust_vri: (blockchainVri?.trust_vri || 0) + localVri.trust,
            empathy_vri: (blockchainVri?.empathy_vri || 0) + localVri.empathy
          });
        }

        if (guestProgress) {
          const localProgress = JSON.parse(guestProgress);
          const { data: blockchainProgress } = await supabase
            .from('branch_progress')
            .select('*')
            .eq('user_id', userData.id);

          for (const localBranch of localProgress) {
            const existing = blockchainProgress?.find((b: any) => b.branch_id === localBranch.branchId);
            
            const existingMissions = Array.isArray(existing?.completed_missions) 
              ? existing.completed_missions as string[]
              : [];
            const localMissions = Array.isArray(localBranch.completedMissions)
              ? localBranch.completedMissions as string[]
              : [];
            
            await supabase.from('branch_progress').upsert({
              user_id: userData.id,
              branch_id: localBranch.branchId,
              current_vri: Math.max(existing?.current_vri || 0, localBranch.currentVRI),
              max_vri: Math.max(existing?.max_vri || 0, localBranch.maxVRI),
              completed_missions: [...new Set([...existingMissions, ...localMissions])],
              is_cleared: existing?.is_cleared || localBranch.isCleared
            });
          }
        }

        toast.success('데이터가 성공적으로 병합되었습니다!');
      }

      setPendingSyncData(null);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('동기화 중 오류가 발생했습니다');
    }
  };

  const disconnectWallet = async () => {
    try {
      if (dappKitDisconnect) {
        await dappKitDisconnect();
      }
      setUser(null);
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnect error:', error);
    }
  };

  const value = {
    user,
    loading,
    isGuest,
    connectWallet,
    disconnectWallet,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {pendingSyncData && (
        <DataSyncDialog
          open={showSyncDialog}
          onOpenChange={setShowSyncDialog}
          onConfirm={handleSyncConfirm}
          localData={pendingSyncData.localData}
          blockchainData={pendingSyncData.blockchainData}
        />
      )}
    </AuthContext.Provider>
  );
};