# FeedFlow API 명세서

## 1. 기본 규칙

- Base URL: `/api`
- 요청과 응답은 JSON을 사용한다.
- 인증이 필요한 API는 `Authorization: Bearer <token>` 헤더를 사용한다.
- 목록 API는 커서 페이지네이션을 사용한다.
- 시간 값은 ISO 8601 문자열로 응답한다.

## 2. 공통 응답 형식

### 2.1 성공

```json
{
  "data": {}
}
```

### 2.2 목록

```json
{
  "data": [],
  "page": {
    "nextCursor": "string|null",
    "hasNext": true
  }
}
```

### 2.3 에러

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인해 주세요.",
    "details": {}
  }
}
```

## 3. 공통 에러 코드

| 코드 | HTTP | 설명 |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | 입력값 오류 |
| UNAUTHORIZED | 401 | 인증 필요 |
| FORBIDDEN | 403 | 권한 없음 |
| NOT_FOUND | 404 | 리소스 없음 |
| CONFLICT | 409 | 중복 또는 상태 충돌 |
| RATE_LIMITED | 429 | 요청 제한 초과 |
| INTERNAL_ERROR | 500 | 서버 오류 |

## 4. Auth API

### 4.1 회원가입

`POST /api/auth/signup`

요청:

```json
{
  "email": "user@example.com",
  "password": "password123!",
  "handle": "feeduser",
  "displayName": "Feed User"
}
```

응답:

```json
{
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "handle": "feeduser",
    "displayName": "Feed User"
  }
}
```

### 4.2 로그인

`POST /api/auth/login`

요청:

```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

응답:

```json
{
  "data": {
    "accessToken": "jwt",
    "user": {
      "id": "usr_123",
      "handle": "feeduser",
      "displayName": "Feed User",
      "role": "user"
    }
  }
}
```

### 4.3 로그아웃

`POST /api/auth/logout`

응답:

```json
{
  "data": {
    "ok": true
  }
}
```

### 4.4 내 정보

`GET /api/auth/me`

응답:

```json
{
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "handle": "feeduser",
    "displayName": "Feed User",
    "bio": "",
    "avatarUrl": null,
    "isPrivate": false,
    "role": "user"
  }
}
```

## 5. Users API

### 5.1 프로필 조회

`GET /api/users/:handle`

응답:

```json
{
  "data": {
    "id": "usr_123",
    "handle": "feeduser",
    "displayName": "Feed User",
    "bio": "hello",
    "avatarUrl": null,
    "isPrivate": false,
    "viewerRelationship": "following",
    "counts": {
      "posts": 12,
      "followers": 30,
      "following": 20
    }
  }
}
```

### 5.2 내 프로필 수정

`PATCH /api/users/me`

요청:

```json
{
  "displayName": "New Name",
  "bio": "short bio",
  "avatarUrl": "https://example.com/avatar.png",
  "isPrivate": false
}
```

응답:

```json
{
  "data": {
    "id": "usr_123",
    "handle": "feeduser",
    "displayName": "New Name",
    "bio": "short bio",
    "avatarUrl": "https://example.com/avatar.png",
    "isPrivate": false
  }
}
```

### 5.3 사용자 차단

`POST /api/users/:id/block`

응답:

```json
{
  "data": {
    "blocked": true
  }
}
```

### 5.4 사용자 차단 해제

`DELETE /api/users/:id/block`

응답:

```json
{
  "data": {
    "blocked": false
  }
}
```

## 6. Posts API

### 6.1 게시글 작성

`POST /api/posts`

요청:

```json
{
  "content": "첫 번째 FeedFlow 게시글",
  "visibility": "public"
}
```

응답:

```json
{
  "data": {
    "id": "post_123",
    "content": "첫 번째 FeedFlow 게시글",
    "visibility": "public",
    "author": {
      "id": "usr_123",
      "handle": "feeduser",
      "displayName": "Feed User"
    },
    "counts": {
      "likes": 0,
      "replies": 0,
      "reposts": 0
    },
    "createdAt": "2026-06-17T06:00:00.000Z"
  }
}
```

### 6.2 게시글 상세

`GET /api/posts/:id`

응답:

```json
{
  "data": {
    "id": "post_123",
    "content": "첫 번째 FeedFlow 게시글",
    "author": {
      "id": "usr_123",
      "handle": "feeduser",
      "displayName": "Feed User"
    },
    "viewerState": {
      "liked": false,
      "reposted": false,
      "blockedAuthor": false
    },
    "counts": {
      "likes": 0,
      "replies": 0,
      "reposts": 0
    },
    "createdAt": "2026-06-17T06:00:00.000Z"
  }
}
```

