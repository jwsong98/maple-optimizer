import os
import json
import requests
from datetime import datetime, date, timedelta
from typing import List, Optional, Union
from pydantic import BaseModel, Field, ValidationError
from pathlib import Path
from urllib.parse import quote

from dotenv import load_dotenv
from dotenv import find_dotenv
from logger import logger, log_api_data, log_pydantic_error, log_api_call, log_cache_usage

load_dotenv(find_dotenv())

# Error Response Models
class ErrorDetail(BaseModel):
    name: str = Field(..., description="에러 타입")
    message: str = Field(..., description="에러 메시지")


class ErrorResponse(BaseModel):
    error: ErrorDetail = Field(..., description="에러 정보")


# Success Response Models
class OcidResponse(BaseModel):
    ocid: str = Field(..., description="캐릭터 식별자")


class SymbolEquipment(BaseModel):
    symbol_name: str = Field(description="심볼 이름")
    symbol_icon: Optional[str] = Field("", description="심볼 아이콘 URL")
    symbol_description: Optional[str] = Field("", description="심볼 설명")
    symbol_force: Optional[str] = Field("0", description="심볼 포스")
    symbol_level: int = Field(0, description="심볼 레벨")
    symbol_str: Optional[str] = Field("0", description="STR 증가량")
    symbol_dex: Optional[str] = Field("0", description="DEX 증가량")
    symbol_int: Optional[str] = Field("0", description="INT 증가량")
    symbol_luk: Optional[str] = Field("0", description="LUK 증가량")
    symbol_hp: Optional[str] = Field("0", description="HP 증가량")
    symbol_drop_rate: Optional[str] = Field("0", description="드롭률 증가량")
    symbol_meso_rate: Optional[str] = Field("0", description="메소 획득량 증가량")
    symbol_exp_rate: Optional[str] = Field("0", description="경험치 획득량 증가량")
    symbol_growth_count: int = Field(0, description="성장치")
    symbol_require_growth_count: int = Field(0, description="요구 성장치")


class SymbolEquipmentResponse(BaseModel):
    date: Optional[datetime] = Field(None, description="조회 기준일 (null 가능)")
    character_class: str = Field("", description="캐릭터 직업")
    symbol: List[SymbolEquipment] = Field(default_factory=list, description="심볼 정보 목록")


class FinalStat(BaseModel):
    stat_name: str = Field(..., description="능력치 이름")
    stat_value: Optional[str] = Field("0", description="능력치 값")


class CharacterBasic(BaseModel):
    date: Optional[datetime] = Field(None, description="조회 기준일 (null 가능)")
    character_name: Optional[str] = Field(None, description="캐릭터 이름")
    world_name: Optional[str] = Field(None, description="월드 이름")
    character_gender: Optional[str] = Field(None, description="성별")
    character_class: Optional[str] = Field(None, description="직업")
    character_class_level: Optional[str] = Field(None, description="전직 레벨")
    character_level: Optional[int] = Field(0, description="캐릭터 레벨")
    character_exp: Optional[int] = Field(0, description="경험치")
    character_exp_rate: Optional[str] = Field("0", description="경험치 퍼센트")
    character_guild_name: Optional[str] = Field(None, description="길드 이름")
    character_image: Optional[str] = Field(None, description="캐릭터 이미지 URL")
    character_date_create: Optional[datetime] = Field(None, description="캐릭터 생성일")
    access_flag: Optional[str] = Field(None, description="접근 권한")
    liberation_quest_clear_flag: Optional[str] = Field(None, description="해방 퀘스트 클리어 여부")
    liberation_quest_clear: Optional[str] = Field(None, description="해방 퀘스트 클리어 상태")


class CharacterStatResponse(BaseModel):
    date: Optional[datetime] = Field(None, description="조회 기준일 (null 가능)")
    character_class: Optional[str] = Field(None, description="캐릭터 직업")
    final_stat: List[FinalStat] = Field(default_factory=list, description="능력치 정보 목록")
    remain_ap: Optional[int] = Field(0, description="잔여 AP")


# Union type for all possible responses
MapleApiResponse = Union[
    OcidResponse,
    SymbolEquipmentResponse,
    CharacterStatResponse,
    CharacterBasic,
    ErrorResponse
]


