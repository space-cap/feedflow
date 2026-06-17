# FeedFlow 개발 계획서

## 1. 프로젝트 개요

FeedFlow는 X(구 Twitter), Threads와 유사한 짧은 글 기반 소셜 네트워크 서비스이다. 사용자는 짧은 게시글을 작성하고, 다른 사용자를 팔로우하며, 홈 피드에서 관심 있는 콘텐츠를 빠르게 소비할 수 있다.

이제 개발 기준은 MVP 검증이 아니라 상용 서비스 운영이다. 신규 기능은 보안, 안정성, 운영 자동화, 데이터 보존 기준을 함께 만족해야 한다.

초기 목표는 거대한 소셜 플랫폼을 한 번에 재현하는 것이 아니라, 핵심 사용 흐름인 가입, 프로필, 게시, 피드, 팔로우, 반응, 알림을 안정적으로 구현한 뒤 검색, 추천, 신고/운영, 미디어, 실시간 기능을 단계적으로 확장하는 것이다.

현재 구현은 Next.js App Router 기반의 모듈형 모놀리식 애플리케이션이다. 별도 NestJS 서버 없이 `src/app/api` Route Handler가 API 서버 역할을 하며, 개발 DB는 Prisma + SQLite를 사용한다.

## 2. 제품 목표

### 2.1 핵심 목표

- 사용자가 짧은 텍스트 게시글을 빠르게 작성하고 공유할 수 있다.
- 팔로우 관계를 기반으로 개인화된 홈 피드를 제공한다.
- 좋아요, 댓글, 재게시를 통해 기본적인 소셜 상호작용을 지원한다.
- 알림을 통해 사용자 간 반응을 즉시 확인할 수 있다.
- 신고, 차단, 비공개 계정 등 최소한의 안전 기능을 제공한다.

### 2.2 초기 성공 기준

- 신규 사용자가 3분 안에 가입, 프로필 설정, 첫 게시글 작성을 완료할 수 있다.
- 홈 피드는 팔로우한 사용자의 게시글을 최신순으로 안정적으로 보여준다.
- 게시글 작성 후 피드 반영까지 1초 이내를 목표로 한다.
- 기본 사용자 흐름에 대한 자동화 테스트를 갖춘다.
- 운영자가 신고된 게시글과 계정을 확인할 수 있는 최소 관리자 화면을 제공한다.

### 2.3 현재 구현 상태 요약

- Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite 기반으로 구현한다.
- 인증은 `feedflow_user_id` HTTP-only 쿠키 세션을 사용한다.
- 회원가입, 로그인, 로그아웃, 프로필 편집, 프로필 이미지 업로드가 구현되어 있다.
- 게시글 작성, 조회, 수정, 삭제, 댓글, 좋아요, 재게시가 구현되어 있다.
- 홈 피드, 탐색 피드, 프로필 피드, 커서 페이지네이션이 구현되어 있다.
- 팔로우, 언팔로우, 비공개 계정 팔로우 요청 승인/거절이 구현되어 있다.
- 알림 목록, 전체 읽음, 개별 읽음이 구현되어 있다.
- 신고 생성, 관리자 신고 목록/상세/상태 변경, 게시글 숨김, 사용자 차단이 구현되어 있다.
- 해시태그 추출, 탐색 화면 해시태그 필터, 모바일 하단 탭, 공통 로딩/에러/404 화면이 구현되어 있다.
- Dockerfile과 배포 가이드, 기본 rate limit, GitHub Actions CI는 준비되어 있으나 운영 모니터링과 Redis 기반 rate limit은 아직 남은 작업이다.
- 상용화 기준의 상세 작업은 `docs/commercial-readiness.md`를 따른다.

## 3. 사용자 범위

### 3.1 일반 사용자

- 계정 생성 및 로그인
- 프로필 설정
- 게시글 작성, 수정, 삭제
- 다른 사용자 팔로우 및 언팔로우
- 홈 피드와 사용자 프로필 피드 조회
- 좋아요, 댓글, 재게시
- 알림 확인
- 사용자 차단 및 신고

