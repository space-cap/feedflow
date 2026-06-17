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

## 주요 명령

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```

## DB

개발 DB는 `prisma/dev.db` SQLite 파일을 사용합니다. 이 파일은 Git에 포함하지 않습니다.

Prisma schema-engine이 현재 Windows/Node 조합에서 `migrate dev` 단계에 빈 에러를 반환해, 초기 개발 DB는 `scripts/init-db.mjs`가 `prisma/migrations/0001_init/migration.sql`을 실행하는 방식으로 생성합니다.
