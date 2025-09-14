import { BOSS_FORCE_REQUIREMENTS, BOSS_FORCE_TYPES, FORCE_MULTIPLIERS } from "@/constants/force";
import { BossName, ForceCalculation, ForceType } from "@/lib/types/force";
import { create } from "zustand";

interface ForceCalculatorState {
  // 선택된 보스
  selectedBoss: BossName | null;
  // 선택된 배율
  selectedMultiplier: number | null;
  // 계산된 목표 포스
  calculatedForce: number | null;
  // 포스 타입 (아케인/어센틱)
  forceType: ForceType | null;

  // 액션
  selectBoss: (boss: BossName) => void;
  selectMultiplier: (multiplier: number) => void;
  setForceType: (type: ForceType) => void;
  reset: () => void;

  // 계산 결과
  getCalculation: () => ForceCalculation | null;
}

export const useForceCalculator = create<ForceCalculatorState>((set, get) => ({
  selectedBoss: null,
  selectedMultiplier: null,
  calculatedForce: null,
  forceType: null,

  selectBoss: (boss) => {
    // Determine force type by membership in configured lists
    let forceType: ForceType | null = null;
    if ((BOSS_FORCE_TYPES.Arcane as readonly string[]).includes(boss)) {
      forceType = "Arcane";
    } else if ((BOSS_FORCE_TYPES.Authentic as readonly string[]).includes(boss)) {
      forceType = "Authentic";
    }

    const baseForce = BOSS_FORCE_REQUIREMENTS[boss];

    set({
      selectedBoss: boss,
      forceType,
      calculatedForce: baseForce,
      // 기본 배율 설정
      selectedMultiplier: forceType === "Arcane" ? 1.0 : 0,
    });
  },

  selectMultiplier: (multiplier) => {
    const { selectedBoss, forceType } = get();
    if (!selectedBoss || !forceType) return;

    const baseForce = BOSS_FORCE_REQUIREMENTS[selectedBoss];
    let calculatedForce: number;

    if (forceType === "Arcane") {
      // 아케인포스: 기본 요구치 × 배율
      calculatedForce = Math.ceil(baseForce * multiplier);
    } else {
      // 어센틱포스: 기본 요구치 + 추가 포스
      calculatedForce = baseForce + multiplier;
    }

    set({ selectedMultiplier: multiplier, calculatedForce });
  },

  setForceType: (type) => {
    // Reset calculator context when switching force type
    set({
      forceType: type,
      selectedBoss: null,
      calculatedForce: null,
      // Preload default multiplier for UX; won't apply until a boss is selected
      selectedMultiplier: type === "Arcane" ? 1.0 : 0,
    });
  },

  reset: () => {
    set({
      selectedBoss: null,
      selectedMultiplier: null,
      calculatedForce: null,
      forceType: null,
    });
  },

  getCalculation: () => {
    const { selectedBoss, selectedMultiplier, calculatedForce, forceType } = get();

    if (!selectedBoss || !selectedMultiplier || !calculatedForce || !forceType) {
      return null;
    }

    return {
      baseForceName: selectedBoss,
      baseForce: BOSS_FORCE_REQUIREMENTS[selectedBoss],
      multiplier: selectedMultiplier,
      targetForce: calculatedForce,
      forceType,
    };
  },
}));
