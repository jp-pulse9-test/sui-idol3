import { Branch, BranchProgress, SalvationPortfolio, VRI, HopeShard } from '@/types/branch';
import { BRANCHES, getUnlockedBranches, getBranchById } from '@/data/branches';
import { SALVATION_MISSIONS, getMissionsByBranch, getMissionById } from '@/data/salvationMissions';

/**
 * 브랜치 관리 서비스
 */
class BranchService {
  /**
   * 모든 브랜치 목록 가져오기
   */
  getAllBranches(): Branch[] {
    return BRANCHES;
  }

  /**
   * 현재 VRI에 따라 해금된 브랜치만 가져오기
   */
  getAvailableBranches(totalVRI: number): Branch[] {
    return getUnlockedBranches(totalVRI);
  }

  /**
   * 특정 브랜치 가져오기
   */
  getBranch(branchId: string): Branch | undefined {
    return getBranchById(branchId);
  }

  /**
   * 브랜치의 미션 목록 가져오기
   */
  getBranchMissions(branchId: string) {
    return getMissionsByBranch(branchId);
  }

  /**
   * 브랜치 진행도 계산
   */
  calculateBranchProgress(
    branchId: string,
    completedMissionIds: string[]
  ): BranchProgress {
    const branch = this.getBranch(branchId);
    if (!branch) {
      throw new Error(`Branch ${branchId} not found`);
    }

    const missions = this.getBranchMissions(branchId);
    const completedMissions = missions.filter(m => completedMissionIds.includes(m.id));
    const currentVRI = completedMissions.reduce((sum, m) => sum + m.vriReward, 0);
    const isCleared = currentVRI >= branch.maxVRI;

    return {
      branchId,
      currentVRI,
      maxVRI: branch.maxVRI,
      completedMissions: completedMissionIds,
      isCleared,
      lastPlayedAt: new Date(),
    };
  }

  /**
   * 전체 VRI 계산
   */
  calculateTotalVRI(branches: BranchProgress[]): VRI {
    const totalVRI = branches.reduce((sum, b) => sum + b.currentVRI, 0);
    
    // 각 가치별 VRI 계산 (추후 미션 완료 데이터에서 가져올 수 있음)
    const trust = branches.find(b => b.branchId === 'branch-2017-trust')?.currentVRI || 0;
    const empathy = branches.find(b => b.branchId === 'branch-2024-empathy')?.currentVRI || 0;
    const love = branches.find(b => b.branchId === 'branch-2026-love')?.currentVRI || 0;

    return {
      total: totalVRI,
      trust,
      empathy,
      love,
      lastUpdated: new Date(),
    };
  }

  /**
   * 구원 포트폴리오 초기화
   */
  initializeSalvationPortfolio(userId: string): SalvationPortfolio {
    return {
      userId,
      vri: {
        total: 0,
        trust: 0,
        empathy: 0,
        love: 0,
        lastUpdated: new Date(),
      },
      branches: BRANCHES.map(b => ({
        branchId: b.id,
        currentVRI: 0,
        maxVRI: b.maxVRI,
        completedMissions: [],
        isCleared: false,
        lastPlayedAt: new Date(),
      })),
      hopeShards: [],
      completionRate: 0,
      canSave2028: false,
    };
  }

  /**
   * 미션 완료 처리
   */
  completeMission(
    portfolio: SalvationPortfolio,
    missionId: string
  ): { 
    portfolio: SalvationPortfolio; 
    hopeShard: HopeShard | null;
  } {
    const mission = getMissionById(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    const branchProgress = portfolio.branches.find(b => b.branchId === mission.branchId);
    if (!branchProgress) {
      throw new Error(`Branch progress for ${mission.branchId} not found`);
    }

    // 이미 완료된 미션인지 확인
    if (branchProgress.completedMissions.includes(missionId)) {
      return { portfolio, hopeShard: null };
    }

    // 미션 완료 추가
    branchProgress.completedMissions.push(missionId);
    branchProgress.currentVRI += mission.vriReward;
    branchProgress.lastPlayedAt = new Date();

    const branch = this.getBranch(mission.branchId);
    if (branch && branchProgress.currentVRI >= branch.maxVRI) {
      branchProgress.isCleared = true;
      if (!branchProgress.firstClearedAt) {
        branchProgress.firstClearedAt = new Date();
      }
    }

    // VRI 업데이트
    portfolio.vri = this.calculateTotalVRI(portfolio.branches);

    // 희망의 파편 생성
    let hopeShard: HopeShard | null = null;
    if (mission.hopeShard) {
      hopeShard = {
        id: `shard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        photocardId: undefined,
        ...mission.hopeShard,
        earnedAt: new Date(),
      };
      portfolio.hopeShards.push(hopeShard);
    }

    // 완성도 계산
    portfolio.completionRate = this.calculateCompletionRate(portfolio);

    // 2028년 구원 가능 여부 (모든 브랜치 클리어 시)
    portfolio.canSave2028 = portfolio.branches.every(b => b.isCleared);

    return { portfolio, hopeShard };
  }

  /**
   * 완성도 계산 (0-100)
   */
  calculateCompletionRate(portfolio: SalvationPortfolio): number {
    const totalMaxVRI = BRANCHES.reduce((sum, b) => sum + b.maxVRI, 0);
    const currentVRI = portfolio.vri.total;
    return Math.round((currentVRI / totalMaxVRI) * 100);
  }

  /**
   * 2028년까지 남은 일수 계산
   */
  getDaysUntil2028(): number {
    const now = new Date();
    const target = new Date('2028-01-01');
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * 멸망 진행도 계산 (VRI에 따라 감소)
   */
  calculateDecayLevel(totalVRI: number): number {
    const maxPossibleVRI = BRANCHES.reduce((sum, b) => sum + b.maxVRI, 0); // 2500
    const decayLevel = 100 - Math.round((totalVRI / maxPossibleVRI) * 100);
    return Math.max(0, Math.min(100, decayLevel));
  }

  /**
   * 다음 해금 브랜치 정보
   */
  getNextLockedBranch(totalVRI: number): Branch | null {
    const lockedBranches = BRANCHES.filter(
      b => !b.isUnlocked && b.requiredVRI !== undefined
    ).sort((a, b) => (a.requiredVRI || 0) - (b.requiredVRI || 0));

    return lockedBranches.find(b => totalVRI < (b.requiredVRI || 0)) || null;
  }
}

export const branchService = new BranchService();
