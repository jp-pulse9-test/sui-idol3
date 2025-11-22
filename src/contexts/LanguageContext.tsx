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
    'play.salvation.title': 'Salvation Missions',
    'play.salvation.subtitle': '타임라인에 걸쳐 잃어버린 가치를 복원하세요',
    'play.guest.badge': '게스트 모드 (저장하려면 지갑 연결)',
    'play.guest.saveButton': '지갑 연결하여 저장',
    'play.countdown.days': '일',
    'play.countdown.until': '2028 붕괴까지',
    'play.vri.total': '총 VRI (가치 복원 지수)',
    'play.vri.love': '사랑',
    'play.vri.trust': '신뢰',
    'play.vri.empathy': '공감',
    'play.branch.choose': '타임라인 브랜치를 선택하세요',
    'play.branch.unlock': '이 브랜치를 잠금 해제하려면',
    'play.branch.totalVRI': '총 VRI가 필요합니다',
    'play.branch.difficulty': '난이도',
    'play.branch.progress': '진행도',
    'play.branch.requires': '필요:',
    'play.branch.back': '← 브랜치로 돌아가기',
    'play.mission.vriReward': 'VRI 보상',
    'play.mission.valueType': '가치 유형',
    'play.mission.completed': '완료 ✓',
    'play.mission.alreadyCompleted': '이미 완료한 미션입니다',
    'play.save.error': '지갑을 연결하여 진행 상황을 저장하세요',
    'play.save.success': '진행 상황이 블록체인에 저장되었습니다!',
    'play.save.failed': '저장 중 오류가 발생했습니다',
    'play.loading': '구원 데이터를 불러오는 중...',
    'play.nav.pantheon': 'Pantheon',
    'play.nav.home': 'Home',
    'play.modal.close': '닫기',
    'play.modal.placeholder': '미션 게임플레이가 여기에 구현됩니다. 현재는 임시 화면입니다.',
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
    'play.salvation.title': 'Salvation Missions',
    'play.salvation.subtitle': 'Restore lost values across the timelines',
    'play.guest.badge': 'Guest Mode (Connect wallet to save)',
    'play.guest.saveButton': 'Connect Wallet to Save',
    'play.countdown.days': 'days',
    'play.countdown.until': 'until 2028 decay',
    'play.vri.total': 'Total VRI (Value Restoration Index)',
    'play.vri.love': 'Love',
    'play.vri.trust': 'Trust',
    'play.vri.empathy': 'Empathy',
    'play.branch.choose': 'Choose a Timeline Branch',
    'play.branch.unlock': 'Unlock this branch with',
    'play.branch.totalVRI': 'total VRI',
    'play.branch.difficulty': 'Difficulty',
    'play.branch.progress': 'Progress',
    'play.branch.requires': 'Requires',
    'play.branch.back': '← Back to Branches',
    'play.mission.vriReward': 'VRI Reward',
    'play.mission.valueType': 'Value Type',
    'play.mission.completed': 'Completed ✓',
    'play.mission.alreadyCompleted': "You've already completed this mission",
    'play.save.error': 'Please connect your wallet to save progress',
    'play.save.success': 'Progress saved to blockchain!',
    'play.save.failed': 'Failed to save progress',
    'play.loading': 'Loading salvation data...',
    'play.nav.pantheon': 'Pantheon',
    'play.nav.home': 'Home',
    'play.modal.close': 'Close',
    'play.modal.placeholder': 'Mission gameplay will be implemented here. For now, this is a placeholder.',
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
