import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Vault, TrendingUp } from "lucide-react";
export const ServiceIntro = () => {
  const {
    t
  } = useLanguage();
  const features = [{
    icon: Sparkles,
    titleKey: 'service.pick.title',
    subtitleKey: 'service.pick.subtitle',
    descriptionKey: 'service.pick.description',
    gradient: 'from-primary/20 via-primary/10 to-transparent'
  }, {
    icon: Vault,
    titleKey: 'service.vault.title',
    subtitleKey: 'service.vault.subtitle',
    descriptionKey: 'service.vault.description',
    gradient: 'from-accent/20 via-accent/10 to-transparent'
  }, {
    icon: TrendingUp,
    titleKey: 'service.rise.title',
    subtitleKey: 'service.rise.subtitle',
    descriptionKey: 'service.rise.description',
    gradient: 'from-secondary/20 via-secondary/10 to-transparent'
  }];
  return <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-orbitron font-bold text-foreground">
            {t('service.intro.title')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-orbitron max-w-3xl mx-auto leading-relaxed">
            {t('service.intro.subtitle')}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
          const Icon = feature.icon;
          return <div key={feature.titleKey} className="group relative" style={{
            animationDelay: `${index * 100}ms`
          }}>
                {/* Card */}
                <div className="relative h-full p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-2xl font-orbitron font-bold text-foreground mb-1">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground font-orbitron">
                        {t(feature.subtitleKey)}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                </div>
              </div>;
        })}
        </div>
      </div>
    </section>;
};