#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$ROOT_DIR/api"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$API_DIR/.venv"
ENV_FILE="$FRONTEND_DIR/.env.local"
API_ENV_FILE="$API_DIR/.env"

if [[ ! -d "$API_DIR" || ! -d "$FRONTEND_DIR" ]]; then
  echo "api 또는 frontend 디렉토리를 찾을 수 없습니다."
  exit 1
fi

echo "[1/4] 백엔드 가상환경 준비"
if [[ ! -d "$VENV_DIR" ]]; then
  python -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/Scripts/activate"

if ! python -c "import fastapi, uvicorn" >/dev/null 2>&1; then
  echo "[2/4] 백엔드 의존성 설치"
  pip install -r "$API_DIR/requirements.txt"
else
  echo "[2/4] 백엔드 의존성 설치 생략(이미 설치됨)"
fi

echo "[3/4] 프론트 환경변수 확인"
if [[ ! -f "$ENV_FILE" ]]; then
  printf "NEXT_PUBLIC_API_URL=http://localhost:8000\n" > "$ENV_FILE"
elif ! rg -q "^NEXT_PUBLIC_API_URL=" "$ENV_FILE"; then
  printf "\nNEXT_PUBLIC_API_URL=http://localhost:8000\n" >> "$ENV_FILE"
fi

if [[ -f "$API_ENV_FILE" ]]; then
  echo "[3.5/4] 백엔드 환경변수 로드(api/.env)"
  set -a
  # shellcheck disable=SC1090
  source "$API_ENV_FILE"
  set +a
fi

echo "[4/4] 서버 실행"
cd "$ROOT_DIR"
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!

cleanup() {
  echo
  echo "개발 서버 종료 중..."
  if kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID"
  fi
}

trap cleanup EXIT INT TERM

cd "$FRONTEND_DIR"
npm install
npm run dev
