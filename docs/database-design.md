# FeedFlow 데이터베이스 설계서

## 1. 설계 원칙

- 개발 DB는 SQLite를 사용한다.
- 모든 주요 테이블은 `id`, `created_at`을 기본으로 가진다.
- 수정 가능한 엔티티에는 `updated_at`을 둔다.
- 삭제가 사용자 경험과 감사 로그에 영향을 주는 데이터는 소프트 삭제한다.
- 운영 단계 PostgreSQL 전환을 고려해 SQLite 전용 기능 의존을 최소화한다.
- 시간 값은 ISO 8601 문자열 또는 ORM의 DateTime 타입으로 저장한다.

## 2. 개발 DB 설정

```env
DATABASE_URL="file:./dev.db"
```

SQLite 파일은 로컬 개발용이며 Git에는 커밋하지 않는다. 마이그레이션 파일과 seed 스크립트만 버전 관리한다.

## 3. 공통 컬럼 규칙

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | text | Prisma `cuid()` 문자열 |
| created_at | datetime | 생성 시각 |
| updated_at | datetime | 수정 가능한 엔티티의 수정 시각 |
| deleted_at | datetime nullable | 소프트 삭제가 필요한 엔티티의 삭제 시각 |

## 4. 테이블 설계

### 4.1 users

사용자 계정과 프로필 정보를 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 사용자 ID |
| email | text | unique, not null | 로그인 이메일 |
| password_hash | text | not null | 해시된 비밀번호 |
| handle | text | unique, not null | 사용자 핸들 |
| display_name | text | not null | 표시 이름 |
| bio | text | nullable | 소개글 |
| avatar_url | text | nullable | 프로필 이미지 URL |
| is_private | integer | not null, default 0 | 비공개 계정 여부 |
| role | text | not null, default `user` | `user`, `admin` |
| status | text | not null, default `active` | `active`, `suspended`, `deleted` |
| created_at | datetime | not null | 생성 시각 |
| updated_at | datetime | not null | 수정 시각 |
| deleted_at | datetime | nullable | 탈퇴 시각 |

인덱스:

- unique `users.email`
- unique `users.handle`

### 4.2 posts

게시글, 댓글, 재게시 관계를 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 게시글 ID |
| author_id | text | foreign key, not null | 작성자 ID |
| parent_post_id | text | foreign key nullable | 댓글일 경우 부모 게시글 |
| repost_of_post_id | text | foreign key nullable | 재게시 원본 게시글 |
| content | text | not null | 본문 |
| visibility | text | not null, default `public` | `public`, `followers`, `private` |
| like_count | integer | not null, default 0 | 좋아요 수 |
| reply_count | integer | not null, default 0 | 댓글 수 |
| repost_count | integer | not null, default 0 | 재게시 수 |
| is_hidden | integer | not null, default 0 | 운영자 숨김 여부 |
| created_at | datetime | not null | 생성 시각 |
| updated_at | datetime | not null | 수정 시각 |
| deleted_at | datetime | nullable | 삭제 시각 |

인덱스:

- `posts.author_id, posts.created_at`
- `posts.parent_post_id, posts.created_at`
- `posts.created_at, posts.id`
- `posts.repost_of_post_id`

제약:

- 일반 게시글은 `parent_post_id`와 `repost_of_post_id`가 모두 null이다.
- 댓글은 `parent_post_id`를 가진다.
- 재게시 글은 `repost_of_post_id`를 가진다.

### 4.3 follows

팔로우 관계와 비공개 계정 팔로우 요청을 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 팔로우 ID |
| follower_id | text | foreign key, not null | 팔로우하는 사용자 |
| following_id | text | foreign key, not null | 팔로우 대상 |
| status | text | not null | `pending`, `accepted`, `rejected` |
| created_at | datetime | not null | 생성 시각 |
| updated_at | datetime | not null | 수정 시각 |

인덱스:

- `follows.follower_id, follows.status`
- `follows.following_id, follows.status`
- unique `follows.follower_id, follows.following_id`

### 4.4 likes

게시글 좋아요를 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 좋아요 ID |
| user_id | text | foreign key, not null | 사용자 ID |
| post_id | text | foreign key, not null | 게시글 ID |
| created_at | datetime | not null | 생성 시각 |

