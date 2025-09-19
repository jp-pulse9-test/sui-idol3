import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Play, Lock } from 'lucide-react';
import { Episode } from '@/types/episode';

interface ChoiceMapProps {
  episode: Episode;
  currentPath?: string;
  onPathSelect?: (path: string) => void;
  className?: string;
}

// Generate visual path representations
const generatePathNodes = (path: string) => {
  const choices = path.split('-');
  const nodes = [];
  
  for (let i = 0; i < 8; i++) {
    const hasChoice = i < choices.length;
    const choice = hasChoice ? choices[i] : null;
    
    nodes.push({
      turn: i + 1,
      choice,
      isActive: hasChoice,
      beat: i === 0 ? 'hook' : 
            i <= 2 ? 'engage' : 
            i <= 4 ? 'pivot' : 
            i === 6 ? 'climax' : 'wrap'
    });
  }
  
  return nodes;
};

// Sample path data - would come from completed episodes
const samplePaths = [
  { id: 'A-B-A-B-A-B-A-B', name: '다정한 길', completed: true, rarity: 'N' },
  { id: 'B-A-B-A-B-A-B-A', name: '열정적인 길', completed: true, rarity: 'R' },
  { id: 'A-A-A-A-A-A-A-A', name: '조심스러운 길', completed: false, rarity: 'SR' },
  { id: 'B-B-B-B-B-B-B-B', name: '대담한 길', completed: false, rarity: 'SSR' },
];

export const ChoiceMap: React.FC<ChoiceMapProps> = ({ 
  episode, 
  currentPath, 
  onPathSelect, 
  className = '' 
}) => {
  const beatColors = {
    hook: 'bg-blue-500',
    engage: 'bg-green-500',
    pivot: 'bg-yellow-500',
    climax: 'bg-red-500',
    wrap: 'bg-purple-500',
  };

  const rarityColors = {
    N: 'border-gray-400',
    R: 'border-blue-400',
    SR: 'border-purple-400',
    SSR: 'border-yellow-400',
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Choice Map</h3>
          <p className="text-sm text-muted-foreground">
            다양한 선택의 길을 탐험하고 각기 다른 포토카드를 획득하세요
          </p>
        </div>

        {/* Beat Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(beatColors).map(([beat, color]) => (
            <div key={beat} className="flex items-center space-x-1 text-xs">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="capitalize">{beat}</span>
            </div>
          ))}
        </div>

        {/* Current Path Visualization */}
        {currentPath && (
          <div className="space-y-3">
            <h4 className="font-medium">현재 진행 경로</h4>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {generatePathNodes(currentPath).map((node, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-1 min-w-0 flex-shrink-0"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                      node.isActive ? beatColors[node.beat] : 'bg-gray-300'
                    }`}
                  >
                    {node.turn}
                  </div>
                  <div className="text-xs text-center">
                    {node.choice || '?'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Paths */}
        <div className="space-y-3">
          <h4 className="font-medium">발견 가능한 경로들</h4>
          <div className="grid gap-3">
            {samplePaths.map((path) => (
              <div
                key={path.id}
                className={`p-4 border-2 rounded-lg transition-all hover:bg-secondary/50 ${
                  rarityColors[path.rarity as keyof typeof rarityColors]
                } ${path.completed ? 'bg-secondary/20' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {path.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">{path.name}</span>
                    </div>
                    <Badge variant="outline" className={rarityColors[path.rarity as keyof typeof rarityColors]}>
                      {path.rarity}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {path.completed ? (
                      <Badge variant="secondary">완료</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPathSelect?.(path.id)}
                        className="flex items-center space-x-1"
                      >
                        {path.id.startsWith(currentPath?.split('-')[0] || '') ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        <span>{path.id.startsWith(currentPath?.split('-')[0] || '') ? '도전' : '잠김'}</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Path preview */}
                <div className="mt-3 flex items-center space-x-1">
                  {path.id.split('-').slice(0, 4).map((choice, index) => (
                    <React.Fragment key={index}>
                      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs">
                        {choice}
                      </div>
                      {index < 3 && <div className="text-gray-400">→</div>}
                    </React.Fragment>
                  ))}
                  <span className="text-gray-400">...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">
              {samplePaths.filter(p => p.completed).length}
            </div>
            <div className="text-xs text-muted-foreground">완료된 경로</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {samplePaths.length}
            </div>
            <div className="text-xs text-muted-foreground">총 경로</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {Math.round((samplePaths.filter(p => p.completed).length / samplePaths.length) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">완주율</div>
          </div>
        </div>
      </div>
    </Card>
  );
};