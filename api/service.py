from typing import Dict, Optional, List, Tuple
from datetime import date, timedelta
from pathlib import Path
from maple import MapleStoryAPI, get_character_ocid, get_character_symbol_equipment, get_character_stat


class MapleService:
    """메이플스토리 API 서비스"""

    def __init__(self, api_key: Optional[str] = None):
        self.api = MapleStoryAPI(api_key)
        self._load_force_cost_tables()

    def _load_force_cost_tables(self):
        """아케인/어센틱 포스 비용 테이블 로드"""
        self.arcane_regions = ['Yuro', 'ChewChew', 'Lecheln', 'Arcana', 'Morass', 'Esfera']
        self.authentic_regions = ['Cernium', 'Arcs', 'Odium', 'Dowonkyung', 'Arteria', 'Carcion', 'Tallahart']

        # 비용 테이블 초기화
        self.arcane_cost_dict = {region: [] for region in self.arcane_regions}
        self.authentic_cost_dict = {region: [] for region in self.authentic_regions}

        # 아케인포스 비용 테이블 로드
        arcane_cost_path = Path(__file__).parent / 'AracneCostTable.txt'
        with open(arcane_cost_path, 'r') as f:
            for line in f:
                if line.startswith('Lev'):
                    continue
                costs = line.strip().split('\t')
                for i, region in enumerate(self.arcane_regions, 1):
                    self.arcane_cost_dict[region].append(int(costs[i]))

        # 어센틱포스 비용 테이블 로드
        authentic_cost_path = Path(__file__).parent / 'AuthenticCostTable.txt'
        with open(authentic_cost_path, 'r') as f:
            for line in f:
                if line.startswith('Lev'):
                    continue
                costs = line.strip().split('\t')
                for i, region in enumerate(self.authentic_regions, 1):
                    self.authentic_cost_dict[region].append(int(costs[i]))

    def get_character_symbol_info(self, character_name: str) -> Dict:
        """
        캐릭터의 초기 정보를 조회합니다.

        Args:
            character_name: 캐릭터 이름

        Returns:
            Dict: {
                "basic_info": {                   # 기본 정보
                    "level": int,                 # 캐릭터 레벨
                    "class": str,                 # 직업
                    "world": str,                 # 서버
                    "image": str                  # 캐릭터 이미지 URL
                },
                "symbol_info": {                  # 심볼 정보
                    "arcane_symbols": [           # 아케인심볼 목록
                        {
                            "name": str,          # 심볼 이름
                            "level": int,         # 레벨
                            "icon": str,          # 아이콘 URL
                            "description": str    # 설명
                        }
                    ],
                    "authentic_symbols": [        # 어센틱심볼 목록
                        {
                            "name": str,
                            "level": int,
                            "icon": str,
                            "description": str
                        }
                    ]
                },
                "force_info": {                   # 포스 정보
                    "arcane_force": int,          # 아케인포스 총합
                    "authentic_force": int        # 어센틱포스 총합
                }
            }
        """
        # 초기 심볼 레벨 딕셔너리 설정
        symbol_levels = {
            "아케인심볼 : 소멸의 여로": 0,
            "아케인심볼 : 츄츄 아일랜드": 0,
            "아케인심볼 : 레헬른": 0,
            "아케인심볼 : 아르카나": 0,
            "아케인심볼 : 모라스": 0,
            "아케인심볼 : 에스페라": 0,
            "어센틱심볼 : 세르니움": 0,
            "어센틱심볼 : 아르크스": 0,
            "어센틱심볼 : 오디움": 0,
            "어센틱심볼 : 도원경": 0,
            "어센틱심볼 : 아르테리아": 0,
            "어센틱심볼 : 카르시온": 0,
            "그랜드 어센틱심볼 : 탈라하트": 0
        }

        try:
            # 1. OCID 조회
            ocid_response = self.api.get_character_ocid(character_name)
            ocid = ocid_response.ocid

            # 2. 기본 정보 조회
            basic_response = self.api.get_character_basic(ocid)
            basic_info = {
                "level": basic_response.character_level,
                "class": basic_response.character_class,
                "world": basic_response.world_name,
                "image": basic_response.character_image
            }

            # 3. 심볼 장비 정보 조회
            symbol_response = self.api.get_character_symbol_equipment(ocid)

            # 기본 심볼 정보 설정
            default_arcane_symbols = [
                {
                    "name": "아케인심볼 : 소멸의 여로",
                    "level": 0,
                    "icon": "",
                    "description": "소멸의 여로에서 획득 가능한 아케인심볼"
                },
                {
                    "name": "아케인심볼 : 츄츄 아일랜드",
                    "level": 0,
                    "icon": "",
                    "description": "츄츄 아일랜드에서 획득 가능한 아케인심볼"
                },
                {
                    "name": "아케인심볼 : 레헬른",
                    "level": 0,
                    "icon": "",
                    "description": "레헬른에서 획득 가능한 아케인심볼"
                },
                {
                    "name": "아케인심볼 : 아르카나",
                    "level": 0,
                    "icon": "",
                    "description": "아르카나에서 획득 가능한 아케인심볼"
                },
                {
                    "name": "아케인심볼 : 모라스",
                    "level": 0,
                    "icon": "",
                    "description": "모라스에서 획득 가능한 아케인심볼"
                },
                {
                    "name": "아케인심볼 : 에스페라",
                    "level": 0,
                    "icon": "",
                    "description": "에스페라에서 획득 가능한 아케인심볼"
                }
            ]

            default_authentic_symbols = [
                {
                    "name": "어센틱심볼 : 세르니움",
                    "level": 0,
                    "icon": "",
                    "description": "세르니움에서 획득 가능한 어센틱심볼"
                },
                {
                    "name": "어센틱심볼 : 아르크스",
                    "level": 0,
                    "icon": "",
                    "description": "아르크스에서 획득 가능한 어센틱심볼"
                },
                {
                    "name": "어센틱심볼 : 오디움",
                    "level": 0,
                    "icon": "",
                    "description": "오디움에서 획득 가능한 어센틱심볼"
                },
                {
                    "name": "어센틱심볼 : 도원경",
                    "level": 0,
                    "icon": "",
                    "description": "도원경에서 획득 가능한 어센틱심볼"
                },
                {
                    "name": "어센틱심볼 : 아르테리아",
                    "level": 0,
                    "icon": "",
                    "description": "아르테리아에서 획득 가능한 어센틱심볼"
                },
                {
                    "name": "어센틱심볼 : 카르시온",
                    "level": 0,
                    "icon": "",
                    "description": "카르시온에서 획득 가능한 어센틱심볼"
                },
                {
                    "name": "그랜드 어센틱심볼 : 탈라하트",
                    "level": 0,
                    "icon": "",
                    "description": "탈라하트에서 획득 가능한 그랜드 어센틱심볼"
                }
            ]

            # 실제 심볼 정보로 기본값 업데이트
            arcane_symbols = list(default_arcane_symbols)
            authentic_symbols = list(default_authentic_symbols)

            for sym in symbol_response.symbol:
                symbol_info = {
                    "name": sym.symbol_name,
                    "level": sym.symbol_level,
                    "icon": sym.symbol_icon or "",
                    "description": sym.symbol_description or f"{sym.symbol_name}에서 획득 가능한 심볼"
                }
                
                # 기존 심볼 찾아서 업데이트
                if "아케인심볼" in sym.symbol_name:
                    for i, default_sym in enumerate(arcane_symbols):
                        if default_sym["name"] == sym.symbol_name:
                            arcane_symbols[i] = symbol_info
                            break
                elif "어센틱심볼" in sym.symbol_name or "그랜드 어센틱심볼" in sym.symbol_name:
                    for i, default_sym in enumerate(authentic_symbols):
                        if default_sym["name"] == sym.symbol_name:
                            authentic_symbols[i] = symbol_info
                            break

            # 4. 스탯 정보에서 아케인/어센틱포스 조회
            stat_response = self.api.get_character_stat(ocid)
            
            arcane_force = 0
            authentic_force = 0

            for stat in stat_response.final_stat:
                if stat.stat_name == "아케인포스":
                    arcane_force = int(stat.stat_value)
                elif stat.stat_name == "어센틱포스":
                    authentic_force = int(stat.stat_value)

            return {
                "basic_info": basic_info,
                "symbol_info": {
                    "arcane_symbols": arcane_symbols,
                    "authentic_symbols": authentic_symbols
                },
                "force_info": {
                    "arcane_force": arcane_force,
                    "authentic_force": authentic_force
                }
            }

        except Exception as e:
            raise ValueError(f"캐릭터 정보 조회 실패: {str(e)}")

    def _get_available_regions(self, force_type: str, char_level: int) -> List[int]:
        """레벨에 따른 지역 해금 여부 반환"""
        if force_type == "Arcane":
            thresholds = [200, 210, 220, 225, 230, 235]
            region_count = 6
        else:  # Authentic
            thresholds = [260, 265, 270, 275, 280, 285, 290]
            region_count = 7

        return [1 if char_level >= th else 0 for th in thresholds[:region_count]]

    def _calculate_non_symbol_force(self, force_type: str, current_force: int, symbol_levels: List[int]) -> int:
        """심볼을 제외한 포스 수치 계산"""
        symbol_force = 0
        if force_type == "Arcane":
            for level in symbol_levels:
                if level > 0:
                    symbol_force += 20 + (level * 10)
        else:  # Authentic
            for level in symbol_levels:
                if level > 0:
                    symbol_force += level * 10

        return current_force - symbol_force

    def _find_best_symbol_upgrade(self, force_type: str, symbol_levels: List[int], 
                                avail_regions: List[int]) -> Tuple[str, int]:
        """다음 업그레이드할 최적의 심볼 찾기"""
        regions = self.arcane_regions if force_type == "Arcane" else self.authentic_regions
        cost_dict = self.arcane_cost_dict if force_type == "Arcane" else self.authentic_cost_dict
        max_level = 20 if force_type == "Arcane" else 11

        best_symbol = 'null'
        min_cost = float('inf')

        for i, (region, level) in enumerate(zip(regions, symbol_levels)):
            if avail_regions[i] == 0 or level >= max_level:
                continue

            cost = cost_dict[region][level]
            if cost == 0:
                return region, 0
            if cost < min_cost:
                min_cost = cost
                best_symbol = region

        return best_symbol, min_cost

    def optimize_force(self, force_type: str, force_goal: int, char_level: int, 
                      current_force: int, symbol_levels: List[int]) -> Dict:
        """
        아케인/어센틱 포스 최적화 계산

        Args:
            force_type: "Arcane" 또는 "Authentic"
            force_goal: 목표 포스 수치
            char_level: 캐릭터 레벨
            current_force: 현재 총합 포스 수치
            symbol_levels: 현재 심볼 레벨 리스트

        Returns:
            Dict: {
                "initial_levels": List[int],      # 초기 심볼 레벨
                "optimized_levels": List[int],    # 최적화된 심볼 레벨
                "total_cost": int,                # 총 비용
                "upgrade_path": List[Dict]        # 업그레이드 경로
            }
        """
        # 입력값 검증
        if force_type not in ["Arcane", "Authentic"]:
            raise ValueError("force_type must be either 'Arcane' or 'Authentic'")

        # 가능한 지역 계산
        avail_regions = self._get_available_regions(force_type, char_level)

        # 심볼 제외 포스 계산
        non_symbol_force = self._calculate_non_symbol_force(force_type, current_force, symbol_levels)
        target_symbol_force = force_goal - non_symbol_force

        # 초기값 설정
        current_levels = list(symbol_levels)
        current_force = sum(level * 10 for level in current_levels)
        if force_type == "Arcane":
            current_force += sum(20 for level in current_levels if level > 0)

        total_cost = 0
        upgrade_path = []

        # 목표 포스까지 반복
        while current_force < target_symbol_force:
            symbol, cost = self._find_best_symbol_upgrade(force_type, current_levels, avail_regions)
            if symbol == 'null':
                break

            # 심볼 업그레이드
            symbol_idx = (self.arcane_regions if force_type == "Arcane" else self.authentic_regions).index(symbol)
            current_levels[symbol_idx] += 1
            total_cost += cost

            # 포스 증가
            force_increase = 10
            if force_type == "Arcane" and current_levels[symbol_idx] == 1:
                force_increase += 20
            current_force += force_increase

            # 업그레이드 경로 기록
            upgrade_path.append({
                "symbol": symbol,
                "new_level": current_levels[symbol_idx],
                "cost": cost,
                "force": current_force
            })

        return {
            "initial_levels": symbol_levels,
            "optimized_levels": current_levels,
            "total_cost": total_cost,
            "upgrade_path": upgrade_path
        }


# 서비스 싱글톤 인스턴스
maple_service = MapleService()