### 3.2 운영자

- 신고된 게시글 목록 확인
- 신고된 사용자 목록 확인
- 게시글 숨김 처리
- 계정 제한 또는 정지
- 서비스 공지 작성

## 4. MVP 기능 범위

### 4.1 인증과 계정

- 이메일 기반 회원가입
- 로그인, 로그아웃
- 비밀번호 재설정은 다음 단계 기능으로 둔다.
- 닉네임, 핸들, 소개글, 프로필 이미지 설정
- 공개 계정과 비공개 계정 옵션

### 4.2 게시글

- 텍스트 게시글 작성
- 글자 수 제한: 기본 500자
- 게시글 목록 조회
- 게시글 상세 조회
- 게시글 수정 및 삭제
- 댓글 작성
- 좋아요
- 재게시
- 링크 미리보기는 MVP 이후 기능으로 분리
- 프로필 이미지는 로컬 업로드 방식으로 지원한다. 게시글 이미지 첨부는 이후 기능으로 분리한다.

### 4.3 피드

- 홈 피드: 팔로우한 사용자의 게시글 최신순
- 추천 피드: MVP에서는 최신 공개 게시글 중심으로 단순 제공
- 프로필 피드: 특정 사용자의 게시글 목록
- 무한 스크롤 기반 페이지네이션

### 4.4 팔로우

- 사용자 팔로우
- 언팔로우
- 팔로워 목록
- 팔로잉 목록
- 비공개 계정의 팔로우 요청 승인/거절

### 4.5 알림

- 좋아요 알림
- 댓글 알림
- 팔로우 알림
- 재게시 알림
- 읽음 처리

### 4.6 안전 기능

- 게시글 신고
- 사용자 신고
- 사용자 차단
- 차단한 사용자 게시글 숨김
- 관리자용 신고 목록

## 5. MVP 제외 기능

다음 기능은 초기 출시 이후 단계적으로 개발한다.

- DM
- 음성/영상 게시
- 실시간 추천 알고리즘
- 고급 해시태그 트렌드
- 고급 검색
- 유료 인증 배지
- 광고 시스템
- 커뮤니티 기능
- 라이브 스트리밍
- 외부 플랫폼 연동 자동 게시

## 6. 추천 기술 스택

### 6.1 프론트엔드

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand 또는 Jotai
- React Hook Form
- Zod

선정 이유는 SEO, 라우팅, 서버 컴포넌트, 이미지 최적화, 타입 안정성, 빠른 UI 개발 생산성 때문이다.

### 6.2 백엔드

초기 구현은 다음 구조로 확정한다.

- Next.js App Router Route Handler: 프론트엔드와 같은 TypeScript 코드베이스에서 API를 함께 제공할 수 있고, 초기 제품 검증 속도가 빠르다.
- NestJS 또는 Spring Boot: 서비스가 커져 API 서버를 분리해야 할 때 전환 후보로 둔다.

이 프로젝트의 현재 기본안은 Next.js App Router + Prisma + SQLite 조합이다. 개발 단계에서는 SQLite로 빠르게 구현하고, 운영 단계에서 트래픽과 동시성 요구가 커지면 PostgreSQL로 전환할 수 있도록 Prisma 스키마와 마이그레이션을 전제로 설계한다.

### 6.3 데이터베이스와 인프라

- SQLite: 개발 단계의 사용자, 게시글, 팔로우, 알림 등 주요 관계형 데이터 저장
- PostgreSQL: 운영 배포 또는 성장 단계에서 전환할 기본 후보
- Redis: 세션, 캐시, 피드 fan-out 작업 큐, rate limit
- Object Storage: 프로필 이미지와 추후 미디어 파일 저장
- Elasticsearch 또는 OpenSearch: 검색 기능 확장 시 도입
- Docker: Redis 등 보조 인프라와 배포 환경 표준화
- GitHub Actions: CI/CD

## 7. 시스템 아키텍처

