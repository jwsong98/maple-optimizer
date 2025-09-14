export interface BossInfo {
  name: string;
  difficulty: string;
  forceType: 'Arcane' | 'Authentic';
  requiredForce: number;
}

export const BOSS_LIST: BossInfo[] = [
  // 아케인 보스
  { name: '루시드', difficulty: 'EASY', forceType: 'Arcane', requiredForce: 360 },
  { name: '루시드', difficulty: 'NORMAL', forceType: 'Arcane', requiredForce: 360 },
  { name: '루시드', difficulty: 'HARD', forceType: 'Arcane', requiredForce: 360 },
  { name: '윌', difficulty: 'EASY', forceType: 'Arcane', requiredForce: 560 },
  { name: '윌', difficulty: 'NORMAL', forceType: 'Arcane', requiredForce: 760 },
  { name: '윌', difficulty: 'HARD', forceType: 'Arcane', requiredForce: 760 },
  { name: '더스크', difficulty: 'NORMAL', forceType: 'Arcane', requiredForce: 730 },
  { name: '더스크', difficulty: 'CHAOS', forceType: 'Arcane', requiredForce: 730 },
  { name: '진 힐라', difficulty: 'NORMAL', forceType: 'Arcane', requiredForce: 820 },
  { name: '진 힐라', difficulty: 'HARD', forceType: 'Arcane', requiredForce: 900 },
  { name: '듄켈', difficulty: 'NORMAL', forceType: 'Arcane', requiredForce: 850 },
  { name: '듄켈', difficulty: 'HARD', forceType: 'Arcane', requiredForce: 1380 },
  { name: '검은 마법사', difficulty: 'HARD', forceType: 'Arcane', requiredForce: 1320 },
  { name: '검은 마법사', difficulty: 'EXTREME', forceType: 'Arcane', requiredForce: 1320 },

  // 어센틱 보스
  { name: '세렌', difficulty: 'NORMAL', forceType: 'Authentic', requiredForce: 200 },
  { name: '세렌', difficulty: 'HARD', forceType: 'Authentic', requiredForce: 200 },
  { name: '세렌', difficulty: 'EXTREME', forceType: 'Authentic', requiredForce: 200 },
  { name: '칼로스', difficulty: 'EASY', forceType: 'Authentic', requiredForce: 200 },
  { name: '칼로스', difficulty: 'NORMAL', forceType: 'Authentic', requiredForce: 300 },
  { name: '칼로스', difficulty: 'CHAOS', forceType: 'Authentic', requiredForce: 330 },
  { name: '칼로스', difficulty: 'EXTREME', forceType: 'Authentic', requiredForce: 440 },
  { name: '최초의 대적자', difficulty: 'EASY', forceType: 'Authentic', requiredForce: 220 },
  { name: '최초의 대적자', difficulty: 'NORMAL', forceType: 'Authentic', requiredForce: 320 },
  { name: '최초의 대적자', difficulty: 'HARD', forceType: 'Authentic', requiredForce: 320 },
  { name: '최초의 대적자', difficulty: 'EXTREME', forceType: 'Authentic', requiredForce: 460 },
  { name: '카링', difficulty: 'EASY', forceType: 'Authentic', requiredForce: 230 },
  { name: '카링', difficulty: 'NORMAL', forceType: 'Authentic', requiredForce: 330 },
  { name: '카링', difficulty: 'HARD', forceType: 'Authentic', requiredForce: 350 },
  { name: '카링', difficulty: 'EXTREME', forceType: 'Authentic', requiredForce: 480 },
  { name: '림보', difficulty: 'NORMAL', forceType: 'Authentic', requiredForce: 500 },
  { name: '림보', difficulty: 'HARD', forceType: 'Authentic', requiredForce: 500 },
  { name: '발드릭스', difficulty: 'NORMAL', forceType: 'Authentic', requiredForce: 700 },
  { name: '발드릭스', difficulty: 'HARD', forceType: 'Authentic', requiredForce: 700 },
];
