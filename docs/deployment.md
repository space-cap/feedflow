# FeedFlow 배포 가이드

## 기본 전제

- 런타임은 Next.js production server입니다.
- 개발 DB는 SQLite(`DATABASE_URL=file:./dev.db`)를 사용합니다.
- 운영에서 SQLite를 계속 사용할 경우 `prisma/dev.db`와 `public/uploads`는 컨테이너 외부 볼륨으로 유지해야 합니다.
- 트래픽이 늘거나 여러 인스턴스를 띄울 예정이면 PostgreSQL 같은 서버형 DB로 전환하는 것을 권장합니다.

## 배포 전 점검

```bash
npm ci
npm run lint
npm run build
npm audit --audit-level=moderate
```

초기 DB 생성과 seed:

```bash
npm run db:init
npm run db:seed
```

## Docker 빌드

```bash
docker build -t feedflow .
```

로컬 컨테이너 실행 예시:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -v feedflow-db:/app/prisma \
  -v feedflow-uploads:/app/public/uploads \
  feedflow
```

새 볼륨을 처음 붙인 경우 컨테이너 안에서 DB 초기화가 필요합니다.

```bash
docker run --rm \
  -e DATABASE_URL="file:./dev.db" \
  -v feedflow-db:/app/prisma \
  feedflow npm run db:init
```

## 운영 체크리스트

- `DATABASE_URL`은 배포 환경에서 명시합니다.
- 업로드 파일 보존을 위해 `public/uploads`를 영속 볼륨 또는 오브젝트 스토리지로 분리합니다.
- 관리자 계정은 seed 이후 실제 이메일과 강한 비밀번호로 교체합니다.
- HTTPS, 보안 쿠키, rate limit, 백업 정책을 운영 환경에서 추가합니다.
- 관리자 신고 처리와 게시글 숨김 액션 로그를 정기적으로 확인합니다.
