import { useState, useEffect } from "react";
import { Database, HardDrive, Radio, Shield } from "lucide-react";

interface AllyStatusBarProps {
  collectedFragments?: number;
  restorationProgress?: number;
  activeMission?: string;
}

export const AllyStatusBar = ({ 
  collectedFragments = 1247, 
  restorationProgress = 12.4,
  activeMission = "Mission Alpha"
}: AllyStatusBarProps) => {
  const [allyRank] = useState("ALPHA-07");
  const maxFragments = 1000000;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-primary/20 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        
        {/* 1. Ally Rank & Level */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-primary flex items-center justify-center border-2 border-primary">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">ALLY RANK</div>
            <div className="text-sm sm:text-lg font-orbitron font-bold text-primary">{allyRank}</div>
          </div>
        </div>

        {/* 2. Data Fragments Collected */}
        <div>
          <div className="text-[10px] sm:text-xs text-muted-foreground font-mono mb-1">FRAGMENTS</div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
            <span className="text-base sm:text-xl font-orbitron font-bold text-foreground">
              {collectedFragments.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
              / {(maxFragments / 1000).toFixed(0)}K
            </span>
          </div>
        </div>

        {/* 3. Earth Restoration Progress */}
        <div>
          <div className="text-[10px] sm:text-xs text-muted-foreground font-mono mb-1">EARTH STATUS</div>
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-secondary animate-pulse"
                style={{ width: `${restorationProgress}%` }}
              />
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-secondary">{restorationProgress}% RESTORED</div>
          </div>
        </div>

        {/* 4. Active Mission */}
        <div>
          <div className="text-[10px] sm:text-xs text-muted-foreground font-mono mb-1">ACTIVE MISSION</div>
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 sm:w-4 sm:h-4 text-accent animate-pulse" />
            <span className="text-xs sm:text-sm font-rajdhani text-foreground truncate">{activeMission}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