초기 구조는 Next.js 안에서 화면과 API를 함께 제공하는 단순한 모듈형 모놀리식 구조로 시작한다. 서비스가 성장하면 피드, 알림, 검색, 미디어 처리 영역을 별도 서비스로 분리할 수 있다.

```text
Web Client
  -> Next.js App Router
    -> Route Handlers
    -> SQLite
    -> Redis
    -> Object Storage
    -> Background Worker

Background Worker
  -> Notification Jobs
  -> Feed Fan-out Jobs
  -> Moderation Jobs
```

### 7.1 주요 모듈

- Auth: 회원가입, 로그인, 토큰, 세션
- User: 프로필, 계정 설정, 차단
- Post: 게시글, 댓글, 좋아요, 재게시
- Follow: 팔로우 관계와 요청
- Feed: 홈 피드, 추천 피드, 프로필 피드
- Notification: 알림 생성과 읽음 처리
- Moderation: 신고, 숨김, 계정 제한
- Admin: 운영자 화면과 권한

## 8. 데이터 모델 초안

### 8.1 users

- id
- email
- password_hash
- handle
- display_name
- bio
- avatar_url
- is_private
- role
- status
- created_at
- updated_at

### 8.2 posts

- id
- author_id
- parent_post_id
- repost_of_post_id
- content
- visibility
- like_count
- reply_count
- repost_count
- created_at
- updated_at
- deleted_at

### 8.3 follows

- id
- follower_id
- following_id
- status
- created_at

### 8.4 likes

- id
- user_id
- post_id
- created_at

### 8.5 notifications

- id
- receiver_id
- actor_id
- type
- post_id
- read_at
- created_at

### 8.6 blocks

- id
- blocker_id
- blocked_id
- created_at

### 8.7 reports

- id
- reporter_id
- target_type
- target_id
- reason
- status
- reviewed_by
- reviewed_at
- created_at

## 9. API 설계 초안

### 9.1 Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/password/reset-request` 예정
- `POST /api/auth/password/reset` 예정

### 9.2 Users

- `GET /api/profiles/:handle`
- `PATCH /api/users/me`
- `POST /api/users/:id/block`
- `DELETE /api/users/:id/block`
- `POST /api/uploads`
- `GET /api/users/:handle/posts` 예정

### 9.3 Posts

- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/replies`
- `POST /api/posts/:id/like`
- `DELETE /api/posts/:id/like`
- `POST /api/posts/:id/repost`
- `DELETE /api/posts/:id/repost`

### 9.4 Follows

- `POST /api/users/:id/follow`
- `DELETE /api/users/:id/follow`
- `GET /api/follow-requests`
- `POST /api/follow-requests/:id/approve`
- `POST /api/follow-requests/:id/reject`
- `GET /api/users/:handle/followers` 예정
- `GET /api/users/:handle/following` 예정

### 9.5 Feeds

- `GET /api/feeds/home`
- `GET /api/feeds/explore`
- `GET /api/search`
- `GET /api/feeds/user/:handle` 예정

### 9.6 Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

### 9.7 Moderation

- `POST /api/reports`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:id`
- `POST /api/admin/posts/:id/hide`
- `POST /api/admin/users/:id/suspend` 예정

## 10. 화면 구성

### 10.1 공개 화면

- 로그인
- 회원가입
- 비밀번호 재설정 예정
- 공개 프로필
- 게시글 상세

### 10.2 로그인 사용자 화면

- 홈 피드
- 추천 피드
- 게시글 작성 모달
- 게시글 상세 및 댓글
- 프로필 편집
- 팔로워/팔로잉 목록
- 알림
- 설정
- 차단 사용자 목록
- 팔로우 요청 관리

### 10.3 관리자 화면

- 신고 대시보드
- 신고 상세
- 숨김 처리된 게시글 목록 예정
- 제한된 계정 목록 예정

## 11. 피드 전략

### 11.1 MVP

MVP에서는 홈 피드를 팔로우 기반 최신순으로 구현한다. 쿼리 복잡도를 낮추기 위해 초기에는 `follows`와 `posts`를 조인해 커서 페이지네이션으로 조회한다.

