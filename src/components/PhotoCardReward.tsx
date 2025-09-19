import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Download, Share2, Eye } from 'lucide-react';
import { PhotoCard } from '@/types/episode';

interface PhotoCardRewardProps {
  photoCard: PhotoCard;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (card: PhotoCard) => void;
  className?: string;
}

const rarityStyles = {
  N: {
    border: 'border-gray-400',
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
    glow: 'shadow-gray-200',
    text: 'text-gray-700',
  },
  R: {
    border: 'border-blue-400',
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    glow: 'shadow-blue-200',
    text: 'text-blue-700',
  },
  SR: {
    border: 'border-purple-400',
    bg: 'bg-gradient-to-br from-purple-100 to-purple-200',
    glow: 'shadow-purple-200',
    text: 'text-purple-700',
  },
  SSR: {
    border: 'border-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    glow: 'shadow-yellow-200',
    text: 'text-yellow-700',
  },
};

const rarityNames = {
  N: 'Normal',
  R: 'Rare',
  SR: 'Super Rare',
  SSR: 'Super Special Rare',
};

export const PhotoCardReward: React.FC<PhotoCardRewardProps> = ({
  photoCard,
  isOpen,
  onClose,
  onSave,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const style = rarityStyles[photoCard.rarity];

  const handleReveal = () => {
    setIsRevealed(true);
    setTimeout(() => setIsFlipped(true), 300);
  };

  const handleSave = () => {
    onSave?.(photoCard);
    onClose();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <div className={`space-y-6 ${className}`}>
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold">포토카드 획득!</h2>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              특별한 순간이 포토카드로 기록되었습니다
            </p>
          </div>

          {/* Card Container */}
          <div className="relative mx-auto w-64 h-80 perspective-1000">
            <div
              className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Card Back (Hidden) */}
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <Card className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400">
                  <div className="text-center text-white space-y-4">
                    <Sparkles className="w-12 h-12 mx-auto animate-pulse" />
                    {!isRevealed && (
                      <Button
                        onClick={handleReveal}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        카드 뒤집기
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Card Front */}
              <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
                <Card className={`w-full h-full ${style.border} border-2 ${style.bg} ${style.glow} shadow-lg overflow-hidden`}>
                  <div className="relative h-full flex flex-col">
                    {/* Rarity Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className={`${style.text} bg-white/80`}>
                        {photoCard.rarity}
                      </Badge>
                    </div>

                    {/* Card Image */}
                    <div className="flex-1 relative overflow-hidden">
                      <img
                        src={photoCard.image}
                        alt={photoCard.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    {/* Card Info */}
                    <div className="p-3 bg-white/90 space-y-2">
                      <h3 className="font-semibold text-sm leading-tight">
                        {photoCard.title}
                      </h3>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>경로: {photoCard.choicePath}</div>
                        <div>{formatDate(photoCard.earnedAt)}</div>
                      </div>

                      <div className="text-xs">
                        <Badge variant="outline" className={style.text}>
                          {rarityNames[photoCard.rarity]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Rarity Description */}
          {isFlipped && (
            <div className={`text-center p-3 rounded-lg ${style.bg} animate-fade-in`}>
              <p className={`text-sm ${style.text} font-medium`}>
                {photoCard.rarity === 'SSR' && '✨ 극히 드문 순간이 담긴 특별한 카드입니다!'}
                {photoCard.rarity === 'SR' && '🌟 특별한 순간이 담긴 귀한 카드입니다!'}
                {photoCard.rarity === 'R' && '💎 소중한 순간이 담긴 카드입니다!'}
                {photoCard.rarity === 'N' && '📸 일상의 아름다운 순간이 담긴 카드입니다!'}
              </p>
            </div>
          )}

          {/* Actions */}
          {isFlipped && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  컬렉션에 저장
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  공유하기
                </Button>
              </div>
              
              <Button variant="ghost" onClick={onClose} className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                컬렉션 보러가기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};