/**
 * 포스 관련 상수
 */

// 기존 보스 포스 요구치 (호환성을 위해 유지, 새 시스템에서는 bosses.ts 사용)
export const BOSS_FORCE_REQUIREMENTS = {
  // 아케인 포스 보스
  "카오스 선택받은 세렌": 1320,
  "카오스 감시자 칼로스": 1380,
  "진 힐라": 1440,
  "아케인 세렌": 1500,
  "아케인 칼로스": 1560,
  "검은 마법사": 1620,

  // 어센틱 포스 보스
  "감시자 칼로스": 600,
  "카오스 검은 마법사": 700,
  "어센틱 세렌": 900,
  "어센틱 칼로스": 1000,
  "가디언 엔젤 슬라임": 1100,
  "카오스 가디언 엔젤 슬라임": 1200,
} as const;

export const FORCE_MULTIPLIERS = {
  // 아케인 포스 배율 (배수)
  Arcane: [
    { value: 0, label: "+0" },
    { value: 10, label: "+10" },
    { value: 20, label: "+20" },
    { value: 30, label: "+30" },
    { value: 40, label: "+40" },
    { value: 50, label: "+50" },
  ],

  // 어센틱 포스 배율 (곱셈)
  Authentic: [
    { value: 1.0, label: "1.0x" },
    { value: 1.1, label: "1.1x" },
    { value: 1.3, label: "1.3x" },
    { value: 1.5, label: "1.5x" },
  ],
} as const;

// 보스 종류별 포스 타입 (기존 시스템용, 새 시스템에서는 bosses.ts 사용)
export const BOSS_FORCE_TYPES = {
  "Arcane" : [
    "카오스 선택받은 세렌",
    "카오스 감시자 칼로스",
    "진 힐라",
    "아케인 세렌",
    "아케인 칼로스",
    "검은 마법사",
  ],
  "Authentic" : [
    "감시자 칼로스",
    "카오스 검은 마법사",
    "어센틱 세렌",
    "어센틱 칼로스",
    "가디언 엔젤 슬라임",
    "카오스 가디언 엔젤 슬라임",
  ],
} as const;

