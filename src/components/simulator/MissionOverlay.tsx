import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MissionOverlayProps {
  onClose: () => void;
}

export const MissionOverlay: React.FC<MissionOverlayProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md animate-fade-in">
      <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-primary font-orbitron">
            THE OLD EARTH SIMULATOR
          </h2>
          <p className="text-sm text-muted-foreground tracking-widest uppercase">
            Year 2847 // Pre-Collapse Archives
          </p>
        </div>

        <div className="space-y-4 text-foreground">
          <p className="text-lg leading-relaxed">
            Explore the world on the brink of collapse in <span className="text-primary font-bold">2847</span>.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Analyze historical data from Old Earth to find clues that could save the future.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-accent font-orbitron">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>Click on stars to explore historical events</span>
          </div>
          
          <Button 
            onClick={onClose}
            size="lg"
            className="font-orbitron tracking-wider"
          >
            BEGIN EXPLORATION
          </Button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
