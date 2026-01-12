# 🍃 LeafPost

동물의숲 스타일의 이메일/카드 서비스 프론트엔드 애플리케이션

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-38B2AC?logo=tailwind-css)

## 📋 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [환경 변수](#-환경-변수)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 컴포넌트](#-주요-컴포넌트)
- [API 통신](#-api-통신)
- [배포](#-배포)

## 🎯 소개

LeafPost는 동물의숲(Animal Crossing) 세계관을 테마로 한 이메일/카드 서비스입니다. 사용자는 게임 속 주민(villager)들의 말투로 작성된 이메일을 작성하고 전송할 수 있습니다.

### 주요 특징

- 🎨 동물의숲 스타일의 아기자기한 UI/UX
- 🎭 다양한 주민 캐릭터 선택 및 말투 변환
- 📧 실시간 이메일 미리보기 및 전송
- 🏆 인기순 주민 카드 표시 (Redis 기반 통계)
- 👤 사용자 프로필 관리
- 🎵 배경음악 재생 기능

## ✨ 주요 기능

### 1. 사용자 인증
- 이메일 기반 회원가입 및 로그인
- HttpOnly 쿠키 기반 인증
- iOS/Android 크로스 플랫폼 지원

### 2. 주민 카드 선택
- 12명의 주민 캐릭터 카드 표시
- 인기순 정렬 및 배지 표시 (🥇🥈🥉)
- 주민별 선택 횟수 표시

### 3. 이메일 작성 및 전송
- 주민 말투로 자동 변환되는 이메일 작성
- 실시간 미리보기
- 즉시 전송 및 예약 전송 기능
- 이메일 제목 및 내용 편집

### 4. 프로필 관리
- 닉네임 및 프로필 이미지 설정
- 프로필 이미지 업로드/제거

### 5. 이메일 히스토리
- 전송된 이메일 목록 조회
- 이메일 상태 관리 (전송됨/예약/삭제됨)

## 🛠 기술 스택

### 프레임워크 & 라이브러리
- **Next.js 16.1.1** - React 프레임워크 (App Router)
- **React 19.2.3** - UI 라이브러리
- **TypeScript 5.9.3** - 타입 안정성

### 스타일링
- **Tailwind CSS 4.1.18** - 유틸리티 기반 CSS 프레임워크

### 상태 관리
- **Zustand 5.0.9** - 경량 상태 관리 라이브러리

### 기타
- **ESLint** - 코드 품질 관리
- **PostCSS** - CSS 처리

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd LeafPost_Front/leafpost
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다. (자세한 내용은 [환경 변수](#-환경-변수) 섹션 참조)

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 확인
```
http://localhost:3000
```

### 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
npm start
```

## 🔐 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# 백엔드 API Base URL
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api

# 예시
# NEXT_PUBLIC_API_BASE_URL=https://leaf-post-back.onrender.com/api
```

### 환경 변수 설명

- `NEXT_PUBLIC_API_BASE_URL`: 백엔드 API의 기본 URL을 설정합니다. 이 값이 설정되지 않으면 빈 문자열이 사용됩니다.

## 📁 프로젝트 구조

```
leafpost/
├── app/                    # Next.js App Router 페이지
│   ├── auth/              # 인증 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── main/              # 메인 페이지
│   │   ├── mypage/        # 마이페이지
│   │   └── page.tsx       # 주민 선택 페이지
│   ├── villagers/         # 주민 상세 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 랜딩 페이지
├── components/            # React 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   │   ├── Header.tsx
│   │   ├── LoginForm.tsx
│   │   ├── MusicToggleButton.tsx
│   │   └── MusicPlayerProvider.tsx
│   ├── mail/             # 이메일 관련 컴포넌트
│   │   ├── MailCard.tsx
│   │   ├── MailCardForm.tsx
│   │   └── PreviewCard.tsx
│   ├── user/             # 사용자 관련 컴포넌트
│   │   └── ProfileEdit.tsx
│   └── villagers/        # 주민 관련 컴포넌트
│       └── VillagerCard.tsx
├── hooks/                # Custom React Hooks
│   ├── useAuth.ts
│   ├── useEmails.ts
│   ├── useProfile.ts
│   └── useVillager.ts
├── lib/                  # 유틸리티 및 설정
│   ├── api/              # API 클라이언트
│   │   ├── auth.ts       # 인증 API
│   │   ├── emails.ts     # 이메일 API
│   │   ├── villagers.ts  # 주민 API
│   │   ├── client.ts     # API 클라이언트 설정
│   │   └── handleApiError.ts
│   ├── auth/             # 인증 관련 유틸리티
│   └── store/            # 상태 관리 스토어
├── public/               # 정적 파일
├── middleware.ts         # Next.js 미들웨어
├── next.config.ts        # Next.js 설정
├── tailwind.config.cjs   # Tailwind CSS 설정
└── tsconfig.json         # TypeScript 설정
```

## 🎨 주요 컴포넌트

### 페이지 컴포넌트

- **`app/page.tsx`** - 랜딩 페이지
- **`app/main/page.tsx`** - 주민 선택 및 이메일 작성 메인 페이지
- **`app/main/mypage/page.tsx`** - 마이페이지 (프로필 관리, 이메일 히스토리)
- **`app/auth/login/page.tsx`** - 로그인 페이지
- **`app/auth/signup/page.tsx`** - 회원가입 페이지

### UI 컴포넌트

- **`VillagerCard`** - 주민 카드 컴포넌트 (인기순 배지, 선택 횟수 표시)
- **`MailCardForm`** - 이메일 작성 폼 (미리보기 포함)
- **`MailCard`** - 전송된 이메일 카드 표시
- **`PreviewCard`** - 이메일 미리보기 카드
- **`ProfileEdit`** - 프로필 편집 컴포넌트

### 공통 컴포넌트

- **`Header`** - 공통 헤더
- **`MusicToggleButton`** - 배경음악 토글 버튼
- **`MusicPlayerProvider`** - 배경음악 컨텍스트 제공

## 🔌 API 통신

### API 클라이언트

모든 API 호출은 `lib/api/client.ts`의 `apiFetch` 함수를 통해 이루어집니다. 이 함수는 다음 기능을 제공합니다:

- HttpOnly 쿠키 기반 인증 (`credentials: "include"`)
- 자동 에러 처리
- 요청/응답 로깅

### 주요 API 엔드포인트

#### 인증
- `POST /auth/login` - 로그인
- `POST /auth/signup` - 회원가입
- `GET /users/me` - 현재 사용자 정보 조회
- `POST /auth/logout` - 로그아웃

#### 주민
- `GET /villagers?sort=popular&limit=12` - 인기순 주민 목록 조회
- `GET /villagers/:id` - 주민 상세 정보 조회

#### 이메일
- `POST /emails` - 이메일 전송
- `POST /emails/preview` - 이메일 미리보기
- `GET /emails` - 이메일 목록 조회

#### 사용자
- `PATCH /users/nickname` - 닉네임 변경
- `PATCH /users/profile` - 프로필 이미지 변경

## 📦 배포

### Vercel 배포

이 프로젝트는 Vercel을 통해 배포됩니다.

1. Vercel에 프로젝트 연결
2. 환경 변수 설정 (`NEXT_PUBLIC_API_BASE_URL`)
3. 자동 배포 완료

### 빌드 스크립트

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🔧 개발 가이드

### 코드 스타일

- ESLint를 사용한 코드 품질 관리
- TypeScript 엄격 모드 사용
- Prettier 포맷팅 (권장)

### 주요 개발 컨벤션

- 컴포넌트는 함수형 컴포넌트 사용
- Custom Hook을 활용한 로직 분리
- API 호출은 `lib/api` 디렉토리에서 관리
- 타입 정의는 각 파일 내에서 관리

### 디버깅

개발 환경에서는 다음과 같은 로그가 출력됩니다:

- `[API]` - API 요청/응답 로그
- `[Auth]` - 인증 관련 로그
- `[Emails]` - 이메일 관련 로그
- `[MainPage]` - 메인 페이지 로그

## 📝 주요 기능 상세

### 인기순 주민 카드

- Redis 기반 선택 횟수 집계
- 상위 3명에게 🥇🥈🥉 배지 표시
- 선택 횟수(usageCount) 표시

### 이메일 미리보기

- 입력 중 실시간 미리보기 (500ms debounce)
- 주민 말투로 변환된 텍스트 표시
- 이미지 합성 카드 미리보기

### 크로스 도메인 인증

- HttpOnly 쿠키 기반 인증
- SameSite=None, Secure=true 설정 필요
- iOS Safari ITP 대응 로직 포함

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📄 라이선스

ISC

---

Made with 💚 by LeafPost Team
