"""
캐시 관리 모듈
"""
import json
from pathlib import Path
from typing import Optional, Dict, Any
from .logger import logger, log_cache_usage

class CacheManager:
    """API 응답 캐시 관리자"""

    def __init__(self, cache_dir: str = "result"):
        self.cache_dir = Path(cache_dir)
        self.cache_enabled = False
        self._ensure_cache_dir()

    def _ensure_cache_dir(self) -> None:
        """캐시 디렉토리 생성"""
        self.cache_dir.mkdir(exist_ok=True)

    def enable(self) -> None:
        """캐시 활성화"""
        self.cache_enabled = True
        logger.info("🔧 캐시 기능 활성화")

    def disable(self) -> None:
        """캐시 비활성화"""
        self.cache_enabled = False
        logger.info("🔧 캐시 기능 비활성화")

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        캐시된 데이터 조회

        Args:
            key: 캐시 키 (파일명)

        Returns:
            캐시된 데이터 또는 None
        """
        if not self.cache_enabled:
            return None

        filepath = self.cache_dir / key
        if filepath.exists():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    log_cache_usage(key, True)
                    return data
            except (json.JSONDecodeError, IOError):
                return None
        return None

    def set(self, key: str, data: Dict[str, Any]) -> None:
        """
        데이터 캐시 저장

        Args:
            key: 캐시 키 (파일명)
            data: 저장할 데이터
        """
        if not self.cache_enabled:
            return

        filepath = self.cache_dir / key
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
            log_cache_usage(key, False)
        except IOError as e:
            logger.error(f"캐시 저장 실패 ({key}): {e}")

    def clear(self) -> None:
        """모든 캐시 삭제"""
        if self.cache_dir.exists():
            for cache_file in self.cache_dir.glob("*.json"):
                try:
                    cache_file.unlink()
                except IOError as e:
                    logger.error(f"캐시 파일 삭제 실패 ({cache_file.name}): {e}")
        logger.info("🧹 모든 캐시 삭제 완료")


# 전역 캐시 매니저 인스턴스
cache_manager = CacheManager()
