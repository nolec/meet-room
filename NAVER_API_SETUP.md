# 네이버 Local Search API 설정 가이드

## 1. 네이버 개발자 센터에서 애플리케이션 등록

### 1-1. 애플리케이션 등록
1. [네이버 개발자 센터](https://developers.naver.com/)에 로그인
2. **"내 애플리케이션"** → **"애플리케이션 등록"** 클릭

### 1-2. 기본 정보 입력
- **애플리케이션 이름**: "너브스" (또는 원하는 이름)
- **사용 API**: **"지역 검색(Local Search)"** 선택
  - 드롭다운에서 "지역 검색(Local Search)" 선택
  - 검색 필드에 "지역" 또는 "Local" 입력하여 찾기

### 1-3. 비로그인 오픈 API 서비스 환경 설정
**WEB 설정** 섹션에서:
- **웹 서비스 URL**: 다음 중 하나 선택
  - **개발 환경**: `localhost:3000` (또는 사용 중인 포트)
  - **프로덕션**: 실제 도메인 (예: `https://yourdomain.com`)
  - 참고: `localhost:3000`은 오류 표시가 나올 수 있지만 개발용으로는 사용 가능

### 1-4. API 키 발급
1. 애플리케이션 등록 완료 후
2. **"내 애플리케이션"** → 등록한 애플리케이션 클릭
3. **"Client ID"**와 **"Client Secret"** 확인/복사

## 2. 환경 변수 설정

### 2-1. 환경 변수 파일 생성
프로젝트 루트에 `env` 폴더가 없으면 생성하고, `env/.env.local` 파일을 생성합니다:

```bash
mkdir -p env
touch env/.env.local
```

### 2-2. 환경 변수 추가
`env/.env.local` 파일에 다음 내용을 추가합니다:

```env
# 네이버 API 설정
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here

# Supabase 설정 (이미 있다면 유지)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**주의사항:**
- `your_client_id_here`와 `your_client_secret_here`를 실제 값으로 교체하세요
- 이 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다

## 3. 서버 재시작

환경 변수를 추가한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 개발 서버 재시작
npm run dev
```

## 4. 확인

대시보드 페이지에서:
1. 위치 정보 접근 권한 허용
2. 주변 가게가 네이버 API를 통해 표시되는지 확인

## 문제 해결

### 오류: "네이버 API 키가 설정되지 않았습니다"
- `env/.env.local` 파일이 올바른 위치에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`)
- 서버를 재시작했는지 확인

### 오류: "네이버 API 호출 실패"
- 네이버 개발자 센터에서 API 사용량 제한 확인
- Local Search API가 활성화되어 있는지 확인
- 웹 서비스 URL이 올바르게 등록되어 있는지 확인

### localhost:3000 오류 표시
- 개발 환경에서는 정상적으로 작동할 수 있습니다
- 프로덕션 배포 시에는 실제 도메인을 등록해야 합니다

