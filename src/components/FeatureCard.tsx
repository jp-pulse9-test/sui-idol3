import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  gradient?: string;
  buttonText?: string;
}

export const FeatureCard = ({ title, description, icon, onClick, gradient, buttonText = "Start" }: FeatureCardProps) => {
  return (
    <Card className={`p-8 glass-dark border-primary/20 hover:border-primary/40 card-hover group ${gradient || ''} relative overflow-hidden transition-all duration-300`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex flex-col items-center text-center space-y-6 relative z-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5 
            shadow-[0_0_20px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]
            group-hover:scale-110 transition-all duration-500">
            <img src={icon} alt={title} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/30 to-secondary/30 
            opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
            group-hover:from-secondary group-hover:to-primary transition-all duration-500">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed max-w-sm">{description}</p>
        </div>
        
        <Button 
          onClick={onClick}
          variant="premium"
          size="lg"
          className="w-full"
        >
          <span className="relative z-10 font-semibold tracking-wide">
            {buttonText}
          </span>
        </Button>
      </div>
    </Card>
  );
};