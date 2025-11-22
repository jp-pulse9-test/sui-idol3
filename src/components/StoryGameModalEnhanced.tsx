import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EpisodeFlow } from "@/components/EpisodeFlow";
import { Scene, HybridProfile, EpisodeState, PhotoCard as EpisodePhotoCard } from "@/types/episode";
import { Heart, Clock, Star, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StoryEpisode {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  turns: number;
  unlocked: boolean;
  completed: boolean;
  scenes: Scene[];
}

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
  persona_prompt: string;
}

interface MemoryCard {
  id: string;
  episodeId: string;
  title: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  image: string;
  earnedAt: Date;
}

interface StoryGameModalProps {
  episode: StoryEpisode;
  selectedIdol: SelectedIdol;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (memoryCard: MemoryCard) => void;
}

const StoryGameModalEnhanced = ({ 
  episode, 
  selectedIdol, 
  isOpen, 
  onClose, 
  onComplete 
}: StoryGameModalProps) => {
  const { language, t } = useLanguage();
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'completing'>('intro');
  const [episodeProgress, setEpisodeProgress] = useState(0);

  // Create hybrid profile based on selected idol
  const hybridProfile: HybridProfile = {
    animalType: 'cat', // Default for now, should come from idol selection
    bodyType: 'balanced',
    vibe: 'lovely',
    talent: 'vocal'
  };

  // Create initial scene based on episode
  const initialScene: Scene = {
    id: "hook",
    beatType: "hook",
    content: `안녕! 나 ${selectedIdol.name}이야. ${episode.description} 함께 이 시간을 보내볼까?`,
    contentEn: `Hi! I'm ${selectedIdol.name}. ${episode.description} Shall we spend this time together?`,
    choices: [
      {
        id: "start_episode",
        text: "응, 함께하자!",
        textEn: "Yes, let's do it together!",
        nextSceneId: "engage",
        affinityBonus: 10,
        emotionImpact: { type: "설렘", weight: 2 },
        requiresProfile: []
      },
      {
        id: "start_shy",
        text: "조금 떨리지만... 괜찮을까?",
        textEn: "I'm a bit nervous... will it be okay?",
        nextSceneId: "engage_support",
        affinityBonus: 8,
        emotionImpact: { type: "불안", weight: 1 },
        requiresProfile: []
      }
    ],
    ambiance: {
      mood: "excited",
      setting: "meeting_room",
      timeOfDay: "afternoon"
    }
  };

  const handleEpisodeComplete = (photoCard: EpisodePhotoCard) => {
    setGamePhase('completing');
    
    // Convert PhotoCard rarity to determine affinity score
    const rarityToAffinity = {
      'N': 40,
      'R': 60,
      'SR': 80,
      'SSR': 95
    };

    const estimatedAffinity = rarityToAffinity[photoCard.rarity] || 50;
    
    // Generate memory card based on episode completion
    setTimeout(() => {
      const memoryCard: MemoryCard = {
        id: photoCard.id,
        episodeId: photoCard.episodeId,
        title: photoCard.title,
        rarity: photoCard.rarity,
        image: photoCard.image,
        earnedAt: photoCard.earnedAt
      };

      onComplete(memoryCard);
    }, 2000);
  };

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return { color: 'text-green-400', icon: '⭐', description: t('story.difficulty.easy') };
      case 'Normal':
        return { color: 'text-blue-400', icon: '⭐⭐', description: t('story.difficulty.normal') };
      case 'Hard':
        return { color: 'text-purple-400', icon: '⭐⭐⭐', description: t('story.difficulty.hard') };
      case 'Expert':
        return { color: 'text-red-400', icon: '⭐⭐⭐⭐', description: t('story.difficulty.expert') };
      default:
        return { color: 'text-gray-400', icon: '⭐', description: t('story.difficulty.unknown') };
    }
  };

  const difficultyInfo = getDifficultyInfo(episode.difficulty);

  if (gamePhase === 'playing') {
    // Convert StoryEpisode to Episode format for EpisodeFlow
    const episodeForFlow = {
      id: episode.id,
      title: episode.title,
      description: episode.description,
      scenes: episode.scenes.map(scene => ({
        id: scene.id,
        beat: scene.beatType || 'engage' as const,
        turnNumber: scene.choices.length > 0 ? 1 : 0,
        idolDialogue: {
          korean: scene.content,
          english: scene.contentEn || scene.content,
        },
        choices: scene.choices,
        isEnding: scene.choices.length === 0,
      })),
      isUnlocked: episode.unlocked,
      completedPaths: [],
      rewardCard: {
        episodeId: episode.id,
        rarity: 'N' as const,
        title: episode.title,
        image: selectedIdol.image,
        choicePath: '',
      },
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto p-6 bg-card/95 backdrop-blur-md border-border">
          <EpisodeFlow
            episode={episodeForFlow}
            hybridProfile={hybridProfile}
            onComplete={handleEpisodeComplete}
            onExit={onClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (gamePhase === 'completing') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md border-border">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text">
              {t('story.completing.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden animate-pulse">
                <img 
                  src={selectedIdol.image} 
                  alt={selectedIdol.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">{t('story.completing.withIdol').replace('{{name}}', selectedIdol.name)}</h3>
              <p className="text-muted-foreground">
                {t('story.completing.converting')}
              </p>
              <Progress value={episodeProgress} className="w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md border-border">
        <DialogHeader>
          <DialogTitle className="gradient-text text-2xl">
            📖 {episode.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Episode Info */}
          <Card className="p-6 glass-dark border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src={selectedIdol.image} 
                    alt={selectedIdol.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{t('story.intro.specialTime').replace('{{name}}', selectedIdol.name)}</h3>
                  <p className="text-sm text-muted-foreground">{episode.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{t('story.intro.turns').replace('{{count}}', episode.turns.toString())}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('story.intro.estimatedTime')}</p>
                </div>
                
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Star className={`w-4 h-4 ${difficultyInfo.color}`} />
                    <span className={`text-sm font-semibold ${difficultyInfo.color}`}>
                      {episode.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{difficultyInfo.description}</p>
                </div>
                
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-accent">{episode.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('story.intro.category')}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Expected Rewards */}
          <Card className="p-4 glass-dark border-primary/20 bg-primary/5">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {t('story.intro.expectedRewards')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold">{t('story.intro.memoryCard')}</div>
                  <div className="text-muted-foreground">{t('story.intro.rarityByAffinity')}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">{t('story.intro.expAndAffinity')}</div>
                  <div className="text-muted-foreground">{t('story.intro.growthByChoice')}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-primary/20">
                <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ 
                  __html: t('story.intro.tip')
                }} />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('story.intro.later')}
            </Button>
            <Button
              onClick={() => setGamePhase('playing')}
              className="flex-1 bg-gradient-primary hover:bg-gradient-secondary"
            >
              {t('story.intro.start')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryGameModalEnhanced;
