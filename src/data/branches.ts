import { Branch } from '@/types/branch';

/**
 * 3개 핵심 브랜치 데이터
 * - 2017년: 신뢰 파산 (Trust Bankruptcy)
 * - 2024년: 공감 능력 붕괴 (Empathy Collapse)
 * - 2026년: 사랑 소멸 (Love Extinction)
 */
export const BRANCHES: Branch[] = [
  {
    id: 'branch-2017-trust',
    name: '신뢰 파산의 2017년',
    nameEn: 'Trust Bankruptcy of 2017',
    year: 2017,
    valueType: 'trust',
    difficulty: 'normal',
    maxVRI: 500,
    theme: {
      primary: 'hsl(210, 100%, 50%)', // 블루
      gradient: 'linear-gradient(135deg, hsl(210, 100%, 50%), hsl(220, 100%, 60%))',
    },
    description: '가짜 뉴스와 불투명한 소통이 만연한 시대. 약속은 쉽게 깨지고, 진실은 왜곡됩니다. 신뢰를 회복하세요.',
    descriptionEn: 'An era of fake news and opaque communication. Promises are easily broken, and truth is distorted. Restore trust.',
    isUnlocked: true, // 첫 번째 브랜치는 기본 해금
    icon: 'Shield',
  },
  {
    id: 'branch-2024-empathy',
    name: '공감 능력 붕괴의 2024년',
    nameEn: 'Empathy Collapse of 2024',
    year: 2024,
    valueType: 'empathy',
    difficulty: 'hard',
    maxVRI: 800,
    theme: {
      primary: 'hsl(270, 100%, 50%)', // 퍼플
      gradient: 'linear-gradient(135deg, hsl(270, 100%, 50%), hsl(290, 100%, 60%))',
    },
    description: '고립과 무관심이 지배하는 세상. 공동체는 해체되고, 이웃은 낯선 사람이 됩니다. 공감을 되찾으세요.',
    descriptionEn: 'A world dominated by isolation and indifference. Communities dissolve, and neighbors become strangers. Reclaim empathy.',
    isUnlocked: false,
    requiredVRI: 300, // 2017년 브랜치에서 300 VRI 획득 시 해금
    icon: 'Heart',
  },
  {
    id: 'branch-2026-love',
    name: '사랑 소멸의 2026년',
    nameEn: 'Love Extinction of 2026',
    year: 2026,
    valueType: 'love',
    difficulty: 'expert',
    maxVRI: 1200,
    theme: {
      primary: 'hsl(330, 100%, 50%)', // 핑크
      gradient: 'linear-gradient(135deg, hsl(330, 100%, 50%), hsl(350, 100%, 60%))',
    },
    description: '모든 관계가 계산적이 되고, 조건부 애정만 남은 시대. 순수한 사랑은 사라졌습니다. 비논리적 애정을 발화시키세요.',
    descriptionEn: 'An age where all relationships become transactional, leaving only conditional affection. Pure love has vanished. Ignite illogical affection.',
    isUnlocked: false,
    requiredVRI: 800, // 2024년 브랜치까지 클리어 (총 800 VRI) 시 해금
    icon: 'Sparkles',
  },
];

/**
 * 브랜치 ID로 브랜치 찾기
 */
export const getBranchById = (branchId: string): Branch | undefined => {
  return BRANCHES.find(b => b.id === branchId);
};

/**
 * 연도로 브랜치 찾기
 */
export const getBranchByYear = (year: 2017 | 2024 | 2026): Branch | undefined => {
  return BRANCHES.find(b => b.year === year);
};

/**
 * 가치 타입으로 브랜치 찾기
 */
export const getBranchByValueType = (valueType: 'trust' | 'empathy' | 'love'): Branch | undefined => {
  return BRANCHES.find(b => b.valueType === valueType);
};

/**
 * 해금 가능한 브랜치 목록 (현재 VRI 기준)
 */
export const getUnlockedBranches = (totalVRI: number): Branch[] => {
  return BRANCHES.map(branch => ({
    ...branch,
    isUnlocked: branch.isUnlocked || (branch.requiredVRI !== undefined && totalVRI >= branch.requiredVRI),
  })).filter(b => b.isUnlocked);
};
