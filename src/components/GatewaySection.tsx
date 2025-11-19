import { Wallet, Sparkles, Image } from "lucide-react";
import { GatewayCard } from "./GatewayCard";
import { useNavigate } from "react-router-dom";

export const GatewaySection = () => {
  const navigate = useNavigate();

  const gateways = [
    {
      icon: Wallet,
      title: "Connect",
      description: "Link your digital identity",
      action: () => {
        // Scroll to top where wallet connect is
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    },
    {
      icon: Sparkles,
      title: "Awaken",
      description: "Begin your journey",
      action: () => navigate("/pick"),
    },
    {
      icon: Image,
      title: "Collect",
      description: "Build your legacy",
      action: () => navigate("/vault"),
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-4 text-foreground">
            Choose Your Path
          </h2>
          <p className="text-muted-foreground font-orbitron">
            Three gateways. One destiny.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gateways.map((gateway) => (
            <GatewayCard
              key={gateway.title}
              icon={gateway.icon}
              title={gateway.title}
              description={gateway.description}
              onClick={gateway.action}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
