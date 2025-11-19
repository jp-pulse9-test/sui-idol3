import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GatewayCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export const GatewayCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  className,
}: GatewayCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative p-8 border border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/50 hover:bg-card/80 transition-all duration-300",
        "hover:scale-105 hover:shadow-lg hover:shadow-primary/10",
        "text-left w-full",
        className
      )}
    >
      {/* Icon */}
      <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full border border-border/50 group-hover:border-primary/50 transition-colors">
        <Icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-orbitron font-semibold mb-2 text-foreground">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground font-orbitron">
        {description}
      </p>
      
      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300" />
    </button>
  );
};
