import { 
  BookOpen, Clock, Heart, Zap, Database, 
  Target, Archive, User, Flame, LucideIcon 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

const FeatureCard = ({ number, title, description, icon: Icon, gradient }: FeatureCardProps) => {
  return (
    <div className={`relative group cursor-pointer overflow-hidden
                    border border-primary/20 rounded-lg p-6
                    bg-gradient-to-br ${gradient}
                    hover:border-primary transition-all hover:scale-105`}>
      {/* Number */}
      <div className="absolute top-2 right-2 text-5xl font-orbitron 
                      font-bold opacity-10 group-hover:opacity-20 transition-opacity">
        {number}
      </div>

      {/* Icon */}
      <Icon className="h-10 w-10 mb-4 text-primary" />

      {/* Title */}
      <h3 className="text-lg font-orbitron font-bold mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        {description}
      </p>

      {/* Hover Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 
                      bg-gradient-to-r from-primary to-transparent 
                      transform scale-x-0 group-hover:scale-x-100 
                      transition-transform origin-left" />
    </div>
  );
};

export const FeatureHighlights = () => {
  const { t } = useLanguage();

  const features: Feature[] = [
    {
      title: t('feature.1.title'),
      description: t('feature.1.desc'),
      icon: BookOpen,
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      title: t('feature.2.title'),
      description: t('feature.2.desc'),
      icon: Clock,
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: t('feature.3.title'),
      description: t('feature.3.desc'),
      icon: Heart,
      gradient: 'from-red-500/20 to-orange-500/20'
    },
    {
      title: t('feature.4.title'),
      description: t('feature.4.desc'),
      icon: Zap,
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      title: t('feature.5.title'),
      description: t('feature.5.desc'),
      icon: Database,
      gradient: 'from-yellow-500/20 to-amber-500/20'
    },
    {
      title: t('feature.6.title'),
      description: t('feature.6.desc'),
      icon: Target,
      gradient: 'from-indigo-500/20 to-violet-500/20'
    },
    {
      title: t('feature.7.title'),
      description: t('feature.7.desc'),
      icon: Archive,
      gradient: 'from-teal-500/20 to-cyan-500/20'
    },
    {
      title: t('feature.8.title'),
      description: t('feature.8.desc'),
      icon: User,
      gradient: 'from-rose-500/20 to-pink-500/20'
    },
    {
      title: t('feature.9.title'),
      description: t('feature.9.desc'),
      icon: Flame,
      gradient: 'from-red-500/20 to-red-700/20'
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center mb-4">
          {t('features.title')}
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          {t('features.subtitle')}
        </p>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              number={String(index + 1).padStart(2, '0')}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
