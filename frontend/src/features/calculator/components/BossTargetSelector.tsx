"use client";

import React from "react";
import { useBossTargetSelector, BossTargetCalculation } from "../hooks/useBossTargetSelector";
import { FORCE_MULTIPLIERS } from "@/constants/force";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BossTargetSelectorProps {
  forceType?: 'Arcane' | 'Authentic';
  onCalculationChange?: (calculation: BossTargetCalculation) => void;
}

export function BossTargetSelector({ 
  forceType: externalForceType, 
  onCalculationChange 
}: BossTargetSelectorProps) {
  const {
    forceType,
    selectedBossName,
    selectedDifficulty,
    selectedMultiplier,
    targetForce,
    setForceType,
    selectBoss,
    selectDifficulty,
    selectMultiplier,
    getAvailableBosses,
    getAvailableDifficulties,
    getSelectedBossInfo,
    getCalculation,
  } = useBossTargetSelector();

  // 외부에서 포스 타입이 주입되면 동기화
  React.useEffect(() => {
    if (externalForceType && forceType !== externalForceType) {
      setForceType(externalForceType);
    }
  }, [externalForceType, forceType, setForceType]);

  // 계산 결과가 변경되면 외부로 알림
  React.useEffect(() => {
    if (onCalculationChange) {
      onCalculationChange(getCalculation());
    }
  }, [selectedBossName, selectedDifficulty, selectedMultiplier, targetForce, onCalculationChange, getCalculation]);

  const availableBosses = getAvailableBosses();
  const availableDifficulties = getAvailableDifficulties();
  const selectedBossInfo = getSelectedBossInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle>목표 포스 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 포스 타입 표시 */}
        {forceType && (
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-sm font-medium">
              선택된 포스 타입: {forceType === 'Arcane' ? '아케인포스' : '어센틱포스'}
            </p>
          </div>
        )}

        {/* 보스 선택 */}
        {forceType && (
          <div className="space-y-2">
            <Label>보스 선택</Label>
            <Select
              value={selectedBossName || ""}
              onValueChange={selectBoss}
            >
              <SelectTrigger>
                <SelectValue placeholder="보스를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {availableBosses.map((bossName) => (
                  <SelectItem key={bossName} value={bossName}>
                    {bossName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 난이도 선택 */}
        {selectedBossName && (
          <div className="space-y-2">
            <Label>난이도 선택</Label>
            <Select
              value={selectedDifficulty || ""}
              onValueChange={selectDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="난이도를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {availableDifficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 기본 요구 포스 표시 */}
        {selectedBossInfo && (
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-sm text-muted-foreground">기본 요구 포스</p>
            <p className="text-lg font-semibold">{selectedBossInfo.requiredForce}</p>
          </div>
        )}

        {/* 배율 선택 */}
        {selectedDifficulty && forceType && (
          <div className="space-y-2">
            <Label>
              {forceType === "Arcane" ? "아케인포스 추가값" : "어센틱포스 배율"}
            </Label>
            <RadioGroup
              value={String(selectedMultiplier ?? "")}
              onValueChange={(value) => selectMultiplier(Number(value))}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              {FORCE_MULTIPLIERS[forceType].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(option.value)}
                    id={`multiplier-${option.value}`}
                  />
                  <Label htmlFor={`multiplier-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* 계산된 목표 포스 */}
        {targetForce !== null && targetForce > 0 && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm font-medium text-primary">계산된 목표 포스</p>
            <p className="mt-1 text-2xl font-bold text-primary">{targetForce}</p>
            {selectedBossInfo && selectedMultiplier !== null && (
              <p className="mt-1 text-xs text-muted-foreground">
                {forceType === 'Arcane' 
                  ? `${selectedBossInfo.requiredForce} + ${selectedMultiplier} = ${targetForce}`
                  : `${selectedBossInfo.requiredForce} × ${selectedMultiplier} = ${targetForce}`
                }
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
