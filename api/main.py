from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import datetime
from dotenv import load_dotenv, find_dotenv
from service import maple_service
from models import ForceOptimizeRequest, ForceOptimizeResponse
from logger import logger, set_debug_level

load_dotenv(find_dotenv())

app = FastAPI(
    title="메이플스토리 계산기 API",
    description="메이플스토리 캐릭터 정보 조회 및 계산 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 프로덕션에서는 프론트엔드 도메인만 허용하세요.
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ping")
def hello_world():
    """API 상태 확인"""
    return {"message": "pong!"}

@app.get("/api/time")
def get_current_time():
    """현재 시간 조회"""
    now = datetime.datetime.now()
    return {"time": now.strftime("%Y-%m-%d %H:%M:%S")}

@app.get("/api/character/{character_name}/init")
async def get_character_symbols(character_name: str):
    """
    캐릭터의 심볼 정보를 조회합니다.

    Args:
        character_name: 캐릭터 이름

    Returns:
        JSON: {
            "symbol_levels": {
                "아케인심볼 : 소멸의 여로": 레벨,
                ...
            },
            "arcane_force": 아케인포스,
            "authentic_force": 어센틱포스,
            "character_class": 직업명
        }
    """
    try:
        result = maple_service.get_character_symbol_info(character_name)
        print(result)
        return JSONResponse(
            content=result,
            status_code=200
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"서버 오류: {str(e)}"
        )



@app.post("/api/optimize/force", response_model=ForceOptimizeResponse)
async def optimize_force(request: ForceOptimizeRequest):
    """
    심볼 포스 최적화 계산을 수행합니다.

    Args:
        request: 최적화 요청 정보
            - force_type: 포스 타입 ("Arcane" 또는 "Authentic")
            - force_goal: 목표 포스 수치
            - char_level: 캐릭터 레벨
            - current_force: 현재 총합 포스 수치
            - symbol_levels: 현재 심볼 레벨 리스트

    Returns:
        ForceOptimizeResponse: 최적화 결과
            - initial_levels: 초기 심볼 레벨
            - optimized_levels: 최적화된 심볼 레벨
            - total_cost: 총 비용
            - upgrade_path: 업그레이드 경로

    Raises:
        HTTPException(400): 잘못된 요청 (심볼 레벨 개수 불일치 등)
        HTTPException(500): 서버 오류
    """
    try:
        # 요청 데이터 검증
        request.validate_symbol_levels()

        # 최적화 계산 수행
        result = maple_service.optimize_force(
            force_type=request.force_type.value,
            force_goal=request.force_goal,
            char_level=request.char_level,
            current_force=request.current_force,
            symbol_levels=request.symbol_levels
        )

        return ForceOptimizeResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"서버 오류: {str(e)}"
        )
