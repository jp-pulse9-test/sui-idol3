import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, Crown, ArrowRight } from "lucide-react";

export const JourneySection = () => {
  const { t } = useLanguage();

  const journeySteps = [
    {
      icon: Sparkles,
      dimension: "AWAKEN",
      symbol: "❅",
      title: { en: "The Awakening", ko: "각성" },
      description: {
        en: "You awaken as DATA ALLY. Meet your AIDOL.",
        ko: "당신은 DATA ALLY로 깨어납니다. 당신의 AIDOL을 만나세요."
      },
      gradient: "from-primary/20 to-primary-glow/20"
    },
    {
      icon: Target,
      dimension: "SALVATION",
      symbol: "🎯",
      title: { en: "The Mission", ko: "임무" },
      description: {
        en: "As DATA ALLY, restore the broken world. Your mission begins.",
        ko: "DATA ALLY로서 부서진 세계를 복원하세요. 당신의 임무가 시작됩니다."
      },
      gradient: "from-accent/20 to-secondary/20"
    },
    {
      icon: Crown,
      dimension: "GLORY",
      symbol: "👑",
      title: { en: "The Legend", ko: "전설" },
      description: {
        en: "Together with AIDOL, become LEGEND forever.",
        ko: "AIDOL과 함께 영원한 LEGEND가 되세요."
      },
      gradient: "from-primary-glow/20 to-primary/30"
    }
  ];

  return (
    <section className="py-24 px-4 bg-background/50 backdrop-blur-sm relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground">
            Begin Your Journey
          </h2>
          <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-pixel">
            <span className="text-primary">DATA ALLY</span>
            <ArrowRight className="text-muted-foreground" />
            <span className="text-primary-glow">LEGEND</span>
          </div>
          <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Journey Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.dimension}
                className={`relative overflow-hidden group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${step.gradient}`}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-4xl">{step.symbol}</span>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-muted-foreground mb-1">
                      Dimension: {step.dimension}
                    </div>
                    <CardTitle className="text-xl font-orbitron">
                      {step.title.en} / {step.title.ko}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description.en}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground mt-2 font-mono">
                    {step.description.ko}
                  </p>
                </CardContent>

                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-pixel text-sm text-primary">
                  {index + 1}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
