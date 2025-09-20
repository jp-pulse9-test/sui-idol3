import { supabase, ApiKey } from '@/lib/supabase';

export class ApiKeyService {
  /**
   * Save or update Gemini API key for a user
   */
  static async saveApiKey(walletAddress: string, apiKey: string): Promise<ApiKey | null> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .upsert(
          {
            user_wallet: walletAddress,
            api_key: apiKey,
          },
          {
            onConflict: 'user_wallet',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error saving API key:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveApiKey:', error);
      return null;
    }
  }

  /**
   * Retrieve API key for a user with enhanced security logging
   */
  static async getApiKey(walletAddress: string): Promise<string | null> {
    try {
      // 보안 강화: 최근 사용 시간 업데이트
      await this.updateLastUsed(walletAddress);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_wallet', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No API key found for wallet:', walletAddress);
        } else {
          console.error('Error retrieving API key:', error);
        }
        return null;
      }

      return data?.api_key || null;
    } catch (error) {
      console.error('Error in getApiKey:', error);
      return null;
    }
  }

  /**
   * Delete API key for a user
   */
  static async deleteApiKey(walletAddress: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_wallet', walletAddress);

      if (error) {
        console.error('Error deleting API key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteApiKey:', error);
      return false;
    }
  }

  /**
   * Check if user has an API key
   */
  static async hasApiKey(walletAddress: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id')
        .eq('user_wallet', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false;
        }
        console.error('Error checking API key existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasApiKey:', error);
      return false;
    }
  }

  /**
   * Update only the API key for a user
   */
  static async updateApiKey(walletAddress: string, newApiKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ api_key: newApiKey })
        .eq('user_wallet', walletAddress);

      if (error) {
        console.error('Error updating API key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateApiKey:', error);
      return false;
    }
  }

  /**
   * 보안 강화: API 키 최근 사용 시간 업데이트
   */
  private static async updateLastUsed(walletAddress: string): Promise<void> {
    try {
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_wallet', walletAddress);
    } catch (error) {
      console.error('Error updating last_used_at:', error);
    }
  }

  /**
   * 보안 모니터링: API 키 사용 로그 조회
   */
  static async getUsageLogs(walletAddress: string, limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('api_key_usage_logs')
        .select('*')
        .eq('user_wallet', walletAddress)
        .order('used_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error retrieving usage logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUsageLogs:', error);
      return [];
    }
  }

  /**
   * 보안 검증: 비정상적인 API 키 활동 감지
   */
  static async detectSuspiciousActivity(walletAddress: string): Promise<boolean> {
    try {
      const logs = await this.getUsageLogs(walletAddress, 50);
      
      // 1시간 내 10회 이상 접근 시 의심스러운 활동으로 간주
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogs = logs.filter(log => new Date(log.used_at) > oneHourAgo);
      
      return recentLogs.length > 10;
    } catch (error) {
      console.error('Error in detectSuspiciousActivity:', error);
      return false;
    }
  }
}