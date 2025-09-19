import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EpisodeFlow } from "@/components/EpisodeFlow";
import { Scene, HybridProfile, EpisodeState } from "@/types/episode";
import { Heart, Clock, Star, Target } from "lucide-react";

interface StoryEpisode {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  turns: number;
  unlocked: boolean;
  completed: boolean;
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

export const StoryGameModalEnhanced = ({ 
  episode, 
  selectedIdol, 
  isOpen, 
  onClose, 
  onComplete 
}: StoryGameModalProps) => {
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

  const handleEpisodeComplete = (finalState: EpisodeState) => {
    setGamePhase('completing');
    
    // Generate memory card based on episode completion
    setTimeout(() => {
      const rarityRoll = Math.random();
      let rarity: 'N' | 'R' | 'SR' | 'SSR' = 'N';
      
      // Rarity based on affinity and choices
      if (finalState.affinity >= 80) {
        rarity = rarityRoll < 0.1 ? 'SSR' : rarityRoll < 0.3 ? 'SR' : 'R';
      } else if (finalState.affinity >= 60) {
        rarity = rarityRoll < 0.05 ? 'SSR' : rarityRoll < 0.2 ? 'SR' : 'R';
      } else if (finalState.affinity >= 40) {
        rarity = rarityRoll < 0.15 ? 'SR' : 'R';
      }

      const memoryCard: MemoryCard = {
        id: `memory_${Date.now()}`,
        episodeId: episode.id,
        title: `${selectedIdol.name} - ${episode.title}`,
        rarity: rarity,
        image: selectedIdol.image,
        earnedAt: new Date()
      };

      onComplete(memoryCard);
    }, 2000);
  };

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return { color: 'text-green-400', icon: '⭐', description: '쉬운 대화' };
      case 'Normal':
        return { color: 'text-blue-400', icon: '⭐⭐', description: '일반적인 상호작용' };
      case 'Hard':
        return { color: 'text-purple-400', icon: '⭐⭐⭐', description: '깊은 감정 교류' };
      case 'Expert':
        return { color: 'text-red-400', icon: '⭐⭐⭐⭐', description: '특별한 순간' };
      default:
        return { color: 'text-gray-400', icon: '⭐', description: '알 수 없음' };
    }
  };

  const difficultyInfo = getDifficultyInfo(episode.difficulty);

  if (gamePhase === 'playing') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 bg-transparent border-none">
          <EpisodeFlow
            initialScene={initialScene}
            hybridProfile={hybridProfile}
            selectedIdol={selectedIdol}
            onEpisodeComplete={handleEpisodeComplete}
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
              ✨ 추억 생성 중...
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
              <h3 className="text-xl font-bold">{selectedIdol.name}와의 특별한 순간</h3>
              <p className="text-muted-foreground">
                소중한 추억이 MemoryCard로 변환되고 있습니다...
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
                  <h3 className="text-lg font-bold">{selectedIdol.name}와의 특별한 시간</h3>
                  <p className="text-sm text-muted-foreground">{episode.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{episode.turns}턴</span>
                  </div>
                  <p className="text-xs text-muted-foreground">예상 소요시간</p>
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
                  <p className="text-xs text-muted-foreground">카테고리</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Expected Rewards */}
          <Card className="p-4 glass-dark border-primary/20 bg-primary/5">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                예상 보상
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold">MemoryCard NFT</div>
                  <div className="text-muted-foreground">친밀도에 따른 레어도</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">경험치 & 친밀도</div>
                  <div className="text-muted-foreground">선택에 따른 성장</div>
                </div>
              </div>
              <div className="pt-2 border-t border-primary/20">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>팁:</strong> 감정적으로 깊이 교감할수록 더 희귀한 카드를 얻을 수 있어요
                </p>
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
              나중에 하기
            </Button>
            <Button
              onClick={() => setGamePhase('playing')}
              className="flex-1 bg-gradient-primary hover:bg-gradient-secondary"
            >
              🎮 에피소드 시작
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryGameModalEnhanced;
