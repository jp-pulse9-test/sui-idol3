import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, Download, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/useWallet";

interface PhotocardVideoGeneratorProps {
  photocardId: string;
  photocardImageUrl: string;
  idolName: string;
  concept: string;
  rarity: string;
}

const VIDEO_GENERATION_COST_SUI = 0.15;

export function PhotocardVideoGenerator({
  photocardId,
  photocardImageUrl,
  idolName,
  concept,
  rarity
}: PhotocardVideoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { isConnected, balance } = useWallet();

  const handleGenerateVideo = async () => {
    if (!isConnected) {
      toast.error('지갑을 연결해주세요');
      return;
    }

    const currentBalance = parseFloat(balance);
    if (currentBalance < VIDEO_GENERATION_COST_SUI) {
      toast.error(`SUI가 부족합니다. 필요: ${VIDEO_GENERATION_COST_SUI} SUI, 보유: ${currentBalance} SUI`);
      return;
    }

    setIsGenerating(true);
    setShowDialog(true);

    try {
      // Call edge function to generate video
      const { data, error } = await supabase.functions.invoke('generate-photocard-video', {
        body: {
          photocardImageUrl,
          idolName,
          concept,
          prompt: null // Use default prompt
        }
      });

      if (error) throw error;

      if (!data || !data.videoUrl) {
        throw new Error('No video URL returned from generation');
      }

      setGeneratedVideoUrl(data.videoUrl);
      toast.success('🎬 비디오가 생성되었습니다!');

      // TODO: Record purchase in database (optional)
      // TODO: Deduct SUI from wallet (blockchain transaction)

    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('비디오 생성에 실패했습니다. 다시 시도해주세요.');
      setShowDialog(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;

    // Create a temporary link to download the video
    const link = document.createElement('a');
    link.href = generatedVideoUrl;
    link.download = `${idolName}_${concept}_video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('비디오 다운로드가 시작되었습니다');
  };

  return (
    <>
      <Button
        onClick={handleGenerateVideo}
        disabled={isGenerating || !isConnected}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Video className="w-4 h-4 mr-2" />
        비디오 생성 ({VIDEO_GENERATION_COST_SUI} SUI)
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>🎬 포토카드 비디오 생성</DialogTitle>
            <DialogDescription>
              AI가 포토카드를 짧은 비디오 클립으로 만들고 있습니다
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Photocard Info */}
              <div className="flex items-center gap-4">
                <img 
                  src={photocardImageUrl} 
                  alt={`${idolName} ${concept}`}
                  className="w-24 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{idolName}</h3>
                  <p className="text-sm text-muted-foreground">{concept}</p>
                  <Badge className="mt-2">{rarity}</Badge>
                </div>
              </div>

              {/* Generation Status */}
              {isGenerating && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <div>
                    <p className="font-medium">AI 비디오 생성 중...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Google Veo 3.1이 포토카드를 영상으로 변환하고 있습니다
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      약 30-60초 소요됩니다
                    </p>
                  </div>
                </div>
              )}

              {/* Generated Video */}
              {generatedVideoUrl && !isGenerating && (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video 
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadVideo}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      다운로드
                    </Button>
                    <Button
                      onClick={() => {
                        const video = document.querySelector('video');
                        if (video) {
                          video.currentTime = 0;
                          video.play();
                        }
                      }}
                      variant="outline"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      재생
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>✨ AI가 생성한 5초 비디오 클립</p>
                    <p className="text-xs mt-1">소셜 미디어에 공유하세요!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