### 11.2 성장 단계

사용자 수와 게시글 수가 증가하면 Redis와 백그라운드 워커를 사용해 fan-out-on-write 방식으로 피드 캐시를 구성한다.

- 사용자가 게시글 작성
- 워커가 팔로워 목록 조회
- 각 팔로워의 피드 캐시에 게시글 ID 추가
- 홈 피드는 캐시된 게시글 ID를 기준으로 상세 데이터 조회

### 11.3 추천 피드

초기 추천 피드는 단순 규칙 기반으로 시작한다.

- 최근 공개 게시글
- 좋아요와 댓글이 많은 게시글
- 차단/신고/숨김 게시글 제외
- 내가 작성한 게시글 제외 옵션

이후에는 관심사, 관계 그래프, 상호작용 기록을 기반으로 개선한다.

## 12. 보안과 정책

### 12.1 인증 보안

- 비밀번호 해시는 bcrypt 또는 Argon2 사용
- 현재 구현은 HTTP-only 쿠키 세션을 사용한다.
- 운영 전환 시 Access Token과 Refresh Token 분리 또는 서버 세션 저장소 도입을 검토한다.
- 운영 전환 시 Refresh Token 회전 또는 세션 회전을 검토한다.
- 로그인 실패 rate limit은 기본 인메모리 방식으로 적용되어 있으며, 운영 단계에서는 Redis 기반으로 전환한다.
- 이메일 인증 도입 검토

### 12.2 사용자 보호

- 차단 사용자의 게시글, 댓글, 알림 숨김
- 신고 누적 게시글 자동 임시 숨김 검토
- 운영자 조치 이력 저장
- 비공개 계정 콘텐츠 접근 제한

### 12.3 API 보호

- 게시글 작성 rate limit은 기본 인메모리 방식으로 적용되어 있으며, 운영 단계에서는 Redis 기반으로 전환한다.
- 댓글 작성 rate limit은 기본 인메모리 방식으로 적용되어 있으며, 운영 단계에서는 Redis 기반으로 전환한다.
- 팔로우 요청 rate limit은 기본 인메모리 방식으로 적용되어 있으며, 운영 단계에서는 Redis 기반으로 전환한다.
- 관리자 API 권한 검증
- 입력값 검증과 XSS 방어

## 13. 테스트 계획

### 13.1 단위 테스트

- 인증 서비스
- 게시글 서비스
- 팔로우 서비스
- 피드 조회 로직
- 알림 생성 로직

### 13.2 통합 테스트

- 회원가입 후 로그인
- 게시글 작성 후 홈 피드 노출
- 팔로우 후 상대 게시글 피드 노출
- 좋아요 후 알림 생성
- 차단 후 콘텐츠 숨김

### 13.3 E2E 테스트

- 현재는 `scripts/smoke-test.mjs`로 보호 API, 게시글 작성/수정, 관리자 권한 흐름을 검증한다.
- 브라우저 기반 E2E는 다음 단계에서 Playwright 등으로 추가한다.

- 신규 사용자 온보딩
- 게시글 작성과 삭제
- 팔로우와 피드 확인
- 댓글 작성
- 신고 후 관리자 확인

## 14. 개발 일정

### 1단계: 기획과 기반 설정, 1주

- 요구사항 확정
- 화면 흐름 정의
- DB 스키마 초안 작성
- 프로젝트 구조 생성
- SQLite 개발 DB와 마이그레이션 환경 구성
- Redis 실행 환경 구성 예정
- GitHub Actions CI 기본 설정

### 2단계: 인증과 사용자, 1~2주

- 회원가입, 로그인, 로그아웃
- 내 정보 조회
- 프로필 편집
- 공개 프로필 조회
- 비공개 계정 플래그

### 3단계: 게시글과 프로필 피드, 2주

- 게시글 CRUD
- 댓글
- 좋아요
- 재게시
- 사용자 프로필 피드
- 기본 페이지네이션

