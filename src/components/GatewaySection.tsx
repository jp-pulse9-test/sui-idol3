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
      gatewayName: t('journey.awaken.dimension'),
      title: t('journey.awaken.title'),
      subtitle: "",
      description: t('journey.awaken.description'),
      detailedInfo: t('journey.awaken.detailedInfo'),
      path: "/pick",
    },
    {
      icon: Target,
      gatewayName: t('journey.mission.dimension'),
      title: t('journey.mission.title'),
      subtitle: "",
      description: t('journey.mission.description'),
      detailedInfo: t('journey.mission.detailedInfo'),
      path: "/play",
    },
    {
      icon: Trophy,
      gatewayName: t('journey.ascend.dimension'),
      title: t('journey.ascend.title'),
      subtitle: "",
      description: t('journey.ascend.description'),
      detailedInfo: t('journey.ascend.detailedInfo'),
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
            {t('journey.title')}
          </h2>
          <p className="text-muted-foreground font-orbitron">
            {t('journey.subtitle')}
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
