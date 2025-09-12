import logging
import os
from typing import Any, Dict

# 환경변수로 디버그 레벨 설정 (기본값: INFO)
DEBUG_LEVEL = os.getenv("DEBUG_LEVEL", "INFO").upper()

# 로그 레벨 매핑
LOG_LEVELS = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL
}

# 로거 설정
def setup_logger(name: str = "maple_calculator") -> logging.Logger:
    """로거 설정"""
    logger = logging.getLogger(name)
    
    # 이미 핸들러가 있으면 제거
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # 로그 레벨 설정
    log_level = LOG_LEVELS.get(DEBUG_LEVEL, logging.INFO)
    logger.setLevel(log_level)
    
    # 콘솔 핸들러 생성
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    
    # 포매터 설정
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    return logger

# 전역 로거 인스턴스
logger = setup_logger()

def log_api_data(data: Any, context: str = "API Data") -> None:
    """API 데이터 로깅"""
    if logger.level <= logging.DEBUG:
        logger.debug(f"{context}: {data}")

def log_pydantic_error(error: Exception, data: Dict, model_name: str) -> None:
    """Pydantic 검증 오류 상세 로깅"""
    logger.error(f"❌ {model_name} 검증 오류: {error}")
    
    if logger.level <= logging.DEBUG:
        logger.debug(f"📊 원본 데이터 ({model_name}):")
        if isinstance(data, dict):
            for key, value in data.items():
                value_type = type(value).__name__
                value_str = str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
                logger.debug(f"  {key}: {value_str} (type: {value_type})")
        else:
            logger.debug(f"  데이터: {data}")

def log_field_validation(field_name: str, value: Any, expected_type: str) -> None:
    """필드 검증 로깅"""
    if logger.level <= logging.DEBUG:
        actual_type = type(value).__name__
        logger.debug(f"🔍 필드 검증 - {field_name}: {value} (실제타입: {actual_type}, 예상타입: {expected_type})")

def log_api_call(endpoint: str, params: Dict = None) -> None:
    """API 호출 로깅"""
    logger.info(f"🌐 API 호출: {endpoint}")
    if params and logger.level <= logging.DEBUG:
        logger.debug(f"📝 파라미터: {params}")

def log_cache_usage(filename: str, is_cached: bool) -> None:
    """캐시 사용 로깅"""
    if is_cached:
        logger.info(f"📋 캐시 사용: {filename}")
    else:
        logger.info(f"💾 새로운 데이터 저장: {filename}")

def set_debug_level(level: str) -> None:
    """디버그 레벨 동적 변경"""
    global logger
    if level.upper() in LOG_LEVELS:
        logger.setLevel(LOG_LEVELS[level.upper()])
        logger.info(f"🔧 디버그 레벨 변경: {level.upper()}")
    else:
        logger.warning(f"⚠️ 잘못된 디버그 레벨: {level}. 가능한 값: {list(LOG_LEVELS.keys())}")
