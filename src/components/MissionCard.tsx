import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface MissionCardProps {
  missionCode: string;
  title: string;
  description: string;
  icon: ReactNode;
  status: 'locked' | 'available' | 'active' | 'completed';
  contribution: number;
  allyCount: number;
  onClick: () => void;
}

export const MissionCard = ({
  missionCode,
  title,
  description,
  icon,
  status,
  contribution,
  allyCount,
  onClick
}: MissionCardProps) => {
  return (
    <Card className="group relative overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur-lg hover:border-primary hover:shadow-rust-glow transition-all duration-500 transform hover:scale-105">
      
      {/* Mission Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`px-3 py-1 rounded-full text-xs font-mono ${
          status === 'completed' ? 'bg-secondary/20 text-secondary border border-secondary/40' :
          status === 'active' ? 'bg-accent/20 text-accent border border-accent/40 animate-pulse' :
          status === 'available' ? 'bg-primary/20 text-primary border border-primary/40' :
          'bg-muted/20 text-muted-foreground border border-muted/40'
        }`}>
          {status === 'completed' ? '✓ 완료' :
           status === 'active' ? '⚡ 진행중' :
           status === 'available' ? '● 가능' :
           '🔒 잠김'}
        </div>
      </div>

      {/* Glitch overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top line animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <CardHeader>
        <div className="flex items-center gap-4">
          {/* Icon Container */}
          <div className="relative">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 group-hover:shadow-rust-glow transition-all duration-300">
              {icon}
            </div>
            {/* Fragment counter */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-black">{contribution}%</span>
            </div>
          </div>

          <div className="flex-1">
            {/* Mission Code */}
            <div className="text-xs text-primary font-mono tracking-wider mb-1">
              MISSION {missionCode}
            </div>
            
            {/* Title */}
            <CardTitle className="text-xl sm:text-2xl font-orbitron text-foreground group-hover:text-primary transition-colors duration-300 glitch-text">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-muted-foreground font-rajdhani text-sm sm:text-base leading-relaxed">
          {description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
          <div>
            <div className="text-xs text-muted-foreground font-mono">복구된 데이터</div>
            <div className="text-lg font-orbitron text-secondary">{contribution}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono">참여 Ally</div>
            <div className="text-lg font-orbitron text-accent">{allyCount.toLocaleString()}</div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onClick}
          variant={status === 'active' ? 'hero' : 'default'}
          className="w-full mt-4"
          disabled={status === 'locked'}
        >
          {status === 'completed' ? '기록 보기' :
           status === 'active' ? '미션 계속' :
           status === 'available' ? '미션 시작' :
           '잠금 해제 필요'}
        </Button>
      </CardContent>
      
      {/* Bottom decoration - Fragment ID */}
      <div className="absolute bottom-2 right-2 font-mono text-xs text-primary/30 group-hover:text-primary/60 transition-colors duration-300">
        [FRAG_{missionCode}_{Math.random().toString(36).substr(2, 6).toUpperCase()}]
      </div>
    </Card>
  );
};
