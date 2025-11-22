import { supabase } from '@/integrations/supabase/client';

export interface GeminiKey {
  id: string;
  user_wallet: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}

export class GeminiKeyService {
  /**
   * Save or update user's personal Gemini API key
   */
  static async saveGeminiKey(walletAddress: string, apiKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_gemini_keys')
        .upsert(
          {
            user_wallet: walletAddress,
            api_key: apiKey,
          },
          {
            onConflict: 'user_wallet',
            ignoreDuplicates: false,
          }
        );

      if (error) {
        console.error('Error saving Gemini API key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveGeminiKey:', error);
      return false;
    }
  }

  /**
   * Check if user has a Gemini API key
   */
  static async hasGeminiKey(walletAddress: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_gemini_keys')
        .select('id')
        .eq('user_wallet', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Gemini key existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasGeminiKey:', error);
      return false;
    }
  }

  /**
   * Delete user's Gemini API key
   */
  static async deleteGeminiKey(walletAddress: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_gemini_keys')
        .delete()
        .eq('user_wallet', walletAddress);

      if (error) {
        console.error('Error deleting Gemini API key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteGeminiKey:', error);
      return false;
    }
  }

  /**
   * Get masked version of the key for display (shows only first 8 chars)
   */
  static async getMaskedKey(walletAddress: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_gemini_keys')
        .select('api_key')
        .eq('user_wallet', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error getting masked key:', error);
        return null;
      }

      if (!data?.api_key) return null;

      return `${data.api_key.substring(0, 8)}...`;
    } catch (error) {
      console.error('Error in getMaskedKey:', error);
      return null;
    }
  }
}
