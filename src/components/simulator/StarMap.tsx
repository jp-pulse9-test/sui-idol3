import React, { useState } from 'react';
import { HistoryNode } from '@/types/simulator';

interface StarMapProps {
  nodes: HistoryNode[];
  onNodeClick: (node: HistoryNode) => void;
  mode: 'past' | 'future';
}

export const StarMap: React.FC<StarMapProps> = ({ nodes, onNodeClick, mode }) => {
  const [hoveredNode, setHoveredNode] = useState<HistoryNode | null>(null);

  const getVisualDiameter = (influence: number) => {
    const baseSize = Math.max(0.5, (influence / 100) * 1.6); 
    return baseSize * 2;
  };

  return (
    <div className="relative w-full h-full bg-background overflow-hidden border border-border rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)_inset]">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Constellation Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        {nodes.map((node, i) => {
          const target = nodes[i + 1];
          if (!target) return null;
          
          return (
            <line
              key={`link-${i}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              stroke={mode === 'future' ? "hsl(var(--accent))" : "hsl(var(--primary))"}
              strokeWidth="0.1"
            />
          );
        })}
      </svg>

      {/* Data Nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const diameter = getVisualDiameter(node.influence);
        
        const baseColor = mode === 'future' ? 'bg-accent' : 'bg-primary';
        const shadowColor = mode === 'future' 
          ? 'shadow-[0_0_4px_hsl(var(--accent))]' 
          : 'shadow-[0_0_4px_hsl(var(--primary))]';

        return (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNodeClick(node)}
          >
            <div 
              className={`rounded-full transition-all duration-300 ${baseColor} ${shadowColor} ${isHovered ? 'scale-[4] opacity-100' : 'opacity-80'}`}
              style={{
                width: `${diameter}px`,
                height: `${diameter}px`,
              }}
            />

            {node.influence > 90 && (
              <div 
                className={`absolute rounded-full animate-ping opacity-30 ${baseColor}`}
                style={{
                  width: '6px',
                  height: '6px',
                  animationDuration: '4s'
                }}
              />
            )}
          </div>
        );
      })}

      {/* Info HUD */}
      {hoveredNode && (
        <div 
          className="absolute z-50 p-3 bg-background/95 border border-border backdrop-blur-md text-xs font-orbitron max-w-[200px] pointer-events-none"
          style={{
            left: `${Math.min(hoveredNode.x + 2, 75)}%`,
            top: `${Math.min(hoveredNode.y + 2, 80)}%`,
            boxShadow: mode === 'future' 
              ? '0 0 15px hsl(var(--accent) / 0.1)' 
              : '0 0 15px hsl(var(--primary) / 0.1)'
          }}
        >
          <div className="flex justify-between items-center mb-2 border-b border-border pb-1">
            <span className={`${mode === 'future' ? 'text-accent' : 'text-primary'} font-bold`}>
              [{hoveredNode.year}]
            </span>
            <span className="text-muted-foreground">INF:{hoveredNode.influence}</span>
          </div>
          <div className="text-foreground font-bold mb-1">{hoveredNode.eventName}</div>
          <div className="text-muted-foreground leading-tight text-[10px]">{hoveredNode.description}</div>
        </div>
      )}
      
      <div className="absolute bottom-3 left-3 text-[9px] text-muted-foreground font-orbitron tracking-widest">
        VISUALIZATION // {mode.toUpperCase()} // NODES: {nodes.length}
      </div>
    </div>
  );
};
