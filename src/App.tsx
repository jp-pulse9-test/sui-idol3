import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IdolPick from "./pages/IdolPick";
import Vault from "./pages/Vault";
import Collection from "./pages/Collection";
import PickOld from "./pages/Pick";
import Play from "./pages/Play";
import Progress from "./pages/Progress";
import GenderSelect from "./pages/GenderSelect";
import WorldSelect from "./pages/WorldSelect";
import MBTITestEnhanced from "./pages/MBTITestEnhanced";
import AppearanceTestEnhanced from "./pages/AppearanceTestEnhanced";
import ResultAnalysisEnhanced from "./pages/ResultAnalysisEnhanced";
import FinalPick from "./pages/FinalPick";
import WorldCup from "./pages/WorldCup";
import Gallery from "./pages/Gallery";
import Growth from "./pages/Growth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* PRD 기반 메인 플로우 */}
          <Route path="/pick" element={<IdolPick />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/collection" element={<Collection />} />
          
          {/* 기존 3단계 플로우 */}
          <Route path="/pick-old" element={<PickOld />} />
          <Route path="/play" element={<Play />} />
          <Route path="/progress" element={<Progress />} />
          
          {/* 기존 세부 페이지들 */}
          <Route path="/gender-select" element={<GenderSelect />} />
          <Route path="/world-select" element={<WorldSelect />} />
          <Route path="/mbti" element={<MBTITestEnhanced />} />
          <Route path="/appearance" element={<AppearanceTestEnhanced />} />
          <Route path="/result-analysis" element={<ResultAnalysisEnhanced />} />
          <Route path="/final-pick" element={<FinalPick />} />
          <Route path="/worldcup" element={<WorldCup />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/growth" element={<Growth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
