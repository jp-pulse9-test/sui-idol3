import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageCircle, Heart } from 'lucide-react';
import { EmotionTracker } from './EmotionTracker';
import { PhotoCardReward } from './PhotoCardReward';
import { useEpisodeState } from '@/hooks/useEpisodeState';
import { Episode, StoryScene, Choice, HybridProfile, PhotoCard } from '@/types/episode';
import { useLanguage } from '@/contexts/LanguageContext';

interface EpisodeFlowProps {
  episode: Episode;
  hybridProfile: HybridProfile;
  onComplete?: (photoCard: PhotoCard) => void;
  onExit?: () => void;
  className?: string;
}

// Sample episode data following the 5-beat structure
const sampleEpisode: Episode = {
  id: 'daily-practice-1',
  title: '첫 번째 연습',
  description: '새로운 곡을 연습하며 아이돌과 함께하는 특별한 시간',
  isUnlocked: true,
  completedPaths: [],
  rewardCard: {
    episodeId: 'daily-practice-1',
    rarity: 'N',
    title: '첫 연습의 추억',
    image: '/api/placeholder/300/400',
    choicePath: '',
  },
  scenes: [
    {
      id: 'hook-1',
      beat: 'hook',
      turnNumber: 1,
      idolDialogue: {
        korean: '오늘 새로운 곡을 연습해볼까요? 조금 어려울 수도 있어요.',
        english: 'Shall we practice a new song today? It might be a bit challenging.',
      },
      choices: [
        {
          id: 'A',
          text: '천천히 차근차근 해봐요',
          emotionImpact: { type: '안정', weight: 1 },
          affinityBonus: 5,
          nextSceneId: 'engage-1a',
        },
        {
          id: 'B',
          text: '어려워도 도전해봐요!',
          emotionImpact: { type: '의지', weight: 2 },
          affinityBonus: 8,
          nextSceneId: 'engage-1b',
        },
      ],
    },
    {
      id: 'engage-1a',
      beat: 'engage',
      turnNumber: 2,
      idolDialogue: {
        korean: '좋아요, 천천히 기본기부터 다져봐요. 당신과 함께라면 든든해요.',
        english: 'Great, let\'s build up the basics slowly. I feel reassured with you.',
      },
      choices: [
        {
          id: 'A',
          text: '기본기가 정말 중요하죠',
          emotionImpact: { type: '안정', weight: 1 },
          affinityBonus: 3,
          nextSceneId: 'pivot-1',
        },
        {
          id: 'B',
          text: '같이 하니까 더 재미있어요',
          emotionImpact: { type: '기쁨', weight: 2 },
          affinityBonus: 6,
          nextSceneId: 'pivot-1',
        },
      ],
    },
    {
      id: 'engage-1b',
      beat: 'engage',
      turnNumber: 2,
      idolDialogue: {
        korean: '그런 마음가짐이 좋아요! 함께 열심히 해봐요.',
        english: 'I love that attitude! Let\'s work hard together.',
      },
      choices: [
        {
          id: 'A',
          text: '열정이 중요하죠!',
          emotionImpact: { type: '의지', weight: 1 },
          affinityBonus: 4,
          nextSceneId: 'pivot-1',
        },
        {
          id: 'B',
          text: '당신의 에너지가 좋아요',
          emotionImpact: { type: '설렘', weight: 2 },
          affinityBonus: 7,
          nextSceneId: 'pivot-1',
        },
      ],
    },
    {
      id: 'pivot-1',
      beat: 'pivot',
      turnNumber: 3,
      idolDialogue: {
        korean: '어? 이 부분이 생각보다 어렵네요... 어떻게 해야 할까요?',
        english: 'Oh? This part is harder than I thought... What should we do?',
      },
      choices: [
        {
          id: 'A',
          text: '잠시 쉬고 다시 해봐요',
          emotionImpact: { type: '안정', weight: 1 },
          affinityBonus: 4,
          nextSceneId: 'climax-1a',
        },
        {
          id: 'B',
          text: '포기하지 말고 계속 해봐요',
          emotionImpact: { type: '의지', weight: 2 },
          affinityBonus: 6,
          nextSceneId: 'climax-1b',
        },
      ],
    },
    {
      id: 'climax-1a',
      beat: 'climax',
      turnNumber: 4,
      idolDialogue: {
        korean: '좋은 생각이에요. 마음을 차분히 하니까 더 잘 되는 것 같아요.',
        english: 'That\'s a good idea. It seems to work better when I calm my mind.',
      },
      choices: [
        {
          id: 'A',
          text: '차분함이 힘이에요',
          emotionImpact: { type: '안정', weight: 2 },
          affinityBonus: 8,
          nextSceneId: 'wrap-1',
        },
      ],
    },
    {
      id: 'climax-1b',
      beat: 'climax',
      turnNumber: 4,
      idolDialogue: {
        korean: '맞아요! 포기하지 않는 마음이 중요하죠. 드디어 해냈어요!',
        english: 'Right! The spirit of not giving up is important. We finally did it!',
      },
      choices: [
        {
          id: 'A',
          text: '정말 대단해요!',
          emotionImpact: { type: '기쁨', weight: 2 },
          affinityBonus: 10,
          nextSceneId: 'wrap-1',
        },
      ],
    },
    {
      id: 'wrap-1',
      beat: 'wrap',
      turnNumber: 5,
      isEnding: true,
      idolDialogue: {
        korean: '오늘 연습 정말 즐거웠어요. 당신과 함께라서 더 의미 있었던 것 같아요.',
        english: 'Today\'s practice was really enjoyable. I think it was more meaningful because I was with you.',
      },
      choices: [
        {
          id: 'A',
          text: '저도 정말 즐거웠어요',
          emotionImpact: { type: '기쁨', weight: 2 },
          affinityBonus: 5,
        },
      ],
    },
  ],
};

