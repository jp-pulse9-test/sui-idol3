import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface IdolStats {
  vocal: { current: number; potential: number };
  dance: { current: number; potential: number };
  rap: { current: number; potential: number };
  visual: { current: number; potential: number };
  charisma: { current: number; potential: number };
  acting: { current: number; potential: number };
  variety: { current: number; potential: number };
  leadership: { current: number; potential: number };
}

interface IdolStatsDisplayProps {
  stats: IdolStats;
  viewMode?: 'radar' | 'bar';
}

export const IdolStatsDisplay = ({ stats, viewMode = 'radar' }: IdolStatsDisplayProps) => {
  const statLabels = {
    vocal: '보컬',
    dance: '댄스',
    rap: '랩',
    visual: '비주얼',
    charisma: '카리스마',
    acting: '연기',
    variety: '예능감',
    leadership: '리더십'
  };

  const radarData = Object.entries(stats).map(([key, value]) => ({
    stat: statLabels[key as keyof typeof statLabels],
    current: value.current,
    potential: value.potential,
    fullMark: 100
  }));

  const barData = Object.entries(stats).map(([key, value]) => ({
    stat: statLabels[key as keyof typeof statLabels],
    current: value.current,
    potential: value.potential
  }));

  if (viewMode === 'radar') {
    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="stat" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name="잠재력"
              dataKey="potential"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Radar
              name="현재 수준"
              dataKey="current"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent))"
              fillOpacity={0.3}
              strokeWidth={3}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent/30 border-2 border-accent rounded-sm"></div>
            <span className="text-sm text-muted-foreground">현재 수준</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/10 border-2 border-primary border-dashed rounded-sm"></div>
            <span className="text-sm text-muted-foreground">잠재력</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {barData.map((item, index) => (
        <div key={item.stat} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.stat}</span>
            <span className="text-xs text-muted-foreground">
              {item.current}/{item.potential}
            </span>
          </div>
          <div className="relative h-6 bg-card/50 rounded-full overflow-hidden">
            {/* 잠재력 배경 */}
            <div 
              className="absolute top-0 left-0 h-full bg-primary/20 rounded-full"
              style={{ width: `${item.potential}%` }}
            />
            {/* 현재 수준 */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${item.current}%`,
                animationDelay: `${index * 100}ms`
              }}
            />
            {/* 수치 텍스트 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-foreground/80">
                {item.current}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 랜덤 스탯 생성기
export const generateRandomStats = (personality: string): IdolStats => {
  const baseStats = {
    vocal: { min: 60, max: 95 },
    dance: { min: 55, max: 90 },
    rap: { min: 40, max: 85 },
    visual: { min: 70, max: 95 },
    charisma: { min: 65, max: 90 },
    acting: { min: 45, max: 80 },
    variety: { min: 50, max: 85 },
    leadership: { min: 55, max: 85 }
  };

  // 성격에 따른 스탯 보정
  const personalityBoosts: Record<string, Partial<Record<keyof typeof baseStats, number>>> = {
    'Bright & Cheerful': { variety: 15, charisma: 10 },
    'Cool & Chic': { visual: 15, charisma: 10 },
    'Energetic Performer': { dance: 15, charisma: 10 },
    'Emotional / Artistic': { vocal: 15, acting: 10 },
    'Mysterious / Unique': { visual: 10, charisma: 15 },
    'Funny / Friendly': { variety: 20, leadership: 5 },
    'Caring / Team-Player': { leadership: 15, variety: 5 },
    'Rebel / Edgy': { rap: 15, charisma: 10 }
  };

  const boosts = personalityBoosts[personality] || {};

  const result: IdolStats = {} as IdolStats;

  Object.entries(baseStats).forEach(([stat, range]) => {
    const boost = boosts[stat as keyof typeof baseStats] || 0;
    const potential = Math.min(100, range.max + boost);
    const current = Math.max(
      range.min + boost - 20,
      Math.min(potential - 10, range.min + boost + Math.random() * 20)
    );

    result[stat as keyof IdolStats] = {
      current: Math.round(current),
      potential: Math.round(potential)
    };
  });

  return result;
};