class MapleStoryAPI:
    """MapleStory Open API Client"""

    BASE_URL = "https://open.api.nexon.com/maplestory/v1"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("MAPLE_API_KEY")
        if not self.api_key:
            raise ValueError("API key is required. Set MAPLE_API_KEY environment variable or pass api_key parameter.")

        # Create result directory if it doesn't exist
        self.result_dir = Path("result")
        self.result_dir.mkdir(exist_ok=True)

    def _make_request(self, endpoint: str, params: dict = None) -> dict:
        """Make HTTP request to MapleStory API"""
        url = f"{self.BASE_URL}{endpoint}"
        headers = {
            "x-nxopen-api-key": self.api_key
        }

        # URL 인코딩된 쿼리 파라미터 구성
        if params:
            query_params = []
            for key, value in params.items():
                if isinstance(value, str):
                    # 한글 문자를 UTF-8로 명시적으로 인코딩
                    encoded_value = quote(value, encoding='utf-8')
                    query_params.append(f"{key}={encoded_value}")
                else:
                    query_params.append(f"{key}={value}")

            if query_params:
                url += "?" + "&".join(query_params)

        log_api_call(endpoint, params)

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            response_data = response.json()
            log_api_data(response_data, f"API 응답 ({endpoint})")
            return response_data
        except requests.exceptions.RequestException as e:
            error_data = {
                "error": {
                    "name": type(e).__name__,
                    "message": str(e)
                }
            }
            logger.error(f"❌ API 요청 실패 ({endpoint}): {e}")
            return error_data

    def _load_cached_result(self, filename: str) -> Optional[dict]:
        """Load cached API response from result folder"""
        filepath = self.result_dir / filename
        if filepath.exists():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                # 캐시 파일이 손상되었거나 읽을 수 없으면 None 반환
                return None
        return None

    def _save_result(self, filename: str, data: dict) -> None:
        """Save API response to result folder"""
        filepath = self.result_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)

    def get_character_ocid(self, character_name: str) -> OcidResponse:
        """
        캐릭터 식별자(ocid) 조회

        Args:
            character_name: 캐릭터 이름

        Returns:
            OcidResponse: 캐릭터 OCID 정보
        """
        filename = f"ocid_{character_name}.json"

        # 캐싱된 결과 확인
        cached_data = self._load_cached_result(filename)
        if cached_data is not None:
            log_cache_usage(filename, True)
            if "error" in cached_data:
                raise ValueError(f"API Error: {cached_data['error']['message']}")
            
            try:
                return OcidResponse(**cached_data)
            except ValidationError as e:
                log_pydantic_error(e, cached_data, "OcidResponse")
                raise ValueError(f"캐싱된 데이터 검증 실패: {e}")

        # 캐싱된 데이터가 없으면 API 호출
        log_cache_usage(filename, False)
        endpoint = "/id"
        params = {"character_name": character_name}

        response_data = self._make_request(endpoint, params)
        self._save_result(filename, response_data)

        if "error" in response_data:
            raise ValueError(f"API Error: {response_data['error']['message']}")

        try:
            return OcidResponse(**response_data)
        except ValidationError as e:
            log_pydantic_error(e, response_data, "OcidResponse")
            raise ValueError(f"API 응답 데이터 검증 실패: {e}")

    def get_character_symbol_equipment(self, ocid: str) -> SymbolEquipmentResponse:
        """
        장착 심볼 정보 조회

        Args:
            ocid: 캐릭터 식별자
            query_date: 조회 기준일 (KST, YYYY-MM-DD). 기본값은 오늘 날짜

        Returns:
            SymbolEquipmentResponse: 심볼 장비 정보
        """

        filename = f"symbol_equipment_{ocid}.json"

        # 캐싱된 결과 확인
        cached_data = self._load_cached_result(filename)
        if cached_data is not None:
            log_cache_usage(filename, True)
            if "error" in cached_data:
                raise ValueError(f"API Error: {cached_data['error']['message']}")
            
            try:
                return SymbolEquipmentResponse(**cached_data)
            except ValidationError as e:
                log_pydantic_error(e, cached_data, "SymbolEquipmentResponse")
                raise ValueError(f"캐싱된 심볼 데이터 검증 실패: {e}")

        # 캐싱된 데이터가 없으면 API 호출
        log_cache_usage(filename, False)
        endpoint = "/character/symbol-equipment"
        params = {"ocid": ocid}

        response_data = self._make_request(endpoint, params)
        self._save_result(filename, response_data)

        if "error" in response_data:
            raise ValueError(f"API Error: {response_data['error']['message']}")

        try:
            return SymbolEquipmentResponse(**response_data)
        except ValidationError as e:
            log_pydantic_error(e, response_data, "SymbolEquipmentResponse")
            raise ValueError(f"심볼 API 응답 데이터 검증 실패: {e}")

    def get_character_basic(self, ocid: str) -> CharacterBasic:
        """
        캐릭터 기본 정보 조회

        Args:
            ocid: 캐릭터 식별자

        Returns:
            CharacterBasic: 캐릭터 기본 정보
        """
        filename = f"character_basic_{ocid}.json"

        # 캐싱된 결과 확인
        cached_data = self._load_cached_result(filename)
        if cached_data is not None:
            log_cache_usage(filename, True)
            if "error" in cached_data:
                raise ValueError(f"API Error: {cached_data['error']['message']}")
            
            try:
                return CharacterBasic(**cached_data)
            except ValidationError as e:
                log_pydantic_error(e, cached_data, "CharacterBasic")
                raise ValueError(f"캐싱된 기본 정보 검증 실패: {e}")

        # 캐싱된 데이터가 없으면 API 호출
        log_cache_usage(filename, False)
        endpoint = "/character/basic"
        params = {"ocid": ocid}

        response_data = self._make_request(endpoint, params)
        self._save_result(filename, response_data)

        if "error" in response_data:
            raise ValueError(f"API Error: {response_data['error']['message']}")

        try:
            return CharacterBasic(**response_data)
        except ValidationError as e:
            log_pydantic_error(e, response_data, "CharacterBasic")
            raise ValueError(f"기본 정보 API 응답 데이터 검증 실패: {e}")

    def get_character_stat(self, ocid: str) -> CharacterStatResponse:
        """
        종합 능력치 정보 조회

        Args:
            ocid: 캐릭터 식별자

        Returns:
            CharacterStatResponse: 종합 능력치 정보
        """
    
        filename = f"character_stat_{ocid}.json"

        # 캐싱된 결과 확인
        cached_data = self._load_cached_result(filename)
        if cached_data is not None:
            log_cache_usage(filename, True)
            if "error" in cached_data:
                raise ValueError(f"API Error: {cached_data['error']['message']}")
            
            try:
                return CharacterStatResponse(**cached_data)
            except ValidationError as e:
                log_pydantic_error(e, cached_data, "CharacterStatResponse")
                # 상세한 final_stat 필드 검사
                if "final_stat" in cached_data and isinstance(cached_data["final_stat"], list):
                    logger.debug("🔍 final_stat 항목별 검사:")
                    for i, stat in enumerate(cached_data["final_stat"]):
                        if isinstance(stat, dict):
                            logger.debug(f"  [{i}] {stat.get('stat_name', 'Unknown')}: {stat.get('stat_value', 'None')} (타입: {type(stat.get('stat_value', None)).__name__})")
                raise ValueError(f"캐싱된 능력치 데이터 검증 실패: {e}")

        # 캐싱된 데이터가 없으면 API 호출
        log_cache_usage(filename, False)
        endpoint = "/character/stat"
        params = {"ocid": ocid}

        response_data = self._make_request(endpoint, params)
        self._save_result(filename, response_data)

        if "error" in response_data:
            raise ValueError(f"API Error: {response_data['error']['message']}")

        try:
            return CharacterStatResponse(**response_data)
        except ValidationError as e:
            log_pydantic_error(e, response_data, "CharacterStatResponse")
            # 상세한 final_stat 필드 검사
            if "final_stat" in response_data and isinstance(response_data["final_stat"], list):
                logger.debug("🔍 final_stat 항목별 검사:")
                for i, stat in enumerate(response_data["final_stat"]):
                    if isinstance(stat, dict):
                        logger.debug(f"  [{i}] {stat.get('stat_name', 'Unknown')}: {stat.get('stat_value', 'None')} (타입: {type(stat.get('stat_value', None)).__name__})")
            raise ValueError(f"능력치 API 응답 데이터 검증 실패: {e}")