### 6.3 게시글 수정

`PATCH /api/posts/:id`

요청:

```json
{
  "content": "수정한 게시글"
}
```

### 6.4 게시글 삭제

`DELETE /api/posts/:id`

응답:

```json
{
  "data": {
    "deleted": true
  }
}
```

### 6.5 댓글 작성

`POST /api/posts/:id/replies`

요청:

```json
{
  "content": "댓글입니다."
}
```

### 6.6 좋아요

`POST /api/posts/:id/like`

응답:

```json
{
  "data": {
    "liked": true,
    "likeCount": 1
  }
}
```

### 6.7 좋아요 취소

`DELETE /api/posts/:id/like`

응답:

```json
{
  "data": {
    "liked": false,
    "likeCount": 0
  }
}
```

### 6.8 재게시

`POST /api/posts/:id/repost`

응답:

```json
{
  "data": {
    "reposted": true,
    "repostCount": 1
  }
}
```

### 6.9 재게시 취소

`DELETE /api/posts/:id/repost`

응답:

```json
{
  "data": {
    "reposted": false,
    "repostCount": 0
  }
}
```

## 7. Follows API

### 7.1 팔로우

`POST /api/users/:id/follow`

응답:

```json
{
  "data": {
    "status": "accepted"
  }
}
```

비공개 계정이면 `status`는 `pending`이다.

### 7.2 언팔로우

`DELETE /api/users/:id/follow`

응답:

```json
{
  "data": {
    "following": false
  }
}
```

### 7.3 팔로워 목록

`GET /api/users/:handle/followers?cursor=&limit=20`

### 7.4 팔로잉 목록

`GET /api/users/:handle/following?cursor=&limit=20`

### 7.5 팔로우 요청 승인

`POST /api/follow-requests/:id/approve`

### 7.6 팔로우 요청 거절

`POST /api/follow-requests/:id/reject`

## 8. Feeds API

### 8.1 홈 피드

`GET /api/feeds/home?cursor=&limit=20`

설명:

- 로그인 필요
- 팔로우한 사용자의 게시글을 최신순으로 반환한다.
- 차단한 사용자와 나를 차단한 사용자의 게시글은 제외한다.

### 8.2 추천 피드

`GET /api/feeds/explore?cursor=&limit=20`

설명:

- 공개 게시글을 최신순 또는 단순 점수순으로 반환한다.
- 숨김, 삭제, 차단 대상 게시글은 제외한다.

### 8.3 프로필 피드

`GET /api/feeds/user/:handle?cursor=&limit=20`

설명:

- 공개 계정은 누구나 조회할 수 있다.
- 비공개 계정은 승인된 팔로워만 조회할 수 있다.

## 9. Notifications API

### 9.1 알림 목록

`GET /api/notifications?cursor=&limit=20`

응답:

```json
{
  "data": [
    {
      "id": "noti_123",
      "type": "like",
      "actor": {
        "id": "usr_456",
        "handle": "other",
        "displayName": "Other"
      },
      "postId": "post_123",
      "readAt": null,
      "createdAt": "2026-06-17T06:00:00.000Z"
    }
  ],
  "page": {
    "nextCursor": null,
    "hasNext": false
  }
}
```

### 9.2 알림 읽음 처리

`PATCH /api/notifications/:id/read`

### 9.3 전체 읽음 처리

`PATCH /api/notifications/read-all`

## 10. Reports API

### 10.1 신고 생성

`POST /api/reports`

요청:

```json
{
  "targetType": "post",
  "targetId": "post_123",
  "reason": "spam"
}
```

응답:

```json
{
  "data": {
    "id": "report_123",
    "status": "open"
  }
}
```

## 11. Admin API

모든 Admin API는 관리자 권한이 필요하다.

### 11.1 신고 목록

`GET /api/admin/reports?status=open&cursor=&limit=20`

### 11.2 신고 상태 변경

`PATCH /api/admin/reports/:id`

요청:

```json
{
  "status": "resolved",
  "note": "게시글 숨김 처리 완료"
}
```

### 11.3 게시글 숨김

`POST /api/admin/posts/:id/hide`

요청:

```json
{
  "note": "spam"
}
```

### 11.4 계정 정지

`POST /api/admin/users/:id/suspend`

요청:

```json
{
  "note": "abuse"
}
```
