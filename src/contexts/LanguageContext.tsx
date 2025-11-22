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
    'journey.title': '당신의 여정이 시작됩니다',
    'journey.subtitle': '인연에서 영광으로',
    'journey.awaken.dimension': 'Dimension: 각성',
    'journey.awaken.title': '운명의 만남',
    'journey.awaken.description': '시간을 넘나드는 AIDOL과 영원한 인연을 맺다',
    'journey.mission.dimension': 'Dimension: 구원',
    'journey.mission.title': '두 세계를 구하라',
    'journey.mission.description': '분열된 시간 속, 세계를 되살릴 미션을 완수하다',
    'journey.ascend.dimension': 'Dimension: 영광',
    'journey.ascend.title': '전설의 전당으로',
    'journey.ascend.description': '영광의 정점에 오르며, 전설 속 그 자리를 차지하다',
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
    'journey.subtitle': 'From bond to glory',
    'journey.awaken.dimension': 'Dimension: AWAKEN',
    'journey.awaken.title': 'Fateful Encounter',
    'journey.awaken.description': 'Meet time-traveling AIDOLs and form your eternal bond',
    'journey.mission.dimension': 'Dimension: SALVATION',
    'journey.mission.title': 'Save Both Worlds',
    'journey.mission.description': 'Complete missions to restore fragmented timelines',
    'journey.ascend.dimension': 'Dimension: GLORY',
    'journey.ascend.title': 'Hall of Legends',
    'journey.ascend.description': 'Rise to the pinnacle and claim your place among legends',
    'synopsis.stats.activeAllies': 'Awakened DATA ALLYs',
    'synopsis.stats.onlineIdols': 'Active AIDOLs',
    'synopsis.stats.collectedFragments': 'Restored Memory Fragments',
    'synopsis.stats.systemStability': 'World Restoration',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ko';
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
