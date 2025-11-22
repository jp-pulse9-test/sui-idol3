interface AsciiProgressProps {
  value: number;
  max: number;
  label?: string;
  width?: number;
}

export const AsciiProgress = ({ value, max, label, width = 20 }: AsciiProgressProps) => {
  const percentage = Math.min(100, (value / max) * 100);
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;

  return (
    <div className="font-mono text-xs text-lime-400">
      {label && <div className="mb-1">{label}</div>}
      <div className="flex items-center gap-2">
        <span>[</span>
        <span className="text-green-400">{'█'.repeat(filled)}</span>
        <span className="text-gray-700">{'░'.repeat(empty)}</span>
        <span>]</span>
        <span className="ml-2 text-lime-300">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};
