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
  },
  en: {
    'nav.settings': 'Settings',
    'nav.photocardGenerator': 'Photocard Generator',
    'hero.enter': 'Enter',
    'hero.title': 'AI Idol Fandom Platform',
    'hero.subtitle': 'Meet Your AI Idol',
    'language.korean': '한국어',
    'language.english': 'English',
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
