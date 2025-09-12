'use client';

import React from 'react';
import MapleCalculator from '@/features/calculator/components/MapleCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              메이플스토리
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
            심볼 최적화 계산기
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            캐릭터 정보를 조회하고 목표 포스에 도달하기 위한 최적의 심볼 업그레이드 경로를 계산하세요.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <MapleCalculator />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500">
          <p>메이플스토리 심볼 최적화 계산기 - API 기반</p>
        </footer>
      </div>
    </div>
  );
}
