import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Settings } from "lucide-react";
import { CinematicSynopsis } from "@/components/CinematicSynopsis";
import { MinimalHero } from "@/components/MinimalHero";
import { GatewaySection } from "@/components/GatewaySection";
import { FragmentedPlanetGrid } from "@/components/FragmentedPlanetGrid";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
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
    // Navigate directly to simplified pick (tournament)
    navigate('/pick');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle background decoration */}
      <FragmentedPlanetGrid side="left" idols={idols} />
      <FragmentedPlanetGrid side="right" idols={idols} />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Fixed Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="font-orbitron text-sm text-muted-foreground">
              SIMKUNG • AIDOL 101
            </div>
            <div className="flex gap-2">
              <LanguageSelector />
              <WalletConnectButton 
                variant="outline" 
                className="border-white/50 hover:border-white text-white hover:bg-white/10"
              />
              {user && (
                <Button
                  onClick={() => navigate('/settings')}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-white/10"
                  title={t('nav.settings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="pt-20">
          <MinimalHero onEnter={handleEnter} />
        </div>

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
