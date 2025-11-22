import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WalletProviderWrapper } from "@/providers/WalletProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppSuspense from "@/components/AppSuspense";
import { useState, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DevTools } from "@/components/DevTools";
import { AppHeader } from "@/components/AppHeader";
import { MobileNavBar } from "@/components/MobileNavBar";
import { CommandPalette } from "@/components/CommandPalette";
import Index from "./pages/Index";
import PickSimplified from "./pages/PickSimplified";
import IdolGallery from "./pages/IdolGallery";
const Vault = lazy(() => import("./pages/Vault"));
import Rise from "./pages/Rise";
import Play from "./pages/Play";
import Pantheon from "./pages/Pantheon";
import Progress from "./pages/Progress";
import PhotoCard from "./pages/PhotoCard";
import Collection from "./pages/Collection";

import Growth from "./pages/Growth";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import SettingsPage from "./pages/Settings";
import PhotocardGenerator from "./pages/PhotocardGenerator";
import My from "./pages/My";
const DemoChat = lazy(() => import("./pages/DemoChat"));
const IdolDetail = lazy(() => import("./pages/IdolDetail"));

const AdminButton = () => {
  const { user } = useAuth();
  const [showDevTools, setShowDevTools] = useState(false);
  
  // 관리자 기능은 제거되었습니다
  return null;

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

const App = () => (
  <ErrorBoundary>
    <AppSuspense>
      <WalletProviderWrapper>
        <TooltipProvider>
          <LanguageProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col w-full">
                  <AppHeader />
                  <CommandPalette />
                  
                  <main className="flex-1 pt-16 pb-20 md:pb-4">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/my" element={<My />} />
                      <Route path="/demo-chat" element={<DemoChat />} />
                      <Route path="/idol-detail" element={<IdolDetail />} />
                      <Route path="/gallery" element={<IdolGallery />} />
                      
                      {/* 간소화된 플로우: Pick → Vault → Rise */}
                      <Route path="/pick" element={<PickSimplified />} />
                      <Route path="/vault" element={<Vault />} />
                      <Route path="/rise" element={<Rise />} />
                      
                      {/* 기타 페이지들 */}
                      <Route path="/play" element={<Play />} />
                      <Route path="/pantheon" element={<Pantheon />} />
                      <Route path="/progress" element={<Progress />} />
                      <Route path="/photocard" element={<PhotoCard />} />
                      <Route path="/collection" element={<Collection />} />
                      
                      <Route path="/growth" element={<Growth />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/photocard-generator" element={<PhotocardGenerator />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>

                  <MobileNavBar />
                  <AdminButton />
                </div>
              </BrowserRouter>
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </WalletProviderWrapper>
    </AppSuspense>
  </ErrorBoundary>
);

export default App;
