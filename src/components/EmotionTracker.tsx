import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EpisodeState } from '@/types/episode';

interface EmotionTrackerProps {
  episodeState: EpisodeState;
  className?: string;
}

const emotionIcons = {
  '기쁨': '😊',
  '설렘': '💕',
  '안정': '😌',
  '의지': '💪',
  '불안': '😰',
};

const emotionColors = {
  '기쁨': 'bg-yellow-500',
  '설렘': 'bg-pink-500',
  '안정': 'bg-green-500',
  '의지': 'bg-blue-500',
  '불안': 'bg-red-500',
};

export const EmotionTracker: React.FC<EmotionTrackerProps> = ({ 
  episodeState, 
  className = '' 
}) => {
  const emotionSummary = episodeState.emotionHistory.reduce((acc, emotion) => {
    acc[emotion.type] = (acc[emotion.type] || 0) + emotion.weight;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionSummary)
    .sort(([,a], [,b]) => b - a)[0];

  const affinityLevel = 
    episodeState.affinity >= 80 ? 'Very High' :
    episodeState.affinity >= 60 ? 'High' :
    episodeState.affinity >= 40 ? 'Medium' :
    episodeState.affinity >= 20 ? 'Low' : 'Very Low';

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Affinity Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">친밀도</span>
            <Badge variant="outline">{affinityLevel}</Badge>
          </div>
          <Progress value={episodeState.affinity} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">
            {episodeState.affinity}/100
          </div>
        </div>

        {/* Current Emotion */}
        {dominantEmotion && (
          <div className="space-y-2">
            <span className="text-sm font-medium">현재 감정</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {emotionIcons[dominantEmotion[0] as keyof typeof emotionIcons]}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">{dominantEmotion[0]}</div>
                <div className="text-xs text-muted-foreground">
                  강도: {dominantEmotion[1] > 0 ? '+' : ''}{dominantEmotion[1]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emotion History */}
        {episodeState.emotionHistory.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">감정 흐름</span>
            <div className="flex flex-wrap gap-1">
              {episodeState.emotionHistory.slice(-6).map((emotion, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-secondary/50 text-xs"
                >
                  <span>{emotionIcons[emotion.type]}</span>
                  <span className={`w-2 h-2 rounded-full ${emotionColors[emotion.type]}`} />
                  <span>{emotion.weight > 0 ? '+' : ''}{emotion.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Turn Counter */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">턴</span>
          <span className="font-medium">{episodeState.turnCount}/8</span>
        </div>

        {/* Highlight Moments */}
        {episodeState.highlightMoments.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">기억할 순간</span>
            <div className="text-xs text-muted-foreground space-y-1">
              {episodeState.highlightMoments.slice(-3).map((moment, index) => (
                <div key={index} className="italic">
                  "{moment}..."
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};