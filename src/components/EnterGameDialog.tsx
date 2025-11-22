import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EnterGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickStart: () => void;
  onSelectIdol: () => void;
}

export const EnterGameDialog = ({ 
  open, 
  onOpenChange, 
  onQuickStart, 
  onSelectIdol 
}: EnterGameDialogProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-lg border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron gradient-text">
            🌍 {t('enterDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-orbitron">
            {t('enterDialog.subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Quick Start */}
          <Button
            onClick={onQuickStart}
            className="w-full h-20 flex items-center justify-start gap-4 px-6 bg-primary hover:bg-primary/90 group"
          >
            <Zap className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-bold text-lg">{t('enterDialog.quickStart.title')}</p>
              <p className="text-xs opacity-80">{t('enterDialog.quickStart.description')}</p>
            </div>
          </Button>
          
          {/* Select Idol */}
          <Button
            onClick={onSelectIdol}
            variant="outline"
            className="w-full h-20 flex items-center justify-start gap-4 px-6 border-primary/50 hover:bg-primary/10 group"
          >
            <Sparkles className="w-8 h-8 group-hover:scale-110 transition-transform text-primary" />
            <div className="text-left">
              <p className="font-bold text-lg">{t('enterDialog.selectIdol.title')}</p>
              <p className="text-xs opacity-80">{t('enterDialog.selectIdol.description')}</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
