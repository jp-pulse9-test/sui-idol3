import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status?: string;
  cost?: { sui?: number; hearts?: number };
  actionLabel: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
}

export const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  status,
  cost,
  actionLabel,
  onClick,
  disabled = false,
  variant = 'default'
}: QuickActionCardProps) => {
  const variantClasses = {
    primary: 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50',
    secondary: 'bg-card/50 backdrop-blur border-border/50',
    default: 'bg-card backdrop-blur'
  };

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-background/50">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {status && (
              <Badge variant="outline" className="text-xs">
                {status}
              </Badge>
            )}
            {cost && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                {cost.sui !== undefined && <span>💎 {cost.sui} SUI</span>}
                {cost.hearts !== undefined && <span>❤️ {cost.hearts} Hearts</span>}
              </div>
            )}
          </div>
          <Button onClick={onClick} disabled={disabled} size="sm">
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
