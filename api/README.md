# MapleStory Calculator API

메이플스토리 오픈 API를 사용하여 캐릭터 정보를 조회하는 파이썬 라이브러리입니다.

## 기능

- ✅ 캐릭터 OCID 조회
- ✅ 장착 심볼 정보 조회
- ✅ 종합 능력치 정보 조회
- ✅ Pydantic 모델을 통한 타입 안정성
- ✅ 자동 결과 저장 (result 폴더)

## 설치 및 설정

### 1. 의존성 설치

```bash
cd api
pip install -e .
```

또는 uv를 사용하는 경우:

```bash
cd api
uv sync
```

### 2. 환경변수 설정

NEXON Open API 키를 환경변수로 설정합니다:

```bash
export MAPLE_API_KEY="your_api_key_here"
```

### 3. API 키 발급

[NEXON Open API](https://openapi.nexon.com/)에서 메이플스토리 API 키를 발급받아야 합니다.

## 사용 방법

### 기본 사용법

```python
from maple import get_character_ocid, get_character_symbol_equipment, get_character_stat

# 1. 캐릭터 OCID 조회
ocid_response = get_character_ocid("캐릭터이름")
print(f"OCID: {ocid_response.ocid}")

# 2. 심볼 장비 정보 조회
symbol_response = get_character_symbol_equipment(ocid_response.ocid)
print(f"심볼 개수: {len(symbol_response.symbol)}")

# 3. 종합 능력치 조회
stat_response = get_character_stat(ocid_response.ocid)
print(f"남은 AP: {stat_response.remain_ap}")
```

### 클래스 인스턴스 사용

```python
from maple import MapleStoryAPI

api = MapleStoryAPI()

# 특정 날짜 데이터 조회
ocid = api.get_character_ocid("캐릭터이름")
symbols = api.get_character_symbol_equipment(ocid.ocid, "2024-01-01")
stats = api.get_character_stat(ocid.ocid, "2024-01-01")
```

### API 키 직접 지정

```python
from maple import MapleStoryAPI

api = MapleStoryAPI(api_key="your_api_key")
```

## API 엔드포인트

### 1. 캐릭터 OCID 조회
- **엔드포인트**: `GET /maplestory/v1/id`
- **파라미터**: `character_name` (캐릭터 이름)
- **반환**: `OcidResponse`

### 2. 심볼 장비 정보 조회
- **엔드포인트**: `GET /maplestory/v1/character/symbol-equipment`
- **파라미터**: `ocid`, `date` (선택, 기본값: 오늘)
- **반환**: `SymbolEquipmentResponse`

### 3. 종합 능력치 정보 조회
- **엔드포인트**: `GET /maplestory/v1/character/stat`
- **파라미터**: `ocid`, `date` (선택, 기본값: 오늘)
- **반환**: `CharacterStatResponse`

## 데이터 모델

### OcidResponse
```python
{
    "ocid": "string"  # 캐릭터 식별자
}
```

### SymbolEquipmentResponse
```python
{
    "date": "2023-12-21T00:00+09:00",
    "character_class": "string",
    "symbol": [
        {
            "symbol_name": "string",
            "symbol_icon": "string",
            "symbol_description": "string",
            "symbol_force": "string",
            "symbol_level": 0,
            "symbol_str": "string",
            "symbol_dex": "string",
            "symbol_int": "string",
            "symbol_luk": "string",
            "symbol_hp": "string",
            "symbol_drop_rate": "string",
            "symbol_meso_rate": "string",
            "symbol_exp_rate": "string",
            "symbol_growth_count": 0,
            "symbol_require_growth_count": 0
        }
    ]
}
```

### CharacterStatResponse
```python
{
    "date": "2023-12-21T00:00+09:00",
    "character_class": "string",
    "final_stat": [
        {
            "stat_name": "최소 스탯 공격력",
            "stat_value": "43.75"
        }
    ],
    "remain_ap": 0
}
```

## 결과 저장

모든 API 호출 결과는 자동으로 `result/` 폴더에 JSON 파일로 저장됩니다:

- `ocid_{character_name}.json` - OCID 조회 결과
- `symbol_equipment_{ocid}_{date}.json` - 심볼 장비 정보
- `character_stat_{ocid}_{date}.json` - 능력치 정보

## 오류 처리

API 오류 발생 시 `ValueError`가 발생합니다:

```python
try:
    response = get_character_ocid("존재하지않는캐릭터")
except ValueError as e:
    print(f"API 오류: {e}")
```

## 테스트

예제 실행:

```bash
cd api
python example_usage.py
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
