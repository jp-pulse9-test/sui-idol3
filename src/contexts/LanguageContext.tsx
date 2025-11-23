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
    'hero.tagline': 'AIDOL 101 - SIMKUNG ALLY',
    'hero.title': 'SIMKUNG',
    'hero.secondaryTitle': 'OLD EARTH SIMULATOR',
    'hero.subtitle': '당신의 선택이 두 세계를 구원한다',
    'hero.enter': 'ENTER',
    'language.korean': '한국어',
    'language.english': 'English',
    'journey.title': 'Begin Your Journey',
    'journey.subtitle': 'SIMKUNG ALLY에서 LEGEND로',
    'service.intro.title': '세 가지 핵심 경험',
    'service.intro.subtitle': '2847년 미래에서 온 202명의 AIDOL과 감정 데이터를 모아 두 세계를 구하는 인터랙티브 K-POP 팬덤 스토리',
    'service.pick.title': 'PICK',
    'service.pick.subtitle': '당신의 AIDOL을 선택하세요',
    'service.pick.description': '토너먼트를 통해 202명의 AIDOL 중 당신만의 파트너를 찾으세요. 당신의 선택이 두 세계의 운명을 결정합니다.',
    'service.vault.title': 'VAULT',
    'service.vault.subtitle': '추억을 수집하세요',
    'service.vault.description': 'AIDOL과의 특별한 순간을 MemoryCard NFT로 저장하세요. 감정 데이터가 쌓일수록 더 희귀한 카드를 획득할 수 있습니다.',
    'service.rise.title': 'RISE',
    'service.rise.subtitle': 'AIDOL과 함께 성장하세요',
    'service.rise.description': 'VRI(가치 복원 지수)를 높여 붕괴 직전의 세계를 복원하세요. 당신의 선택과 상호작용이 스토리를 바꿉니다.',
    'journey.awaken.dimension': 'Dimension: AWAKEN',
    'journey.awaken.title': 'AIDOL을 만나다',
    'journey.awaken.description': 'SIMKUNG ALLY가 되어 AIDOL과 함께하는 첫 순간',
    'journey.mission.dimension': 'Dimension: SALVATION',
    'journey.mission.title': '세계를 구원하라',
    'journey.mission.description': 'SIMKUNG ALLY로서 무너진 세계를 복원하는 미션',
    'journey.ascend.dimension': 'Dimension: GLORY',
    'journey.ascend.title': 'LEGEND의 전당',
    'journey.ascend.description': 'AIDOL과 함께 LEGEND로 기록되다',
    'journey.awaken.detailedInfo': '토너먼트를 통해 당신의 이상형 AIDOL을 찾으세요. 16명의 후보 중 최종 1명을 선택하며, 선택한 AIDOL과 함께 2028년 붕괴를 막기 위한 여정을 시작합니다.',
    'journey.mission.detailedInfo': 'SIMKUNG ALLY로서 타임라인에 걸쳐 무너진 세계를 복원하는 미션에 참여하세요. 각 미션은 잃어버린 가치(사랑, 신뢰, 공감)를 복원하며 VRI를 높여갑니다.',
    'journey.ascend.detailedInfo': 'AIDOL과 함께 쌓은 업적을 확인하고, LEGEND의 전당에서 당신의 기록을 영원히 남기세요. 최고의 SIMKUNG ALLY들과 경쟁하며 역사에 이름을 새깁니다.',
    'enterDialog.title': '🌍 지구 멸망을 막아라',
    'enterDialog.subtitle': '2028 붕괴를 막기 위한 여정이 시작됩니다',
    'enterDialog.quickStart.title': '빠른 시작',
    'enterDialog.quickStart.description': '바로 플레이',
    'enterDialog.selectIdol.title': 'AIDOL 선택',
    'enterDialog.selectIdol.description': '토너먼트로 선택',
    'synopsis.stats.activeAllies': '각성한 SIMKUNG ALLY',
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
    // StoryGameModalEnhanced
    'story.completing.title': '✨ 추억 생성 중...',
    'story.completing.withIdol': '{{name}}와의 특별한 순간',
    'story.completing.converting': '소중한 추억이 MemoryCard로 변환되고 있습니다...',
    'story.intro.specialTime': '{{name}}와의 특별한 시간',
    'story.intro.turns': '{{count}}턴',
    'story.intro.estimatedTime': '예상 소요시간',
    'story.intro.category': '카테고리',
    'story.intro.expectedRewards': '예상 보상',
    'story.intro.memoryCard': 'MemoryCard NFT',
    'story.intro.rarityByAffinity': '친밀도에 따른 레어도',
    'story.intro.expAndAffinity': '경험치 & 친밀도',
    'story.intro.growthByChoice': '선택에 따른 성장',
    'story.intro.tip': '💡 <strong>팁:</strong> 감정적으로 깊이 교감할수록 더 희귀한 카드를 얻을 수 있어요',
    'story.intro.later': '나중에 하기',
    'story.intro.start': '🎮 에피소드 시작',
    'story.difficulty.easy': '쉬운 대화',
    'story.difficulty.normal': '일반적인 상호작용',
    'story.difficulty.hard': '깊은 감정 교류',
    'story.difficulty.expert': '특별한 순간',
    'story.difficulty.unknown': '알 수 없음',
    // EpisodeFlow
    'episode.cannotLoad': '에피소드를 불러올 수 없습니다.',
    'episode.goBack': '돌아가기',
    'episode.turns': '{{count}}/8턴',
    'episode.turn': 'Turn {{number}}',
    'episode.pleaseChoose': '선택해주세요:',
    'episode.affinity': '친밀도',
    'episode.emotion': '감정',
    'episode.completed': '에피소드 완료!',
    'episode.savedAsPhotocard': '특별한 순간이 포토카드로 저장되었습니다.',
    'episode.viewPhotocard': '포토카드 보기',
    'episode.replay': '다시 플레이',
    'episode.exit': '나가기',
  },
  en: {
    'nav.settings': 'Settings',
    'nav.photocardGenerator': 'Photocard Generator',
    'hero.tagline': 'AIDOL 101 - SIMKUNG ALLY',
    'hero.title': 'SIMKUNG',
    'hero.secondaryTitle': 'OLD EARTH SIMULATOR',
    'hero.subtitle': 'Your choices save two worlds',
    'hero.enter': 'ENTER',
    'language.korean': '한국어',
    'language.english': 'English',
    'journey.title': 'Begin Your Journey',
    'journey.subtitle': 'SIMKUNG ALLY → LEGEND',
    'service.intro.title': 'Three Core Experiences',
    'service.intro.subtitle': 'Interactive K-POP fandom story platform to collect emotional data with 202 AIDOLs from 2847 and save two worlds',
    'service.pick.title': 'PICK',
    'service.pick.subtitle': 'Choose Your AIDOL',
    'service.pick.description': 'Find your unique partner among 202 AIDOLs through tournaments. Your choice determines the fate of two worlds.',
    'service.vault.title': 'VAULT',
    'service.vault.subtitle': 'Collect Memories',
    'service.vault.description': 'Save special moments with AIDOL as MemoryCard NFTs. The more emotional data you accumulate, the rarer cards you can earn.',
    'service.rise.title': 'RISE',
    'service.rise.subtitle': 'Grow with AIDOL',
    'service.rise.description': 'Increase VRI (Value Restoration Index) to restore the world on the brink of collapse. Your choices and interactions change the story.',
    'journey.awaken.dimension': 'Dimension: AWAKEN',
    'journey.awaken.title': 'The Awakening',
    'journey.awaken.description': 'You awaken as SIMKUNG ALLY. Meet your AIDOL.',
    'journey.mission.dimension': 'Dimension: SALVATION',
    'journey.mission.title': 'The Mission',
    'journey.mission.description': 'As SIMKUNG ALLY, restore the broken world. Your mission begins.',
    'journey.ascend.dimension': 'Dimension: GLORY',
    'journey.ascend.title': 'The Legend',
    'journey.ascend.description': 'Together with AIDOL, become LEGEND forever.',
    'journey.awaken.detailedInfo': 'Find your ideal AIDOL through a tournament. Choose 1 from 16 candidates and begin the journey to prevent the 2028 collapse with your chosen AIDOL.',
    'journey.mission.detailedInfo': 'As SIMKUNG ALLY, participate in missions to restore the broken world across timelines. Each mission restores lost values (Love, Trust, Empathy) and increases your VRI.',
    'journey.ascend.detailedInfo': 'Review your achievements with AIDOL and eternally record your legacy in the Hall of Legends. Compete with the best SIMKUNG ALLYs and inscribe your name in history.',
    'enterDialog.title': '🌍 Prevent Earth\'s Destruction',
    'enterDialog.subtitle': 'The journey to stop the 2028 collapse begins',
    'enterDialog.quickStart.title': 'Quick Start',
    'enterDialog.quickStart.description': 'Start Mission',
    'enterDialog.selectIdol.title': 'Select AIDOL',
    'enterDialog.selectIdol.description': 'Tournament Mode',
    'synopsis.stats.activeAllies': 'Awakened SIMKUNG ALLYs',
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
    // StoryGameModalEnhanced
    'story.completing.title': '✨ Creating Memory...',
    'story.completing.withIdol': 'Special Moment with {{name}}',
    'story.completing.converting': 'Your precious memory is being converted into a MemoryCard...',
    'story.intro.specialTime': 'Special Time with {{name}}',
    'story.intro.turns': '{{count}} Turns',
    'story.intro.estimatedTime': 'Estimated Time',
    'story.intro.category': 'Category',
    'story.intro.expectedRewards': 'Expected Rewards',
    'story.intro.memoryCard': 'MemoryCard NFT',
    'story.intro.rarityByAffinity': 'Rarity by Affinity',
    'story.intro.expAndAffinity': 'EXP & Affinity',
    'story.intro.growthByChoice': 'Growth by Choice',
    'story.intro.tip': '💡 <strong>Tip:</strong> The deeper your emotional connection, the rarer the card you can earn',
    'story.intro.later': 'Later',
    'story.intro.start': '🎮 Start Episode',
    'story.difficulty.easy': 'Easy Conversation',
    'story.difficulty.normal': 'Normal Interaction',
    'story.difficulty.hard': 'Deep Emotional Exchange',
    'story.difficulty.expert': 'Special Moment',
    'story.difficulty.unknown': 'Unknown',
    // EpisodeFlow
    'episode.cannotLoad': 'Cannot load episode.',
    'episode.goBack': 'Go Back',
    'episode.turns': '{{count}}/8 turns',
    'episode.turn': 'Turn {{number}}',
    'episode.pleaseChoose': 'Please choose:',
    'episode.affinity': 'Affinity',
    'episode.emotion': 'Emotion',
    'episode.completed': 'Episode Completed!',
    'episode.savedAsPhotocard': 'Special moment saved as photocard.',
    'episode.viewPhotocard': 'View Photocard',
    'episode.replay': 'Replay',
    'episode.exit': 'Exit',
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
