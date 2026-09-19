-- 0004_reports_select_own_after_insert.sql
-- DB-RLS-BASE 보완 — `POST /api/reports`(API-REPORTS)는 Supabase JS의
-- `.insert(...).select("report_id, receipt_number")`로 접수번호를 즉시 응답에
-- 담는다. PostgREST는 이를 `INSERT ... RETURNING`으로 실행하는데, RETURNING은
-- 삽입한 행에 대해 SELECT Policy도 함께 통과해야 한다 — 그런데
-- `reports_select_admin_only`는 관리자만 SELECT를 허용하므로, 신고를 접수한
-- 본인(비관리자)조차 자신이 방금 만든 행을 반환받지 못해 신고 제출 자체가 항상
-- RLS 위반으로 실패했다(Reports 테이블에 실제 데이터를 써본 적이 이번이 처음이라
-- 지금까지 드러나지 않았다).
--
-- REQ-NFR-PRIV-003("신고·피신고 상세는 관리자만 접근")의 취지는 "다른 사람의
-- 신고를 볼 수 없다"는 것이지 "본인이 스스로 제출한 신고를 볼 수 없다"는 뜻이
-- 아니므로, 신고자 본인 행에 한해 SELECT를 추가로 허용한다(다른 사용자의 신고는
-- 여전히 admin만 볼 수 있다 — 두 Policy는 permissive라 OR로 합쳐진다).
create policy reports_select_own on public.reports
  for select
  using (reporter_user_id = auth.uid());
