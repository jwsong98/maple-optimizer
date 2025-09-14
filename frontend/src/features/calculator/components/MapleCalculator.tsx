'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, User, Zap, Shield, Star, Calculator, TrendingUp, Coins, Target, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCharacterSymbols, optimizeForce } from '@/remote/api';
import { CharacterSymbolInfo, SymbolItem, ForceOptimizeRequest, ForceOptimizeResponse } from '@/lib/types';
import { SYMBOL_NAME_MAP, SYMBOL_ICON_MAP, SYMBOL_CONFIG } from '@/constants/config';
import { ForceSelector } from './ForceSelector';
import { BossTargetCalculation } from '../hooks/useBossTargetSelector';



const optimizerSchema = z.object({
  force_type: z.enum(['Arcane', 'Authentic']),
  force_goal: z.number().min(1, '목표 포스는 1 이상이어야 합니다'),
  char_level: z.number().min(200, '캐릭터 레벨은 200 이상이어야 합니다'),
  current_force: z.number().min(0, '현재 포스는 0 이상이어야 합니다'),
  symbol_levels: z.array(z.number().min(0)).min(6).max(7),
  extra_force: z.number().min(0, '추가 포스는 0 이상이어야 합니다'),
});

type OptimizerForm = z.infer<typeof optimizerSchema>;

