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
        "group relative p-6 md:p-8 border border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/50 hover:bg-card/80 transition-all duration-300",
        "hover:scale-105 hover:shadow-lg hover:shadow-primary/10",
        "text-left w-full min-h-[240px] md:min-h-[280px] touch-action-manipulation",
        className
      )}
    >
      {/* Icon */}
      <div className="mb-4 md:mb-6 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border border-border/50 group-hover:border-primary/50 transition-colors">
        <Icon className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      {/* Content */}
      <h3 className="text-lg md:text-xl font-orbitron font-semibold mb-2 text-foreground">
        {title}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground font-orbitron">
        {description}
      </p>
      
      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300" />
    </button>
  );
};
