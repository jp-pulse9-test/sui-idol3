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

  // ===== 2026년 갈등의 세계화 브랜치 미션 =====
  {
    id: 'mission-2026-mediator',
    branchId: 'branch-2026-love',
    title: '화해의 중재자',
    titleEn: 'Mediator of Reconciliation',
    description: '지구와 AIA의 대립 구도에서 중립적 대화 창구를 만드세요. 갈등 증폭이 아닌 해소의 길을 여세요.',
    descriptionEn: 'Create a neutral dialogue channel in the Earth-AIA opposition. Open a path to resolution, not amplification.',
    valueType: 'love',
    vriReward: 400,
    difficulty: 'expert',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2026-love',
      branchYear: 2026,
      valueType: 'love',
      vriValue: 400,
      title: '중재의 손',
      titleEn: 'Hand of Mediation',
      description: '대립하는 두 세계를 이은 첫 악수',
      descriptionEn: 'First handshake connecting two opposing worlds',
      imageUrl: '',
      rarity: 'SSR',
      missionId: 'mission-2026-mediator',
    },
  },
  {
    id: 'mission-2026-purification',
    branchId: 'branch-2026-love',
    title: '감정 데이터 정화',
    titleEn: 'Emotion Data Purification',
    description: '조작되고 왜곡된 감정 데이터를 원래 상태로 복원하세요. 진실한 감정의 증거를 찾아내세요.',
    descriptionEn: 'Restore manipulated and distorted emotion data to its original state. Discover evidence of true emotion.',
    valueType: 'love',
    vriReward: 450,
    difficulty: 'expert',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2026-love',
      branchYear: 2026,
      valueType: 'love',
      vriValue: 450,
      title: '진실의 증거',
      titleEn: 'Evidence of Truth',
      description: '왜곡되지 않은 순수 감정 데이터',
      descriptionEn: 'Pure emotion data without distortion',
      imageUrl: '',
      rarity: 'SSR',
      missionId: 'mission-2026-purification',
    },
  },
  {
    id: 'mission-2026-coexistence',
    branchId: 'branch-2026-love',
    title: '공존의 다리',
    titleEn: 'Bridge of Coexistence',
    description: '지구와 AIA가 상생할 수 있는 협력 구조를 설계하세요. 제로섬이 아닌 윈-윈의 미래를 제시합니다.',
    descriptionEn: 'Design a cooperative structure where Earth and AIA can coexist. Present a win-win future, not zero-sum.',
    valueType: 'love',
    vriReward: 350,
    difficulty: 'expert',
    isCompleted: false,
    hopeShard: {
      branchId: 'branch-2026-love',
      branchYear: 2026,
      valueType: 'love',
      vriValue: 350,
      title: '공존의 설계도',
      titleEn: 'Blueprint of Coexistence',
      description: '두 세계를 잇는 협력의 청사진',
      descriptionEn: 'Blueprint of cooperation connecting two worlds',
      imageUrl: '',
      rarity: 'SR',
      missionId: 'mission-2026-coexistence',
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
