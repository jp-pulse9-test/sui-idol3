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
      <div className="relative z-10 text-center space-y-6 md:space-y-8 px-4">
        <div className="flex justify-center">
          <p className="text-xs sm:text-sm md:text-base text-primary font-orbitron tracking-widest uppercase typing-effect">
            {t('hero.tagline')}
          </p>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-orbitron font-bold tracking-wider text-foreground">
          {t('hero.title')}
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-orbitron tracking-wide max-w-2xl mx-auto px-4">
          {t('hero.subtitle')}
        </p>
        
        <Button
          onClick={() => setShowEnterDialog(true)}
          size="lg"
          className="mt-6 md:mt-8 px-10 py-5 md:px-12 md:py-6 text-base md:text-lg font-orbitron tracking-widest hover:scale-105 transition-transform touch-action-manipulation"
        >
          {t('hero.enter')}
        </Button>
      </div>
      
      {/* Subtle corner decorations - hidden on very small screens */}
      <div className="hidden sm:block absolute top-8 left-8 w-12 h-12 md:w-16 md:h-16 border-l-2 border-t-2 border-primary/20" />
      <div className="hidden sm:block absolute bottom-8 right-8 w-12 h-12 md:w-16 md:h-16 border-r-2 border-b-2 border-primary/20" />
      
      {/* Enter Game Dialog */}
      <EnterGameDialog
        open={showEnterDialog}
        onOpenChange={setShowEnterDialog}
        onQuickStart={() => navigate('/play')}
        onSelectIdol={() => navigate('/pick')}
      />
    </section>
  );
};
