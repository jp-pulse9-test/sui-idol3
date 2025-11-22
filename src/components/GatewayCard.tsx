import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GatewayCardProps {
  icon: LucideIcon | string;
  gatewayName: string;
  title: string;
  subtitle?: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export const GatewayCard = ({
  icon,
  gatewayName,
  title,
  subtitle,
  description,
  onClick,
  className,
}: GatewayCardProps) => {
  const isStringIcon = typeof icon === 'string';
  return (
    <button
      onClick={onClick}
      aria-label={`${gatewayName}: ${title}`}
      className={cn(
        "group relative p-6 md:p-8 border border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/50 hover:bg-card/80 transition-all duration-500",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
        "text-left w-full min-h-[280px] md:min-h-[320px] touch-action-manipulation",
        "flex flex-col items-start justify-start gap-3 md:gap-4",
        className
      )}
    >
      {/* Gateway Label */}
      <div className="text-xs md:text-sm font-orbitron text-accent/70 group-hover:text-accent transition-colors tracking-wider uppercase">
        {gatewayName}
      </div>
      
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border border-accent/30 group-hover:border-accent/60 group-hover:bg-accent/10 transition-all duration-300">
        {isStringIcon ? (
          <span className="text-3xl md:text-4xl text-muted-foreground group-hover:text-accent transition-colors">
            {icon}
          </span>
        ) : (
          (() => {
            const IconComponent = icon as LucideIcon;
            return <IconComponent className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground group-hover:text-accent transition-colors" />;
          })()
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-xl md:text-2xl font-orbitron font-bold text-foreground group-hover:text-accent transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm md:text-base font-orbitron text-muted-foreground/80">
            {subtitle}
          </p>
        )}
        <p className="text-xs md:text-sm text-muted-foreground font-orbitron leading-relaxed mt-1">
          {description}
        </p>
      </div>
      
      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-accent to-accent/50 group-hover:w-full transition-all duration-500" />
    </button>
  );
};
