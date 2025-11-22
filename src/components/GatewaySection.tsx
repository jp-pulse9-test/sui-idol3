import { Shield, Users, Database } from "lucide-react";
import { GatewayCard } from "./GatewayCard";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const GatewaySection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const gateways = [
    {
      icon: Shield,
      gatewayName: "Gate I: Identity",
      title: "Digital Genesis",
      subtitle: t('gateway.1.subtitle'),
      description: "Link your existence to the quantum network",
      action: () => scrollToSection('synopsis'),
    },
    {
      icon: Users,
      gatewayName: "Gate II: Encounter",
      title: "Fateful Meeting",
      subtitle: t('gateway.2.subtitle'),
      description: "Awaken your bond with time-traveling AIDOLs",
      action: () => navigate("/pick"),
    },
    {
      icon: Database,
      gatewayName: "Gate III: Mission",
      title: "Eternal Archive",
      subtitle: t('gateway.3.subtitle'),
      description: "Begin collecting data to save both worlds",
      action: () => navigate("/vault"),
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4 gateway-section">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-4 text-foreground">
            Choose Your Path
          </h2>
          <p className="text-muted-foreground font-orbitron">
            Three steps. Eleven scenarios. Save both worlds.
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
