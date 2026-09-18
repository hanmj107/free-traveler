-- 0002_rls_policies.sql
-- DB-RLS-BASE — RLS 정책 정의(6개 테이블, DB-SCHEMA-BASE가 이미 ENABLE ROW LEVEL SECURITY
-- 해둔 상태). docs/02_SRS_BASELINE.md §7-6~§7-10, REQ-NFR-PRIV-003/004, root CLAUDE.md
-- 규칙 14(RLS 우회 코드 금지)를 근거로 한다. 이 마이그레이션은 6개 테이블의 Policy만
-- 추가하며 새 테이블은 만들지 않는다.

-- ============================================================================
-- 관리자 판별 Helper — profiles.role='ADMIN' 여부를 SECURITY DEFINER로 조회한다.
-- Policy의 USING/WITH CHECK 절에서 profiles를 재귀적으로 참조할 때의 복잡도를 피하기
-- 위한 표준적인 패턴이다(search_path를 명시적으로 고정해 하이재킹을 방지한다).
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- ============================================================================
-- 1. profiles
-- ============================================================================
create policy profiles_select_own on public.profiles
  for select
  using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
  for insert
  with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================================
-- 2. mate_posts — 비회원도 조회 가능(REQ-FUNC-MATE-002)하지만, user_blocks가 반영되면
--    차단한/차단당한 상대의 글은 서로에게 보이지 않는다(REQ-NFR-PRIV-004, 상호 비노출).
-- ============================================================================
create policy mate_posts_select on public.mate_posts
  for select
  using (
    auth.uid() is null
    or not exists (
      select 1 from public.user_blocks b
      where
        (b.blocker_user_id = auth.uid() and b.blocked_user_id = mate_posts.author_user_id)
        or (b.blocked_user_id = auth.uid() and b.blocker_user_id = mate_posts.author_user_id)
    )
  );

create policy mate_posts_insert_own on public.mate_posts
  for insert
  with check (author_user_id = auth.uid());

create policy mate_posts_update_own on public.mate_posts
  for update
  using (author_user_id = auth.uid())
  with check (author_user_id = auth.uid());

-- ============================================================================
-- 3. mate_applications — 신청자 본인 또는 대상 모집글 작성자만 조회 가능.
-- ============================================================================
create policy mate_applications_select on public.mate_applications
  for select
  using (
    applicant_user_id = auth.uid()
    or exists (
      select 1 from public.mate_posts p
      where p.post_id = mate_applications.post_id and p.author_user_id = auth.uid()
    )
  );

create policy mate_applications_insert_own on public.mate_applications
  for insert
  with check (applicant_user_id = auth.uid());

-- 승인/거절(status·decided_at 변경)은 대상 모집글 작성자만 수행한다.
create policy mate_applications_update_by_post_author on public.mate_applications
  for update
  using (
    exists (
      select 1 from public.mate_posts p
      where p.post_id = mate_applications.post_id and p.author_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.mate_posts p
      where p.post_id = mate_applications.post_id and p.author_user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. user_blocks — 본인이 등록한 차단 관계만 조회·생성·삭제(해제) 가능.
-- ============================================================================
create policy user_blocks_select_own on public.user_blocks
  for select
  using (blocker_user_id = auth.uid());

create policy user_blocks_insert_own on public.user_blocks
  for insert
  with check (blocker_user_id = auth.uid());

create policy user_blocks_delete_own on public.user_blocks
  for delete
  using (blocker_user_id = auth.uid());

-- ============================================================================
-- 5. reports — 관리자 role만 SELECT(REQ-NFR-PRIV-003, "신고·피신고 정보 관리자 전용").
--    신고자는 제출(INSERT)만 가능하며, 접수번호는 그 INSERT 응답에서 바로 확인한다
--    (COMP-SCR004-REPORT — 이후 재조회 SELECT 권한은 부여하지 않는다).
-- ============================================================================
create policy reports_select_admin_only on public.reports
  for select
  using (public.is_admin());

create policy reports_insert_own on public.reports
  for insert
  with check (reporter_user_id = auth.uid());

create policy reports_update_admin_only on public.reports
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 6. app_settings — 모든 사용자(비회원 포함) 조회 가능, 쓰기는 관리자 role만
--    (REQ-NFR-SEC-004, API-EXTERNAL-URLS Task와 동일한 원칙).
-- ============================================================================
create policy app_settings_select_all on public.app_settings
  for select
  using (true);

create policy app_settings_admin_write on public.app_settings
  for insert
  with check (public.is_admin());

create policy app_settings_admin_update on public.app_settings
  for update
  using (public.is_admin())
  with check (public.is_admin());
