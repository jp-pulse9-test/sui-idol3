/**
 * Walrus Cross-Chain Uploader Component
 *
 * Allows users to upload files to Walrus from any supported blockchain
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { SUPPORTED_CHAINS, SupportedChain } from '../types/crosschain';
import { walrusCrossChainSDK, WalrusCrossChainOperation } from '../services/walrusCrossChainSDK';
import { Upload, Zap, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface WalrusCrossChainUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (blobId: string) => void;
}

export const WalrusCrossChainUploader: React.FC<WalrusCrossChainUploaderProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storageEpochs, setStorageEpochs] = useState(5);
  const [userBudget, setUserBudget] = useState('');
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [operation, setOperation] = useState<WalrusCrossChainOperation | null>(null);

  useEffect(() => {
    if (selectedChain && selectedFile) {
      estimateCost();
    }
  }, [selectedChain, selectedFile, storageEpochs]);

  const estimateCost = async () => {
    if (!selectedChain || !selectedFile) return;

    try {
      const estimate = await walrusCrossChainSDK.getCostEstimate({
        sourceChain: selectedChain,
        sourceAddress: walletAddress || '0x0',
        fileSizeKB: Math.ceil(selectedFile.size / 1024),
        storageEpochs,
        deletable: false,
        userBudget: userBudget || undefined,
      });

      setCostEstimate(estimate);
    } catch (error) {
      console.error('Failed to estimate cost:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedChain || !selectedFile || !walletAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!costEstimate || !costEstimate.withinBudget) {
      toast.error('Cost exceeds budget or estimation failed');
      return;
    }

    setIsUploading(true);

    try {
      const fileData = await selectedFile.arrayBuffer();

      const op = await walrusCrossChainSDK.storeFromChain(
        {
          sourceChain: selectedChain,
          sourceAddress: walletAddress,
          fileSizeKB: Math.ceil(selectedFile.size / 1024),
          storageEpochs,
          deletable: false,
          userBudget: userBudget || undefined,
        },
        new Uint8Array(fileData)
      );

      setOperation(op);

      if (op.status === 'completed' && op.blobId) {
        toast.success('File uploaded to Walrus!');
        onSuccess?.(op.blobId);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'quoting': return 20;
      case 'bridging': return 40;
      case 'swapping': return 60;
      case 'storing': return 80;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Cross-Chain Walrus Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chain Selection */}
          <div className="space-y-2">
            <Label>Source Blockchain</Label>
            <Select onValueChange={(value) => {
              const chain = SUPPORTED_CHAINS.find(c => c.id === value);
              setSelectedChain(chain || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    <div className="flex items-center gap-2">
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {chain.symbol}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <Input
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label>File to Upload</Label>
            <Input
              type="file"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.txt"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                {selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Storage Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Storage Epochs</Label>
              <Input
                type="number"
                value={storageEpochs}
                onChange={(e) => setStorageEpochs(parseInt(e.target.value) || 5)}
                min={1}
                max={100}
              />
              <p className="text-xs text-muted-foreground">
                ~{Math.ceil(storageEpochs * 24 / 30)} days
              </p>
            </div>

            <div className="space-y-2">
              <Label>Budget (optional)</Label>
              <Input
                placeholder={selectedChain ? `Max ${selectedChain.symbol}` : 'Max amount'}
                value={userBudget}
                onChange={(e) => setUserBudget(e.target.value)}
              />
            </div>
          </div>

          {/* Cost Estimate */}
          {costEstimate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cost Estimate</CardTitle>
                <CardDescription>
                  Estimated costs for cross-chain upload
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Storage (WAL)</p>
                    <p className="font-semibold">{costEstimate.walrusStorage.walTokens} WAL</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Storage (SUI)</p>
                    <p className="font-semibold">{costEstimate.walrusStorage.suiTokens} SUI</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bridge Fee</p>
                    <p className="font-semibold">${costEstimate.bridgeFeeUSD}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gas Costs</p>
                    <p className="font-semibold">
                      {costEstimate.sourceChainGas} {selectedChain?.symbol}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {costEstimate.totalSourceTokenNeeded} {selectedChain?.symbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ ${costEstimate.totalUSD} USD
                      </p>
                    </div>
                  </div>

                  {!costEstimate.withinBudget && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                      <p className="text-sm text-red-500">
                        ⚠️ Cost exceeds budget ceiling
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operation Status */}
          {operation && isUploading && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(operation.status)}
                  {operation.currentStep}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={getProgressValue(operation.status)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Status: {operation.status}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                !selectedChain ||
                !walletAddress ||
                !selectedFile ||
                isUploading ||
                (costEstimate && !costEstimate.withinBudget)
              }
              className="flex-1"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Upload to Walrus</>
              )}
            </Button>
          </div>

          {/* Info */}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>How it works:</strong>
                <br />
                1. Bridge tokens from {selectedChain?.name || 'your chain'} to Sui via Wormhole
                <br />
                2. Auto-swap to SUI/WAL on Sui DEXes
                <br />
                3. Store file on Walrus decentralized storage
                <br />
                4. Receive verifiable proof for origin chain
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
