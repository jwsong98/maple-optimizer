"use client";

import { create } from "zustand";
import { BOSS_LIST, BossInfo } from "@/constants/bosses";
import { FORCE_MULTIPLIERS } from "@/constants/force";

export interface BossTargetCalculation {
  selectedBoss: BossInfo | null;
  selectedMultiplier: number | null;
  targetForce: number | null;
}

interface BossTargetSelectorState {
  // 선택된 포스 타입
  forceType: 'Arcane' | 'Authentic' | null;
  // 선택된 보스 이름
  selectedBossName: string | null;
  // 선택된 난이도
  selectedDifficulty: string | null;
  // 선택된 배율
  selectedMultiplier: number | null;
  // 계산된 목표 포스
  targetForce: number | null;

  // 액션
  setForceType: (type: 'Arcane' | 'Authentic') => void;
  selectBoss: (bossName: string) => void;
  selectDifficulty: (difficulty: string) => void;
  selectMultiplier: (multiplier: number) => void;
  reset: () => void;

  // 계산 및 유틸리티
  getAvailableBosses: () => string[];
  getAvailableDifficulties: () => string[];
  getSelectedBossInfo: () => BossInfo | null;
  getCalculation: () => BossTargetCalculation;
}

export const useBossTargetSelector = create<BossTargetSelectorState>((set, get) => ({
  forceType: null,
  selectedBossName: null,
  selectedDifficulty: null,
  selectedMultiplier: null,
  targetForce: null,

  setForceType: (type) => {
    set({
      forceType: type,
      selectedBossName: null,
      selectedDifficulty: null,
      selectedMultiplier: null,
      targetForce: 0,
    });
  },

  selectBoss: (bossName) => {
    set({
      selectedBossName: bossName,
      selectedDifficulty: null,
      selectedMultiplier: null,
      targetForce: 0,
    });
  },

  selectDifficulty: (difficulty) => {
    const { forceType, selectedBossName } = get();
    if (!forceType || !selectedBossName) return;

    const bossInfo = BOSS_LIST.find(
      boss => boss.name === selectedBossName && 
              boss.difficulty === difficulty && 
              boss.forceType === forceType
    );

    if (!bossInfo) return;

    // 기본 배율 설정
    const defaultMultiplier = forceType === 'Arcane' ? 0 : 1.0;

    let calculatedForce: number;
    if (forceType === 'Arcane') {
      // 아케인포스: 기본 요구치 + 배율
      calculatedForce = bossInfo.requiredForce + defaultMultiplier;
    } else {
      // 어센틱포스: 기본 요구치 × 배율
      calculatedForce = Math.ceil(bossInfo.requiredForce * defaultMultiplier);
    }

    set({
      selectedDifficulty: difficulty,
      selectedMultiplier: defaultMultiplier,
      targetForce: calculatedForce,
    });
  },

  selectMultiplier: (multiplier) => {
    const state = get();
    const bossInfo = state.getSelectedBossInfo();
    
    if (!bossInfo || !state.forceType) return;

    let calculatedForce: number;
    if (state.forceType === 'Arcane') {
      // 아케인포스: 기본 요구치 + 배율
      calculatedForce = bossInfo.requiredForce + multiplier;
    } else {
      // 어센틱포스: 기본 요구치 × 배율
      calculatedForce = Math.ceil(bossInfo.requiredForce * multiplier);
    }

    set({
      selectedMultiplier: multiplier,
      targetForce: calculatedForce,
    });
  },

  reset: () => {
    set({
      forceType: null,
      selectedBossName: null,
      selectedDifficulty: null,
      selectedMultiplier: null,
      targetForce: null,
    });
  },

  getAvailableBosses: () => {
    const { forceType } = get();
    if (!forceType) return [];

    const uniqueBosses = Array.from(
      new Set(
        BOSS_LIST
          .filter(boss => boss.forceType === forceType)
          .map(boss => boss.name)
      )
    );

    return uniqueBosses;
  },

  getAvailableDifficulties: () => {
    const { forceType, selectedBossName } = get();
    if (!forceType || !selectedBossName) return [];

    return BOSS_LIST
      .filter(boss => 
        boss.forceType === forceType && 
        boss.name === selectedBossName
      )
      .map(boss => boss.difficulty);
  },

  getSelectedBossInfo: () => {
    const { forceType, selectedBossName, selectedDifficulty } = get();
    if (!forceType || !selectedBossName || !selectedDifficulty) return null;

    return BOSS_LIST.find(
      boss => 
        boss.forceType === forceType && 
        boss.name === selectedBossName && 
        boss.difficulty === selectedDifficulty
    ) || null;
  },

  getCalculation: () => {
    const state = get();
    return {
      selectedBoss: state.getSelectedBossInfo(),
      selectedMultiplier: state.selectedMultiplier,
      targetForce: state.targetForce,
    };
  },
}));
