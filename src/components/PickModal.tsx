import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Zap } from "lucide-react";
import { IdolPreset } from "@/types/idol";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type GamePhase = 'loading' | 'tournament' | 'preview' | 'minting' | 'complete';

interface PickModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PickModal({ open, onOpenChange }: PickModalProps) {
  const navigate = useNavigate();
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [allIdols, setAllIdols] = useState<IdolPreset[]>([]);
  const [tournamentIdols, setTournamentIdols] = useState<IdolPreset[]>([]);
  const [currentRound, setCurrentRound] = useState<IdolPreset[]>([]);
  const [currentPair, setCurrentPair] = useState<[IdolPreset, IdolPreset] | null>(null);
  const [finalWinner, setFinalWinner] = useState<IdolPreset | null>(null);
  const [heartEffect, setHeartEffect] = useState<'left' | 'right' | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [savedProgress, setSavedProgress] = useState<any>(null);

  // Load saved progress on mount
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('pickProgress');
      if (saved) {
        const progress = JSON.parse(saved);
        setSavedProgress(progress);
      }
      fetchIdols();
    }
  }, [open]);

  const saveProgress = () => {
    const progress = {
      gamePhase,
      tournamentIdols,
      currentRound,
      currentPair,
      finalWinner,
      timestamp: Date.now()
    };
    localStorage.setItem('pickProgress', JSON.stringify(progress));
  };

  const restoreProgress = () => {
    if (savedProgress) {
      setGamePhase(savedProgress.gamePhase);
      setTournamentIdols(savedProgress.tournamentIdols);
      setCurrentRound(savedProgress.currentRound);
      setCurrentPair(savedProgress.currentPair);
      setFinalWinner(savedProgress.finalWinner);
      setSavedProgress(null);
    }
  };

  const fetchIdols = async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_idol_data');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAllIdols(data);
        
        // Check if there's saved progress
        const saved = localStorage.getItem('pickProgress');
        if (saved) {
          const progress = JSON.parse(saved);
          // Check if saved within last 24 hours
          if (Date.now() - progress.timestamp < 24 * 60 * 60 * 1000) {
            restoreProgress();
            return;
          }
        }
        
        // Start new tournament
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(16, data.length));
        
        setTournamentIdols(selected);
        setCurrentRound(selected);
        setCurrentPair([selected[0], selected[1]]);
        setGamePhase('tournament');
      } else {
        toast({
          title: "No Data",
          description: "Unable to load idol data.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching idols:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading idol data.",
        variant: "destructive"
      });
    }
  };

  const handleChoice = (selectedIdol: IdolPreset, side: 'left' | 'right') => {
    setHeartEffect(side);
    setTimeout(() => setHeartEffect(null), 1000);

    if (!currentPair) return;

    const currentIndex = currentRound.indexOf(currentPair[0]);
    const nextRound = [...currentRound];
    
    nextRound.splice(currentIndex, 2, selectedIdol);
    
    if (currentIndex + 2 >= currentRound.length) {
      const pairsRemaining = Math.floor(nextRound.length / 2);
      
      if (pairsRemaining === 1) {
        setFinalWinner(selectedIdol);
        setGamePhase('preview');
        saveProgress();
        return;
      } else {
        const filteredNextRound = nextRound.slice(0, pairsRemaining);
        setCurrentRound(filteredNextRound);
        setCurrentPair([filteredNextRound[0], filteredNextRound[1]]);
      }
    } else {
      const nextPairIndex = currentIndex + 2;
      if (nextPairIndex + 1 < currentRound.length) {
        setCurrentPair([currentRound[nextPairIndex], currentRound[nextPairIndex + 1]]);
      }
      setCurrentRound(nextRound);
    }
    saveProgress();
  };

  const handleConfirmPick = async () => {
    if (!finalWinner) return;
    
    setIsMinting(true);
    setGamePhase('minting');
    
    try {
      localStorage.setItem('selectedIdol', JSON.stringify(finalWinner));
      localStorage.setItem('tournamentWinner', JSON.stringify(finalWinner));
      localStorage.removeItem('pickProgress'); // Clear saved progress
      
      toast({
        title: "Selection Complete!",
        description: `You have selected ${finalWinner.name}.`,
      });
      
      setGamePhase('complete');
      
      setTimeout(() => {
        onOpenChange(false);
        navigate('/vault');
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving your selection.",
        variant: "destructive"
      });
      setGamePhase('preview');
    } finally {
      setIsMinting(false);
    }
  };

  const getTournamentRoundName = () => {
    const remaining = currentRound.length;
    switch (remaining) {
      case 16: return "Round of 16";
      case 8: return "Quarter-finals";
      case 4: return "Semi-finals";
      case 2: return "Finals";
      default: return `Round of ${remaining}`;
    }
  };

  const getCurrentProgress = () => {
    const initialCount = tournamentIdols.length;
    const remaining = currentRound.length;
    return ((initialCount - remaining) / (initialCount - 1)) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto p-4 md:p-6">
        <DialogTitle className="sr-only">Pick Your Ideal AIDOL</DialogTitle>
        
        {gamePhase === 'loading' && (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading idol data...</p>
          </div>
        )}

        {gamePhase === 'tournament' && currentPair && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">
                💕 Heart Battle
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  {getTournamentRoundName()}
                </Badge>
                <Progress value={getCurrentProgress()} className="w-full md:w-48" />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Choose the idol that appeals to you more
              </p>
            </div>

            {/* Mobile: Single column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {/* Left Idol */}
              <Card 
                className={`relative p-4 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-500 ${
                  heartEffect === 'left' ? 'scale-105 border-pink-500/50 shadow-pink-500/25 shadow-xl' : ''
                }`}
                onClick={() => handleChoice(currentPair[0], 'left')}
              >
                {heartEffect === 'left' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Heart className="w-12 h-12 text-pink-500 animate-bounce fill-current" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-primary/20">
                    <img 
                      src={currentPair[0].profile_image}
                      alt={currentPair[0].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold gradient-text">{currentPair[0].name}</h3>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20"
                  >
                    💕 Choose
                  </Button>
                </div>
              </Card>

              {/* VS Divider - Desktop only */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Right Idol */}
              <Card 
                className={`relative p-4 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-500 ${
                  heartEffect === 'right' ? 'scale-105 border-pink-500/50 shadow-pink-500/25 shadow-xl' : ''
                }`}
                onClick={() => handleChoice(currentPair[1], 'right')}
              >
                {heartEffect === 'right' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Heart className="w-12 h-12 text-pink-500 animate-bounce fill-current" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-primary/20">
                    <img 
                      src={currentPair[1].profile_image}
                      alt={currentPair[1].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold gradient-text">{currentPair[1].name}</h3>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20"
                  >
                    💕 Choose
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-3 glass-dark border-white/10">
              <div className="text-center space-y-2">
                <h3 className="font-bold text-xs text-muted-foreground">Tournament Progress</h3>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className={currentRound.length >= 16 ? 'text-primary' : 'text-muted-foreground'}>R16</span>
                  <span>→</span>
                  <span className={currentRound.length <= 8 && currentRound.length > 4 ? 'text-primary' : 'text-muted-foreground'}>QF</span>
                  <span>→</span>
                  <span className={currentRound.length <= 4 && currentRound.length > 2 ? 'text-primary' : 'text-muted-foreground'}>SF</span>
                  <span>→</span>
                  <span className={currentRound.length <= 2 ? 'text-primary' : 'text-muted-foreground'}>F</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {(gamePhase === 'preview' || gamePhase === 'minting' || gamePhase === 'complete') && finalWinner && (
          <div className="space-y-6 text-center p-4">
            <div className="text-4xl">🎉</div>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">
              Your Ideal AIDOL!
            </h2>
            
            <div className="aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-gradient-primary/20">
              <img 
                src={finalWinner.profile_image}
                alt={finalWinner.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold gradient-text">{finalWinner.name}</h3>
              {finalWinner.personality && (
                <Badge variant="outline" className="text-base px-3 py-1">
                  {finalWinner.personality}
                </Badge>
              )}
            </div>
            
            {gamePhase === 'preview' && (
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={() => {
                    localStorage.removeItem('pickProgress');
                    setGamePhase('loading');
                    fetchIdols();
                  }}
                  variant="outline"
                  size="lg"
                >
                  Choose Again
                </Button>
                <Button
                  onClick={handleConfirmPick}
                  size="lg"
                  className="btn-modern"
                  disabled={isMinting}
                >
                  Confirm
                </Button>
              </div>
            )}
            
            {gamePhase === 'minting' && (
              <div className="space-y-4">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">Saving...</p>
              </div>
            )}
            
            {gamePhase === 'complete' && (
              <div className="space-y-4">
                <div className="text-4xl">✅</div>
                <p className="text-lg text-primary">Complete!</p>
                <p className="text-muted-foreground">Moving to Vault...</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
