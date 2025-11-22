import { ReactNode } from 'react';

interface AsciiBoxProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export const AsciiBox = ({ children, title, className = '' }: AsciiBoxProps) => {
  return (
    <div className={`retro-terminal-box p-4 ${className}`}>
      {title && (
        <div className="border-b border-lime-500/30 pb-2 mb-3">
          <span className="text-lime-400 font-mono text-sm retro-glow">
            {'>'} {title}
          </span>
        </div>
      )}
      <div className="font-mono text-sm">
        {children}
      </div>
    </div>
  );
};
