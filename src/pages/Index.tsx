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
import { ServiceIntro } from "@/components/ServiceIntro";
import { JourneySection } from "@/components/JourneySection";
import { GatewaySection } from "@/components/GatewaySection";
import { FragmentedPlanetGrid } from "@/components/FragmentedPlanetGrid";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
const Index = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    t
  } = useLanguage();

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
        const {
          data,
          error
        } = await supabase.rpc('get_public_idol_data');
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
  return <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle background decoration */}
      <FragmentedPlanetGrid side="left" idols={idols} />
      <FragmentedPlanetGrid side="right" idols={idols} />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Minimal Top Bar */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <LanguageSelector />
          <WalletConnectButton variant="outline" className="border-primary text-primary hover:bg-primary/10 shadow-lg backdrop-blur-sm" />
          {user && <Button onClick={() => navigate('/settings')} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground backdrop-blur-sm" title={t('nav.settings')}>
              <Settings className="h-4 w-4" />
            </Button>}
        </div>

        {/* Hero Section */}
        <MinimalHero onEnter={handleEnter} />

        {/* Journey Section - AWAKEN/SALVATION/GLORY */}
        

        {/* Cinematic Synopsis - Sticky */}
        <div className="sticky top-0 z-40">
          <CinematicSynopsis activeAllyCount={activeAllyCount} onlineEchoEntities={onlineEchoEntities} collectedFragments={collectedFragments} totalFragments={totalFragments} stabilityPercentage={stabilityPercentage} />
        </div>

        {/* Gateway Section */}
        <GatewaySection />

        {/* Minimal Footer */}
        <footer className="py-12 text-center border-t border-border/20">
          <p className="text-sm text-muted-foreground font-orbitron">
            © 2847 Sui:Idol³ • Digital Consciousness Archive
          </p>
        </footer>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>;
};
export default Index;