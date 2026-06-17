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
npm run test:api
npm audit --audit-level=moderate
```

## DB

개발 DB는 `prisma/dev.db` SQLite 파일을 사용합니다. 이 파일은 Git에 포함하지 않습니다.

Prisma schema-engine이 현재 Windows/Node 조합에서 `migrate dev` 단계에 빈 에러를 반환해, 초기 개발 DB는 `scripts/init-db.mjs`가 `prisma/migrations/0001_init/migration.sql`을 실행하는 방식으로 생성합니다.

## 현재 구현된 MVP 흐름

- 회원가입, 로그인, 로그아웃
- 프로필 조회와 편집
- 프로필 이미지 업로드
- 팔로우, 언팔로우
- 비공개 계정 팔로우 요청 승인/거절
- 팔로우 기반 홈 피드
- 탐색/검색, 해시태그 필터
- 게시글 작성, 상세, 수정, 삭제, 댓글
- 좋아요, 재게시
- 알림 목록과 전체/개별 읽음
- 신고 생성과 관리자 신고 필터/상세/처리
- 사용자 차단과 차단 목록
- 모바일 하단 탭
- 공통 로딩, 에러, 404 화면

## 서비스화 1단계 보안 기준

- 게시글 작성, 댓글, 좋아요, 재게시, 팔로우, 차단, 신고, 프로필 수정, 알림 읽음 처리는 로그인한 사용자만 호출할 수 있습니다.
- 관리자 신고 목록, 신고 처리, 게시글 숨김 처리는 `admin` 권한 사용자만 호출할 수 있습니다.
- 로그아웃 상태에서는 홈/탐색/프로필 같은 공개 읽기 화면만 사용할 수 있고, 쓰기 영역은 로그인 안내를 보여줍니다.
- 운영 환경에서는 세션 쿠키에 `secure` 옵션을 적용합니다.
- 로그인, 회원가입, 게시글 작성, 댓글 작성, 팔로우, 신고, 업로드 API에는 기본 rate limit을 적용합니다.
- GitHub Actions CI에서 lint, build, API smoke test를 자동 실행합니다.

## 배포

Docker 기준 배포 절차와 SQLite 볼륨 운영 방식은 [docs/deployment.md](docs/deployment.md)를 참고하세요.
상용 서비스 전환 기준과 다음 운영 과제는 [docs/commercial-readiness.md](docs/commercial-readiness.md)를 참고하세요.
