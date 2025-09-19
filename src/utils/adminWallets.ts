// 수퍼어드민 지갑 주소 목록
export const SUPER_ADMIN_WALLETS = [
  "0x999403dcfae1c4945e4f548fb2e7e6c7912ad4dd68297f1a5855c847513ec8fc", // 기본 테스트 지갑
  "0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456", // 추가 관리자 지갑 1
  "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", // 추가 관리자 지갑 2
];

// 수퍼어드민 지갑인지 체크
export const isSuperAdmin = (walletAddress: string): boolean => {
  return SUPER_ADMIN_WALLETS.includes(walletAddress.toLowerCase());
};

// 수퍼어드민 초기 SUI 코인 지급량
export const SUPER_ADMIN_INITIAL_SUI_COINS = 100.0; // 일반 유저 1.0 vs 관리자 100.0

// 수퍼어드민 초기 팬 하트 지급량
export const SUPER_ADMIN_INITIAL_FAN_HEARTS = 1000; // 일반 유저 0 vs 관리자 1000

// 수퍼어드민 일일 하트 지급량
export const SUPER_ADMIN_DAILY_HEARTS = 100; // 일반 유저 10 vs 관리자 100