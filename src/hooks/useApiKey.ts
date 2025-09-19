import { useState, useEffect } from 'react';
import { ApiKeyService } from '@/services/apiKeyService';

export const useApiKey = (walletAddress: string | null) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchApiKey();
    } else {
      setApiKey(null);
    }
  }, [walletAddress]);

  const fetchApiKey = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const key = await ApiKeyService.getApiKey(walletAddress);
      setApiKey(key);
    } catch (err) {
      setError('Failed to fetch API key');
      console.error('Error fetching API key:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async (newApiKey: string) => {
    if (!walletAddress) {
      setError('No wallet connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await ApiKeyService.saveApiKey(walletAddress, newApiKey);
      if (result) {
        setApiKey(newApiKey);
        return true;
      }
      setError('Failed to save API key');
      return false;
    } catch (err) {
      setError('Error saving API key');
      console.error('Error saving API key:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async () => {
    if (!walletAddress) {
      setError('No wallet connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await ApiKeyService.deleteApiKey(walletAddress);
      if (success) {
        setApiKey(null);
        return true;
      }
      setError('Failed to delete API key');
      return false;
    } catch (err) {
      setError('Error deleting API key');
      console.error('Error deleting API key:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiKey,
    isLoading,
    error,
    saveApiKey,
    deleteApiKey,
    refetch: fetchApiKey,
  };
};