import { Button } from "@/components/ui/button";

interface MinimalHeroProps {
  onEnter: () => void;
}

export const MinimalHero = ({ onEnter }: MinimalHeroProps) => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-6 md:space-y-8 px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-orbitron font-bold tracking-wider text-foreground">
          SIMKUNG
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-orbitron tracking-wide max-w-2xl mx-auto px-4">
          Where digital consciousness awakens
        </p>
        
        <Button
          onClick={onEnter}
          size="lg"
          className="mt-6 md:mt-8 px-10 py-5 md:px-12 md:py-6 text-base md:text-lg font-orbitron tracking-widest hover:scale-105 transition-transform touch-action-manipulation"
        >
          ENTER
        </Button>
      </div>
      
      {/* Subtle corner decorations - hidden on very small screens */}
      <div className="hidden sm:block absolute top-8 left-8 w-12 h-12 md:w-16 md:h-16 border-l-2 border-t-2 border-primary/20" />
      <div className="hidden sm:block absolute bottom-8 right-8 w-12 h-12 md:w-16 md:h-16 border-r-2 border-b-2 border-primary/20" />
    </section>
  );
};
