-- supabase/seed.sql
-- DB-SEED-BASE — 개발/테스트용 최소 시드 데이터(6개 테이블 전체).
-- 실제 개인정보는 포함하지 않는다(Security/Privacy AC) — 이메일은 RFC 2606이 예약한
-- .invalid 도메인만 사용하고, 이름·본문은 전부 가상의 테스트용 문구다.
--
-- auth.users는 Supabase Auth 내부 스키마다. 로컬 개발 환경(`supabase start` → `supabase
-- db reset`)에서 이 파일이 실행될 때 일반 회원가입 흐름을 거치지 않고 테스트 계정을
-- 직접 생성하기 위해 pgcrypto의 crypt()/gen_salt()로 비밀번호를 해시한다(Supabase 공식
-- 예제와 동일한 패턴). 실제 Supabase 프로젝트가 아직 연결되지 않아(docs/ARCHITECTURE.md
-- §16) 이 파일을 실제로 실행해 검증하지는 못했다 — 로컬/스테이징 연결 후 재확인 필요.

begin;

-- ============================================================================
-- 0. 테스트 계정 3명(auth.users + profiles) — Admin 1명, Member 2명.
-- ============================================================================
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'seed.admin@example.invalid',
    crypt('seed-not-a-real-password-1', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'seed.member-a@example.invalid',
    crypt('seed-not-a-real-password-2', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated',
    'seed.member-b@example.invalid',
    crypt('seed-not-a-real-password-3', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''
  )
on conflict (id) do nothing;

insert into public.profiles (id, email, nickname, adult_verified, adult_verified_at, role)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'seed.admin@example.invalid',
    'seed_admin',
    true,
    now(),
    'ADMIN'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'seed.member-a@example.invalid',
    'seed_member_a',
    true,
    now(),
    'MEMBER'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'seed.member-b@example.invalid',
    'seed_member_b',
    true,
    now(),
    'MEMBER'
  )
on conflict (id) do nothing;

-- ============================================================================
-- 1. mate_posts — 8건(모집중 6 + 마감 2), 전부 seed_member_a 작성.
-- ============================================================================
insert into public.mate_posts (
  post_id, author_user_id, country, region, start_date, end_date,
  travel_style_tags, title, body_text, safety_rule_agreed, status
) values
  (
    'aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
    '일본', '도쿄', '2026-10-10', '2026-10-13',
    array['city', 'gourmet'], '도쿄 미식 동행 구해요',
    '10월 초 도쿄에서 3박 4일 동안 미식 위주로 동행하실 분을 찾습니다. 안전수칙을 함께 지켜주세요.',
    true, 'RECRUITING'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
    '베트남', '다낭', '2026-11-05', '2026-11-09',
    array['resort', 'budget'], '다낭 휴양 동행',
    '휴양 위주로 다낭 리조트에서 함께 쉴 동행을 구합니다.',
    true, 'RECRUITING'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
    '태국', '방콕', '2026-09-20', '2026-09-24',
    array['city', 'budget'], '방콕 야시장 투어 동행',
    '방콕 야시장과 왕궁 위주로 4박 일정 동행 구합니다.',
    true, 'RECRUITING'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222',
    '대만', '타이베이', '2026-12-01', '2026-12-04',
    array['gourmet', 'city'], '타이베이 딤섬 투어 동행',
    '타이베이에서 딤섬·야시장 위주로 3박 동행 구합니다.',
    true, 'RECRUITING'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222',
    '프랑스', '파리', '2027-01-10', '2027-01-17',
    array['city', 'nature_hiking'], '파리 장기 배낭여행 동행',
    '1주일간 파리 전역을 도보로 둘러볼 동행을 구합니다.',
    true, 'RECRUITING'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222',
    '인도네시아', '발리', '2026-10-25', '2026-10-30',
    array['resort', 'family'], '발리 힐링 여행 동행',
    '발리에서 요가와 휴양 위주로 5일 일정 동행 구합니다.',
    true, 'RECRUITING'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222',
    '홍콩', '홍콩', '2026-08-15', '2026-08-18',
    array['city', 'gourmet'], '홍콩 야경 투어 동행(마감)',
    '이미 마감된 홍콩 동행 모집글입니다.',
    true, 'CLOSED'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222',
    '대한민국', '제주', '2026-07-01', '2026-07-03',
    array['nature_hiking', 'family'], '제주 올레길 동행(마감)',
    '이미 마감된 제주 올레길 동행 모집글입니다.',
    true, 'CLOSED'
  )
on conflict (post_id) do nothing;

-- ============================================================================
-- 2. mate_applications — 2건(PENDING 1 + APPROVED 1), 전부 seed_member_b가 신청.
-- ============================================================================
insert into public.mate_applications (
  application_id, post_id, applicant_user_id, message_text, status, decided_at
) values
  (
    'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    '도쿄 미식 동행 신청합니다. 잘 부탁드려요!', 'PENDING', null
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    '방콕 야시장 투어 함께하고 싶습니다.', 'APPROVED', now()
  )
on conflict (application_id) do nothing;

-- ============================================================================
-- 3. user_blocks — 1건(seed_member_b가 seed_member_a를 차단).
-- ============================================================================
insert into public.user_blocks (block_id, blocker_user_id, blocked_user_id)
values (
  'cccccccc-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222'
)
on conflict (block_id) do nothing;

-- ============================================================================
-- 4. reports — 1건(seed_member_b가 seed_member_a의 모집글을 신고).
-- ============================================================================
insert into public.reports (
  report_id, receipt_number, reporter_user_id, target_type, target_id, reason, status
) values (
  'dddddddd-0000-0000-0000-000000000001',
  'SEED-REPORT-0001',
  '33333333-3333-3333-3333-333333333333',
  'MATE_POST',
  'aaaaaaaa-0000-0000-0000-000000000001',
  '테스트용 신고 사유입니다.',
  'RECEIVED'
)
on conflict (report_id) do nothing;

-- ============================================================================
-- 5. app_settings — 항공/호텔 외부 랜딩 URL(docs/01_PRD.md §8 연동 시스템 표 기준).
-- ============================================================================
insert into public.app_settings (key, value, updated_by)
values
  ('flight_landing_url', 'https://www.google.com/travel/flights', '11111111-1111-1111-1111-111111111111'),
  ('hotel_landing_url', 'https://www.booking.com', '11111111-1111-1111-1111-111111111111')
on conflict (key) do nothing;

commit;
