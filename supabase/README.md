# Supabase Setup

이 프로젝트는 Vercel 배포 시 로컬 JSON 파일과 `public/uploads` 대신 Supabase를 사용하도록 준비되어 있습니다.

구성은 아래처럼 사용합니다.

- 로그인 / 로그아웃: Supabase Auth
- 공지사항 / 메인 피드 / 배경 이미지 설정: Supabase Postgres
- 이미지 업로드: Supabase Storage

## 1. 환경변수 설정

Vercel과 로컬 `.env.local`에 아래 값을 넣습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 2. 데이터베이스 생성

Supabase SQL Editor에서 아래 순서로 실행합니다.

1. [schema.sql](/Users/kimtaehyeong/Desktop/프로젝트/godeok-bon/supabase/schema.sql)
2. [seed.sql](/Users/kimtaehyeong/Desktop/프로젝트/godeok-bon/supabase/seed.sql)

이 스키마에는 아래 항목이 포함됩니다.

- `admin_users`
- `notices`
- `home_feeds`
- `site_media`
- 공개 Storage 버킷
  - `notices`
  - `home-feed`
  - `site-media`

## 3. 관리자 계정 만들기

1. Supabase Auth에서 이메일/비밀번호 계정을 하나 생성합니다.
2. 생성된 사용자 `id`를 확인합니다.
3. SQL Editor에서 아래 예시처럼 관리자 권한을 등록합니다.

```sql
insert into public.admin_users (user_id, username, email, display_name)
values (
  'SUPABASE_AUTH_USER_ID',
  'admin',
  'admin@example.com',
  '관리자'
)
on conflict (user_id) do update
set
  username = excluded.username,
  email = excluded.email,
  display_name = excluded.display_name;
```

로그인 화면에서는 `username`을 입력하지만, 실제 인증은 연결된 `email + password`로 처리됩니다.

## 4. 이미지 업로드 방식

업로드 이미지는 Vercel 서버의 로컬 디스크에 저장하지 않습니다.

- 공지 에디터 이미지: `notices` 버킷
- 메인 피드 이미지: `home-feed` 버킷
- 페이지 배경 이미지: `site-media` 버킷

이미지는 서버에서 먼저 형식 검사를 거친 뒤 Storage로 업로드됩니다.

허용 형식:

- JPG
- PNG
- GIF
- WEBP

차단 형식:

- SVG
- 위장된 비이미지 파일
- 과도하게 큰 파일

관련 로직:

- [lib/image-security.ts](/Users/kimtaehyeong/Desktop/프로젝트/godeok-bon/lib/image-security.ts)
- [lib/supabase/storage.ts](/Users/kimtaehyeong/Desktop/프로젝트/godeok-bon/lib/supabase/storage.ts)

## 5. 배포 메모

- Vercel은 로컬 파일 저장이 유지되지 않으므로 JSON/로컬 업로드 저장 방식으로 운영하면 안 됩니다.
- Supabase 환경변수가 설정되면 앱은 자동으로 Supabase 저장소를 우선 사용합니다.
- 환경변수가 없으면 개발용 로컬 fallback이 동작합니다.
