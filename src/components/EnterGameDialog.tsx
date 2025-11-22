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
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-lg border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-orbitron text-white">
            🌍 {t('enterDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base text-muted-foreground font-orbitron">
            {t('enterDialog.subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {/* Quick Start */}
          <Button
            onClick={onQuickStart}
            className="w-full h-auto py-4 flex items-center justify-start gap-3 md:gap-4 px-4 md:px-6 bg-black border-2 border-accent hover:bg-accent/10 group text-white"
          >
            <Zap className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 group-hover:scale-110 transition-transform text-accent" />
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-sm md:text-base truncate">{t('enterDialog.quickStart.title')}</p>
              <p className="text-[10px] md:text-xs opacity-80 line-clamp-1">{t('enterDialog.quickStart.description')}</p>
            </div>
          </Button>
          
          {/* Select Idol */}
          <Button
            onClick={onSelectIdol}
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-start gap-3 md:gap-4 px-4 md:px-6 border-primary/50 hover:bg-primary/10 group"
          >
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 group-hover:scale-110 transition-transform text-primary" />
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-sm md:text-base truncate">{t('enterDialog.selectIdol.title')}</p>
              <p className="text-[10px] md:text-xs opacity-80 line-clamp-1">{t('enterDialog.selectIdol.description')}</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
