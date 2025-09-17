import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  gradient?: string;
}

export const FeatureCard = ({ title, description, icon, onClick, gradient }: FeatureCardProps) => {
  return (
    <Card className={`p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 card-hover group ${gradient || ''}`}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-primary p-4 shadow-glow-primary group-hover:scale-110 transition-transform duration-300">
          <img src={icon} alt={title} className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
        <Button 
          onClick={onClick}
          variant="hero"
          size="lg"
          className="w-full"
        >
          시작하기
        </Button>
      </div>
    </Card>
  );
};