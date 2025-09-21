import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Heart, Star, Sparkles, BarChart3, Radar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { IdolStatsDisplay, generateRandomStats } from "@/components/IdolStatsDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { secureStorage } from "@/utils/secureStorage";
import { IdolPreset } from "@/types/idol";
import { useNavigate } from "react-router-dom";

interface IdolPreviewProps {
  selectedIdol: IdolPreset;
  onConfirm: () => void;
  onBack: () => void;
  isMinting?: boolean;
}

const IdolPreview = ({ selectedIdol, onConfirm, onBack, isMinting = false }: IdolPreviewProps) => {
  const navigate = useNavigate();
  const [votingProgress, setVotingProgress] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [hasSufficientCoins, setHasSufficientCoins] = useState(false);
  const [currentSuiCoins, setCurrentSuiCoins] = useState(0);
  const [idolStats, setIdolStats] = useState(() => generateRandomStats(selectedIdol.personality));

  useEffect(() => {
    // Check Sui coin balance (0.15 coins = 700 won)
    const userCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    setCurrentSuiCoins(userCoins);
    setHasSufficientCoins(userCoins >= 0.15);
    
    console.log('🔍 IdolPreview coin check:', { userCoins, hasSufficientCoins: userCoins >= 0.15 });
  }, []);

  const handleVoting = async () => {
    // Real-time coin recheck
    const latestCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    setCurrentSuiCoins(latestCoins);
    
    if (latestCoins < 0.15) {
      toast.error(`Insufficient Sui coins. 0.15 coins (700 won) required. Current: ${latestCoins.toFixed(2)} SUI`);
      return;
    }

    setIsVoting(true);
    setVotingProgress(0);
    
    // Voting progress simulation
    const intervals = [20, 40, 60, 80, 100];
    for (const progress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setVotingProgress(progress);
    }
    
    // Deduct coins
    const finalCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    localStorage.setItem('suiCoins', (finalCoins - 0.15).toFixed(2));
    
    // Confirm after completion
    setTimeout(() => {
      onConfirm();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            👑 Favorite Selection Complete!
          </h1>
          <p className="text-muted-foreground text-lg">
            Congratulations! Check out your favorite selected from the heart-racing battle
          </p>
        </div>

        {/* Winning idol card */}
        <div className="text-center">
          <Card className="p-8 glass-dark border-white/10 max-w-md mx-auto relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-pink-500/10 to-purple-500/10" />
            <div className="absolute top-4 right-4">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="relative space-y-6">
              {/* Idol image */}
              <div className="relative mx-auto w-48 h-48">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gradient-primary shadow-xl">
                  <img 
                    src={selectedIdol.profile_image}
                    alt={selectedIdol.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Sparkle effects */}
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="absolute -bottom-2 -left-2 animate-bounce delay-300">
                  <Star className="w-5 h-5 text-pink-400" />
                </div>
              </div>

              {/* Idol information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold gradient-text">{selectedIdol.name}</h2>
                  <Badge variant="outline" className="px-4 py-2">
                    {selectedIdol.personality}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">
                  {selectedIdol.description}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Idol detailed stats */}
        <Card className="p-6 glass-dark border-white/10">
          <Tabs defaultValue="radar" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">📊 Idol Stats</h3>
              <TabsList className="bg-card/50">
                <TabsTrigger value="radar" className="flex items-center gap-2">
                  <Radar className="w-4 h-4" />
                  Radar
                </TabsTrigger>
                <TabsTrigger value="bar" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Bar Chart
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="radar">
              <IdolStatsDisplay stats={idolStats} viewMode="radar" />
            </TabsContent>
            
            <TabsContent value="bar">
              <IdolStatsDisplay stats={idolStats} viewMode="bar" />
            </TabsContent>
          </Tabs>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm bg-card/30 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {Math.round(Object.values(idolStats).reduce((acc, stat) => acc + stat.current, 0) / 8)}
              </div>
              <div className="text-muted-foreground">Current Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {Math.round(Object.values(idolStats).reduce((acc, stat) => acc + stat.potential, 0) / 8)}
              </div>
              <div className="text-muted-foreground">Potential Average</div>
            </div>
          </div>
        </Card>

        {/* Voting process */}
        {!isVoting ? (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold gradient-text">💝 Vote for Your Favorite</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Vote for your selected idol to own them permanently. <br />
                Voting cost: 0.15 SUI coins (700 won) | Current balance: {currentSuiCoins.toFixed(2)} SUI
              </p>
              {currentSuiCoins < 0.15 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-destructive text-sm">
                    ⚠️ Insufficient Sui coins. 0.15 coins required. <br />
                    Current balance: {currentSuiCoins.toFixed(2)} SUI
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={onBack} variant="outline" size="lg">
                ← Select Again
              </Button>
              <Button 
                onClick={handleVoting} 
                variant="default" 
                size="lg"
                className="btn-modern px-8"
                disabled={currentSuiCoins < 0.15 || isMinting}
              >
                {isMinting ? "🔄 Minting..." : "💝 Vote (0.15 SUI)"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <Card className="p-8 glass-dark border-white/10 max-w-md mx-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold gradient-text">Voting in progress...</h3>
                  <p className="text-muted-foreground">Please wait a moment</p>
                </div>
                
                <div className="space-y-4">
                  <Progress value={votingProgress} className="w-full h-3" />
                  <div className="text-sm text-muted-foreground">
                    {votingProgress === 0 && "Connecting to blockchain network..."}
                    {votingProgress === 20 && "Creating voting transaction..."}
                    {votingProgress === 40 && "Calling smart contract..."}
                    {votingProgress === 60 && "Recording vote..."}
                    {votingProgress === 80 && "Registering ownership..."}
                    {votingProgress === 100 && "🎉 Voting complete!"}
                  </div>
                </div>

                {votingProgress === 100 && (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-bold">Vote successful!</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Next step buttons */}
        <Card className="p-6 glass-dark border-white/10 max-w-2xl mx-auto">
          <div className="text-center space-y-6">
            <h3 className="text-xl font-bold gradient-text">Next Steps</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-auto p-6 flex flex-col items-center space-y-3 bg-card/50 hover:bg-accent/20 border-accent/30"
                onClick={() => navigate('/vault')}
              >
                <div className="text-2xl">🗃️</div>
                <div className="font-bold text-accent text-lg">VAULT</div>
                <div className="text-muted-foreground text-sm">Story Play & Photocard Collection</div>
                <ArrowRight className="h-4 w-4 text-accent" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-auto p-6 flex flex-col items-center space-y-3 bg-card/50 hover:bg-secondary/20 border-secondary/30"
                onClick={() => navigate('/rise')}
              >
                <div className="text-2xl">📈</div>
                <div className="font-bold text-secondary text-lg">RISE</div>
                <div className="text-muted-foreground text-sm">Leaderboard & Gallery & Trading</div>
                <ArrowRight className="h-4 w-4 text-secondary" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IdolPreview;