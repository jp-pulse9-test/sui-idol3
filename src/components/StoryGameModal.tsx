import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface StoryChoice {
  id: string;
  text: string;
  result: string;
  nextSceneId?: string;
  nftReward?: string;
}

interface StoryScene {
  id: string;
  title: string;
  content: string;
  choices: StoryChoice[];
  isEnding?: boolean;
  nftReward?: string;
}

interface StoryScenario {
  id: string;
  title: string;
  description: string;
  location: string;
  emoji: string;
  unlocked: boolean;
  progress: number;
  scenes: StoryScene[];
  category: 'daily' | 'debut' | 'special';
  difficulty: 'easy' | 'normal' | 'hard';
  estimatedTime: string;
}

interface StoryGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: StoryScenario | null;
  idolName: string;
}

const StoryGameModal: React.FC<StoryGameModalProps> = ({ isOpen, onClose, scenario, idolName }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'result' | 'completed'>('playing');
  const [choiceResult, setChoiceResult] = useState<string>('');
  const [collectedNFTs, setCollectedNFTs] = useState<string[]>([]);

  if (!scenario) return null;

  const currentScene = scenario.scenes[currentSceneIndex];
  const progress = ((currentSceneIndex + 1) / scenario.scenes.length) * 100;

  const handleChoiceSelect = (choice: StoryChoice) => {
    setChoiceResult(choice.result);
    setGameState('result');

    // NFT 리워드 처리
    if (choice.nftReward) {
      setCollectedNFTs(prev => [...prev, choice.nftReward!]);
      toast.success(`🎁 ${getNFTName(choice.nftReward)} 획득!`);
    }

    // 다음 씬으로 이동 또는 완료
    setTimeout(() => {
      if (choice.nextSceneId) {
        const nextSceneIndex = scenario.scenes.findIndex(scene => scene.id === choice.nextSceneId);
        if (nextSceneIndex !== -1) {
          setCurrentSceneIndex(nextSceneIndex);
          setGameState('playing');
          setChoiceResult('');
        }
      } else if (currentScene.isEnding) {
        setGameState('completed');
      } else {
        // 다음 씬으로 순차 이동
        if (currentSceneIndex < scenario.scenes.length - 1) {
          setCurrentSceneIndex(currentSceneIndex + 1);
          setGameState('playing');
          setChoiceResult('');
        } else {
          setGameState('completed');
        }
      }
    }, 2000);
  };

  const getNFTName = (nftId: string): string => {
    const nftNames: { [key: string]: string } = {
      'first_meeting_photocard': '첫 만남 기념 포토카드',
      'practice_behind_photocard': '연습실 비하인드 포토카드',
      'debut_special_badge': '데뷔 기념 Rookie 뱃지'
    };
    return nftNames[nftId] || '특별한 포토카드';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'normal': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily': return '📅';
      case 'debut': return '🌟';
      case 'special': return '💎';
      default: return '📖';
    }
  };

  const resetGame = () => {
    setCurrentSceneIndex(0);
    setGameState('playing');
    setChoiceResult('');
    setCollectedNFTs([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{scenario.emoji}</span>
            <div>
              <h2 className="text-xl font-bold">{scenario.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getDifficultyColor(scenario.difficulty)} text-white`}>
                  {scenario.difficulty.toUpperCase()}
                </Badge>
                <Badge variant="secondary">
                  {getCategoryIcon(scenario.category)} {scenario.category}
                </Badge>
                <Badge variant="outline">⏱️ {scenario.estimatedTime}</Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {gameState === 'playing' && (
            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-primary">{currentScene.title}</h3>
                  <Badge variant="secondary" className="mt-2">
                    📍 {scenario.location}
                  </Badge>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {currentScene.content}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-center">어떻게 하시겠습니까?</h4>
                <div className="grid gap-3">
                  {currentScene.choices.map((choice, index) => (
                    <Button
                      key={choice.id}
                      onClick={() => handleChoiceSelect(choice)}
                      variant="outline"
                      className="p-4 h-auto text-left justify-start hover:bg-primary/10 transition-all duration-200"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mr-3">
                        {index + 1}
                      </span>
                      {choice.text}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {gameState === 'result' && (
            <Card className="p-6 text-center space-y-4">
              <div className="text-6xl">✨</div>
              <h3 className="text-lg font-bold text-primary">결과</h3>
              <p className="text-foreground">{choiceResult}</p>
              <div className="text-sm text-muted-foreground">
                다음 장면으로 이동 중...
              </div>
            </Card>
          )}

          {gameState === 'completed' && (
            <Card className="p-6 text-center space-y-6">
              <div className="text-6xl">🎉</div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">스토리 완료!</h3>
                <p className="text-muted-foreground">
                  {idolName}과의 특별한 시간이 끝났습니다.
                </p>
              </div>

              {collectedNFTs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">🎁 획득한 아이템</h4>
                  <div className="grid gap-2">
                    {collectedNFTs.map((nft, index) => (
                      <Badge key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2">
                        💎 {getNFTName(nft)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={resetGame} variant="outline">
                  다시 플레이
                </Button>
                <Button onClick={onClose} variant="default">
                  완료
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryGameModal;