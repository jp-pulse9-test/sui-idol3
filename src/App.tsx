import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GenderSelect from "./pages/GenderSelect";
import MBTITest from "./pages/MBTITest";
import AppearanceTest from "./pages/AppearanceTest";
import ResultAnalysis from "./pages/ResultAnalysis";
import FinalPick from "./pages/FinalPick";
import WorldCup from "./pages/WorldCup";
import PhotoCard from "./pages/PhotoCard";
import Collection from "./pages/Collection";
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
          <Route path="/gender-select" element={<GenderSelect />} />
          <Route path="/mbti" element={<MBTITest />} />
          <Route path="/appearance" element={<AppearanceTest />} />
          <Route path="/result-analysis" element={<ResultAnalysis />} />
          <Route path="/final-pick" element={<FinalPick />} />
          <Route path="/worldcup" element={<WorldCup />} />
          <Route path="/photocard" element={<PhotoCard />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/growth" element={<Growth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
