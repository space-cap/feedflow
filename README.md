# FeedFlow

X/Twitter, Threads 스타일의 짧은 글 기반 소셜 피드 MVP입니다.

## 기술 스택

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite

## 로컬 실행

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

개발 서버:

```text
http://127.0.0.1:3000
```

Seed 계정:

```text
email: demo@feedflow.local
password: password
```

관리자 seed 계정:

```text
email: admin@feedflow.local
password: password
```

## 주요 명령

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```

## DB

개발 DB는 `prisma/dev.db` SQLite 파일을 사용합니다. 이 파일은 Git에 포함하지 않습니다.

Prisma schema-engine이 현재 Windows/Node 조합에서 `migrate dev` 단계에 빈 에러를 반환해, 초기 개발 DB는 `scripts/init-db.mjs`가 `prisma/migrations/0001_init/migration.sql`을 실행하는 방식으로 생성합니다.

## 현재 구현된 MVP 흐름

- 회원가입, 로그인, 로그아웃
- 프로필 조회와 편집
- 팔로우, 언팔로우
- 팔로우 기반 홈 피드
- 탐색/검색
- 게시글 작성, 상세, 댓글
- 좋아요, 재게시
- 알림 목록과 전체 읽음
- 신고 생성과 관리자 신고 처리
- 사용자 차단과 차단 목록

## 서비스화 1단계 보안 기준

- 게시글 작성, 댓글, 좋아요, 재게시, 팔로우, 차단, 신고, 프로필 수정, 알림 읽음 처리는 로그인한 사용자만 호출할 수 있습니다.
- 관리자 신고 목록, 신고 처리, 게시글 숨김 처리는 `admin` 권한 사용자만 호출할 수 있습니다.
- 로그아웃 상태에서는 홈/탐색/프로필 같은 공개 읽기 화면만 사용할 수 있고, 쓰기 영역은 로그인 안내를 보여줍니다.