### 4단계: 팔로우와 홈 피드, 2주

- 팔로우/언팔로우
- 팔로우 요청 승인/거절
- 홈 피드
- 추천 피드 v1
- 차단 사용자 필터링

### 5단계: 알림과 안전 기능, 1~2주

- 알림 생성
- 알림 목록과 읽음 처리
- 신고 기능
- 관리자 신고 목록
- 게시글 숨김 처리

### 6단계: 품질 개선과 출시 준비, 1~2주

- API 스모크 테스트
- E2E 테스트 예정
- 성능 점검
- 접근성 점검
- 배포 환경 구성
- 운영 로그와 모니터링 설정 예정
- 베타 출시

## 15. 배포 전략

### 15.1 개발 환경

- SQLite 파일 DB를 사용해 로컬 개발 진입 장벽 최소화
- Redis 등 보조 인프라는 이후 Docker Compose로 추가한다.
- 프론트엔드와 API는 Next.js 개발 서버에서 함께 실행한다.
- `.env.example` 제공

### 15.2 스테이징 환경

- main 브랜치 병합 전 자동 테스트
- staging 브랜치 배포
- 마이그레이션 자동 적용
- 운영자 테스트 계정 제공
- SQLite와 PostgreSQL 간 SQL/ORM 호환성 점검

### 15.3 운영 환경

- Blue/Green 또는 Rolling 배포
- DB 백업 자동화
- 운영 DB는 PostgreSQL 전환을 우선 검토
- 에러 추적 도구 연동
- API latency, error rate, queue lag 모니터링
- 관리자 작업 로그 저장

## 16. 운영 지표

- 일간 활성 사용자 수
- 가입 전환율
- 첫 게시글 작성률
- 사용자당 일간 게시글 수
- 홈 피드 조회 수
- 좋아요/댓글/재게시 비율
- 신고 처리 평균 시간
- 차단 발생률
- API p95 latency
- 게시글 작성 실패율

## 17. 주요 리스크와 대응

### 17.1 피드 성능

팔로우 관계가 많아질수록 홈 피드 조회가 느려질 수 있다. MVP에서는 쿼리 기반으로 시작하되, 성장 단계에서 Redis 기반 fan-out 구조로 전환한다.

### 17.2 악성 콘텐츠와 스팸

짧은 글 서비스는 스팸과 혐오 표현에 취약하다. 초기부터 rate limit, 신고, 차단, 관리자 숨김 처리를 포함하고, 이후 자동 모더레이션을 도입한다.

### 17.3 알림 폭주

인기 게시글에서 알림이 과도하게 발생할 수 있다. 알림 중복 방지, 배치 처리, 사용자별 알림 설정을 단계적으로 추가한다.

### 17.4 기능 범위 확장

DM, 추천 알고리즘, 트렌드, 미디어 기능을 너무 빨리 넣으면 MVP 출시가 지연된다. 초기에는 텍스트 기반 소셜 그래프와 피드 품질에 집중한다.

## 18. 우선순위

### 반드시 먼저 구현

- 회원가입과 로그인
- 프로필
- 게시글 작성과 조회
- 팔로우
- 홈 피드
- 좋아요와 댓글
- 알림
- 신고와 차단

### 이후 구현

- 게시글 이미지 첨부
- 고급 검색
- 고급 해시태그 트렌드
- 추천 알고리즘 개선
- DM
- 트렌드
- 고급 관리자 도구

## 19. 다음 액션

1. 현재 문서와 실제 구현 상태를 기준으로 남은 기능을 이슈 단위로 정리한다.
2. 비밀번호 재설정, 팔로워/팔로잉 목록, 관리자 사용자 제재 중 다음 구현 대상을 선택한다.
3. CSRF 방어와 로그인 실패 이력 저장을 추가한다.
4. 운영 로그, 에러 추적, 감사 로그 조회 화면을 추가한다.
5. 운영 DB 전환 여부를 결정하고 PostgreSQL 전환 계획을 구체화한다.
