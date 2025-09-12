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
      '오디움'
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
  '그랜드 어센틱심볼 : 탈라하트': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDPHOB',
  // // 추가 심볼들
  // '어센틱심볼 : 셀라스': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOG',
  // '어센틱심볼 : 문브릿지': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOH',
  // '어센틱심볼 : 고통의 미궁': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOI',
  // '어센틱심볼 : 리멘': 'https://open.api.nexon.com/static/maplestory/item/icon/KEIDIHOJ',
} as const;
