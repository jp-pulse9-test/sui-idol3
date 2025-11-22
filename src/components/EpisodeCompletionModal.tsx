import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Trophy, Download, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EpisodeCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: {
    title: string;
    category: string;
  };
  idol: {
    name: string;
    image: string;
  };
  result: {
    turns: number;
    memoryCards: number;
    images: string[];
    vriReward: number;
  };
}

export const EpisodeCompletionModal: React.FC<EpisodeCompletionModalProps> = ({
  isOpen,
  onClose,
  episode,
  idol,
  result
}) => {
  const { language, t } = useLanguage();

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `memory-card-${index + 1}.png`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10 border-purple-500/30">
        {/* Header */}
        <div className="text-center space-y-4 py-6">
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="w-20 h-20 text-yellow-500 animate-bounce" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold gradient-text">
            {language === 'en' ? '🎉 Episode Complete!' : '🎉 에피소드 완료!'}
          </h2>
          
          <p className="text-muted-foreground">
            {language === 'en' 
              ? `You've completed "${episode.title}" with ${idol.name}!`
              : `${idol.name}와 함께 "${episode.title}"을(를) 완료했어요!`
            }
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 my-6">
          <Card className="p-4 text-center bg-card/50 border-primary/30">
            <div className="text-2xl font-bold text-primary mb-1">{result.turns}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'en' ? 'Turns' : '턴'}
            </div>
          </Card>
          
          <Card className="p-4 text-center bg-card/50 border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400 mb-1">{result.memoryCards}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'en' ? 'Memory Cards' : '메모리 카드'}
            </div>
          </Card>
          
          <Card className="p-4 text-center bg-card/50 border-pink-500/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="w-4 h-4 text-pink-500" />
              <div className="text-2xl font-bold text-pink-400">+{result.vriReward}</div>
            </div>
            <div className="text-xs text-muted-foreground">VRI</div>
          </Card>
        </div>

        {/* Memory Cards Gallery */}
        {result.images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold">
                {language === 'en' ? 'Memory Cards Collected' : '수집한 메모리 카드'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.images.map((imageUrl, index) => (
                <div key={index} className="group relative">
                  <Card className="overflow-hidden border-2 border-purple-500/30 hover:border-purple-500/50 transition-all">
                    <img 
                      src={imageUrl} 
                      alt={`Memory Card ${index + 1}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(imageUrl, index)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Download' : '다운로드'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          navigator.share?.({
                            title: `Memory Card from ${episode.title}`,
                            text: `Check out this moment with ${idol.name}!`,
                            url: imageUrl
                          });
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Share' : '공유'}
                      </Button>
                    </div>
                  </Card>
                  <div className="text-center mt-2">
                    <Badge variant="outline" className="text-xs">
                      {language === 'en' ? `Card ${index + 1}` : `카드 ${index + 1}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {language === 'en' ? 'Continue' : '계속하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpisodeCompletionModal;
