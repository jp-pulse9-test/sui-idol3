import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SynopsisPhaseProps {
  phase: number;
  active: boolean;
  children: React.ReactNode;
  theme?: "dystopian" | "timewarp" | "mission" | "convergence";
}

export const SynopsisPhase = ({ phase, active, children, theme = "dystopian" }: SynopsisPhaseProps) => {
  const phaseRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.5,
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    if (phaseRef.current) {
      observer.observe(phaseRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const themeClasses = {
    dystopian: "from-cyan-500/10 via-red-500/10 to-transparent",
    timewarp: "from-purple-500/10 via-pink-500/10 to-transparent",
    mission: "from-green-500/10 via-blue-500/10 to-transparent",
    convergence: "from-pink-500/10 via-purple-500/10 via-blue-500/10 to-cyan-500/10",
  };

  const particleClasses = {
    dystopian: "before:bg-gradient-to-r before:from-cyan-500 before:to-red-500",
    timewarp: "before:bg-gradient-to-r before:from-purple-500 before:to-pink-500",
    mission: "before:bg-gradient-to-r before:from-green-500 before:to-blue-500",
    convergence: "before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-cyan-500",
  };

  return (
    <div
      ref={phaseRef}
      className={cn(
        "min-h-screen flex items-center justify-center relative transition-all duration-1000 ease-out",
        "px-4 md:px-8",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
    >
      {/* Animated Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-20 transition-opacity duration-1000",
          themeClasses[theme],
          isVisible ? "opacity-30" : "opacity-0"
        )}
      />

      {/* Particle Effect Layer */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-1000",
          "before:absolute before:inset-0 before:opacity-5",
          "before:bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))]",
          particleClasses[theme],
          isVisible && "opacity-100"
        )}
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glass Container */}
      <div
        className={cn(
          "relative z-10 max-w-5xl mx-auto",
          "glass-dark p-8 md:p-12 lg:p-16 rounded-2xl",
          "border border-border/20",
          "transition-all duration-1000",
          isVisible ? "translate-y-0 blur-0" : "translate-y-8 blur-sm"
        )}
      >
        {/* Content */}
        <div className="space-y-6 md:space-y-8 text-center">{children}</div>

        {/* Phase Indicator */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((p) => (
              <div
                key={p}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-500",
                  p === phase
                    ? "bg-primary w-8 shadow-[0_0_20px_rgba(var(--primary),0.8)]"
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
