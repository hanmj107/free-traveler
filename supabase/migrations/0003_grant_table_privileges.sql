-- 0003_grant_table_privileges.sql
-- DB-SCHEMA-BASE 보완 — `0001_base_schema.sql`이 6개 테이블을 만들 때 `anon`/
-- `authenticated` role에 테이블 단위 권한(GRANT)을 부여하지 않았다. Postgres는
-- Row Level Security 이전에 테이블 단위 권한을 먼저 확인하므로, RLS Policy
-- (`0002_rls_policies.sql`)가 아무리 올바르게 정의돼 있어도 GRANT가 없으면 모든
-- 쿼리가 "permission denied"로 실패한다.
--
-- 이 gap은 실제 Supabase 프로젝트에 마이그레이션을 처음 적용한 뒤 TEST-RLS-BASIC의
-- pgTAP 테스트를 실행하며 발견했다 — Supabase 대시보드로 테이블을 만들면 자동으로
-- 부여되는 기본 권한이, 원시 SQL 마이그레이션(`supabase db push`)으로 테이블을 만들
-- 때는 자동으로 생기지 않는다.
--
-- 실제 접근 제어는 계속 RLS Policy가 담당한다(이 GRANT는 "테이블에 접근을 시도할
-- 수 있다"는 문만 열어줄 뿐이며, 어떤 행을 볼 수 있는지는 여전히
-- `0002_rls_policies.sql`의 Policy가 결정한다 — CLAUDE.md 규칙 14).

grant select, insert, update, delete
  on public.profiles, public.mate_posts, public.mate_applications,
     public.user_blocks, public.reports, public.app_settings
  to authenticated;

-- 비회원(anon)은 공개 조회만 필요하다(REQ-FUNC-MATE-002·SEC-004) — RLS Policy가
-- 이미 anon에게는 mate_posts_select/app_settings_select_all만 허용하므로 여기서도
-- SELECT만 부여해 대칭을 맞춘다(다른 테이블은 anon용 SELECT Policy 자체가 없어
-- GRANT를 줘도 RLS가 결과를 0건으로 막는다).
grant select
  on public.profiles, public.mate_posts, public.mate_applications,
     public.user_blocks, public.reports, public.app_settings
  to anon;
