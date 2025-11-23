import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Snowflake } from "lucide-react";
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
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-lg border-primary/30 animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-orbitron text-center text-white">
            {t('enterDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base text-muted-foreground font-orbitron text-center mt-2">
            {t('enterDialog.subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {/* Dimension: AWAKEN */}
          <div className="border border-primary/30 rounded-lg p-4 hover:border-primary/60 transition-all group cursor-pointer" onClick={onQuickStart}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Snowflake className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-orbitron text-primary uppercase tracking-wider mb-1">
                  {t('enterDialog.dimension1.title')}
                </h3>
                <p className="text-base font-bold text-white mb-2">
                  {t('enterDialog.dimension1.subtitle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('enterDialog.dimension1.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Dimension: SALVATION */}
          <div className="border border-accent/30 rounded-lg p-4 hover:border-accent/60 transition-all group cursor-pointer" onClick={onSelectIdol}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Snowflake className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-orbitron text-accent uppercase tracking-wider mb-1">
                  {t('enterDialog.dimension2.title')}
                </h3>
                <p className="text-base font-bold text-white mb-2">
                  {t('enterDialog.dimension2.subtitle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('enterDialog.dimension2.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Dimension: GLORY */}
          <div className="border border-secondary/30 rounded-lg p-4 hover:border-secondary/60 transition-all group">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <Snowflake className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-orbitron text-secondary uppercase tracking-wider mb-1">
                  {t('enterDialog.dimension3.title')}
                </h3>
                <p className="text-base font-bold text-white mb-2">
                  {t('enterDialog.dimension3.subtitle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('enterDialog.dimension3.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
