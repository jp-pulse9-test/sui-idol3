import { useState } from "react";
import { Sparkles, Target, Trophy } from "lucide-react";
import { GatewayCard } from "./GatewayCard";
import { JourneyDetailDialog } from "./JourneyDetailDialog";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MultiversePlanets } from "./MultiversePlanets";

export const GatewaySection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedGateway, setSelectedGateway] = useState<{
    icon: any;
    gatewayName: string;
    title: string;
    description: string;
    detailedInfo: string;
    path: string;
  } | null>(null);

  const gateways = [
    {
      icon: Sparkles,
      gatewayName: "AWAKEN ❅",
      title: "The Awakening",
      subtitle: "각성",
      description: "You awaken as DATA ALLY. Meet your AIDOL.",
      detailedInfo: "당신은 DATA ALLY로 깨어납니다. 당신의 AIDOL을 만나세요.",
      path: "/pick",
    },
    {
      icon: Target,
      gatewayName: "SALVATION",
      title: "The Mission",
      subtitle: "임무",
      description: "As DATA ALLY, restore the broken world. Your mission begins.",
      detailedInfo: "DATA ALLY로서 부서진 세계를 복원하세요. 당신의 임무가 시작됩니다.",
      path: "/play",
    },
    {
      icon: Trophy,
      gatewayName: "GLORY",
      title: "The Legend",
      subtitle: "전설",
      description: "Together with AIDOL, become LEGEND forever.",
      detailedInfo: "AIDOL과 함께 영원한 LEGEND가 되세요.",
      path: "/pantheon",
    },
  ];

  return (
    <section className="min-h-screen relative flex items-center justify-center py-32 mt-20 px-4 gateway-section">
      {/* Multiverse background */}
      <div className="absolute inset-0 opacity-40">
        <MultiversePlanets />
      </div>
      
      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-4 text-foreground">
            Begin Your Journey
          </h2>
          <p className="text-muted-foreground font-orbitron text-xl">
            DATA ALLY → LEGEND
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gateways.map((gateway) => (
            <GatewayCard
              key={gateway.gatewayName}
              icon={gateway.icon}
              gatewayName={gateway.gatewayName}
              title={gateway.title}
              subtitle={gateway.subtitle}
              description={gateway.description}
              onClick={() => setSelectedGateway(gateway)}
            />
          ))}
        </div>
      </div>
      
      {/* Journey Detail Dialog */}
      {selectedGateway && (
        <JourneyDetailDialog
          open={!!selectedGateway}
          onOpenChange={(open) => !open && setSelectedGateway(null)}
          icon={selectedGateway.icon}
          gatewayName={selectedGateway.gatewayName}
          title={selectedGateway.title}
          description={selectedGateway.description}
          detailedInfo={selectedGateway.detailedInfo}
          onStart={() => navigate(selectedGateway.path)}
        />
      )}
    </section>
  );
};
