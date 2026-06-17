# FeedFlow 개발 계획서

## 1. 프로젝트 개요

FeedFlow는 X(구 Twitter), Threads와 유사한 짧은 글 기반 소셜 네트워크 서비스이다. 사용자는 짧은 게시글을 작성하고, 다른 사용자를 팔로우하며, 홈 피드에서 관심 있는 콘텐츠를 빠르게 소비할 수 있다.

초기 목표는 거대한 소셜 플랫폼을 한 번에 재현하는 것이 아니라, 핵심 사용 흐름인 가입, 프로필, 게시, 피드, 팔로우, 반응, 알림을 안정적으로 구현한 뒤 검색, 추천, 신고/운영, 미디어, 실시간 기능을 단계적으로 확장하는 것이다.

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
- 비밀번호 재설정
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
- 해시태그 트렌드
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

초기 구현은 다음 두 가지 중 하나를 선택한다.

- Node.js/NestJS: 프론트엔드와 같은 TypeScript 생태계를 공유하고 실시간 기능 확장이 쉽다.
- Spring Boot: 안정적인 백엔드 구조, 트랜잭션 처리, 엔터프라이즈 운영 경험을 활용하기 좋다.

이 계획서의 기본안은 Next.js + NestJS + SQLite 조합으로 작성한다. 개발 단계에서는 SQLite로 빠르게 구현하고, 운영 단계에서 트래픽과 동시성 요구가 커지면 PostgreSQL로 전환할 수 있도록 ORM과 마이그레이션을 전제로 설계한다.

### 6.3 데이터베이스와 인프라

- SQLite: 개발 단계의 사용자, 게시글, 팔로우, 알림 등 주요 관계형 데이터 저장
- PostgreSQL: 운영 배포 또는 성장 단계에서 전환할 기본 후보
- Redis: 세션, 캐시, 피드 fan-out 작업 큐, rate limit
- Object Storage: 프로필 이미지와 추후 미디어 파일 저장
- Elasticsearch 또는 OpenSearch: 검색 기능 확장 시 도입
- Docker: Redis 등 보조 인프라와 배포 환경 표준화
- GitHub Actions: CI/CD

## 7. 시스템 아키텍처

초기 구조는 단순한 모듈형 모놀리식 백엔드로 시작한다. 서비스가 성장하면 피드, 알림, 검색, 미디어 처리 영역을 별도 서비스로 분리할 수 있다.

```text
Web Client
  -> API Server
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

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/password/reset-request`
- `POST /auth/password/reset`
- `GET /auth/me`

### 9.2 Users

- `GET /users/:handle`
- `PATCH /users/me`
- `GET /users/:handle/posts`
- `POST /users/:id/block`
- `DELETE /users/:id/block`

### 9.3 Posts

- `POST /posts`
- `GET /posts/:id`
- `PATCH /posts/:id`
- `DELETE /posts/:id`
- `POST /posts/:id/replies`
- `POST /posts/:id/like`
- `DELETE /posts/:id/like`
- `POST /posts/:id/repost`
- `DELETE /posts/:id/repost`

### 9.4 Follows

- `POST /users/:id/follow`
- `DELETE /users/:id/follow`
- `GET /users/:handle/followers`
- `GET /users/:handle/following`
- `POST /follow-requests/:id/approve`
- `POST /follow-requests/:id/reject`

### 9.5 Feeds

- `GET /feeds/home`
- `GET /feeds/explore`
- `GET /feeds/user/:handle`

### 9.6 Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

### 9.7 Moderation

- `POST /reports`
- `GET /admin/reports`
- `PATCH /admin/reports/:id`
- `POST /admin/posts/:id/hide`
- `POST /admin/users/:id/suspend`

## 10. 화면 구성

### 10.1 공개 화면

- 로그인
- 회원가입
- 비밀번호 재설정
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

### 10.3 관리자 화면

- 신고 대시보드
- 신고 상세
- 숨김 처리된 게시글 목록
- 제한된 계정 목록

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
- Access Token과 Refresh Token 분리
- Refresh Token 회전
- 로그인 실패 rate limit
- 이메일 인증 도입 검토

### 12.2 사용자 보호

- 차단 사용자의 게시글, 댓글, 알림 숨김
- 신고 누적 게시글 자동 임시 숨김 검토
- 운영자 조치 이력 저장
- 비공개 계정 콘텐츠 접근 제한

### 12.3 API 보호

- 게시글 작성 rate limit
- 댓글 작성 rate limit
- 팔로우 요청 rate limit
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
- Redis 실행 환경 구성
- CI 기본 설정

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

- E2E 테스트
- 성능 점검
- 접근성 점검
- 배포 환경 구성
- 운영 로그와 모니터링 설정
- 베타 출시

## 15. 배포 전략

### 15.1 개발 환경

- SQLite 파일 DB를 사용해 로컬 개발 진입 장벽 최소화
- Docker Compose로 Redis 등 보조 인프라 실행
- 프론트엔드와 백엔드는 로컬에서 별도 실행
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

- 이미지 첨부
- 검색
- 해시태그
- 추천 알고리즘 개선
- DM
- 트렌드
- 고급 관리자 도구

## 19. 다음 액션

1. 기술 스택을 Next.js + NestJS + SQLite로 확정한다.
2. MVP 화면 목록을 기준으로 와이어프레임을 작성한다.
3. DB ERD를 작성한다.
4. API 명세를 OpenAPI 문서로 구체화한다.
5. 프로젝트 초기 구조, SQLite 마이그레이션, Redis 실행 환경을 생성한다.
