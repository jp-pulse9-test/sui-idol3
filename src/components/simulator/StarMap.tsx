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
    // Much larger nodes for clear visibility and easy clicking
    const baseSize = Math.max(4, (influence / 100) * 8); 
    return baseSize * 2;
  };

  return (
    <div className="relative w-full h-full bg-black/90 overflow-hidden border-2 border-primary/30 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.9)_inset]">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Constellation Lines - Very subtle */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
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
              strokeWidth="0.5"
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
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNodeClick(node)}
          >
            <div 
              className={`rounded-full transition-all duration-300 ${baseColor} ${shadowColor} ${isHovered ? 'scale-[3] opacity-100' : 'opacity-100 hover:opacity-100'} hover:scale-[3] active:scale-[3.5]`}
              style={{
                width: `${diameter}px`,
                height: `${diameter}px`,
                minWidth: '14px',
                minHeight: '14px',
                filter: 'brightness(1.2)',
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

      {/* Expanded Info Card on Hover */}
      {hoveredNode && (
        <div 
          className="absolute z-50 p-4 bg-background/98 border-2 border-border backdrop-blur-md text-xs font-orbitron max-w-[280px] shadow-2xl rounded-lg animate-scale-in"
          style={{
            left: `${Math.min(hoveredNode.x + 3, 70)}%`,
            top: `${Math.min(hoveredNode.y + 3, 75)}%`,
            boxShadow: mode === 'future' 
              ? '0 0 25px hsl(var(--accent) / 0.3)' 
              : '0 0 25px hsl(var(--primary) / 0.3)'
          }}
        >
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
            <span className={`text-sm font-bold ${mode === 'future' ? 'text-accent' : 'text-primary'}`}>
              {hoveredNode.year}
            </span>
            <span className="text-xs text-muted-foreground">INFLUENCE: {hoveredNode.influence}</span>
          </div>
          <div className="text-foreground font-bold mb-2 text-sm">{hoveredNode.eventName}</div>
          <div className="text-muted-foreground leading-relaxed text-[11px] mb-3">{hoveredNode.description}</div>
          <div className="text-[9px] text-accent uppercase tracking-wider">Click to explore details</div>
        </div>
      )}
      
      <div className="absolute bottom-3 left-3 text-[9px] text-muted-foreground font-orbitron tracking-widest">
        VISUALIZATION // {mode.toUpperCase()} // NODES: {nodes.length}
      </div>
    </div>
  );
};
