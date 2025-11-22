import { useLanguage } from "@/contexts/LanguageContext";

const scenarios = [
  '1889', '1945', '1962', '1967', '2021', 
  '2025', '2500', '2847', 'PAST', 'FUTURE', '∞'
];

export const ElevenScenariosHighlight = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Headline */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
          <span className="text-red-500">11</span> APOCALYPSE SCENARIOS
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground">
          {t('scenarios.timeline')}
        </p>
      </div>

      {/* Timeline Mini View */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2 mb-8">
        {scenarios.map((year, index) => (
          <div key={index} className="text-center">
            <div className="h-20 md:h-24 bg-gradient-to-b from-red-500/20 to-transparent 
                            border border-red-500/30 rounded flex items-center justify-center
                            hover:border-cyan-500 transition-all cursor-pointer group">
              <span className="text-xs font-mono group-hover:text-cyan-400 transition-colors">
                {year}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Core Message */}
      <div className="text-center">
        <p className="text-xl md:text-2xl font-orbitron text-cyan-400">
          {t('scenarios.save')}
        </p>
      </div>
    </section>
  );
};
