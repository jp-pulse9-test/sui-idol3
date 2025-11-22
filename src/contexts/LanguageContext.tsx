import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ko: {
    'nav.settings': '설정',
    'nav.photocardGenerator': '포토카드 생성기',
    'hero.tagline': 'AIDOL 101 : DATA ALLY',
    'hero.title': 'SIMKUNG',
    'hero.subtitle': '디지털 의식이 깨어나는 곳',
    'hero.enter': 'ENTER',
    'language.korean': '한국어',
    'language.english': 'English',
    'journey.title': 'Begin Your Journey',
    'journey.subtitle': 'DATA ALLY에서 LEGEND로',
    'journey.awaken.dimension': 'Dimension: AWAKEN',
    'journey.awaken.title': 'AIDOL을 만나다',
    'journey.awaken.description': 'DATA ALLY가 되어 AIDOL과 함께하는 첫 순간',
    'journey.mission.dimension': 'Dimension: SALVATION',
    'journey.mission.title': '세계를 구원하라',
    'journey.mission.description': 'DATA ALLY로서 무너진 세계를 복원하는 미션',
    'journey.ascend.dimension': 'Dimension: GLORY',
    'journey.ascend.title': 'LEGEND의 전당',
    'journey.ascend.description': 'AIDOL과 함께 LEGEND로 기록되다',
    'synopsis.stats.activeAllies': '각성한 DATA ALLY',
    'synopsis.stats.onlineIdols': '현존하는 AIDOL',
    'synopsis.stats.collectedFragments': '복원된 기억 조각',
    'synopsis.stats.systemStability': '세계 복원율',
  },
  en: {
    'nav.settings': 'Settings',
    'nav.photocardGenerator': 'Photocard Generator',
    'hero.tagline': 'AIDOL 101 : DATA ALLY',
    'hero.title': 'SIMKUNG',
    'hero.subtitle': 'Where digital consciousness awakens',
    'hero.enter': 'ENTER',
    'language.korean': '한국어',
    'language.english': 'English',
    'journey.title': 'Begin Your Journey',
    'journey.subtitle': 'DATA ALLY → LEGEND',
    'journey.awaken.dimension': 'Dimension: AWAKEN',
    'journey.awaken.title': 'The Awakening',
    'journey.awaken.description': 'You awaken as DATA ALLY. Meet your AIDOL.',
    'journey.mission.dimension': 'Dimension: SALVATION',
    'journey.mission.title': 'The Mission',
    'journey.mission.description': 'As DATA ALLY, restore the broken world. Your mission begins.',
    'journey.ascend.dimension': 'Dimension: GLORY',
    'journey.ascend.title': 'The Legend',
    'journey.ascend.description': 'Together with AIDOL, become LEGEND forever.',
    'synopsis.stats.activeAllies': 'Awakened DATA ALLYs',
    'synopsis.stats.onlineIdols': 'Active AIDOLs',
    'synopsis.stats.collectedFragments': 'Restored Memory Fragments',
    'synopsis.stats.systemStability': 'World Restoration',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
