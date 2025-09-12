export interface BossInfo {
  name: string;
  difficulty: string;
  forceType: 'Arcane' | 'Authentic';
  requiredForce: number;
}

export const BOSS_LIST: BossInfo[] = [
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
];

export const FORCE_MULTIPLIERS = {
  Arcane: [
    { label: '1.0배', value: 1.0 },
    { label: '1.1배', value: 1.1 },
    { label: '1.3배', value: 1.3 },
    { label: '1.5배', value: 1.5 },
  ],
  Authentic: Array.from({ length: 51 }, (_, i) => ({
    label: `+${i}`,
    value: i,
  })),
};
