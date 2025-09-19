// 수퍼어드민 지갑 주소 목록
export const SUPER_ADMIN_WALLETS = [
  "0x999403dcfae1c4945e4f548fb2e7e6c7912ad4dd68297f1a5855c847513ec8fc", // 기본 테스트 지갑
  "0xbf0ca9fc3f88f59193a5b985e61dd8b02d97f83b2efe99b9a2c5ae50c16cb531", // 테스트 지갑 2
  "0x6f8a5d5a7f7b8a527c9493841e21699ee87453a341b95b297eb2f616c687ac1f", // 테스트 지갑 3
  "0x0065009a167c25172cccf24adeb1c0e5a53726cbf2a15bf261a2e3a559d7c5ca", // 테스트 지갑 4
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