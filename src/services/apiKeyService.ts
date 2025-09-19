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
   * Retrieve API key for a user
   */
  static async getApiKey(walletAddress: string): Promise<string | null> {
    try {
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
}