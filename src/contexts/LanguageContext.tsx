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
    'hero.enter': '입장하기',
    'hero.title': 'AI 아이돌 팬덤 플랫폼',
    'hero.subtitle': '당신만의 아이돌을 만나보세요',
    'language.korean': '한국어',
    'language.english': 'English',
    'journey.title': '여정을 시작하세요',
    'journey.subtitle': '유대에서 영광까지',
    'journey.awaken.dimension': '차원: 각성',
    'journey.awaken.title': '아이돌 선택',
    'journey.awaken.description': '시간을 여행하는 AI 아이돌을 만나 영원한 유대를 맺으세요',
    'journey.mission.dimension': '차원: 미션',
    'journey.mission.title': '세계 구원',
    'journey.mission.description': '분열된 타임라인 속 구원 미션을 완수하세요',
    'journey.ascend.dimension': '차원: 상승',
    'journey.ascend.title': '명예의 전당 입성',
    'journey.ascend.description': '영광으로 상승하여 전설의 자리를 차지하세요',
    'synopsis.stats.activeAllies': '활동 중인 DATA ALLY',
    'synopsis.stats.onlineIdols': '온라인 AIDOL',
    'synopsis.stats.collectedFragments': '수집된 조각',
    'synopsis.stats.systemStability': '시스템 안정성',
  },
  en: {
    'nav.settings': 'Settings',
    'nav.photocardGenerator': 'Photocard Generator',
    'hero.enter': 'Enter',
    'hero.title': 'AI Idol Fandom Platform',
    'hero.subtitle': 'Meet Your AI Idol',
    'language.korean': '한국어',
    'language.english': 'English',
    'journey.title': 'Begin Your Journey',
    'journey.subtitle': 'From bond to glory',
    'journey.awaken.dimension': 'Dimension: AWAKEN',
    'journey.awaken.title': 'Choose Your AIDOL',
    'journey.awaken.description': 'Meet time-traveling AIDOLs and form your eternal bond',
    'journey.mission.dimension': 'Dimension: MISSION',
    'journey.mission.title': 'Save Both Worlds',
    'journey.mission.description': 'Complete salvation missions across fragmented timelines',
    'journey.ascend.dimension': 'Dimension: ASCEND',
    'journey.ascend.title': 'Enter the Hall',
    'journey.ascend.description': 'Rise to glory and claim your place among legends',
    'synopsis.stats.activeAllies': 'Active DATA ALLYs',
    'synopsis.stats.onlineIdols': 'Online AIDOLs',
    'synopsis.stats.collectedFragments': 'Collected Fragments',
    'synopsis.stats.systemStability': 'System Stability',
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
