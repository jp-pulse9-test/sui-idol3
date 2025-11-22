import { LucideIcon } from "lucide-react";

interface FlowCardProps {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'cyan' | 'purple' | 'green' | 'red';
}

export const FlowCard = ({ step, title, description, icon: Icon, color }: FlowCardProps) => {
  const colorMap = {
    cyan: 'border-cyan-500/50 hover:border-cyan-500',
    purple: 'border-purple-500/50 hover:border-purple-500',
    green: 'border-green-500/50 hover:border-green-500',
    red: 'border-red-500/50 hover:border-red-500',
  };

  return (
    <div className={`border-2 ${colorMap[color]} rounded-lg p-6 
                    transition-all hover:scale-105 cursor-pointer bg-card`}>
      <div className="text-xs text-muted-foreground mb-2 font-mono">STEP {step}</div>
      <Icon className="h-8 w-8 mb-3 text-foreground" />
      <h3 className="text-xl font-orbitron font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
