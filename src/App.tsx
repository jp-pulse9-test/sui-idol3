import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProviderWrapper } from "@/providers/WalletProvider";
import { useState, useEffect } from "react";
import { zkLoginService } from "@/services/zkLoginService";
import { zkLoginServiceWorking } from "@/services/zkLoginServiceWorking";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DevTools } from "@/components/DevTools";
import Index from "./pages/Index";
import Pick from "./pages/Pick";
import Vault from "./pages/Vault";
import Rise from "./pages/Rise";
import Play from "./pages/Play";
import Progress from "./pages/Progress";
import GenderSelect from "./pages/GenderSelect";

import MBTITestEnhanced from "./pages/MBTITestEnhanced";
import AppearanceTestEnhanced from "./pages/AppearanceTestEnhanced";
import ResultAnalysisEnhanced from "./pages/ResultAnalysisEnhanced";
import FinalPick from "./pages/FinalPick";
import WorldCup from "./pages/WorldCup";
import PhotoCard from "./pages/PhotoCard";
import Collection from "./pages/Collection";
import Gallery from "./pages/Gallery";
import Growth from "./pages/Growth";
import ZkLoginTest from "./pages/ZkLoginTest";
import ZkLoginTestOfficial from "./pages/ZkLoginTestOfficial";
import ZkLoginTestWorking from "./pages/ZkLoginTestWorking";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import SettingsPage from "./pages/Settings";

const AdminButton = () => {
  const { user } = useAuth();
  const [showDevTools, setShowDevTools] = useState(false);
  const SUPER_ADMIN_WALLETS = [
    "0x999403dcfae1c4945e4f548fb2e7e6c7912ad4dd68297f1a5855c847513ec8fc",
    "0x6f8a5d5a7f7b8a527c9493841e21699ee87453a341b95b297eb2f616c687ac1f",
    "0x0065009a167c25172cccf24adeb1c0e5a53726cbf2a15bf261a2e3a559d7c5ca",
    "0xbf0ca9fc3f88f59193a5b985e61dd8b02d97f83b2efe99b9a2c5ae50c16cb531"
  ];

  if (!user || !SUPER_ADMIN_WALLETS.includes(user.id)) return null;

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowDevTools(!showDevTools)}
          variant="outline"
          size="sm"
          className="bg-card/80 backdrop-blur-sm border-border hover:bg-primary/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          관리자
        </Button>
      </div>
      {showDevTools && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDevTools(false)}>
          <div className="fixed top-16 right-4 z-50" onClick={(e) => e.stopPropagation()}>
            <DevTools />
          </div>
        </div>
      )}
    </>
  );
};

const App = () => {
  // zkLogin OAuth 콜백 처리
  useEffect(() => {
    const handleZkLoginCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('id_token')) {
        await zkLoginService.handleOAuthCallback();
        await zkLoginServiceWorking.handleOAuthCallback();
      }
    };

    handleZkLoginCallback();
  }, []);

  return (
    <WalletProviderWrapper>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          {/* 새로운 3단계 플로우: Pick → Vault → Rise */}
          <Route path="/pick" element={<Pick />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/rise" element={<Rise />} />
          
          {/* 이전 플로우 (호환성) */}
          <Route path="/play" element={<Play />} />
          <Route path="/progress" element={<Progress />} />
          
          {/* 기존 세부 페이지들 */}
          <Route path="/gender-select" element={<GenderSelect />} />
          
          <Route path="/mbti" element={<MBTITestEnhanced />} />
          <Route path="/appearance" element={<AppearanceTestEnhanced />} />
          <Route path="/result-analysis" element={<ResultAnalysisEnhanced />} />
          <Route path="/final-pick" element={<FinalPick />} />
          <Route path="/worldcup" element={<WorldCup />} />
          <Route path="/photocard" element={<PhotoCard />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/zklogin-test" element={<ZkLoginTest />} />
          <Route path="/zklogin-test-official" element={<ZkLoginTestOfficial />} />
          <Route path="/zklogin-test-working" element={<ZkLoginTestWorking />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
          <AdminButton />
        </AuthProvider>
      </TooltipProvider>
    </WalletProviderWrapper>
  );
};

export default App;