export default function MapleCalculator() {
  const [characterName, setCharacterName] = useState('');
  const [searchedName, setSearchedName] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<ForceOptimizeResponse | null>(null);
  const [bossTargetCalculation, setBossTargetCalculation] = useState<BossTargetCalculation | null>(null);
  const [savedBossTargetCalculation, setSavedBossTargetCalculation] = useState<BossTargetCalculation | null>(null);
  const { toast } = useToast();

  // Character lookup query
  const {
    data: characterQueryData,
    isLoading: isCharacterLoading,
    error: characterError,
  } = useQuery({
    queryKey: ['character', searchedName],
    queryFn: () => getCharacterSymbols(searchedName!),
    enabled: !!searchedName,
    retry: false,
  });

  // Form for optimization
  const form = useForm<OptimizerForm>({
    resolver: zodResolver(optimizerSchema),
    defaultValues: {
      force_type: 'Arcane',
      force_goal: 0,
      char_level: 275,
      current_force: 0,
      symbol_levels: [0, 0, 0, 0, 0, 0],
      extra_force: 0,
    },
  });

  // Utility functions for force calculations
  const calculateSymbolForce = React.useCallback((levels: number[], type: 'Arcane' | 'Authentic') => {
    return levels.reduce((total, level) => {
      if (type === 'Arcane') {
        // 아케인심볼: 레벨이 0이 아닌 경우 기본 20 + (레벨 * 10)
        return total + (level > 0 ? 20 + (level * 10) : 0);
      } else {
        // 어센틱심볼: 레벨 * 10
        return total + (level * 10);
      }
    }, 0);
  }, []);

  const calculateExtraForce = React.useCallback((totalForce: number, levels: number[], type: 'Arcane' | 'Authentic') => {
    const symbolForce = calculateSymbolForce(levels, type);
    return Math.max(0, totalForce - symbolForce);
  }, [calculateSymbolForce]);

  // ✨ Parse character data from react-query as single source of truth
  const parsedCharacterData = React.useMemo(() => {
    if (!characterQueryData?.data) return null;

    const data = characterQueryData.data;
    const arcaneSymbols = data.symbol_info.arcane_symbols.map(s => s.level);
    const authenticSymbols = data.symbol_info.authentic_symbols.map(s => s.level);

    return {
      level: data.basic_info.level,
      class: data.basic_info.class,
      arcane: {
        force: data.force_info.arcane_force,
        levels: arcaneSymbols,
        extra: calculateExtraForce(data.force_info.arcane_force, arcaneSymbols, 'Arcane'),
      },
      authentic: {
        force: data.force_info.authentic_force,
        levels: authenticSymbols,
        extra: calculateExtraForce(data.force_info.authentic_force, authenticSymbols, 'Authentic'),
      }
    };
  }, [characterQueryData, calculateExtraForce]);

  const forceType = form.watch('force_type');
  const symbolLevels = form.watch('symbol_levels');
  const extraForce = form.watch('extra_force');

  // Calculate total force including extra force from current form values
  const totalCurrentForce = React.useMemo(() => {
    const symbolForce = calculateSymbolForce(symbolLevels, forceType);
    return symbolForce + extraForce;
  }, [calculateSymbolForce, symbolLevels, forceType, extraForce]);

  // Sync current_force with calculated total force
  React.useEffect(() => {
    form.setValue('current_force', totalCurrentForce);
  }, [totalCurrentForce, form]);

  // Handle boss target calculation changes
  const handleBossTargetCalculationChange = React.useCallback((calculation: BossTargetCalculation) => {
    setBossTargetCalculation(calculation);
    
    // Update form values when target force calculation changes
    if (calculation.targetForce && calculation.targetForce > 0) {
      form.setValue('force_goal', calculation.targetForce);
    }
  }, [form]);

  // Optimization mutation
  const optimizeMutation = useMutation({
    mutationFn: (data: ForceOptimizeRequest) => optimizeForce(data),
    onSuccess: (response) => {
      setOptimizationResult(response.data);
      toast({
        title: '최적화 완료',
        description: '심볼 최적화 계산이 완료되었습니다.',
      });
    },
    onError: (error: any) => {
      toast({
        title: '최적화 실패',
        description: error.response?.data?.detail || '최적화 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // Handle character search
  const handleCharacterSearch = () => {
    if (!characterName.trim()) {
      toast({
        title: '오류',
        description: '캐릭터 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    // Save current boss target calculation before character lookup
    if (bossTargetCalculation?.targetForce && bossTargetCalculation.targetForce > 0) {
      setSavedBossTargetCalculation(bossTargetCalculation);
    }
    
    setSearchedName(characterName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCharacterSearch();
    }
  };

  // ✨ Sync form with character data using form.reset for atomic updates
  React.useEffect(() => {
    if (parsedCharacterData) {
      // Determine which force type has data
      const hasArcaneData = parsedCharacterData.arcane.levels.length > 0;
      const hasAuthenticData = parsedCharacterData.authentic.levels.length > 0;
      
      let targetForceType: 'Arcane' | 'Authentic' = forceType;
      if (hasArcaneData && !hasAuthenticData) {
        targetForceType = 'Arcane';
      } else if (hasAuthenticData && !hasArcaneData) {
        targetForceType = 'Authentic';
      }

      const currentTypeData = targetForceType === 'Arcane' 
        ? parsedCharacterData.arcane 
        : parsedCharacterData.authentic;

      // Reset form with character data, preserving boss target if exists
      const currentGoal = savedBossTargetCalculation?.targetForce || form.getValues('force_goal');
      
      form.reset({
        force_type: targetForceType,
        force_goal: currentGoal,
        char_level: parsedCharacterData.level,
        current_force: currentTypeData.force,
        symbol_levels: currentTypeData.levels,
        extra_force: currentTypeData.extra,
      });

      // Clear saved boss target after restoring
      if (savedBossTargetCalculation) {
        setSavedBossTargetCalculation(null);
      }
    }
  }, [parsedCharacterData, form, savedBossTargetCalculation]);

  // Handle character error
  React.useEffect(() => {
    if (characterError) {
      toast({
        title: '조회 실패',
        description: '캐릭터 정보를 찾을 수 없습니다. 캐릭터 이름을 확인해주세요.',
        variant: 'destructive',
      });
    }
  }, [characterError, toast]);

  // ✨ Handle force type changes using parsed character data or defaults
  React.useEffect(() => {
    if (parsedCharacterData) {
      // Character data is available, use it
      const currentTypeData = forceType === 'Arcane' 
        ? parsedCharacterData.arcane 
        : parsedCharacterData.authentic;

      form.reset({
        ...form.getValues(), // Preserve other values like force_goal
        current_force: currentTypeData.force,
        symbol_levels: currentTypeData.levels,
        extra_force: currentTypeData.extra,
      });
    } else {
      // No character data, use defaults
      const defaultLevels = forceType === 'Arcane' 
        ? [0, 0, 0, 0, 0, 0] 
        : [0, 0, 0, 0, 0, 0, 0];
      
      form.reset({
        ...form.getValues(),
        current_force: 0,
        symbol_levels: defaultLevels,
        extra_force: 0,
      });

      // Reset goal when force family changes (only if no character data and no saved boss target)
      if (!savedBossTargetCalculation && !isCharacterLoading) {
        form.setValue('force_goal', 0);
      }
    }
  }, [forceType, parsedCharacterData, form, savedBossTargetCalculation, isCharacterLoading]);

  const onSubmitOptimization = (data: OptimizerForm) => {
    if (!bossTargetCalculation?.targetForce || bossTargetCalculation.targetForce <= 0) {
      toast({
        title: "오류",
        description: "목표 포스를 설정해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Use boss target calculation data
    const adjustedData = {
      ...data,
      force_goal: bossTargetCalculation.targetForce,
      current_force: totalCurrentForce,
    };
    optimizeMutation.mutate(adjustedData as ForceOptimizeRequest);
  };

  const symbolNames = forceType === 'Arcane' ? SYMBOL_CONFIG.ARCANE.NAMES : SYMBOL_CONFIG.AUTHENTIC.NAMES;
  const maxLevel = forceType === 'Arcane' ? SYMBOL_CONFIG.ARCANE.MAX_LEVEL : SYMBOL_CONFIG.AUTHENTIC.MAX_LEVEL;

  return (
    <div className="space-y-8">
      {/* Character Search Section */}
      <Card className="w-full max-w-6xl mx-auto">
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
            <Button onClick={handleCharacterSearch} disabled={isCharacterLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isCharacterLoading ? '조회중...' : '조회'}
            </Button>
          </div>

          {parsedCharacterData && (
            <div className="space-y-6 mt-6">
              <Separator />
              
              {/* Character Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <User className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm text-gray-600 mb-1">직업</div>
                    <div className="font-bold">{parsedCharacterData.class}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-sm text-gray-600 mb-1">레벨</div>
                    <div className="font-bold">{parsedCharacterData.level}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-sm text-gray-600 mb-1">아케인포스</div>
                    <div className="font-bold text-purple-600">
                      {parsedCharacterData.arcane.force.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm text-gray-600 mb-1">어센틱포스</div>
                    <div className="font-bold text-blue-600">
                      {parsedCharacterData.authentic.force.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Section */}
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            심볼 최적화 계산기
          </CardTitle>
          <CardDescription>
            목표 포스에 도달하기 위한 최적의 심볼 업그레이드 경로를 계산합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitOptimization)} className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="force_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">포스 타입</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? 'Arcane'}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="포스 타입 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Arcane">아케인포스</SelectItem>
                            <SelectItem value="Authentic">어센틱포스</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="char_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">캐릭터 레벨</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="275"
                            className="h-12"
                            {...field}
                            value={field.value ?? 200}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 200)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <ForceSelector 
                    forceTypeFromForm={forceType} 
                    onTargetForceChange={handleBossTargetCalculationChange}
                  />

                  <FormField
                    control={form.control}
                    name="current_force"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">현재 포스 (자동 계산)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-12 bg-gray-100 cursor-not-allowed"
                            disabled
                            readOnly
                            {...field}
                            value={totalCurrentForce}
                          />
                        </FormControl>
                        <div className="text-sm text-gray-500 mt-1">
                          심볼 포스와 추가 포스의 합으로 자동 계산됩니다
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </div>


              {/* Symbol Levels Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">
                    {forceType === 'Arcane' ? '아케인심볼 정보' : '어센틱심볼 정보'}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {forceType === 'Arcane' ? '아케인포스' : '어센틱포스'}
                  </Badge>
                </div>
                
                <Card className={forceType === 'Arcane' ? 'border-purple-200 bg-purple-50' : 'border-blue-200 bg-blue-50'}>
                  <CardContent className="p-6">
                    <div className={`grid gap-4 ${forceType === 'Arcane' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3'}`}>
                      {symbolNames.map((symbolName, index) => {
                        const fullSymbolName = forceType === 'Arcane' 
                          ? `아케인심볼 : ${symbolName}`
                          : `어센틱심볼 : ${symbolName}`;
                        const iconUrl = SYMBOL_ICON_MAP[fullSymbolName as keyof typeof SYMBOL_ICON_MAP];

                        return (
                          <FormField
                            key={symbolName}
                            control={form.control}
                            name={`symbol_levels.${index}`}
                            render={({ field }) => (
                              <FormItem className="text-center">
                                <div className={`w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                                  forceType === 'Arcane' ? 'bg-purple-100' : 'bg-blue-100'
                                }`}>
                                  {iconUrl ? (
                                    <img 
                                      src={iconUrl} 
                                      alt={symbolName}
                                      className="w-12 h-12"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.setAttribute('style', 'display: block');
                                      }}
                                    />
                                  ) : null}
                                  {forceType === 'Arcane' ? (
                                    <Zap className="w-8 h-8 text-purple-500" style={{display: iconUrl ? 'none' : 'block'}} />
                                  ) : (
                                    <Shield className="w-8 h-8 text-blue-500" style={{display: iconUrl ? 'none' : 'block'}} />
                                  )}
                                </div>
                                <FormLabel className="text-xs font-medium text-gray-700 block mb-1">
                                  {symbolName}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={maxLevel}
                                    className="h-10 text-center font-medium"
                                    placeholder="레벨"
                                    {...field}
                                    value={field.value ?? 0}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0;
                                      const newLevels = [...form.getValues('symbol_levels')];
                                      newLevels[index] = Math.min(Math.max(value, 0), maxLevel);
                                      form.setValue('symbol_levels', newLevels);
                                    }}
                                  />
                                </FormControl>
                                <div className="text-xs text-gray-500 mt-1">
                                  Max: {maxLevel}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
                      {/* Extra Force Input */}
                      <FormField
                        control={form.control}
                        name="extra_force"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              추가 포스 (심볼 외 수단)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="h-10"
                                placeholder="0"
                                {...field}
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Force Summary */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">심볼 포스</div>
                          <div className={`font-bold ${
                            forceType === 'Arcane' ? 'text-purple-600' : 'text-blue-600'
                          }`}>
                            {calculateSymbolForce(symbolLevels, forceType).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">추가 포스</div>
                          <div className={`font-bold ${
                            forceType === 'Arcane' ? 'text-purple-600' : 'text-blue-600'
                          }`}>
                            {extraForce.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          총 {forceType === 'Arcane' ? '아케인' : '어센틱'}포스:
                        </span>
                        <div className="flex flex-col items-end">
                          <span className={`font-bold text-lg ${
                            forceType === 'Arcane' ? 'text-purple-600' : 'text-blue-600'
                          }`}>
                            {totalCurrentForce.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={optimizeMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
                  size="lg"
                >
                  <Target className="w-5 h-5 mr-2" />
                  {optimizeMutation.isPending ? '계산중...' : '최적화 계산'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimizationResult && (
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              최적화 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">총 비용</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {optimizationResult.total_cost.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">업그레이드 단계</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {optimizationResult.upgrade_path.length}단계
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="font-medium">최종 포스</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {optimizationResult.upgrade_path.length > 0
                      ? optimizationResult.upgrade_path[optimizationResult.upgrade_path.length - 1].force.toLocaleString()
                      : totalCurrentForce.toLocaleString()
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">레벨 비교</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {symbolNames.map((symbolName, index) => (
                      <div key={symbolName} className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate">{symbolName}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Lv.{optimizationResult.initial_levels[index]}
                          </Badge>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <Badge variant={
                            optimizationResult.optimized_levels[index] > optimizationResult.initial_levels[index]
                              ? "default"
                              : "secondary"
                          }>
                            Lv.{optimizationResult.optimized_levels[index]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">업그레이드 경로</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {optimizationResult.upgrade_path.map((step, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {step.symbol} → Lv.{step.new_level}
                          </div>
                          <div className="text-xs text-gray-500">
                            비용: {step.cost.toLocaleString()} | 포스: {step.force.toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {index + 1}단계
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
