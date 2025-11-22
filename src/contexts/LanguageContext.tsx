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
    
    // Features
    'features.title': '핵심 특징',
    'features.subtitle': 'AIDOL 101을 특별하게 만드는 9가지 특징',
    
    // Flow
    'flow.title': '서비스 플로우',
    'flow.yourJourney': '당신의 여정',
    'flow.step1.desc': '개인 선택 → AIDOL 바디 생성',
    'flow.step2.desc': '성격 테스트 → 모험 → 작업 선택',
    'flow.step3.desc': 'AIDOL과 대화 → 감정 링크',
    'flow.step4.desc': '포토카드 수집 → 타임라인 기록',
    'flow.loop': 'Your data grows the world',
    
    // Scenarios
    'scenarios.eleven': '11개 멸망 시나리오',
    'scenarios.timeline': '1889년부터 무한대까지, 11개의 멸망 타임라인',
    'scenarios.save': '202 AIDOLs × Your Data = Save 11 Futures',
    
    // 9 Features
    'feature.1.title': 'STORY ONBOARDING',
    'feature.1.desc': '세계관으로 입장하는 온보딩',
    'feature.2.title': 'TIME SHIFT EXPERIENCE',
    'feature.2.desc': '11개 시대를 넘나드는 여정',
    'feature.3.title': 'EMOTION LINK ENGINE',
    'feature.3.desc': '감정 분석 기반 AI 반응',
    'feature.4.title': 'AUTO PLAY EVOLUTION',
    'feature.4.desc': '성장하는 자동 플레이 시스템',
    'feature.5.title': 'DATA = POWER',
    'feature.5.desc': '모든 행동이 세계에 영향',
    'feature.6.title': 'MISSION PLAY SYSTEM',
    'feature.6.desc': '데일리·챕터 미션',
    'feature.7.title': 'TIME ARCHIVE',
    'feature.7.desc': '개인화된 세계 기록',
    'feature.8.title': 'AIDOL AI PERSONALITY',
    'feature.8.desc': '학습하는 다차원 AI 캐릭터',
    'feature.9.title': 'ELEVEN APOCALYPSE SCENARIOS',
    'feature.9.desc': '11개 멸망 타임라인 구원',
    
    // Gateway
    'gateway.1.subtitle': '당신은 어느 타임라인 출신인가요?',
    'gateway.2.subtitle': '11개 타임라인 속 202명의 AIDOL',
    'gateway.3.subtitle': '함께 11개의 미래를 구하세요',
  },
  en: {
    'nav.settings': 'Settings',
    'nav.photocardGenerator': 'Photocard Generator',
    'hero.enter': 'Enter',
    'hero.title': 'AI Idol Fandom Platform',
    'hero.subtitle': 'Meet Your AI Idol',
    'language.korean': '한국어',
    'language.english': 'English',
    
    // Features
    'features.title': 'Core Features',
    'features.subtitle': '9 features that make AIDOL 101 special',
    
    // Flow
    'flow.title': 'Service Flow',
    'flow.yourJourney': 'YOUR JOURNEY',
    'flow.step1.desc': 'Personal Choice → AIDOL Body Generation',
    'flow.step2.desc': 'Personality Test → Adventure → Task Selection',
    'flow.step3.desc': 'Chat with AIDOL → Emotion Link',
    'flow.step4.desc': 'Collect Photocards → Timeline Records',
    'flow.loop': 'Your data grows the world',
    
    // Scenarios
    'scenarios.eleven': '11 Apocalypse Scenarios',
    'scenarios.timeline': 'From 1889 to Infinity, 11 Apocalypse Timelines',
    'scenarios.save': '202 AIDOLs × Your Data = Save 11 Futures',
    
    // 9 Features
    'feature.1.title': 'STORY ONBOARDING',
    'feature.1.desc': 'Onboarding through the world lore',
    'feature.2.title': 'TIME SHIFT EXPERIENCE',
    'feature.2.desc': 'Journey across 11 eras',
    'feature.3.title': 'EMOTION LINK ENGINE',
    'feature.3.desc': 'AI response based on emotion analysis',
    'feature.4.title': 'AUTO PLAY EVOLUTION',
    'feature.4.desc': 'Evolving auto-play system',
    'feature.5.title': 'DATA = POWER',
    'feature.5.desc': 'Every action impacts the world',
    'feature.6.title': 'MISSION PLAY SYSTEM',
    'feature.6.desc': 'Daily & Chapter missions',
    'feature.7.title': 'TIME ARCHIVE',
    'feature.7.desc': 'Personalized world records',
    'feature.8.title': 'AIDOL AI PERSONALITY',
    'feature.8.desc': 'Learning multi-dimensional AI characters',
    'feature.9.title': 'ELEVEN APOCALYPSE SCENARIOS',
    'feature.9.desc': 'Save 11 apocalypse timelines',
    
    // Gateway
    'gateway.1.subtitle': 'Which timeline are you from?',
    'gateway.2.subtitle': '202 AIDOLs across 11 timelines',
    'gateway.3.subtitle': 'Save 11 futures together',
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
