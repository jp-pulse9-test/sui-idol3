import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Save, Trash2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { GeminiKeyService } from '@/services/geminiKeyService';
import { toast } from 'sonner';

interface GeminiKeyManagerProps {
  walletAddress: string;
}

export const GeminiKeyManager: React.FC<GeminiKeyManagerProps> = ({ walletAddress }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);

  useEffect(() => {
    checkExistingKey();
  }, [walletAddress]);

  const checkExistingKey = async () => {
    const exists = await GeminiKeyService.hasGeminiKey(walletAddress);
    setHasKey(exists);
    
    if (exists) {
      const masked = await GeminiKeyService.getMaskedKey(walletAddress);
      setMaskedKey(masked);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      toast.error('Invalid Gemini API key format. Keys should start with "AIza"');
      return;
    }

    setIsLoading(true);
    try {
      const success = await GeminiKeyService.saveGeminiKey(walletAddress, apiKey);
      
      if (success) {
        toast.success('✨ Gemini API key saved successfully!');
        setApiKey('');
        setShowKey(false);
        await checkExistingKey();
      } else {
        toast.error('Failed to save API key. Please try again.');
      }
    } catch (error) {
      console.error('Error saving key:', error);
      toast.error('An error occurred while saving the key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your Gemini API key? This will revert to using Lovable AI for image generation.')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await GeminiKeyService.deleteGeminiKey(walletAddress);
      
      if (success) {
        toast.success('Gemini API key deleted successfully');
        setHasKey(false);
        setMaskedKey(null);
        setApiKey('');
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error('An error occurred while deleting the key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-dark p-6 border-purple-500/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-white">Personal Gemini API Key</h3>
          </div>
          {hasKey && (
            <div className="flex items-center space-x-2 text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Active</span>
            </div>
          )}
        </div>

        {hasKey ? (
          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Current Key:</p>
              <p className="font-mono text-white">{maskedKey}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setHasKey(false);
                  setMaskedKey(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Update Key
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Using your personal Gemini API key. Costs are billed directly to your Google Cloud account.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key (AIza...)"
                className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading || !apiKey.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save API Key'}
            </Button>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300 leading-relaxed">
                💡 <strong>Optional:</strong> Add your personal Gemini API key to use your own Google Cloud billing instead of Lovable AI credits for image generation.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
