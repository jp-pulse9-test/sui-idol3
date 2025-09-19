import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Heart, Star, Zap } from 'lucide-react';

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'pick' | 'vault' | 'rise';
  onStartJourney: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ open, onOpenChange, type, onStartJourney }) => {
  const getPreviewContent = () => {
    switch (type) {
      case 'pick':
        return {
          title: '🎯 PICK 단계 미리보기',
          description: '당신만의 운명적 아이돌을 찾는 3단계 여정 (지갑 연결 불필요)',
          steps: [
            {
              step: '1단계',
              title: '성향 분석',
              description: '당신의 성격과 취향을 분석합니다',
              example: '외향형 → 화려한 무대를 좋아하는 아이돌 추천',
              icon: <Heart className="w-5 h-5" />
            },
            {
              step: '2단계', 
              title: '심쿵 배틀',
              description: '101명 중 끌리는 아이돌들을 선별합니다',
              example: '16강 → 8강 → 결승전으로 좁혀가기',
              icon: <Star className="w-5 h-5" />
            },
            {
              step: '3단계',
              title: '최애 선택',
              description: '분석 결과와 선호도를 종합해 최애를 결정합니다',
              example: '"밝고 에너지 넘치는 하루"와 95% 매칭!',
              icon: <Zap className="w-5 h-5" />
            }
          ]
        };
      
      case 'vault':
        return {
          title: '🗃️ VAULT 단계 미리보기',
          description: '최애와 함께하는 일상 스토리와 포토카드 수집 (지갑 연결 필요)',
          steps: [
            {
              step: '지갑연결',
              title: 'Sui 지갑 연결',
              description: '데이터 보관을 위한 지갑 연결이 필요합니다',
              example: '안전한 블록체인 기반 데이터 저장',
              icon: <Heart className="w-5 h-5" />
            },
            {
              step: '스토리앨범',
              title: '추억 포토카드 획득',
              description: '스토리 클리어 시 특별한 순간이 담긴 NFT 카드',
              example: 'SSR 등급 "첫 만남의 설렘" 포토카드 획득!',
              icon: <Star className="w-5 h-5" />
            },
            {
              step: '추억보관',
              title: '나만의 비밀 금고',
              description: '수집한 모든 추억을 안전하게 보관',
              example: '현재 12장 보유 (N:8장, R:3장, SR:1장)',
              icon: <Zap className="w-5 h-5" />
            }
          ]
        };
      
      case 'rise':
        return {
          title: '📈 RISE 단계 미리보기',
          description: '최애의 데뷔와 성장을 함께 체감하는 특별한 여정 (지갑 연결 필요)',
          steps: [
            {
              step: '피어멘토링',
              title: '함께 성장하기',
              description: '다양한 활동을 통해 최애와 함께 발전합니다',
              example: '신곡 발매, 팬미팅, 콘서트 등 특별한 순간들',
              icon: <Heart className="w-5 h-5" />
            },
            {
              step: '추억생성',
              title: '특별한 순간들',
              description: '중요한 이정표마다 새로운 추억을 만듭니다',
              example: '"첫 1위 달성!" 특별한 순간 기록',
              icon: <Star className="w-5 h-5" />
            },
            {
              step: '스토리앨범',
              title: '성장 스토리 완성',
              description: '모든 추억이 담긴 완전한 스토리를 완성합니다',
              example: '데뷔부터 현재까지의 완전한 성장 스토리',
              icon: <Zap className="w-5 h-5" />
            }
          ]
        };
      
      default:
        return null;
    }
  };

  const content = getPreviewContent();
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {content.steps.map((step, index) => (
            <Card key={index} className="border border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {step.step}
                      </Badge>
                      <h3 className="font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                    <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary/30">
                      <p className="text-sm font-medium text-primary">
                        예시: {step.example}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button 
            onClick={onStartJourney}
            className="bg-gradient-primary hover:bg-gradient-secondary text-white font-semibold"
          >
            지금 시작하기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;