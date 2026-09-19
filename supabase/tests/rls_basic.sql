-- supabase/tests/rls_basic.sql
-- TEST-RLS-BASIC — RLS 기본 정책 Integration Test(pgTAP, REQ-NFR-PRIV-003/004).
--
-- 이 파일은 트랜잭션 안에서 실행되고 마지막에 ROLLBACK하므로(pgtap 확장 설치 포함)
-- 실제 데이터나 스키마를 변경하지 않는다. supabase/seed.sql이 이미 적용된 프로젝트를
-- 전제로 하며(seed_admin/seed_member_a/seed_member_b 3계정, seed_member_b가
-- seed_member_a를 차단, seed_member_a가 작성한 mate_posts 8건, reports 1건), 이
-- 고정 fixture로 아래 2개 Functional AC를 실제 쿼리로 검증한다:
--   (1) 비관리자가 reports를 조회하면 RLS가 결과를 차단한다.
--   (2) 차단된 상대방(seed_member_a)의 mate_posts가 차단한 사람(seed_member_b)의
--       목록/상세 조회에 노출되지 않는다.
--
-- 실행: `supabase db query --linked -f supabase/tests/rls_basic.sql`
-- (로컬 Docker 스택이 있으면 `supabase test db`로도 실행할 수 있다.)

begin;

create extension if not exists pgtap with schema extensions;

select plan(7);

-- pgTAP의 is()/ok()는 매 호출마다 자신만의 결과 Set(TAP 형식 text 한 행)을 즉시
-- 반환한다. `set local role`로 세션 role을 바꿔가며 여러 번 호출하면 각 호출이
-- 서로 다른 결과 Set이 되어, 스크립트를 한 번에 실행하는 클라이언트(예: 단순
-- 파일 실행기)는 보통 마지막 결과 Set만 보게 된다. 이 파일은 그런 환경에서도
-- 전체 결과를 한 번에 확인할 수 있도록 각 assertion 결과를 임시 테이블에 모아
-- 마지막에 한 번에 조회한다.
create temporary table test_results (seq int, result text) on commit drop;
grant select, insert on test_results to authenticated, anon;

-- (4)/(5) 대조군이 role을 넘나들며 값을 비교할 수 있도록 잠시 담아두는 표.
create temporary table baseline (n int) on commit drop;
grant select, insert on baseline to authenticated, anon;

-- 고정 시드 UUID(supabase/seed.sql과 동일한 값).
-- seed_admin, seed_member_a(모든 mate_posts 작성자), seed_member_b(member_a를 차단).

-- ============================================================================
-- (1) 비관리자(seed_member_a)가 reports를 조회하면 0건이어야 한다(RLS 차단).
-- ============================================================================
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

insert into test_results select 1, is(
  (select count(*)::int from public.reports),
  0,
  '비관리자(seed_member_a)는 reports를 조회해도 0건을 받는다(reports_select_admin_only)'
);

reset role;
reset "request.jwt.claims";

-- ============================================================================
-- (2) 관리자(seed_admin)가 reports를 조회하면 시드된 1건 이상을 볼 수 있다(대조군).
-- ============================================================================
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

insert into test_results select 2, ok(
  (select count(*)::int from public.reports) >= 1,
  '관리자(seed_admin)는 reports를 1건 이상 조회할 수 있다(is_admin() 우회)'
);

reset role;
reset "request.jwt.claims";

-- ============================================================================
-- (3) 차단한 사람(seed_member_b)은 차단당한 작성자(seed_member_a)의 mate_posts를
--     목록에서 전혀 볼 수 없다(user_blocks 상호 비노출, REQ-NFR-PRIV-004).
-- ============================================================================
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

insert into test_results select 3, is(
  (
    select count(*)::int
    from public.mate_posts
    where author_user_id = '22222222-2222-2222-2222-222222222222'
  ),
  0,
  '차단한 사람(seed_member_b)에게는 차단당한 작성자(seed_member_a)의 mate_posts가 0건 보인다'
);

-- 같은 세션에서 특정 게시글 상세(단건) 조회도 차단되는지 함께 확인한다.
insert into test_results select 4, is(
  (
    select count(*)::int
    from public.mate_posts
    where post_id = 'aaaaaaaa-0000-0000-0000-000000000001'
  ),
  0,
  '차단당한 작성자의 게시글 상세(단건 조회)도 차단한 사람에게 보이지 않는다'
);

reset role;
reset "request.jwt.claims";

-- ============================================================================
-- (4) 대조군 — 차단 관계가 없는 관리자(seed_admin)에게는 seed_member_a의
--     mate_posts 8건이 모두 보인다(차단 필터가 무관한 사용자에게는 적용되지 않음).
-- ============================================================================
-- seed_member_a의 실제 총 글 수는 8(seed) + 그동안 쌓인 E2E Smoke 테스트 글
-- 수만큼 더 많을 수 있다(tests/e2e/mate-auth.spec.ts가 실행할 때마다 실제 글을
-- 남긴다) — 그래서 이 대조군은 고정 숫자 대신 "차단 여부와 무관한 두 role이
-- 서로 같은 개수를 본다"로 비교한다. 최소 8건 이상이라는 것만 고정으로 확인한다.
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

insert into baseline
select count(*)::int
from public.mate_posts
where author_user_id = '22222222-2222-2222-2222-222222222222';

insert into test_results select 5, ok(
  (select n from baseline) >= 8,
  '차단 관계가 없는 관리자에게는 seed_member_a의 mate_posts가 최소 8건 이상 보인다(대조군)'
);

reset role;
reset "request.jwt.claims";

-- ============================================================================
-- (5) 비로그인(anon)에게는 차단 필터 없이 mate_posts가 전부 공개된다(REQ-FUNC-MATE-002).
-- 관리자가 본 개수(baseline)와 정확히 같아야 한다 — 비로그인도 차단과 무관하게
-- 전체를 보므로 둘의 개수가 다르면 어느 한쪽이 부당하게 필터링되고 있다는 뜻이다.
-- ============================================================================
set local role anon;
reset "request.jwt.claims";

insert into test_results select 6, is(
  (
    select count(*)::int
    from public.mate_posts
    where author_user_id = '22222222-2222-2222-2222-222222222222'
  ),
  (select n from baseline),
  '비로그인 사용자는 차단 여부와 무관하게 mate_posts 전체를 조회할 수 있다'
);

reset role;

-- ============================================================================
-- (6) 비관리자가 reports 상태를 직접 UPDATE해도 RLS가 막아 0행이 바뀐다.
-- ============================================================================
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

with attempted as (
  update public.reports
  set status = 'IN_REVIEW'
  where report_id = 'dddddddd-0000-0000-0000-000000000001'
  returning report_id
)
insert into test_results select 7, is(
  (select count(*)::int from attempted),
  0,
  '비관리자는 reports 상태를 직접 UPDATE할 수 없다(reports_update_admin_only, 0행 반영)'
);

reset role;
reset "request.jwt.claims";

select * from finish();

select seq, result from test_results order by seq;

rollback;
