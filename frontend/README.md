# 메이플스토리 심볼 최적화 계산기 Frontend

Next.js 기반의 메이플스토리 심볼 최적화 계산기 웹 애플리케이션입니다.

## 🚀 기능

### 통합된 워크플로우
- **단일 페이지 플로우**: 캐릭터 조회부터 최적화 계산까지 하나의 화면에서 처리
- **자동 데이터 연동**: 캐릭터 조회 시 최적화 폼에 자동으로 데이터 반영
- **실시간 심볼 아이콘**: 로컬 아이콘 매핑으로 빠른 로딩

### 1. 캐릭터 조회
- 캐릭터 이름으로 심볼 정보 조회
- 아케인포스/어센틱포스 현황 확인
- 현재 심볼 레벨 표시
- 실제 심볼 아이콘 표시

### 2. 심볼 최적화 계산
- 목표 포스 설정
- 현재 심볼 레벨 입력 (캐릭터 조회 시 자동 입력)
- 최적의 업그레이드 경로 계산
- 총 비용 및 단계별 업그레이드 정보 제공

## 🛠 기술 스택

- **Framework**: Next.js 15.1.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: 
  - React Query (@tanstack/react-query) - 서버 상태 관리
  - Zustand - 클라이언트 상태 관리
- **Form**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/ui/          # shadcn/ui 컴포넌트
├── constants/             # 상수 정의
│   └── config.ts          # API 설정, 심볼 매핑, 아이콘 매핑
├── features/              # 기능별 모듈
│   ├── calculator/        # 통합 계산기 컴포넌트
│   │   ├── api.ts
│   │   └── components/
│   │       └── MapleCalculator.tsx
│   ├── character/         # 개별 캐릭터 조회 (레거시)
│   └── optimizer/         # 개별 최적화 (레거시)
├── hooks/                 # 커스텀 훅
├── lib/                   # 유틸리티
│   ├── types.ts          # 타입 정의
│   └── utils.ts
└── remote/               # API 통신
    └── api.ts
```

## 🎯 주요 컴포넌트

### MapleCalculator (통합 컴포넌트)
- **통합 워크플로우**: 캐릭터 조회 + 심볼 최적화를 하나의 컴포넌트에서 처리
- **자동 데이터 연동**: 캐릭터 조회 결과를 최적화 폼에 자동 반영
- **React Query**: 서버 상태 관리 및 캐싱
- **React Hook Form + Zod**: 폼 검증 및 타입 안전성
- **실시간 아이콘**: 로컬 아이콘 매핑으로 빠른 심볼 표시
- **실시간 계산**: 입력값 변경 시 즉시 포스 계산

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
npm start
```

## 📡 API 연동

백엔드 API와의 통신을 위해 다음 엔드포인트를 사용합니다:

- `GET /api/character/{character_name}/init` - 캐릭터 심볼 정보 조회
- `POST /api/optimize/force` - 심볼 최적화 계산

API 설정은 `src/constants/config.ts`에서 관리됩니다.

## 🎨 디자인 시스템

- **UI 라이브러리**: shadcn/ui
- **색상 팔레트**: Tailwind CSS 기본 색상
- **아이콘**: Lucide React
- **테마**: light/dark 모드 지원 (next-themes)

## 🧪 코드 품질

- **ESLint**: Next.js 권장 설정
- **TypeScript**: 엄격한 타입 체크
- **Prettier**: 코드 포맷팅
- **Zod**: 런타임 타입 검증

## 📝 사용법

1. **캐릭터 조회**: 캐릭터 이름을 입력하고 조회 버튼 클릭
2. **자동 데이터 반영**: 조회 결과가 하단 최적화 폼에 자동으로 입력됨
3. **목표 설정**: 목표 포스를 설정하고 필요시 심볼 레벨 수정
4. **최적화 계산**: 계산 버튼을 클릭하여 최적 업그레이드 경로 확인
5. **결과 확인**: 비용, 단계, 레벨 비교 정보를 한눈에 확인

## 🔄 데이터 플로우

1. **캐릭터 조회**: 사용자가 캐릭터 이름을 입력
2. **API 호출**: React Query를 통해 백엔드 API 호출
3. **자동 반영**: 조회된 심볼 정보가 최적화 폼에 자동 입력
4. **아이콘 표시**: 로컬 아이콘 매핑으로 실시간 심볼 아이콘 표시
5. **최적화**: 사용자가 목표 설정 후 최적화 계산 요청
6. **결과 표시**: 계산 결과를 시각적 차트와 테이블로 표시

## 🚀 배포

### Vercel (권장)
```bash
vercel deploy
```

### 기타 플랫폼
Next.js 빌드 결과물을 정적 호스팅 또는 Node.js 환경에 배포할 수 있습니다.

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.