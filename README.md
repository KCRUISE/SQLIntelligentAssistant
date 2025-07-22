# SQL 어시스턴트 - AI 기반 자연어-SQL 변환기

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI GPT-4o" />
</div>

<div align="center">
  <h3>지능형 포맷팅 및 최적화 기능을 갖춘 고급 AI 기반 SQL 번역 및 쿼리 관리 웹 애플리케이션</h3>
</div>

---

## 🌟 개요

SQL 어시스턴트는 OpenAI의 GPT-4o를 사용하여 자연어 쿼리를 최적화된 SQL 문으로 변환하는 종합적인 웹 애플리케이션입니다. 최신 웹 기술로 구축되었으며, Oracle 데이터베이스 사용에 최적화된 한국어 인터페이스와 시스템 전체에 적용된 전문가급 SQL 포맷팅 기능을 제공합니다.

### ✨ 주요 기능

- **🤖 AI 기반 번역**: OpenAI GPT-4o를 사용한 자연어-SQL 변환
- **🎨 고급 SQL 포맷팅**: 50개 이상의 사용자 정의 옵션을 제공하는 전문가급 포맷팅
- **📊 데이터 시각화**: 쿼리 결과를 활용한 대화형 차트 및 그래프
- **💾 쿼리 관리**: 히스토리, 즐겨찾기, 공유 기능
- **🗄️ 스키마 관리**: 데이터베이스 스키마 정의 및 관리
- **🌐 실시간 통신**: WebSocket 기반 라이브 쿼리 생성
- **📱 모바일 반응형**: 모든 기기 크기에 최적화
- **🌍 한국어 지역화**: 네이티브 한국어 지원
- **🔧 다중 데이터베이스 지원**: Oracle, PostgreSQL, MySQL, SQL Server, SQLite

## 🏗️ 아키텍처

### 프론트엔드 스택
- **React 18** + TypeScript로 타입 안정성 보장
- **Wouter**를 통한 경량 클라이언트 사이드 라우팅
- **TanStack Query**로 강력한 서버 상태 관리
- **Radix UI + shadcn/ui**로 접근 가능한 컴포넌트 제공
- **Tailwind CSS**를 활용한 유틸리티 우선 스타일링
- **Vite**로 빠른 개발 및 최적화된 빌드

### 백엔드 스택
- **Node.js + Express.js**로 견고한 서버 사이드 로직
- **PostgreSQL** + Neon 서버리스 호스팅
- **Drizzle ORM**으로 타입 안전 데이터베이스 작업
- **WebSocket**을 통한 실시간 통신
- **OpenAI GPT-4o**로 지능적인 SQL 생성

### 주요 구성 요소

#### 🔥 채팅 인터페이스
- 스트리밍 AI 응답과 함께하는 자연어 입력
- 실시간 WebSocket 통신
- 다중 SQL 방언 지원
- 실행 가능한 대화형 SQL 코드 블록

#### 📝 SQL 포맷터
- 실시간 미리보기가 제공되는 50개 이상의 포맷팅 옵션
- 콤마 우선 정렬 및 구조화된 들여쓰기
- 통합 키워드 색상 시스템
- 대/소문자 변환 (대문자/소문자/없음)
- 전문가 프리셋 스타일 (Oracle, PostgreSQL, Compact)

#### 📊 쿼리 관리
- 검색/필터링이 가능한 포괄적인 쿼리 히스토리
- 자주 사용하는 쿼리를 위한 즐겨찾기 시스템
- 만료 기간이 있는 공유 가능한 쿼리 링크
- 결과 내보내기 기능

#### 🗂️ 스키마 관리
- 사용자 정의 데이터베이스 스키마 정의
- 스키마 인식 쿼리 생성
- 다중 방언 지원
- 시각적 스키마 표현

#### 📈 데이터 시각화
- 다양한 차트 유형 (막대, 선, 원형, 산점도)
- 대화형 데이터 탐색
- 시각화 내보내기 기능
- 반응형 차트 레이아웃

## 🚀 시작하기

### 사전 요구사항

- **Node.js** 20.x 이상
- **PostgreSQL** 데이터베이스 (또는 Neon 계정)
- GPT-4o 접근을 위한 **OpenAI API 키**

### 설치 방법

