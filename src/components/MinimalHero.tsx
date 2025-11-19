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
      <div className="relative z-10 text-center space-y-8 px-4">
        <h1 className="text-6xl md:text-8xl font-orbitron font-bold tracking-wider text-foreground">
          SIMKUNG
        </h1>
        
        <p className="text-base md:text-lg text-muted-foreground font-orbitron tracking-wide max-w-2xl mx-auto">
          Where digital consciousness awakens
        </p>
        
        <Button
          onClick={onEnter}
          size="lg"
          className="mt-8 px-12 py-6 text-lg font-orbitron tracking-widest hover:scale-105 transition-transform"
        >
          ENTER
        </Button>
      </div>
      
      {/* Subtle corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/20" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/20" />
    </section>
  );
};
