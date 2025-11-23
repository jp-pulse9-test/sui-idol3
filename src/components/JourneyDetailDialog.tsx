import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface JourneyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  gatewayName: string;
  title: string;
  description: string;
  detailedInfo: string;
  onStart: () => void;
}

export const JourneyDetailDialog = ({
  open,
  onOpenChange,
  icon: Icon,
  gatewayName,
  title,
  description,
  detailedInfo,
  onStart,
}: JourneyDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-lg border-primary/30">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full border border-primary/50 bg-primary/5 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary/60 font-orbitron uppercase tracking-wider">
                {gatewayName}
              </p>
              <DialogTitle className="text-2xl font-orbitron gradient-text">
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-muted-foreground font-orbitron">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="prose prose-invert max-w-none">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {detailedInfo}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
