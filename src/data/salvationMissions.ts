import { SalvationMission } from '@/types/branch';

/**
 * 브랜치별 구원 미션 데이터
 */
export const SALVATION_MISSIONS: SalvationMission[] = [
  // ===== 2017년 신뢰 파산 브랜치 미션 =====
  {
    id: 'mission-2017-truth-restoration',
    branchId: 'branch-2017-trust',
    title: '진실 회복 작전',
    titleEn: 'Truth Restoration Operation',
    description: '가짜 뉴스로 무너진 신뢰를 회복하기 위해 진실된 정보를 퍼뜨리세요.',
    descriptionEn: 'Spread truthful information to restore trust shattered by fake news.',
    valueType: 'trust',
    vriReward: 150,
    difficulty: 'normal',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2017-trust',
      branchYear: 2017,
      valueType: 'trust',
      vriValue: 150,
      title: '진실의 빛',
      titleEn: 'Light of Truth',
      description: '어둠 속에서 빛나는 진실의 순간',
      descriptionEn: 'A moment of truth shining in darkness',
      imageUrl: '', // 추후 생성
      rarity: 'R',
      missionId: 'mission-2017-truth-restoration',
    },
  },
  {
    id: 'mission-2017-transparent-communication',
    branchId: 'branch-2017-trust',
    title: '투명한 대화',
    titleEn: 'Transparent Communication',
    description: '숨김없는 솔직한 대화로 깨진 관계를 복원하세요.',
    descriptionEn: 'Restore broken relationships through honest and open communication.',
    valueType: 'trust',
    vriReward: 200,
    difficulty: 'normal',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2017-trust',
      branchYear: 2017,
      valueType: 'trust',
      vriValue: 200,
      title: '약속의 증표',
      titleEn: 'Token of Promise',
      description: '다시 한번 믿을 수 있다는 증거',
      descriptionEn: 'Proof that we can trust again',
      imageUrl: '',
      rarity: 'SR',
      missionId: 'mission-2017-transparent-communication',
    },
  },
  {
    id: 'mission-2017-promise-keeper',
    branchId: 'branch-2017-trust',
    title: '약속 지키기',
    titleEn: 'Promise Keeper',
    description: '작은 약속이라도 지키는 모습을 보여주세요. 신뢰는 행동에서 시작됩니다.',
    descriptionEn: 'Keep even small promises. Trust begins with actions.',
    valueType: 'trust',
    vriReward: 150,
    difficulty: 'normal',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2017-trust',
      branchYear: 2017,
      valueType: 'trust',
      vriValue: 150,
      title: '지켜진 약속',
      titleEn: 'Kept Promise',
      description: '신뢰의 첫걸음',
      descriptionEn: 'The first step of trust',
      imageUrl: '',
      rarity: 'R',
      missionId: 'mission-2017-promise-keeper',
    },
  },

  // ===== 2024년 공감 능력 붕괴 브랜치 미션 =====
  {
    id: 'mission-2024-neighbor-connection',
    branchId: 'branch-2024-empathy',
    title: '고립된 이웃 연결',
    titleEn: 'Connect Isolated Neighbors',
    description: '고립된 이웃에게 손을 내미세요. 공감은 관심에서 시작됩니다.',
    descriptionEn: 'Reach out to isolated neighbors. Empathy begins with care.',
    valueType: 'empathy',
    vriReward: 250,
    difficulty: 'hard',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2024-empathy',
      branchYear: 2024,
      valueType: 'empathy',
      vriValue: 250,
      title: '연결의 손길',
      titleEn: 'Hand of Connection',
      description: '고립을 깨는 따뜻한 손길',
      descriptionEn: 'A warm touch that breaks isolation',
      imageUrl: '',
      rarity: 'SR',
      missionId: 'mission-2024-neighbor-connection',
    },
  },
  {
    id: 'mission-2024-communal-memory',
    branchId: 'branch-2024-empathy',
    title: '공동체적 기억 복원',
    titleEn: 'Restore Communal Memory',
    description: '과거의 연대와 협력의 기억을 되살려 공동체를 재건하세요.',
    descriptionEn: 'Revive memories of past solidarity and cooperation to rebuild community.',
    valueType: 'empathy',
    vriReward: 300,
    difficulty: 'hard',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2024-empathy',
      branchYear: 2024,
      valueType: 'empathy',
      vriValue: 300,
      title: '공동체의 기억',
      titleEn: 'Memory of Community',
      description: '함께했던 시절의 기록',
      descriptionEn: 'A record of times we were together',
      imageUrl: '',
      rarity: 'SSR',
      missionId: 'mission-2024-communal-memory',
    },
  },
  {
    id: 'mission-2024-empathy-ignition',
    branchId: 'branch-2024-empathy',
    title: '공감 발화',
    titleEn: 'Empathy Ignition',
    description: '타인의 고통을 진정으로 이해하고 함께 아파하세요.',
    descriptionEn: 'Truly understand and share the pain of others.',
    valueType: 'empathy',
    vriReward: 250,
    difficulty: 'hard',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2024-empathy',
      branchYear: 2024,
      valueType: 'empathy',
      vriValue: 250,
      title: '공감의 불꽃',
      titleEn: 'Spark of Empathy',
      description: '마음이 통하는 순간',
      descriptionEn: 'A moment of mutual understanding',
      imageUrl: '',
      rarity: 'SR',
      missionId: 'mission-2024-empathy-ignition',
    },
  },

  // ===== 2026년 사랑 소멸 브랜치 미션 =====
  {
    id: 'mission-2026-unconditional-love',
    branchId: 'branch-2026-love',
    title: '무조건적 사랑',
    titleEn: 'Unconditional Love',
    description: '아무런 대가를 바라지 않고 순수하게 사랑하세요.',
    descriptionEn: 'Love purely without expecting anything in return.',
    valueType: 'love',
    vriReward: 400,
    difficulty: 'expert',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2026-love',
      branchYear: 2026,
      valueType: 'love',
      vriValue: 400,
      title: '순수한 마음',
      titleEn: 'Pure Heart',
      description: '조건 없는 사랑의 증거',
      descriptionEn: 'Evidence of unconditional love',
      imageUrl: '',
      rarity: 'SSR',
      missionId: 'mission-2026-unconditional-love',
    },
  },
  {
    id: 'mission-2026-illogical-affection',
    branchId: 'branch-2026-love',
    title: '비논리적 애정',
    titleEn: 'Illogical Affection',
    description: '이성적 판단을 넘어선 비논리적이지만 진실된 애정을 발화시키세요.',
    descriptionEn: 'Ignite illogical but genuine affection beyond rational judgment.',
    valueType: 'love',
    vriReward: 450,
    difficulty: 'expert',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2026-love',
      branchYear: 2026,
      valueType: 'love',
      vriValue: 450,
      title: '비논리의 아름다움',
      titleEn: 'Beauty of Illogic',
      description: '계산할 수 없는 사랑',
      descriptionEn: 'Love beyond calculation',
      imageUrl: '',
      rarity: 'SSR',
      missionId: 'mission-2026-illogical-affection',
    },
  },
  {
    id: 'mission-2026-sacrifice',
    branchId: 'branch-2026-love',
    title: '희생의 빛',
    titleEn: 'Light of Sacrifice',
    description: '자신을 희생하더라도 타인을 구하는 선택을 하세요.',
    descriptionEn: 'Choose to save others even at the cost of self-sacrifice.',
    valueType: 'love',
    vriReward: 350,
    difficulty: 'expert',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2026-love',
      branchYear: 2026,
      valueType: 'love',
      vriValue: 350,
      title: '희생의 증표',
      titleEn: 'Token of Sacrifice',
      description: '타인을 위한 숭고한 선택',
      descriptionEn: 'A noble choice for others',
      imageUrl: '',
      rarity: 'SR',
      missionId: 'mission-2026-sacrifice',
    },
  },
];

/**
 * 브랜치별 미션 목록 가져오기
 */
export const getMissionsByBranch = (branchId: string): SalvationMission[] => {
  return SALVATION_MISSIONS.filter(m => m.branchId === branchId);
};

/**
 * 미션 ID로 미션 찾기
 */
export const getMissionById = (missionId: string): SalvationMission | undefined => {
  return SALVATION_MISSIONS.find(m => m.id === missionId);
};

/**
 * 브랜치의 총 VRI 계산
 */
export const getTotalVRIForBranch = (branchId: string): number => {
  return getMissionsByBranch(branchId).reduce((sum, mission) => sum + mission.vriReward, 0);
};
