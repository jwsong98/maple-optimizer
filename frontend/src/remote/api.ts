'use client';

import axios from 'axios';
import { ForceOptimizeRequest, ForceOptimizeResponse, CharacterSymbolInfo } from '@/lib/types';
import { API_CONFIG } from '@/constants/config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Response wrapper type
interface ApiResponse<T> {
  data: T;
  status: number;
}

/**
 * API 상태 확인
 */
export const ping = async (): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.get('/api/ping');
  return {
    data: response.data,
    status: response.status,
  };
};

/**
 * 현재 시간 조회
 */
export const getCurrentTime = async (): Promise<ApiResponse<{ time: string }>> => {
  const response = await apiClient.get('/api/time');
  return {
    data: response.data,
    status: response.status,
  };
};

/**
 * 캐릭터 심볼 정보 조회
 * @param characterName 캐릭터 이름
 */
export const getCharacterSymbols = async (
  characterName: string
): Promise<ApiResponse<CharacterSymbolInfo>> => {
  const response = await apiClient.get(`/api/character/${encodeURIComponent(characterName)}/init`);
  return {
    data: response.data,
    status: response.status,
  };
};

/**
 * 심볼 포스 최적화 계산
 * @param request 최적화 요청 정보
 */
export const optimizeForce = async (
  request: ForceOptimizeRequest
): Promise<ApiResponse<ForceOptimizeResponse>> => {
  const response = await apiClient.post('/api/optimize/force', request);
  return {
    data: response.data,
    status: response.status,
  };
};

// Export the configured axios instance for custom requests
export { apiClient };
