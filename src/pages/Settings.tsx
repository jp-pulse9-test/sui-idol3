import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Settings as SettingsIcon, Key, Shield, Info } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const walletAddress = localStorage.getItem('walletAddress');

  useEffect(() => {
    if (!walletAddress) {
      navigate('/');
    }
  }, [walletAddress, navigate]);

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold gradient-text flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8" />
            Settings
          </h1>
          <div className="w-20" />
        </div>

        {/* Wallet Info Card */}
        <Card className="glass-dark p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Wallet Information</h2>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Connected Wallet Address</p>
            <p className="font-mono text-sm text-white/80 break-all bg-white/5 p-3 rounded-lg">
              {walletAddress}
            </p>
          </div>
        </Card>

        {/* API Key Management */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Key className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">API Configuration</h2>
          </div>
          <ApiKeyManager walletAddress={walletAddress} />
        </div>

        {/* Info Card */}
        <Card className="glass-dark p-6 border-purple-500/20">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-white">About Gemini API Key</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your Gemini API key enables AI-powered features in Sui:AIdol³.
                The key is securely stored in Supabase and encrypted for your protection.
              </p>
              <div className="pt-2">
                <p className="text-sm text-gray-400 mb-2">How to get your API key:</p>
                <ol className="text-sm text-gray-400 space-y-1 ml-4">
                  <li>1. Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Google AI Studio</a></li>
                  <li>2. Sign in with your Google account</li>
                  <li>3. Click "Create API Key"</li>
                  <li>4. Copy and paste the key above</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Settings (placeholder for future features) */}
        <Card className="glass-dark p-6">
          <h3 className="font-semibold text-white mb-4">More Settings Coming Soon</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-50">
              <span className="text-gray-400">Notification Preferences</span>
              <span className="text-xs text-gray-500">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-50">
              <span className="text-gray-400">Language Settings</span>
              <span className="text-xs text-gray-500">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-50">
              <span className="text-gray-400">Privacy Settings</span>
              <span className="text-xs text-gray-500">Coming Soon</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;