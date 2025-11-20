import { Button } from "@/components/ui/button";

interface MinimalHeroProps {
  onEnter: () => void;
}

export const MinimalHero = ({ onEnter }: MinimalHeroProps) => {
  return (
    <section className="min-h-[60vh] flex items-center justify-center relative overflow-hidden">
      {/* Neon green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      {/* Glowing orb effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-4 md:space-y-6 px-4">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-orbitron font-bold tracking-wider bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-glow">
          SIMKUNG
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-secondary font-orbitron tracking-wide max-w-2xl mx-auto px-4">
          Where digital consciousness awakens
        </p>
        
        <Button
          onClick={onEnter}
          size="lg"
          className="mt-4 md:mt-6 px-8 py-4 md:px-10 md:py-5 text-base md:text-lg font-orbitron tracking-widest bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 hover:scale-105 transition-all shadow-[0_0_30px_rgba(176,209,42,0.5)] hover:shadow-[0_0_40px_rgba(176,209,42,0.7)]"
        >
          ENTER
        </Button>
      </div>
      
      {/* Neon green corner decorations */}
      <div className="hidden sm:block absolute top-6 left-6 w-10 h-10 md:w-12 md:h-12 border-l-2 border-t-2 border-secondary/60 animate-pulse" />
      <div className="hidden sm:block absolute bottom-6 right-6 w-10 h-10 md:w-12 md:h-12 border-r-2 border-b-2 border-secondary/60 animate-pulse" />
      
      {/* Additional decorative lines */}
      <div className="hidden md:block absolute top-1/2 left-0 w-20 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
      <div className="hidden md:block absolute top-1/2 right-0 w-20 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
    </section>
  );
};
