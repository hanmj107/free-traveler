-- 0001_base_schema.sql
-- DB-SCHEMA-BASE — Supabase 스키마 정의(정확히 6개 테이블).
-- docs/02_SRS_BASELINE.md §7-6~§7-10(USER/MATE_POST/MATE_APPLICATION/USER_BLOCK/REPORT),
-- docs/02_SRS_BASELINE.md §8-2(app_settings 외부 랜딩 URL), docs/PROJECT_SCOPE.md §3,
-- .claude/skills/traveler-project-pipeline/SKILL.md §6을 그대로 옮긴 것이다.
--
-- 이 파일은 스키마(테이블·제약·인덱스)만 정의한다. RLS Policy는 DB-RLS-BASE에서,
-- 시드 데이터는 DB-SEED-BASE에서 별도 마이그레이션으로 추가한다(Expected Files 경계 준수).
--
-- 여행지·국가별 안전정보·대표 소개는 정적 TypeScript 데이터(src/data/*.ts)로만 구현하며
-- 이 마이그레이션에는 포함하지 않는다(docs/PROJECT_SCOPE.md §3, 루트 CLAUDE.md 규칙 13·16).

-- ============================================================================
-- 1. profiles — auth.users 1:1 확장 프로필
--    (REQ-NFR-PRIV-001/002: 이메일·닉네임·성인확인여부·확인시각만 필수 수집,
--     생년월일(birthdate) 컬럼은 의도적으로 정의하지 않는다)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nickname text not null,
  adult_verified boolean not null default false,
  adult_verified_at timestamptz,
  age_range text,
  gender text,
  travel_style_tags text[] not null default '{}',
  role text not null default 'MEMBER',
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('MEMBER', 'ADMIN')),
  constraint profiles_adult_verified_at_check check (
    adult_verified = false or adult_verified_at is not null
  )
);

comment on table public.profiles is
  'DESTINATION-002 감사 원칙(REQ-NFR-PRIV-002): 생년월일은 저장하지 않는다. 성인확인여부(adult_verified)와 확인시각(adult_verified_at)만 저장한다.';

-- ============================================================================
-- 2. mate_posts — 동행 모집글(REQ-FUNC-MATE-003)
-- ============================================================================
create table if not exists public.mate_posts (
  post_id uuid primary key default gen_random_uuid (),
  author_user_id uuid not null references public.profiles (id) on delete cascade,
  country text not null,
  region text not null,
  start_date date not null,
  end_date date not null,
  travel_style_tags text[] not null default '{}',
  title text not null,
  body_text text not null,
  safety_rule_agreed boolean not null default false,
  status text not null default 'RECRUITING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mate_posts_status_check check (status in ('RECRUITING', 'CLOSED')),
  constraint mate_posts_date_range_check check (end_date >= start_date)
);

create index if not exists mate_posts_author_idx on public.mate_posts (author_user_id);
create index if not exists mate_posts_status_idx on public.mate_posts (status);
create index if not exists mate_posts_country_region_idx on public.mate_posts (country, region);

-- ============================================================================
-- 3. mate_applications — 참가 요청(REQ-FUNC-MATE-004/005)
-- ============================================================================
create table if not exists public.mate_applications (
  application_id uuid primary key default gen_random_uuid (),
  post_id uuid not null references public.mate_posts (post_id) on delete cascade,
  applicant_user_id uuid not null references public.profiles (id) on delete cascade,
  message_text text not null,
  status text not null default 'PENDING',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  constraint mate_applications_status_check check (
    status in ('PENDING', 'APPROVED', 'REJECTED')
  ),
  constraint mate_applications_decided_at_check check (
    status = 'PENDING' or decided_at is not null
  )
);

-- (post_id, applicant_user_id) 조합에 PENDING 또는 APPROVED 상태는 동시에 1건만 존재할 수
-- 있다(docs/02_SRS_BASELINE.md §7-8 유일 제약, REQ-FUNC-MATE-004 중복 제출 방지). REJECTED
-- 이력은 재신청을 위해 여러 건 존재할 수 있으므로 전체 컬럼에 대한 단순 UNIQUE 대신
-- 상태를 조건으로 하는 부분 유일 인덱스로 구현한다.
create unique index if not exists mate_applications_pending_approved_unique
  on public.mate_applications (post_id, applicant_user_id)
  where status in ('PENDING', 'APPROVED');

create index if not exists mate_applications_post_idx on public.mate_applications (post_id);
create index if not exists mate_applications_applicant_idx on public.mate_applications (applicant_user_id);

-- ============================================================================
-- 4. user_blocks — 차단 관계(REQ-FUNC-MATE-007, REQ-NFR-PRIV-004)
-- ============================================================================
create table if not exists public.user_blocks (
  block_id uuid primary key default gen_random_uuid (),
  blocker_user_id uuid not null references public.profiles (id) on delete cascade,
  blocked_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_no_self_block_check check (blocker_user_id <> blocked_user_id),
  constraint user_blocks_unique unique (blocker_user_id, blocked_user_id)
);

create index if not exists user_blocks_blocker_idx on public.user_blocks (blocker_user_id);
create index if not exists user_blocks_blocked_idx on public.user_blocks (blocked_user_id);

-- ============================================================================
-- 5. reports — 신고(REQ-FUNC-MATE-006, ADMIN-003)
-- ============================================================================
create table if not exists public.reports (
  report_id uuid primary key default gen_random_uuid (),
  receipt_number text not null,
  reporter_user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'RECEIVED',
  received_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint reports_receipt_number_unique unique (receipt_number),
  constraint reports_target_type_check check (
    target_type in ('USER', 'MATE_POST', 'MATE_APPLICATION')
  ),
  constraint reports_status_check check (
    status in ('RECEIVED', 'IN_REVIEW', 'RESOLVED')
  )
);

comment on column public.reports.target_id is
  '다형적(polymorphic) 참조 — target_type 값에 따라 profiles.id/mate_posts.post_id/mate_applications.application_id 중 하나를 가리킨다. FK 제약은 걸지 않는다.';

create index if not exists reports_reporter_idx on public.reports (reporter_user_id);
create index if not exists reports_status_idx on public.reports (status);

-- ============================================================================
-- 6. app_settings — 외부 URL 등 환경설정(REQ-NFR-SEC-004)
-- ============================================================================
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.app_settings is
  '항공/호텔 외부 랜딩 URL 등 키-값 환경설정. 관리자만 쓰기 가능(RLS는 DB-RLS-BASE에서 정의), 일반 사용자는 조회만.';

-- ============================================================================
-- 기본값으로 RLS를 활성화해 둔다(Policy는 DB-RLS-BASE에서 추가 — 정책이 없는 동안은
-- service_role을 제외한 모든 접근이 기본 차단되어 안전한 상태로 남는다).
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.mate_posts enable row level security;
alter table public.mate_applications enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;
