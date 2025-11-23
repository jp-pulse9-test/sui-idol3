import React from 'react';
import { Fragment } from '@/types/simulator';
import { Sparkles } from 'lucide-react';

interface FragmentLibraryProps {
  fragments: Fragment[];
}

export const FragmentLibrary: React.FC<FragmentLibraryProps> = ({ fragments }) => {
  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-border p-3 bg-muted/20">
        <h3 className="text-xs font-orbitron tracking-widest text-primary uppercase flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          Emotional Fragments [{fragments.length}]
        </h3>
      </div>

      {/* Fragment Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {fragments.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground font-orbitron">
              No fragments collected yet...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {fragments.map((fragment) => (
              <div 
                key={fragment.id}
                className="border border-border rounded-lg p-2 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                style={{ borderColor: fragment.color }}
              >
                <div 
                  className="w-full h-12 rounded mb-2"
                  style={{ backgroundColor: fragment.color, opacity: 0.3 }}
                />
                <div className="text-[10px] font-orbitron font-bold text-foreground mb-1 truncate">
                  {fragment.name}
                </div>
                <div className="text-[9px] text-muted-foreground line-clamp-2">
                  {fragment.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
