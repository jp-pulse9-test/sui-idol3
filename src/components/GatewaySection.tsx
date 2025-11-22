import { Sparkles, Target, Trophy } from "lucide-react";
import { GatewayCard } from "./GatewayCard";
import { useNavigate } from "react-router-dom";

export const GatewaySection = () => {
  const navigate = useNavigate();

  const gateways = [
    {
      icon: Sparkles,
      gatewayName: "Dimension: AWAKEN",
      title: "Choose Your AIDOL",
      subtitle: "아이돌 선택",
      description: "Meet time-traveling AIDOLs and form your eternal bond",
      action: () => navigate("/pick"),
    },
    {
      icon: Target,
      gatewayName: "Dimension: MISSION",
      title: "Save Both Worlds",
      subtitle: "세계 구원",
      description: "Complete salvation missions across fragmented timelines",
      action: () => navigate("/play"),
    },
    {
      icon: Trophy,
      gatewayName: "Dimension: ASCEND",
      title: "Enter the Hall",
      subtitle: "명예의 전당",
      description: "Rise to glory and claim your place among legends",
      action: () => navigate("/pantheon"),
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4 gateway-section">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-4 text-foreground">
            Begin Your Journey
          </h2>
          <p className="text-muted-foreground font-orbitron">
            From bond to glory
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
