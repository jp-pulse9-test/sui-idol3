import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { EnterGameDialog } from "./EnterGameDialog";
import { useNavigate } from "react-router-dom";

interface MinimalHeroProps {
  onEnter: () => void;
}

export const MinimalHero = ({ onEnter }: MinimalHeroProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showEnterDialog, setShowEnterDialog] = useState(false);
  
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/videos/space-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/70" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-8 md:space-y-12 px-4 max-w-5xl mx-auto">
        {/* Main Title - Primary Focus */}
        <div className="space-y-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-orbitron font-bold tracking-wider text-foreground drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
            {t('hero.title')}
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl text-primary font-orbitron tracking-widest uppercase">
            {t('hero.secondaryTitle')}
          </p>
        </div>
        
        {/* Description - Secondary Focus */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/90 font-orbitron tracking-wide leading-relaxed">
            {t('hero.description')}
          </p>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-orbitron tracking-wide">
            {t('hero.subtitle')}
          </p>
        </div>
        
        {/* CTA Button - Action Focus */}
        <div className="pt-4">
          <Button
            onClick={() => setShowEnterDialog(true)}
            size="lg"
            className="mt-2 px-12 py-6 md:px-16 md:py-8 text-lg md:text-xl font-orbitron font-bold tracking-widest hover:scale-110 transition-all duration-300 shadow-[0_0_30px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.8)] touch-action-manipulation"
          >
            {t('hero.enter')}
          </Button>
          <p className="text-xs text-muted-foreground/60 font-orbitron mt-4 tracking-wider uppercase">
            {t('hero.tagline')}
          </p>
        </div>
      </div>
      
      {/* Subtle corner decorations - hidden on very small screens */}
      <div className="hidden sm:block absolute top-8 left-8 w-12 h-12 md:w-16 md:h-16 border-l-2 border-t-2 border-primary/20" />
      <div className="hidden sm:block absolute bottom-8 right-8 w-12 h-12 md:w-16 md:h-16 border-r-2 border-b-2 border-primary/20" />
      
      {/* Enter Game Dialog */}
      <EnterGameDialog
        open={showEnterDialog}
        onOpenChange={setShowEnterDialog}
        onQuickStart={() => navigate('/intro')}
        onSelectIdol={() => navigate('/intro')}
      />
    </section>
  );
};
