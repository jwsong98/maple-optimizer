from pydantic import BaseModel, Field
from typing import List, Dict, Literal
from enum import Enum


class ForceType(str, Enum):
    ARCANE = "Arcane"
    AUTHENTIC = "Authentic"


class ForceOptimizeRequest(BaseModel):
    """심볼 최적화 요청 모델"""
    force_type: ForceType = Field(
        description="포스 타입 ('Arcane' 또는 'Authentic')"
    )
    force_goal: int = Field(
        description="목표 포스 수치",
        gt=0
    )
    char_level: int = Field(
        description="캐릭터 레벨",
        ge=200
    )
    current_force: int = Field(
        description="현재 총합 포스 수치",
        ge=0
    )
    symbol_levels: List[int] = Field(
        description="현재 심볼 레벨 리스트 (아케인: 6개, 어센틱: 7개)",
        min_items=6,
        max_items=7
    )

    def validate_symbol_levels(self):
        """심볼 레벨 리스트 검증"""
        if self.force_type == ForceType.ARCANE and len(self.symbol_levels) != 6:
            raise ValueError("아케인심볼은 6개의 레벨이 필요합니다")
        if self.force_type == ForceType.AUTHENTIC and len(self.symbol_levels) != 7:
            raise ValueError("어센틱심볼은 7개의 레벨이 필요합니다")
        
        max_level = 20 if self.force_type == ForceType.ARCANE else 11
        if any(level < 0 or level > max_level for level in self.symbol_levels):
            raise ValueError(f"심볼 레벨은 0에서 {max_level} 사이여야 합니다")


class UpgradeStep(BaseModel):
    """업그레이드 단계 정보"""
    symbol: str = Field(description="업그레이드할 심볼 이름")
    new_level: int = Field(description="업그레이드 후 레벨")
    cost: int = Field(description="업그레이드 비용")
    force: int = Field(description="업그레이드 후 총 포스")


class ForceOptimizeResponse(BaseModel):
    """심볼 최적화 응답 모델"""
    initial_levels: List[int] = Field(
        description="초기 심볼 레벨"
    )
    optimized_levels: List[int] = Field(
        description="최적화된 심볼 레벨"
    )
    total_cost: int = Field(
        description="총 비용"
    )
    upgrade_path: List[UpgradeStep] = Field(
        description="업그레이드 경로"
    )
