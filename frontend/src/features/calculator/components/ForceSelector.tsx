"use client";

import React from "react";
import { BossTargetSelector } from "./BossTargetSelector";
import { BossTargetCalculation } from "../hooks/useBossTargetSelector";

type ForceSelectorProps = {
  // Form-level force type: 'Arcane' | 'Authentic'
  forceTypeFromForm?: 'Arcane' | 'Authentic';
  onTargetForceChange?: (calculation: BossTargetCalculation) => void;
};

export function ForceSelector({ forceTypeFromForm, onTargetForceChange }: ForceSelectorProps) {
  return (
    <BossTargetSelector 
      forceType={forceTypeFromForm}
      onCalculationChange={onTargetForceChange}
    />
  );
}
