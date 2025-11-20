import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Settings, Camera } from "lucide-react";
import { CinematicSynopsis } from "@/components/CinematicSynopsis";
import { MinimalHero } from "@/components/MinimalHero";
import { GatewaySection } from "@/components/GatewaySection";
import { FragmentedPlanetGrid } from "@/components/FragmentedPlanetGrid";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Ally Status Data for CinematicSynopsis
  const [collectedFragments] = useState(1247);
  const [totalFragments] = useState(487634);
  const [stabilityPercentage] = useState(12.4);
  const [activeAllyCount] = useState(8942);
  const [onlineEchoEntities] = useState(143);
  
  // Idol data state for background
  const [idols, setIdols] = useState<any[]>([]);

  // Fetch idols for background
  useEffect(() => {
    const fetchIdols = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_public_idol_data');
        
        if (error) throw error;
        
        if (data) {
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setIdols(shuffled.slice(0, 12));
        }
      } catch (error) {
        console.error('Error fetching idols:', error);
      }
    };
    
    fetchIdols();
  }, []);

  const handleEnter = () => {
    // Navigate to game start (gender selection)
    navigate('/gender-select');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle background decoration */}
      <FragmentedPlanetGrid side="left" idols={idols} />
      <FragmentedPlanetGrid side="right" idols={idols} />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Minimal Top Bar */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <WalletConnectButton 
            variant="default" 
            className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-lg backdrop-blur-sm"
          />
          {user && (
            <>
              <Button
                onClick={() => navigate('/photocard-generator')}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground backdrop-blur-sm"
                title="Photocard Generator"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground backdrop-blur-sm"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Hero Section */}
        <MinimalHero onEnter={handleEnter} />

        {/* Cinematic Synopsis */}
        <div id="synopsis" className="py-20">
          <CinematicSynopsis
            activeAllyCount={activeAllyCount}
            onlineEchoEntities={onlineEchoEntities}
            collectedFragments={collectedFragments}
            totalFragments={totalFragments}
            stabilityPercentage={stabilityPercentage}
          />
        </div>

        {/* Gateway Section */}
        <GatewaySection />

        {/* Minimal Footer */}
        <footer className="py-12 text-center border-t border-border/20">
          <p className="text-sm text-muted-foreground font-orbitron">
            © 2847 SIMKUNG • Digital Consciousness Archive
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
