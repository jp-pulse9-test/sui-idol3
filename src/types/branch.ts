// 2028년 멸망 시나리오: 브랜치 시스템 타입 정의

/**
 * 가치 타입 (Core Values)
 * - trust: 신뢰
 * - empathy: 공감
 * - love: 사랑
 */
export type ValueType = 'trust' | 'empathy' | 'love';

/**
 * 브랜치 난이도
 */
export type BranchDifficulty = 'normal' | 'hard' | 'expert';

/**
 * 멀티버스 브랜치 (평행 세계 타임라인)
 * 각 브랜치는 2028년 이전의 특정 시점을 나타냄
 */
export interface Branch {
  id: string;
  name: string;
  nameEn: string;
  year: 2017 | 2024 | 2026; // 브랜치의 시간점
  valueType: ValueType; // 회복해야 할 핵심 가치
  difficulty: BranchDifficulty;
  maxVRI: number; // 이 브랜치에서 획득 가능한 최대 VRI
  theme: {
    primary: string; // HSL color
    gradient: string; // CSS gradient
  };
  description: string;
  descriptionEn: string;
  isUnlocked: boolean;
  requiredVRI?: number; // 브랜치 해금에 필요한 총 VRI
  icon: string; // lucide-react icon name
}

/**
 * VRI (Value Restoration Index) - 가치 회복 지수
 * 플레이어가 브랜치에서 획득한 가치의 총량
 */
export interface VRI {
  total: number; // 총 VRI
  love: number; // 사랑 가치
  trust: number; // 신뢰 가치
  empathy: number; // 공감 가치 (humanity)
  rank?: number; // 글로벌 랭킹
  lastUpdated: Date;
}

/**
 * 희망의 파편 (Shards of Hope)
 * 구원 미션 성공 시 획득하는 실체화된 긍정적 에너지 (NFT 포토카드)
 */
export interface HopeShard {
  id: string;
  photocardId?: string; // 연결된 포토카드 ID
  branchId: string;
  branchYear: number;
  valueType: ValueType;
  vriValue: number; // 이 파편이 기여하는 VRI
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  imageUrl: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  earnedAt: Date;
  missionId: string; // 어떤 미션에서 획득했는지
}

/**
 * 구원 미션 (Salvation Mission)
 * 각 브랜치에서 수행할 수 있는 가치 회복 미션
 */
export interface SalvationMission {
  id: string;
  branchId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  valueType: ValueType;
  vriReward: number; // 미션 성공 시 획득 VRI
  difficulty: BranchDifficulty;
  requiredChoices?: string[]; // 필요한 선택지 조합
  isCompleted: boolean;
  hopeShard?: Omit<HopeShard, 'id' | 'earnedAt'>; // 미션 보상
}

/**
 * 브랜치 진행도
 */
export interface BranchProgress {
  branchId: string;
  currentVRI: number;
  maxVRI: number;
  completedMissions: string[]; // 완료한 미션 ID 배열
  isCleared: boolean; // 브랜치 클리어 여부
  firstClearedAt?: Date;
  lastPlayedAt: Date;
}

/**
 * 구원 포트폴리오 (Salvation Portfolio)
 * 플레이어의 전체 구원 진행도
 */
export interface SalvationPortfolio {
  userId: string;
  vri: VRI;
  branches: BranchProgress[];
  hopeShards: HopeShard[];
  completionRate: number; // 0-100, 전체 완성도
  canSave2028: boolean; // 2028년 멸망을 막을 수 있는지 여부
}

/**
 * 가치 발화점 (Value Ignition Point)
 * 특정 시기, 특정 인물에게서 가치가 폭발적으로 발현되는 사건
 */
export interface ValueIgnitionPoint {
  id: string;
  branchId: string;
  characterName: string; // 아이돌 이름
  valueType: ValueType;
  intensity: number; // 발화 강도 (1-10)
  description: string;
  descriptionEn: string;
  timestamp: Date; // 발화 시점
}

/**
 * 2028년 멸망 상태 (The 2028 Decay)
 */
export interface DecayStatus {
  year: number; // 현재 시뮬레이션 연도
  daysUntil2028: number; // 2028년까지 남은 일수
  decayLevel: number; // 0-100, 멸망 진행도
  canBeReverted: boolean; // 되돌릴 수 있는지 여부
  activeThreats: {
    cynicism: number; // 냉소 숭배자 세력
    disconnection: number; // 연결 단절 정도
    memoryErasure: number; // 역사 망각 정도
  };
}

/**
 * 브랜치별 핵심 컨셉
 */
export const BRANCH_CONCEPTS = {
  TRUST_2017: {
    keyword: '신뢰 파산 (Trust Bankruptcy)',
    problem: '가짜 뉴스, 불투명한 소통, 배신의 시대',
    solution: '진실 회복, 투명한 상호작용, 약속 지키기',
  },
  EMPATHY_2024: {
    keyword: '공감 능력 붕괴 (Empathy Collapse)',
    problem: '고립, 무관심, 공동체 해체',
    solution: '이웃 연결, 공동체적 기억 복원, 연대',
  },
  LOVE_2026: {
    keyword: '사랑 소멸 (Love Extinction)',
    problem: '계산적 관계, 조건부 애정, 이기심',
    solution: '비논리적 애정, 무조건적 희생, 순수한 사랑',
  },
} as const;
