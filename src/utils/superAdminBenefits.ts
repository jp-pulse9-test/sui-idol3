import { SUPER_ADMIN_INITIAL_SUI_COINS, SUPER_ADMIN_INITIAL_FAN_HEARTS, SUPER_ADMIN_DAILY_HEARTS, isSuperAdmin } from "@/utils/adminWallets";
import { toast } from "sonner";
import { secureStorage } from "@/utils/secureStorage";

// 수퍼어드민 특권 강제 적용 함수
export const applySuperAdminBenefits = () => {
  const currentWallet = secureStorage.getWalletAddress();
  
  if (!currentWallet || !isSuperAdmin(currentWallet)) {
    return false;
  }

  // SUI 코인 업데이트
  const currentSuiCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
  if (currentSuiCoins < SUPER_ADMIN_INITIAL_SUI_COINS) {
    localStorage.setItem('suiCoins', SUPER_ADMIN_INITIAL_SUI_COINS.toString());
    toast.success(`🎉 수퍼어드민 SUI 코인 ${SUPER_ADMIN_INITIAL_SUI_COINS}개 지급 완료!`);
  }

  // 팬 하트 업데이트
  const currentFanHearts = parseInt(localStorage.getItem('fanHearts') || '0');
  if (currentFanHearts < SUPER_ADMIN_INITIAL_FAN_HEARTS) {
    localStorage.setItem('fanHearts', SUPER_ADMIN_INITIAL_FAN_HEARTS.toString());
    toast.success(`💖 수퍼어드민 팬 하트 ${SUPER_ADMIN_INITIAL_FAN_HEARTS}개 지급 완료!`);
  }

  // 일일 하트 업데이트
  const currentDailyHearts = parseInt(localStorage.getItem('dailyHearts') || '0');
  if (currentDailyHearts < SUPER_ADMIN_DAILY_HEARTS) {
    localStorage.setItem('dailyHearts', SUPER_ADMIN_DAILY_HEARTS.toString());
    toast.success(`💝 수퍼어드민 일일 하트 ${SUPER_ADMIN_DAILY_HEARTS}개 지급 완료!`);
  }

  return true;
};

// 페이지 로드 시 자동 적용
export const autoApplySuperAdminBenefits = () => {
  // 페이지 로드 후 1초 뒤에 자동 적용
  setTimeout(() => {
    applySuperAdminBenefits();
  }, 1000);
};