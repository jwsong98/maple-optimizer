import { BOSS_FORCE_REQUIREMENTS, BOSS_FORCE_TYPES, FORCE_MULTIPLIERS } from "@/constants/force";

export type BossName = keyof typeof BOSS_FORCE_REQUIREMENTS;
export type ForceType = keyof typeof FORCE_MULTIPLIERS;
export type ARCANE_BossForceType = typeof BOSS_FORCE_TYPES["Arcane"];
export type AUTHENTIC_BossForceType = typeof BOSS_FORCE_TYPES["Authentic"];

export interface ForceMultiplier {
  value: number;
  label: string;
}

export interface ForceCalculation {
  baseForceName: BossName;
  baseForce: number;
  multiplier: number;
  targetForce: number;
  forceType: ForceType;
}

export interface ForceOptimizationRequest {
  forceType: ForceType;
  forceGoal: number;
  charLevel: number;
  currentForce: number;
  symbolLevels: number[];
}

export interface ForceOptimizationResponse {
  initialLevels: number[];
  optimizedLevels: number[];
  totalCost: number;
  upgradePath: {
    symbol: string;
    newLevel: number;
    cost: number;
    force: number;
  }[];
}