export const EpisodeFlow: React.FC<EpisodeFlowProps> = ({
  episode = sampleEpisode,
  hybridProfile,
  onComplete,
  onExit,
  className = '',
}) => {
  const { language, t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [showReward, setShowReward] = useState(false);
  const [finalPhotoCard, setFinalPhotoCard] = useState<PhotoCard | null>(null);

  const {
    episodeState,
    gameHistory,
    makeChoice,
    completeEpisode,
    resetEpisode,
    getChoicePathString,
  } = useEpisodeState({
    initialSceneId: episode.scenes[0].id,
    hybridProfile,
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !episodeState.isCompleted) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, episodeState.isCompleted]);

  // Find current scene
  const currentScene = episode.scenes.find(scene => scene.id === episodeState.currentSceneId);

  const handleChoice = (choice: Choice) => {
    const nextScene = episode.scenes.find(scene => scene.id === choice.nextSceneId);
    const highlightText = currentScene?.idolDialogue.korean.slice(0, 15);
    
    makeChoice(choice, choice.nextSceneId, highlightText);

    // Check if episode is complete
    if (nextScene?.isEnding || episodeState.turnCount >= 8) {
      setTimeout(() => {
        completeEpisode();
        generatePhotoCard();
      }, 1000);
    }
  };

  const generatePhotoCard = () => {
    const choicePath = getChoicePathString();
    const rarity = determineRarity(episodeState.affinity, choicePath);
    
    const photoCard: PhotoCard = {
      id: `${episode.id}-${Date.now()}`,
      episodeId: episode.id,
      rarity,
      title: generateCardTitle(episodeState, hybridProfile),
      image: '/api/placeholder/300/400', // Would be generated based on moment
      momentHash: generateMomentHash(gameHistory),
      earnedAt: new Date(),
      choicePath,
    };

    setFinalPhotoCard(photoCard);
    setShowReward(true);
  };

  const determineRarity = (affinity: number, choicePath: string): 'N' | 'R' | 'SR' | 'SSR' => {
    const pathComplexity = new Set(choicePath.split('-')).size;
    
    if (affinity >= 90 && pathComplexity >= 3) return 'SSR';
    if (affinity >= 75 && pathComplexity >= 2) return 'SR';
    if (affinity >= 50) return 'R';
    return 'N';
  };

  const generateCardTitle = (state: typeof episodeState, profile: HybridProfile) => {
    const emotionSummary = state.emotionHistory.reduce((acc, emotion) => {
      acc[emotion.type] = (acc[emotion.type] || 0) + emotion.weight;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.entries(emotionSummary)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const emotionTitles = {
      '기쁨': '웃음이 가득한',
      '설렘': '두근거리는',
      '안정': '평온한',
      '의지': '열정적인',
      '불안': '조심스러운',
    };

    return `${emotionTitles[dominantEmotion as keyof typeof emotionTitles] || ''} ${episode.title}`;
  };

  const generateMomentHash = (history: typeof gameHistory) => {
    const dataString = JSON.stringify(history);
    // Simple hash generation (in production, use proper crypto)
    return btoa(dataString).slice(0, 16);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((episodeState.turnCount / 8) * 100, 100);

  if (!currentScene) {
    return (
      <Card className="p-6 text-center">
        <p>{t('episode.cannotLoad')}</p>
        <Button onClick={onExit} className="mt-4">
          {t('episode.goBack')}
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Episode Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{episode.title}</h2>
            <p className="text-sm text-muted-foreground">{episode.description}</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Badge variant="outline">
              {t('episode.turns').replace('{{count}}', episodeState.turnCount.toString())}
            </Badge>
          </div>
        </div>
        <Progress value={progressPercentage} className="mt-3" />
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Episode Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Scene */}
          <Card className="p-6">
            <div className="space-y-6">
              {/* Beat indicator */}
              <Badge variant="secondary" className="capitalize">
                {currentScene.beat} - {t('episode.turn').replace('{{number}}', currentScene.turnNumber.toString())}
              </Badge>

              {/* Idol Dialogue */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">
                        {language === 'en' ? currentScene.idolDialogue.english : currentScene.idolDialogue.korean}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choices */}
              {!episodeState.isCompleted && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('episode.pleaseChoose')}</span>
                  </div>
                  <div className="space-y-2">
                    {currentScene.choices.map((choice) => (
                      <Button
                        key={choice.id}
                        variant="outline"
                        onClick={() => handleChoice(choice)}
                        className="w-full justify-start text-left h-auto p-4 hover:bg-primary/10"
                      >
                        <div className="space-y-1">
                          <div>{language === 'en' && choice.textEn ? choice.textEn : choice.text}</div>
                          <div className="text-xs text-muted-foreground">
                            {t('episode.affinity')} {choice.affinityBonus > 0 ? '+' : ''}{choice.affinityBonus} | 
                            {t('episode.emotion')}: {choice.emotionImpact.type} ({choice.emotionImpact.weight > 0 ? '+' : ''}{choice.emotionImpact.weight})
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Episode Complete */}
              {episodeState.isCompleted && (
                <div className="text-center space-y-4 py-6">
                  <div className="text-lg font-semibold">{t('episode.completed')}</div>
                  <p className="text-muted-foreground">
                    {t('episode.savedAsPhotocard')}
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={() => setShowReward(true)}>
                      {t('episode.viewPhotocard')}
                    </Button>
                    <Button variant="outline" onClick={resetEpisode}>
                      {t('episode.replay')}
                    </Button>
                    <Button variant="ghost" onClick={onExit}>
                      {t('episode.exit')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <EmotionTracker episodeState={episodeState} />
        </div>
      </div>

      {/* Photo Card Reward Modal */}
      {finalPhotoCard && (
        <PhotoCardReward
          photoCard={finalPhotoCard}
          isOpen={showReward}
          onClose={() => setShowReward(false)}
          onSave={(card) => {
            onComplete?.(card);
            setShowReward(false);
          }}
        />
      )}
    </div>
  );
};