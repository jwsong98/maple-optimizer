'use client';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
} as const;

// Symbol configuration
export const SYMBOL_CONFIG = {
  ARCANE: {
    COUNT: 6,
    MAX_LEVEL: 20,
    NAMES: [
      '소멸의 여로',
      '츄츄 아일랜드', 
      '레헬른',
      '아르카나',
      '모라스',
      '에스페라'
    ],
  },
  AUTHENTIC: {
    COUNT: 3,
    MAX_LEVEL: 11,
    NAMES: [
      '세르니움',
      '아르크스',
      '오디움',
      '도원경',
      '아르테리아',
      '카르시온',
      '탈라하트',
    ],
  },
} as const;

// Symbol name mapping for optimization API
export const SYMBOL_NAME_MAP = {
  '아케인심볼 : 소멸의 여로': '소멸의 여로',
  '아케인심볼 : 츄츄 아일랜드': '츄츄 아일랜드',
  '아케인심볼 : 레헬른': '레헬른',
  '아케인심볼 : 아르카나': '아르카나',
  '아케인심볼 : 모라스': '모라스',
  '아케인심볼 : 에스페라': '에스페라',
  // '어센틱심볼 : 셀라스': '셀라스',
  // '어센틱심볼 : 문브릿지': '문브릿지',
  // '어센틱심볼 : 고통의 미궁': '고통의 미궁',
  // '어센틱심볼 : 리멘': '리멘',
  '어센틱심볼 : 세르니움': '세르니움',
  '어센틱심볼 : 아르크스': '아르크스',
  '어센틱심볼 : 오디움': '오디움',
  '어센틱심볼 : 도원경': '도원경',
  '어센틱심볼 : 아르테리아': '아르테리아',
  '어센틱심볼 : 카르시온': '카르시온',
  '그랜드 어센틱심볼 : 탈라하트': '탈라하트',
} as const;

// Symbol icon mapping
export const SYMBOL_ICON_MAP = {
  '아케인심볼 : 소멸의 여로': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDJHOA',
  '아케인심볼 : 츄츄 아일랜드': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDJHOD',
  '아케인심볼 : 레헬른': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDJHOC',
  '아케인심볼 : 아르카나': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDJHOF',
  '아케인심볼 : 모라스': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDJHOE',
  '아케인심볼 : 에스페라': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDJHOH',
  '어센틱심볼 : 세르니움': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOB',
  '어센틱심볼 : 아르크스': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOA',
  '어센틱심볼 : 오디움': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOD',
  '어센틱심볼 : 도원경': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOC',
  '어센틱심볼 : 아르테리아': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOF',
  '어센틱심볼 : 카르시온': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOE',
  '어센틱심볼 : 탈라하트': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDPHOB',
  // // 추가 심볼들
  // '어센틱심볼 : 셀라스': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOG',
  // '어센틱심볼 : 문브릿지': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOH',
  // '어센틱심볼 : 고통의 미궁': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOI',
  // '어센틱심볼 : 리멘': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOJ',
} as const;

// Boss target force by family (from provided lists)
export const BOSS_TARGETS = {
  ARCANE: [
    { name: 'EASY 루시드', target: 360 },
    { name: 'NORMAL 루시드', target: 360 },
    { name: 'HARD 루시드', target: 360 },
    { name: 'EASY 윌', target: 560 },
    { name: 'NORMAL 윌', target: 760 },
    { name: 'HARD 윌', target: 760 },
    { name: 'NORMAL 더스크', target: 730 },
    { name: 'CHAOS 더스크', target: 730 },
    { name: 'NORMAL 진 힐라', target: 820 },
    { name: 'HARD 진 힐라', target: 900 },
    { name: 'NORMAL 듄켈', target: 850 },
    { name: 'HARD 듄켈', target: 1380 },
    { name: 'HARD 검은 마법사', target: 1320 },
    { name: 'EXTREME 검은 마법사', target: 1320 },
  ],
  AUTHENTIC: [
    { name: 'NORMAL 세렌', target: 200 },
    { name: 'HARD 세렌', target: 200 },
    { name: 'EXTREME 세렌', target: 200 },
    { name: 'EASY 칼로스', target: 200 },
    { name: 'NORMAL 칼로스', target: 300 },
    { name: 'CHAOS 칼로스', target: 330 },
    { name: 'EXTREME 칼로스', target: 440 },
    { name: 'EASY 최초의 대적자', target: 220 },
    { name: 'NORMAL 최초의 대적자', target: 320 },
    { name: 'HARD 최초의 대적자', target: 320 },
    { name: 'EXTREME 최초의 대적자', target: 460 },
    { name: 'EASY 카링', target: 230 },
    { name: 'NORMAL 카링', target: 330 },
    { name: 'HARD 카링', target: 350 },
    { name: 'EXTREME 카링', target: 480 },
    { name: 'NORMAL 림보', target: 500 },
    { name: 'HARD 림보', target: 500 },
    { name: 'NORMAL 발드릭스', target: 700 },
    { name: 'HARD 발드릭스', target: 700 },
  ],
} as const;
