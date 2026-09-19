# CHECK-MANUAL-PERFORMANCE — 성능 수동 확인(Lighthouse)

- **상태:** PENDING(대부분 실제 브라우저/배포 URL이 있어야 측정 가능한 항목)

## TC-01 — Lighthouse LCP p75 목표 측정(PERF-001)

- **상태:** PENDING — Lighthouse는 실제 브라우저(Chrome DevTools 또는
  `npx lighthouse`)로 사람이 직접 실행해야 하는 Manual Check 항목이다. Vercel
  Preview/Production URL이 생긴 뒤 5개 경로(`/`, `/about`, `/travel-tools`,
  `/mates`, `/account`)에 대해 각각 실행하고 LCP 값을 기록한다.

## TC-02 — Filter 응답 체감 측정(PERF-002)

- **상태:** PENDING — SCR-001 국내/해외 여행지 계절·기간·테마 Filter, SCR-004
  검색 Filter를 실제로 조작하며 체감 지연을 확인한다.

## TC-03 — 입력 검증 지연 체감 측정(PERF-003)

- **상태:** PENDING — SCR-003 항공/숙소 Form, SCR-005 계정 Form 등에서 실시간
  검증 오류 표시 지연을 체감으로 확인한다.

## TC-04 — 여행지 상세 meta title/description/canonical/OG 태그 확인(CONTENT-001)

- **상태:** 부분 확인, 개선 필요 항목 발견
- `/`, `/about`은 각각 고유한 `title`/`description`을 가지고 있음을 코드로
  확인했다(더 이상 "Create Next App" 기본값이 아니다 — 이번에
  `src/app/layout.tsx`의 Root 기본 metadata도 "Create Next App"/`lang="en"`으로
  남아 있던 것을 발견해 Free Traveler 기본값 + `lang="ko"`로 함께 고쳤다).
- `/travel-tools`, `/mates`, `/account`는 전부 Client Component 페이지라 Next.js
  제약상 자체 `metadata`를 export할 수 없다 — 지금은 Root layout의 공통
  기본값을 그대로 물려받는다(페이지별 고유 title은 아니다). 이 3개 화면에
  페이지별 metadata가 꼭 필요하다면 각 페이지를 "Server Component 껍데기 +
  Client 내부 Component"로 분리해야 하는데, 이는 새 Component 파일 생성이 필요해
  이번 Task(Expected Files: 이 체크리스트 파일 하나)의 범위를 넘어간다 — 후속
  작업으로 남긴다.
- **"여행지 상세"** 콘텐츠는 SCR-001 화면 안에서 클릭 시 열리는 Drawer(모달)로
  구현돼 있어 별도 URL/Route가 없다(설계상 동일 화면 위에서 열리는 구조,
  `design-reference/D-001/DESIGN.md` §14). 따라서 "여행지 상세"만의 독립된
  meta 태그는 이 설계에서는 애초에 존재할 수 없다 — Drawer가 아니라 SCR-001
  Route 전체의 메타데이터가 이 항목의 실질적인 대상이다.
- `alternates.canonical`/`openGraph` 태그는 아직 어떤 페이지에도 없다. 실제
  배포 도메인이 아직 없어(Vercel Project 미생성) 정확한 canonical URL을 지금
  넣으면 틀린 값이 될 수 있으므로 추가하지 않았다 — Vercel 배포 도메인이
  확정되면 `metadataBase`(Root layout)와 각 페이지의 `alternates.canonical`/
  `openGraph`를 추가하는 후속 작업이 필요하다.

## 다음에 할 일

1. Vercel Project 생성 후 발급된 도메인으로 `src/app/layout.tsx`에
   `metadataBase`를 설정하고, `/`·`/about`에 `openGraph`/`alternates.canonical`을
   추가한다.
2. 그 도메인으로 TC-01(Lighthouse)·TC-02·TC-03을 사람이 직접 측정해 이 파일에
   결과를 기록한다.