1. **저장소 클론**
   ```bash
   git clone https://github.com/KCRUISE/SQLIntelligentAssistant.git
   cd SQLIntelligentAssistant
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   ```
   
   `.env` 파일 구성:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_session_secret
   NODE_ENV=development
   ```

4. **데이터베이스 초기화**
   ```bash
   npm run db:push
   ```

5. **개발 서버 시작**
   ```bash
   npm run dev
   ```

6. **브라우저에서 열기**
   `http://localhost:5000`으로 이동

### 프로덕션 배포

1. **애플리케이션 빌드**
   ```bash
   npm run build
   ```

2. **프로덕션 서버 시작**
   ```bash
   npm start
   ```

## 📊 데이터베이스 스키마

애플리케이션은 다음 주요 테이블을 가진 PostgreSQL을 사용합니다:

- `users` - 사용자 프로필 및 인증
- `database_schemas` - 사용자 정의 데이터베이스 스키마 정의
- `queries` - 메타데이터를 포함한 생성된 SQL 쿼리
- `shared_queries` - 공유 가능한 쿼리 링크
- `sessions` - 사용자 세션 관리

## 🎨 SQL 포맷팅 기능

### 전문가급 포맷팅 옵션

- **대/소문자 변환**: 대문자, 소문자 또는 원본 대/소문자 보존
- **콤마 위치**: 앞, 뒤 또는 줄 기반 위치 지정
- **들여쓰기**: 구성 가능한 간격 (1-8 공백)
- **키워드 색상**: 통합 또는 개별 키워드 색상
- **컬럼 정렬**: SELECT 절을 위한 스마트 정렬
- **JOIN 포맷팅**: 복잡한 조인을 위한 계층적 들여쓰기

### 프리셋 스타일

- **Oracle 스타일**: Oracle 데이터베이스 규칙에 최적화
- **PostgreSQL 스타일**: PostgreSQL 전용 포맷팅 규칙
- **컴팩트 스타일**: 간결한 쿼리를 위한 최소 간격

## 🔧 구성

### 포맷팅 옵션
모든 SQL 포맷팅 옵션은 localStorage에 저장되어 시스템 전체에 적용됩니다:

```typescript
interface FormattingOptions {
  keywordCase: 'upper' | 'lower' | 'capitalize';
  commaPosition: 'before' | 'after' | 'line-before' | 'line-after';
  indentSize: number; // 1-8 공백
  caseConversion: 'none' | 'upper' | 'lower';
  unifiedKeywordColor: string;
  // ... 추가 옵션
}
```

### 데이터베이스 방언
특정 최적화를 포함하여 지원되는 SQL 방언:

- **Oracle**: 고급 기능, DECODE, NVL, ROWNUM
- **PostgreSQL**: 배열 연산, JSON 함수, CTE
- **MySQL**: MySQL 전용 함수 및 구문
- **SQL Server**: T-SQL 기능, TOP 절
- **SQLite**: 경량 연산, 제한된 함수

## 🌐 API 엔드포인트

### 핵심 엔드포인트
- `GET /api/queries` - 쿼리 히스토리 조회
- `POST /api/queries` - 새 쿼리 저장
- `GET /api/schemas` - 사용자 스키마 가져오기
- `POST /api/schemas` - 새 스키마 생성
- `GET /api/shared/:id` - 공유 쿼리 접근

### WebSocket 이벤트
- `generate-sql` - 자연어-SQL 변환
- `explain-query` - 쿼리 설명 생성
- `optimize-query` - 쿼리 최적화 제안

## 🤝 기여하기

1. **저장소 포크**
2. **기능 브랜치 생성**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **변경 사항 커밋**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **브랜치에 푸시**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Pull Request 열기**

### 개발 가이드라인

- TypeScript 모범 사례 준수
- 기존 컴포넌트 패턴 사용
- 한국어 지원 유지
- 새 기능에 대한 테스트 추가
- 필요에 따라 문서 업데이트

## 📝 라이센스

이 프로젝트는 MIT 라이센스에 따라 라이센스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **OpenAI** - GPT-4o API 제공
- **Neon** - 서버리스 PostgreSQL 제공
- **Radix UI** - 접근 가능한 컴포넌트 제공
- **shadcn/ui** - 아름다운 컴포넌트 라이브러리 제공
- **Tailwind CSS** - 유틸리티 우선 스타일링 제공

## 📞 지원

지원이 필요하시면 support@sqlassistant.com으로 이메일을 보내거나 Discord 커뮤니티에 참여하세요.

---

<div align="center">
  <p><strong>깔끔하고 최적화된 SQL을 사랑하는 개발자들을 위해 ❤️로 만들었습니다</strong></p>
</div>
