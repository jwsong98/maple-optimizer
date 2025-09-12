'use client';

// API Types based on the OpenAPI schema
export type ForceType = 'Arcane' | 'Authentic';

export interface ForceOptimizeRequest {
  force_type: ForceType;
  force_goal: number;
  char_level: number;
  current_force: number;
  symbol_levels: number[];
}

export interface UpgradeStep {
  symbol: string;
  new_level: number;
  cost: number;
  force: number;
}

export interface ForceOptimizeResponse {
  initial_levels: number[];
  optimized_levels: number[];
  total_cost: number;
  upgrade_path: UpgradeStep[];
}

export interface SymbolItem {
  name: string;
  level: number;
  icon: string;
  description: string;
}

export interface CharacterBasicInfo {
  level: number;
  class: string;
  world: string;
  image: string;
}

export interface SymbolInfo {
  arcane_symbols: SymbolItem[];
  authentic_symbols: SymbolItem[];
}

export interface ForceInfo {
  arcane_force: number;
  authentic_force: number;
}

export interface CharacterSymbolInfo {
  basic_info: CharacterBasicInfo;
  symbol_info: SymbolInfo;
  force_info: ForceInfo;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}