# Convenience functions for direct usage
def get_character_ocid(character_name: str, api_key: Optional[str] = None) -> OcidResponse:
    """캐릭터 OCID 조회 (편의 함수)"""
    api = MapleStoryAPI(api_key)
    return api.get_character_ocid(character_name)


def get_character_symbol_equipment(ocid: str, api_key: Optional[str] = None) -> SymbolEquipmentResponse:
    """심볼 장비 정보 조회 (편의 함수)"""
    api = MapleStoryAPI(api_key)
    return api.get_character_symbol_equipment(ocid)


def get_character_stat(ocid: str, api_key: Optional[str] = None) -> CharacterStatResponse:
    """종합 능력치 정보 조회 (편의 함수)"""
    api = MapleStoryAPI(api_key)
    return api.get_character_stat(ocid)



if __name__ == "__main__":

    print("\n=== 실제 API 호출 테스트 ===")
    try:
        # OCID 조회 예제
        ocid_response = get_character_ocid("핵종례")
        print(f"Character OCID: {ocid_response.ocid}")

        # 심볼 장비 조회 예제
        symbol_response = get_character_symbol_equipment(ocid_response.ocid)
        print(f"Character Class: {symbol_response.character_class}")
        print(f"Symbol Count: {len(symbol_response.symbol)}")

        # 능력치 조회 예제
        stat_response = get_character_stat(ocid_response.ocid)
        print(f"Character Class: {stat_response.character_class}")
        print(f"Remaining AP: {stat_response.remain_ap}")

    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
