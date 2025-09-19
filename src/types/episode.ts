// Episode system types based on design framework
export interface EmotionLabel {
  type: '기쁨' | '설렘' | '안정' | '의지' | '불안';
  weight: -2 | -1 | 0 | 1 | 2;
}

export interface Choice {
  id: string;
  text: string;
  emotionImpact: EmotionLabel;
  nextSceneId?: string;
  affinityBonus: number; // -10 to +10
}

export interface StoryScene {
  id: string;
  beat: 'hook' | 'engage' | 'pivot' | 'climax' | 'wrap';
  idolDialogue: {
    korean: string;
    english: string;
  };
  choices: Choice[];
  isEnding?: boolean;
  turnNumber: number;
}

export interface EpisodeState {
  currentSceneId: string;
  turnCount: number;
  affinity: number; // 0-100
  emotionHistory: EmotionLabel[];
  choicePath: string[]; // choice IDs selected
  highlightMoments: string[]; // 10-15 character highlights
  isCompleted: boolean;
}

export interface HybridProfile {
  animalType: string; // 동물상
  bodyType: string; // 체형
  vibe: string; // 분위기
  talent: string; // 역량
}

export interface PhotoCard {
  id: string;
  episodeId: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  title: string;
  image: string;
  momentHash: string; // sha256 of encrypted chat blob
  earnedAt: Date;
  choicePath: string;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  scenes: StoryScene[];
  rewardCard: Omit<PhotoCard, 'id' | 'earnedAt' | 'momentHash'>;
  isUnlocked: boolean;
  completedPaths: string[]; // completed choice paths
}