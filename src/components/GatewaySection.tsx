import { Sparkles, Target, Trophy } from "lucide-react";
import { GatewayCard } from "./GatewayCard";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const GatewaySection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const gateways = [
    {
      icon: Sparkles,
      gatewayName: t('journey.awaken.dimension'),
      title: t('journey.awaken.title'),
      subtitle: "",
      description: t('journey.awaken.description'),
      action: () => navigate("/pick"),
    },
    {
      icon: Target,
      gatewayName: t('journey.mission.dimension'),
      title: t('journey.mission.title'),
      subtitle: "",
      description: t('journey.mission.description'),
      action: () => navigate("/play"),
    },
    {
      icon: Trophy,
      gatewayName: t('journey.ascend.dimension'),
      title: t('journey.ascend.title'),
      subtitle: "",
      description: t('journey.ascend.description'),
      action: () => navigate("/pantheon"),
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4 gateway-section">
      <div className="max-w-6xl w-full">
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
              onClick={gateway.action}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
