import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  emoji?: string;
  onClick: () => void;
  gradient?: string;
  buttonText?: string;
}

export const FeatureCard = ({ title, description, icon, emoji, onClick, gradient, buttonText = "시작하기" }: FeatureCardProps) => {
  return (
    <Card className={`p-8 glass-dark border-white/10 card-hover group ${gradient || ''} relative overflow-hidden`}>
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary p-3 glow-primary group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
            <img src={icon} alt={title} className="w-full h-full object-cover rounded-xl opacity-70" />
            {emoji && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="text-3xl relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300" 
                  style={{ 
                    textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)',
                    filter: 'brightness(1.2) contrast(1.1) saturate(1.2)'
                  }}
                >
                  {emoji}
                </span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-500"></div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold gradient-text">{title}</h3>
          <p className="text-muted-foreground leading-relaxed max-w-sm">{description}</p>
        </div>
        <Button 
          onClick={onClick}
          variant="premium"
          size="lg"
          className="w-full font-bold text-lg py-4 relative overflow-hidden group/btn
            bg-gradient-to-r from-accent via-primary to-secondary 
            hover:from-primary hover:via-accent hover:to-primary
            text-white hover:text-white
            shadow-lg hover:shadow-xl
            border border-white/20 hover:border-white/30
            transition-all duration-300 ease-in-out
            hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="relative z-10 font-semibold tracking-wide">
            {buttonText}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 
            translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
        </Button>
      </div>
    </Card>
  );
};