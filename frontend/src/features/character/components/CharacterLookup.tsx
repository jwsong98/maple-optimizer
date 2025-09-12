'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, User, Zap, Shield, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCharacterSymbols } from '@/remote/api';
import { CharacterSymbolInfo, SymbolItem } from '@/lib/types';
import { SYMBOL_NAME_MAP } from '@/constants/config';

interface CharacterLookupProps {
  onCharacterFound?: (data: CharacterSymbolInfo) => void;
}

export default function CharacterLookup({ onCharacterFound }: CharacterLookupProps) {
  const [characterName, setCharacterName] = useState('');
  const [searchedName, setSearchedName] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    data: characterData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['character', searchedName],
    queryFn: () => getCharacterSymbols(searchedName!),
    enabled: !!searchedName,
    retry: false,
  });

  const handleSearch = () => {
    if (!characterName.trim()) {
      toast({
        title: '오류',
        description: '캐릭터 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setSearchedName(characterName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  React.useEffect(() => {
    if (characterData?.data && onCharacterFound) {
      onCharacterFound(characterData.data);
    }
  }, [characterData, onCharacterFound]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: '조회 실패',
        description: '캐릭터 정보를 찾을 수 없습니다. 캐릭터 이름을 확인해주세요.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          캐릭터 조회
        </CardTitle>
        <CardDescription>
          메이플스토리 캐릭터 이름을 입력하여 심볼 정보를 조회하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="캐릭터 이름을 입력하세요"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? '조회중...' : '조회'}
          </Button>
        </div>

        {characterData?.data && (
          <div className="space-y-6">
            <Separator />
            
            {/* Character Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <User className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-gray-600 mb-1">직업</div>
                  <div className="font-bold">{characterData.data.basic_info.class}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm text-gray-600 mb-1">레벨</div>
                  <div className="font-bold">{characterData.data.basic_info.level}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-sm text-gray-600 mb-1">아케인포스</div>
                  <div className="font-bold text-purple-600">
                    {characterData.data.force_info.arcane_force.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-gray-600 mb-1">어센틱포스</div>
                  <div className="font-bold text-blue-600">
                    {characterData.data.force_info.authentic_force.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Arcane Symbols */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  아케인심볼 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {characterData.data.symbol_info.arcane_symbols.map((symbol: SymbolItem) => (
                    <div key={symbol.name} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={symbol.icon} 
                          alt={symbol.name}
                          className="w-12 h-12"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <Zap className="w-8 h-8 text-purple-500" style={{display: 'none'}} />
                      </div>
                      <div className="text-xs text-gray-600 mb-1 truncate">
                        {SYMBOL_NAME_MAP[symbol.name as keyof typeof SYMBOL_NAME_MAP] || symbol.name.replace('아케인심볼 : ', '')}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Lv.{symbol.level}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                  <span className="text-gray-600">총 아케인포스:</span>
                  <span className="font-bold text-purple-600">
                    {characterData.data.force_info.arcane_force.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Authentic Symbols */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  어센틱심볼 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                  {characterData.data.symbol_info.authentic_symbols.map((symbol: SymbolItem) => (
                    <div key={symbol.name} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={symbol.icon} 
                          alt={symbol.name}
                          className="w-12 h-12"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <Shield className="w-8 h-8 text-blue-500" style={{display: 'none'}} />
                      </div>
                      <div className="text-xs text-gray-600 mb-1 truncate">
                        {SYMBOL_NAME_MAP[symbol.name as keyof typeof SYMBOL_NAME_MAP] || 
                         symbol.name.replace('어센틱심볼 : ', '').replace('그랜드 어센틱심볼 : ', '')}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Lv.{symbol.level}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                  <span className="text-gray-600">총 어센틱포스:</span>
                  <span className="font-bold text-blue-600">
                    {characterData.data.force_info.authentic_force.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
