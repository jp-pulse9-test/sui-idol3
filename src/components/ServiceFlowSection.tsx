import { FlowCard } from "./FlowCard";
import { Sparkles, Gamepad2, MessageCircle, Layers, RotateCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const ServiceFlowSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center mb-12">
          {t('flow.yourJourney')}
        </h2>

        {/* Flow Diagram */}
        <div className="bg-background/50 backdrop-blur p-6 md:p-8 rounded-lg border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1: SIMKUNG */}
            <FlowCard
              step="01"
              title="SIMKUNG"
              description={t('flow.step1.desc')}
              icon={Sparkles}
              color="cyan"
            />

            {/* Step 2: PLAY */}
            <FlowCard
              step="02"
              title="PLAY"
              description={t('flow.step2.desc')}
              icon={Gamepad2}
              color="purple"
            />

            {/* Step 3: CONNECT */}
            <FlowCard
              step="03"
              title="CONNECT"
              description={t('flow.step3.desc')}
              icon={MessageCircle}
              color="green"
            />

            {/* Step 4: COLLECT */}
            <FlowCard
              step="04"
              title="COLLECT"
              description={t('flow.step4.desc')}
              icon={Layers}
              color="red"
            />
          </div>

          {/* Loop Indicator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <RotateCw className="h-4 w-4" />
              <span className="text-sm font-mono">{t('flow.loop')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
