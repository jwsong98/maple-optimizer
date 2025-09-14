'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calculator, TrendingUp, Coins, Target, ArrowRight, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { optimizeForce } from '@/remote/api';
import { ForceOptimizeRequest, ForceOptimizeResponse, ForceType, CharacterSymbolInfo } from '@/lib/types';
import { SYMBOL_CONFIG, BOSS_TARGETS } from '@/constants/config';

const optimizerSchema = z.object({
  force_type: z.enum(['Arcane', 'Authentic']),
  force_goal: z.number().min(1, '목표 포스는 1 이상이어야 합니다'),
  char_level: z.number().min(1, '캐릭터 레벨은 200 이상이어야 합니다'),
  current_force: z.number().min(0, '현재 포스는 0 이상이어야 합니다'),
  symbol_levels: z.array(z.number().min(0)).min(6).max(7),
  selected_boss: z.string().optional(),
});

type OptimizerForm = z.infer<typeof optimizerSchema>;

interface ForceOptimizerProps {
  characterData?: CharacterSymbolInfo;
}


export default function ForceOptimizer({ characterData }: ForceOptimizerProps) {
  const [optimizationResult, setOptimizationResult] = useState<ForceOptimizeResponse | null>(null);
  const [savedForces, setSavedForces] = useState<{arcane: number, authentic: number}>({arcane: 0, authentic: 0});
  const [savedSymbolLevels, setSavedSymbolLevels] = useState<{arcane: number[], authentic: number[]}>({
    arcane: [1, 1, 1, 1, 1, 1],
    authentic: [1, 1, 1, 1, 1, 1, 1]
  });
  const { toast } = useToast();

  const form = useForm<OptimizerForm>({
    resolver: zodResolver(optimizerSchema),
    defaultValues: {
      force_type: 'Arcane',
      force_goal: 1500,
      char_level: 275,
      current_force: 0,
      symbol_levels: [1, 1, 1, 1, 1, 1],
      selected_boss: undefined,
    },
  });

  const forceType = form.watch('force_type');

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

  // Update form when character data changes
  useEffect(() => {
    if (characterData) {
      const arcaneSymbols = characterData.symbol_info.arcane_symbols.map(symbol => symbol.level);
      const authenticSymbols = characterData.symbol_info.authentic_symbols.map(symbol => symbol.level);

      // Save force values and symbol levels from character data
      setSavedForces({
        arcane: characterData.force_info.arcane_force,
        authentic: characterData.force_info.authentic_force
      });

      setSavedSymbolLevels({
        arcane: arcaneSymbols.slice(0, SYMBOL_CONFIG.ARCANE.COUNT),
        authentic: authenticSymbols.slice(0, SYMBOL_CONFIG.AUTHENTIC.COUNT)
      });

      // Default to Arcane if we have arcane symbols
      if (arcaneSymbols.length > 0) {
        form.setValue('force_type', 'Arcane');
        form.setValue('current_force', characterData.force_info.arcane_force);
        form.setValue('symbol_levels', arcaneSymbols.slice(0, SYMBOL_CONFIG.ARCANE.COUNT));
        form.setValue('char_level', characterData.basic_info.level);
      } else if (authenticSymbols.length > 0) {
        form.setValue('force_type', 'Authentic');
        form.setValue('current_force', characterData.force_info.authentic_force);
        form.setValue('symbol_levels', authenticSymbols.slice(0, SYMBOL_CONFIG.AUTHENTIC.COUNT));
        form.setValue('char_level', characterData.basic_info.level);
      }
    }
  }, [characterData, form]);

  // Update symbol levels array and force when force type changes
  useEffect(() => {
    if (forceType === 'Arcane') {
      // Load saved arcane data or use defaults
      form.setValue('current_force', savedForces.arcane);
      form.setValue('symbol_levels', savedSymbolLevels.arcane);
    } else if (forceType === 'Authentic') {
      // Load saved authentic data or use defaults
      form.setValue('current_force', savedForces.authentic);
      form.setValue('symbol_levels', savedSymbolLevels.authentic);
    }
    // Reset boss and goal when switching families
    form.setValue('selected_boss', undefined);
    form.setValue('force_goal', 0);
  }, [forceType, form, savedForces, savedSymbolLevels]);

  // Save current values when they change
  useEffect(() => {
    const currentForce = form.watch('current_force');
    const currentLevels = form.watch('symbol_levels');
    
    if (forceType === 'Arcane') {
      setSavedForces(prev => ({ ...prev, arcane: currentForce }));
      setSavedSymbolLevels(prev => ({ ...prev, arcane: currentLevels }));
    } else if (forceType === 'Authentic') {
      setSavedForces(prev => ({ ...prev, authentic: currentForce }));
      setSavedSymbolLevels(prev => ({ ...prev, authentic: currentLevels }));
    }
  }, [form.watch('current_force'), form.watch('symbol_levels'), forceType]);

  const onSubmit = (data: OptimizerForm) => {
    optimizeMutation.mutate(data as ForceOptimizeRequest);
  };

  const symbolNames = forceType === 'Arcane' ? SYMBOL_CONFIG.ARCANE.NAMES : SYMBOL_CONFIG.AUTHENTIC.NAMES;
  const maxLevel = forceType === 'Arcane' ? SYMBOL_CONFIG.ARCANE.MAX_LEVEL : SYMBOL_CONFIG.AUTHENTIC.MAX_LEVEL;

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  {/* Boss Selector: filters by force type and sets goal */}
                  <FormField
                    control={form.control}
                    name="selected_boss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">보스 선택</FormLabel>
                        <Select
                          value={field.value ?? ''}
                          onValueChange={(val) => {
                            field.onChange(val);
                            const list = forceType === 'Arcane' ? BOSS_TARGETS.ARCANE : BOSS_TARGETS.AUTHENTIC;
                            const found = list.find((b) => b.name === val);
                            form.setValue('force_goal', found ? found.target : 0);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="보스를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(forceType === 'Arcane' ? BOSS_TARGETS.ARCANE : BOSS_TARGETS.AUTHENTIC).map((b) => (
                              <SelectItem key={b.name} value={b.name}>
                                {b.name} ({b.target} 포스)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          보스를 선택하면 목표 포스가 자동으로 설정됩니다.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="force_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">포스 타입</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormField
                    control={form.control}
                    name="force_goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">목표 포스</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1500"
                            className="h-12"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="current_force"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">현재 포스</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-12"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
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
                    <div className={`grid gap-4 ${forceType === 'Arcane' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-7 lg:grid-cols-7'}`}>
                      {symbolNames.map((symbolName, index) => (
                        <FormField
                          key={symbolName}
                          control={form.control}
                          name={`symbol_levels.${index}`}
                          render={({ field }) => (
                            <FormItem className="text-center">
                              <div className={`w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                                forceType === 'Arcane' ? 'bg-purple-100' : 'bg-blue-100'
                              }`}>
                                {forceType === 'Arcane' ? (
                                  <Zap className="w-8 h-8 text-purple-500" />
                                ) : (
                                  <Shield className="w-8 h-8 text-blue-500" />
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
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        총 {forceType === 'Arcane' ? '아케인' : '어센틱'}포스:
                      </span>
                      <span className={`font-bold text-lg ${
                        forceType === 'Arcane' ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {form.watch('current_force').toLocaleString()}
                      </span>
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

      {optimizationResult && (
        <Card className="w-full max-w-4xl mx-auto">
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
                      : form.getValues('current_force').toLocaleString()
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
