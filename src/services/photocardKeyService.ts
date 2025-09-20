import { supabase } from '@/integrations/supabase/client';

export interface PhotocardKey {
  id: string;
  serial_key: string;
  total_credits: number;
  remaining_credits: number;
  is_unlimited: boolean;
  expires_at?: string;
}

export interface UserPhotocardKey {
  id: string;
  user_wallet: string;
  serial_key: string;
  activated_at: string;
}

export interface PhotocardUsage {
  id: string;
  user_wallet: string;
  serial_key: string;
  credits_used: number;
  created_at: string;
  generation_type?: string;
}

export class PhotocardKeyService {
  /**
   * 시리얼 키의 유효성을 확인합니다
   */
  static async validateSerialKey(serialKey: string): Promise<{ valid: boolean; key?: PhotocardKey; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('photocard_keys')
        .select('*')
        .eq('serial_key', serialKey.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { valid: false, error: '유효하지 않은 시리얼 키입니다.' };
        }
        console.error('Error validating serial key:', error);
        return { valid: false, error: '시리얼 키 확인 중 오류가 발생했습니다.' };
      }

      // 만료일 확인
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, error: '만료된 시리얼 키입니다.' };
      }

      // 크레딧 확인
      if (!data.is_unlimited && data.remaining_credits <= 0) {
        return { valid: false, error: '사용 가능한 크레딧이 없습니다.' };
      }

      return { valid: true, key: data };
    } catch (error) {
      console.error('Error in validateSerialKey:', error);
      return { valid: false, error: '시리얼 키 확인 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 사용자의 시리얼 키를 활성화합니다
   */
  static async activateSerialKey(walletAddress: string, serialKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 먼저 키 유효성 확인
      const validation = await this.validateSerialKey(serialKey);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // 이미 활성화된 키인지 확인
      const { data: existing } = await supabase
        .from('user_photocard_keys')
        .select('*')
        .eq('user_wallet', walletAddress)
        .eq('serial_key', serialKey.toUpperCase())
        .single();

      if (existing) {
        return { success: false, error: '이미 활성화된 시리얼 키입니다.' };
      }

      // 키 활성화
      const { error } = await supabase
        .from('user_photocard_keys')
        .insert({
          user_wallet: walletAddress,
          serial_key: serialKey.toUpperCase(),
        });

      if (error) {
        console.error('Error activating serial key:', error);
        return { success: false, error: '시리얼 키 활성화 중 오류가 발생했습니다.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in activateSerialKey:', error);
      return { success: false, error: '시리얼 키 활성화 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 사용자의 활성화된 키 목록을 조회합니다
   */
  static async getUserActiveKeys(walletAddress: string): Promise<{ keys: (UserPhotocardKey & { photocard_keys: PhotocardKey })[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_photocard_keys')
        .select(`
          *,
          photocard_keys!inner(*)
        `)
        .eq('user_wallet', walletAddress);

      if (error) {
        console.error('Error getting user active keys:', error);
        return { keys: [], error: '활성화된 키 조회 중 오류가 발생했습니다.' };
      }

      return { keys: data || [] };
    } catch (error) {
      console.error('Error in getUserActiveKeys:', error);
      return { keys: [], error: '활성화된 키 조회 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 크레딧을 사용합니다
   */
  static async useCredits(walletAddress: string, serialKey: string, creditsToUse: number = 1, generationType?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 키 정보 조회
      const { data: keyData, error: keyError } = await supabase
        .from('photocard_keys')
        .select('*')
        .eq('serial_key', serialKey.toUpperCase())
        .single();

      if (keyError || !keyData) {
        return { success: false, error: '유효하지 않은 시리얼 키입니다.' };
      }

      // 무제한 키가 아닌 경우 크레딧 확인 및 차감
      if (!keyData.is_unlimited) {
        if (keyData.remaining_credits < creditsToUse) {
          return { success: false, error: '사용 가능한 크레딧이 부족합니다.' };
        }

        // 크레딧 차감
        const { error: updateError } = await supabase
          .from('photocard_keys')
          .update({ remaining_credits: keyData.remaining_credits - creditsToUse })
          .eq('serial_key', serialKey.toUpperCase());

        if (updateError) {
          console.error('Error updating credits:', updateError);
          return { success: false, error: '크레딧 차감 중 오류가 발생했습니다.' };
        }
      }

      // 사용량 기록
      const { error: usageError } = await supabase
        .from('photocard_usage')
        .insert({
          user_wallet: walletAddress,
          serial_key: serialKey.toUpperCase(),
          credits_used: creditsToUse,
          generation_type: generationType || 'photocard_generation',
        });

      if (usageError) {
        console.error('Error recording usage:', usageError);
        // 사용량 기록 실패해도 계속 진행 (중요하지 않음)
      }

      return { success: true };
    } catch (error) {
      console.error('Error in useCredits:', error);
      return { success: false, error: '크레딧 사용 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 사용자의 사용량 통계를 조회합니다
   */
  static async getUserUsageStats(walletAddress: string): Promise<{ stats: PhotocardUsage[]; totalUsed: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('photocard_usage')
        .select('*')
        .eq('user_wallet', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting usage stats:', error);
        return { stats: [], totalUsed: 0, error: '사용량 통계 조회 중 오류가 발생했습니다.' };
      }

      const totalUsed = data?.reduce((sum, usage) => sum + usage.credits_used, 0) || 0;

      return { stats: data || [], totalUsed };
    } catch (error) {
      console.error('Error in getUserUsageStats:', error);
      return { stats: [], totalUsed: 0, error: '사용량 통계 조회 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 사용자가 포토카드 생성 권한이 있는지 확인합니다
   */
  static async hasPhotocardAccess(walletAddress: string): Promise<{ hasAccess: boolean; activeKey?: PhotocardKey; error?: string }> {
    try {
      const { keys, error } = await this.getUserActiveKeys(walletAddress);
      
      if (error) {
        return { hasAccess: false, error };
      }

      // 유효한 키가 있는지 확인
      for (const keyData of keys) {
        const key = keyData.photocard_keys;
        
        // 만료일 확인
        if (key.expires_at && new Date(key.expires_at) < new Date()) {
          continue;
        }

        // 크레딧 확인
        if (key.is_unlimited || key.remaining_credits > 0) {
          return { hasAccess: true, activeKey: key };
        }
      }

      return { hasAccess: false, error: '유효한 포토카드 생성 권한이 없습니다.' };
    } catch (error) {
      console.error('Error in hasPhotocardAccess:', error);
      return { hasAccess: false, error: '권한 확인 중 오류가 발생했습니다.' };
    }
  }
}