import { useState, useCallback } from 'react';
import { EpisodeState, EmotionLabel, Choice, HybridProfile } from '@/types/episode';

interface UseEpisodeStateProps {
  initialSceneId: string;
  hybridProfile: HybridProfile;
}

export const useEpisodeState = ({ initialSceneId, hybridProfile }: UseEpisodeStateProps) => {
  const [episodeState, setEpisodeState] = useState<EpisodeState>({
    currentSceneId: initialSceneId,
    turnCount: 1,
    affinity: 50, // Start at middle
    emotionHistory: [],
    choicePath: [],
    highlightMoments: [],
    isCompleted: false,
  });

  const [gameHistory, setGameHistory] = useState<Array<{
    sceneId: string;
    choice: Choice;
    timestamp: Date;
  }>>([]);

  const makeChoice = useCallback((choice: Choice, nextSceneId?: string, highlightText?: string) => {
    setEpisodeState(prev => {
      const newAffinity = Math.max(0, Math.min(100, prev.affinity + choice.affinityBonus));
      const newEmotionHistory = [...prev.emotionHistory, choice.emotionImpact];
      const newChoicePath = [...prev.choicePath, choice.id];
      const newHighlightMoments = highlightText 
        ? [...prev.highlightMoments, highlightText.slice(0, 15)]
        : prev.highlightMoments;

      return {
        ...prev,
        currentSceneId: nextSceneId || prev.currentSceneId,
        turnCount: prev.turnCount + 1,
        affinity: newAffinity,
        emotionHistory: newEmotionHistory,
        choicePath: newChoicePath,
        highlightMoments: newHighlightMoments,
      };
    });

    setGameHistory(prev => [...prev, {
      sceneId: episodeState.currentSceneId,
      choice,
      timestamp: new Date(),
    }]);
  }, [episodeState.currentSceneId]);

  const completeEpisode = useCallback(() => {
    setEpisodeState(prev => ({
      ...prev,
      isCompleted: true,
    }));
  }, []);

  const resetEpisode = useCallback(() => {
    setEpisodeState({
      currentSceneId: initialSceneId,
      turnCount: 1,
      affinity: 50,
      emotionHistory: [],
      choicePath: [],
      highlightMoments: [],
      isCompleted: false,
    });
    setGameHistory([]);
  }, [initialSceneId]);

  const getEmotionSummary = useCallback(() => {
    const emotionCounts = episodeState.emotionHistory.reduce((acc, emotion) => {
      acc[emotion.type] = (acc[emotion.type] || 0) + emotion.weight;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion, weight]) => ({ emotion, weight }));
  }, [episodeState.emotionHistory]);

  const getChoicePathString = useCallback(() => {
    return episodeState.choicePath.join('-');
  }, [episodeState.choicePath]);

  return {
    episodeState,
    gameHistory,
    makeChoice,
    completeEpisode,
    resetEpisode,
    getEmotionSummary,
    getChoicePathString,
  };
};