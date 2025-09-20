import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowRightLeft, 
  Globe, 
  Send, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { wormholeNTTService, NTTTransferParams } from '@/services/wormholeNTTService';
import { toast } from 'sonner';

interface PhotoCard {
  id: string;
  idolName: string;
  concept: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  imageUrl: string;
  serialNo: number;
}

interface MultiChainTransferProps {
  photoCard: PhotoCard;
  onTransferComplete?: (result: any) => void;
}

export const MultiChainTransfer: React.FC<MultiChainTransferProps> = ({
  photoCard,
  onTransferComplete
}) => {
  const [selectedChain, setSelectedChain] = useState<number>(1);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [vaaInput, setVaaInput] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);

  const supportedChains = wormholeNTTService.getSupportedChains();
  const selectedChainInfo = wormholeNTTService.getChainInfo(selectedChain);

  const handleTransfer = async () => {
    if (!recipientAddress.trim()) {
      toast.error('수신자 주소를 입력해주세요.');
      return;
    }

    setIsTransferring(true);
    setTransferResult(null);

    try {
      const transferParams: NTTTransferParams = {
        tokenId: photoCard.id,
        destinationChain: selectedChain,
        recipientAddress: recipientAddress.trim(),
        amount: 1, // 포토카드는 항상 1개
      };

      const result = await wormholeNTTService.transferPhotoCard(transferParams);
      setTransferResult(result);

      if (result.success) {
        onTransferComplete?.(result);
      }
    } catch (error) {
      console.error('전송 실패:', error);
      toast.error('전송 중 오류가 발생했습니다.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleReceive = async () => {
    if (!vaaInput.trim()) {
      toast.error('VAA를 입력해주세요.');
      return;
    }

    setIsReceiving(true);

    try {
      const result = await wormholeNTTService.receivePhotoCard(vaaInput.trim());
      
      if (result.success) {
        toast.success('포토카드를 성공적으로 수신했습니다!');
        setVaaInput('');
      }
    } catch (error) {
      console.error('수신 실패:', error);
      toast.error('수신 중 오류가 발생했습니다.');
    } finally {
      setIsReceiving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다!');
    } catch (error) {
      toast.error('복사에 실패했습니다.');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'SR': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'R': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'N': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <Globe className="w-8 h-8" />
          멀티체인 전송
        </h2>
        <p className="text-muted-foreground">
          Wormhole NTT를 통해 포토카드를 다른 체인으로 전송하거나 수신하세요
        </p>
      </div>

      {/* 포토카드 정보 */}
      <Card className="p-6 glass-dark border-white/10">
        <div className="flex items-center gap-6">
          <div className="w-24 h-32 rounded-lg overflow-hidden bg-gradient-primary/20">
            <img
              src={photoCard.imageUrl}
              alt={`${photoCard.idolName} ${photoCard.concept}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold">{photoCard.idolName}</h3>
            <p className="text-muted-foreground">{photoCard.concept}</p>
            <div className="flex items-center gap-2">
              <Badge className={getRarityColor(photoCard.rarity)}>
                {photoCard.rarity}
              </Badge>
              <Badge variant="outline">
                #{photoCard.serialNo.toString().padStart(4, '0')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              ID: {photoCard.id}
            </p>
          </div>
        </div>
      </Card>

      {/* 전송/수신 탭 */}
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="send" className="data-[state=active]:bg-primary/20">
            <Send className="w-4 h-4 mr-2" />
            전송하기
          </TabsTrigger>
          <TabsTrigger value="receive" className="data-[state=active]:bg-primary/20">
            <Download className="w-4 h-4 mr-2" />
            수신하기
          </TabsTrigger>
        </TabsList>

        {/* 전송 탭 */}
        <TabsContent value="send" className="space-y-6 mt-6">
          <Card className="p-6 glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                다른 체인으로 전송
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination-chain">목적지 체인</Label>
                <Select value={selectedChain.toString()} onValueChange={(value) => setSelectedChain(parseInt(value))}>
                  <SelectTrigger className="bg-card/50 border-border">
                    <SelectValue placeholder="체인을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                    {supportedChains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{chain.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {chain.symbol}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-address">수신자 주소</Label>
                <Input
                  id="recipient-address"
                  placeholder={`${selectedChainInfo?.name} 주소를 입력하세요`}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-card/50 border-border"
                />
              </div>

              <div className="p-4 bg-card/30 rounded-lg">
                <h4 className="font-semibold mb-2">전송 정보</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>전송할 포토카드:</span>
                    <span className="font-medium">{photoCard.idolName} {photoCard.concept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>목적지 체인:</span>
                    <span className="font-medium">{selectedChainInfo?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>수량:</span>
                    <span className="font-medium">1개</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleTransfer}
                disabled={isTransferring || !recipientAddress.trim()}
                className="w-full btn-modern"
              >
                {isTransferring ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {selectedChainInfo?.name}으로 전송
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 전송 결과 */}
          {transferResult && (
            <Card className={`p-6 glass-dark border-white/10 ${
              transferResult.success ? 'border-green-500/50' : 'border-red-500/50'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  transferResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transferResult.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {transferResult.success ? '전송 성공!' : '전송 실패'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transferResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">트랜잭션 해시:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-card/50 px-2 py-1 rounded">
                          {transferResult.transactionDigest?.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transferResult.transactionDigest)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://suiexplorer.com/txblock/${transferResult.transactionDigest}?network=testnet`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {transferResult.sequenceNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">시퀀스 번호:</span>
                        <code className="text-xs bg-card/50 px-2 py-1 rounded">
                          {transferResult.sequenceNumber}
                        </code>
                      </div>
                    )}

                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-400">
                        포토카드가 성공적으로 {selectedChainInfo?.name}으로 전송되었습니다. 
                        VAA가 생성되면 목적지 체인에서 수신할 수 있습니다.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400">
                      전송 실패: {transferResult.error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 수신 탭 */}
        <TabsContent value="receive" className="space-y-6 mt-6">
          <Card className="p-6 glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                다른 체인에서 수신
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vaa-input">VAA (Verifiable Action Approval)</Label>
                <Input
                  id="vaa-input"
                  placeholder="VAA 데이터를 입력하세요"
                  value={vaaInput}
                  onChange={(e) => setVaaInput(e.target.value)}
                  className="bg-card/50 border-border"
                />
                <p className="text-xs text-muted-foreground">
                  다른 체인에서 전송된 포토카드의 VAA를 입력하세요.
                </p>
              </div>

              <Button
                onClick={handleReceive}
                disabled={isReceiving || !vaaInput.trim()}
                className="w-full btn-modern"
              >
                {isReceiving ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    수신 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    포토카드 수신
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="p-4 glass-dark border-accent/20 bg-accent/5">
            <div className="space-y-2">
              <h4 className="font-semibold text-accent flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                VAA란?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• VAA는 Wormhole에서 생성되는 검증 가능한 액션 승인입니다</li>
                <li>• 다른 체인에서 전송된 토큰을 수신하기 위해 필요합니다</li>
                <li>• 전송 후 몇 분 후에 VAA가 생성됩니다</li>
                <li>• Wormhole Explorer에서 VAA를 확인할 수 있습니다</li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiChainTransfer;
