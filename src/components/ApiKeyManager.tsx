import React, { useState, useEffect } from 'react';
import { ApiKeyService } from '@/services/apiKeyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, Eye, EyeOff } from 'lucide-react';

interface ApiKeyManagerProps {
  walletAddress: string;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ walletAddress }) => {
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingApiKey();
  }, [walletAddress]);

  const checkExistingApiKey = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const hasKey = await ApiKeyService.hasApiKey(walletAddress);
      setHasExistingKey(hasKey);

      if (hasKey) {
        // For security, we don't retrieve the actual key
        // Instead, show a masked version to indicate a key exists
        setApiKey('•••••••••••••••••••••••••••••••••••••••');
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await ApiKeyService.saveApiKey(walletAddress, apiKey);
      if (result) {
        toast({
          title: "Success",
          description: hasExistingKey ? "API key updated successfully" : "API key saved successfully",
        });
        setHasExistingKey(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    setIsLoading(true);
    try {
      const success = await ApiKeyService.deleteApiKey(walletAddress);
      if (success) {
        toast({
          title: "Success",
          description: "API key deleted successfully",
        });
        setApiKey('');
        setHasExistingKey(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-dark">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold gradient-text mb-2">Gemini API Key Management</h3>
          <p className="text-sm text-gray-400">
            {hasExistingKey
              ? "Your API key is securely stored in Supabase"
              : "Enter your Gemini API key to enable AI features"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSaveApiKey}
            disabled={isLoading || !apiKey.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {hasExistingKey ? 'Update' : 'Save'} API Key
          </Button>

          {hasExistingKey && (
            <Button
              onClick={handleDeleteApiKey}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};