인덱스:

- `likes.post_id`
- `likes.user_id`
- unique `likes.user_id, likes.post_id`

### 4.5 reposts

재게시 중복 방지를 위해 별도 관계 테이블을 둔다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 재게시 관계 ID |
| user_id | text | foreign key, not null | 사용자 ID |
| post_id | text | foreign key, not null | 원본 게시글 ID |
| repost_post_id | text | foreign key, not null | 생성된 재게시 글 ID |
| created_at | datetime | not null | 생성 시각 |

인덱스:

- `reposts.post_id`
- unique `reposts.user_id, reposts.post_id`
- unique `reposts.repost_post_id`

### 4.6 notifications

사용자 알림을 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 알림 ID |
| receiver_id | text | foreign key, not null | 알림 수신자 |
| actor_id | text | foreign key nullable | 행위자 |
| type | text | not null | `like`, `reply`, `follow`, `repost` |
| post_id | text | foreign key nullable | 관련 게시글 |
| read_at | datetime | nullable | 읽음 시각 |
| created_at | datetime | not null | 생성 시각 |

인덱스:

- `notifications.receiver_id, notifications.created_at`
- `notifications.receiver_id, notifications.read_at`

### 4.7 blocks

사용자 차단 관계를 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 차단 ID |
| blocker_id | text | foreign key, not null | 차단한 사용자 |
| blocked_id | text | foreign key, not null | 차단된 사용자 |
| created_at | datetime | not null | 생성 시각 |

인덱스:

- `blocks.blocker_id`
- unique `blocks.blocker_id, blocks.blocked_id`

### 4.8 reports

게시글과 사용자 신고를 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 신고 ID |
| reporter_id | text | foreign key, not null | 신고자 |
| target_type | text | not null | `post`, `user` |
| target_id | text | not null | 대상 ID |
| reason | text | not null | 신고 사유 |
| status | text | not null, default `open` | `open`, `reviewing`, `resolved`, `rejected` |
| reviewed_by | text | foreign key nullable | 처리 운영자 |
| reviewed_at | datetime | nullable | 처리 시각 |
| created_at | datetime | not null | 생성 시각 |
| updated_at | datetime | not null | 수정 시각 |

인덱스:

- `reports.status, reports.created_at`
- `reports.target_type, reports.target_id`
- `reports.reporter_id`

### 4.9 moderation_actions

운영자 조치 이력을 저장한다.

| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | text | primary key | 조치 ID |
| admin_id | text | foreign key, not null | 운영자 ID |
| target_type | text | not null | `post`, `user`, `report` |
| target_id | text | not null | 대상 ID |
| action | text | not null | `hide_post`, `report_open`, `report_reviewing`, `report_resolved`, `report_rejected` |
| note | text | nullable | 처리 메모 |
| created_at | datetime | not null | 생성 시각 |

## 5. 관계 요약

- `users` 1:N `posts`
- `users` N:M `users` through `follows`
- `users` N:M `posts` through `likes`
- `users` N:M `posts` through `reposts`
- `posts` 1:N `posts` through `parent_post_id`
- `users` 1:N `notifications` as receiver
- `users` N:M `users` through `blocks`
- `users` 1:N `reports` as reporter

## 6. 커서 페이지네이션 기준

목록 API는 `created_at`과 `id`를 조합한 커서를 사용한다.

```text
cursor = base64("{created_at}:{id}")
```

정렬 기준:

```sql
ORDER BY created_at DESC, id DESC
```

다음 페이지 조건:

```sql
WHERE (created_at < :cursorCreatedAt)
   OR (created_at = :cursorCreatedAt AND id < :cursorId)
```

## 7. SQLite 사용 시 주의사항

- Boolean은 `integer`의 `0`, `1`로 저장한다.
- 동시 쓰기 성능은 제한적이므로 개발용 DB로 사용한다.
- 외래 키 제약은 연결 시 `PRAGMA foreign_keys = ON`을 활성화한다.
- PostgreSQL 전환을 고려해 raw SQL보다 ORM 마이그레이션을 우선 사용한다.
- 검색 기능은 SQLite `LIKE`로 시작하고, 고급 검색 단계에서 OpenSearch 도입을 검토한다.
