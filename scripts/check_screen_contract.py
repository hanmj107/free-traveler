#!/usr/bin/env python3
"""
check_screen_contract.py — Free Traveler의 5개 고정 화면·Route 계약을 검사한다.

입력:
  - design-reference/SCREEN_ROUTE_CONTRACT.json  (Screen/Route/Page Entry 정본)
  - TASKS/TASK_MANIFEST.csv                      (Page Owner Task·Requirement Ref·Depends On 정본,
                                                    scripts/audit_tasks.py가 생성/갱신한다)
  - src/app 디렉터리                              (mode=ci·release에서만 실제 구현 파일을 검사)

실행 모드(--mode, 필수):
  - plan    : Page Owner와 경로 "계획"만 검사한다(SCREEN_ROUTE_CONTRACT.json·TASK_MANIFEST.csv만
              읽으며 src/app을 건드리지 않는다 — 코드가 아직 없어도 실행 가능).
  - ci      : plan의 모든 검사에 더해 실제 구현된 Page 파일(src/app/**/page.tsx)과 공개 경로를
              검사한다(기술 경로 아래 잘못된 page.tsx, 계약에 없는 여분의 page.tsx 등).
  - release : ci의 모든 검사에 더해 docs/preview-checks/SCR-001.md ~ SCR-005.md의 Preview
              Checkpoint 확인 여부를 검사한다.

검사:
  1. 고정 화면 5개(SCR-001 `/`, SCR-002 `/about`, SCR-003 `/travel-tools`, SCR-004 `/mates`,
     SCR-005 `/account`)가 SCREEN_ROUTE_CONTRACT.json에 정확히 존재한다.
  2. 각 화면의 Page Owner Task(Category=PAGE_OWNER)가 TASK_MANIFEST.csv에 정확히 1개다.
  3. 기술 경로(/auth/callback, /api/**, not-found)를 사용자 화면으로 세지 않는다.
  4. 여행지 상세·안전정보를 새 Page(Route)로 만들지 않았는지 검사한다(SCR-001 Drawer/Modal로만
     구현해야 한다).
  5. SCR-003 Page Owner Task가 여행 입력(항공·숙소)과 동행 작성 양쪽 요구를 모두 포함한다.
  6. (release 모드 전용) docs/preview-checks/SCR-001.md부터 SCR-005.md까지 사람의 Preview
     확인(CONFIRMED) 기록이 있는지 확인한다.

출력:
  - 위반이 없으면: SCREEN_CONTRACT_PASS (mode=...) 출력, exit 0
  - 위반이 있으면: 위반마다 파일·화면 ID·원인·수정 힌트를 출력, exit 1
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
SCREEN_ROUTE_CONTRACT_JSON = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
TASK_MANIFEST_CSV = ROOT / "TASKS" / "TASK_MANIFEST.csv"
SRC_APP_DIR = ROOT / "src" / "app"
PREVIEW_CHECKS_DIR = ROOT / "docs" / "preview-checks"

# "고정 화면" — 이 5개는 스크립트 안에 직접 고정해 둔 정본이다. SCREEN_ROUTE_CONTRACT.json이
# 이 목록과 다르면(추가/누락/Route 변경) 검사 1이 실패한다 — 계약 파일 자체를 그대로
# 신뢰하지 않고 독립적인 기준으로 대조하기 위함이다.
FIXED_SCREENS: dict[str, str] = {
    "SCR-001": "/",
    "SCR-002": "/about",
    "SCR-003": "/travel-tools",
    "SCR-004": "/mates",
    "SCR-005": "/account",
}
SCREEN_ORDER = list(FIXED_SCREENS)

# 허용 기술 경로 — SCREEN_ROUTE_CONTRACT.json의 technical_routes[]가 사용하는 표기와 맞춘다.
ALLOWED_TECHNICAL_ROUTES = {"/auth/callback", "/api/*", "*"}

# 여행지 상세·안전정보를 새 Page(Route)로 만드는 것을 금지하는 패턴(검사 4).
FORBIDDEN_NEW_SCREEN_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(r"^/?destinations?(/|$)", re.IGNORECASE),
        "여행지 상세는 새 Route가 아니라 SCR-001(`/`)의 여행지 상세 Drawer/Modal로만 구현한다.",
    ),
    (
        re.compile(r"^/?(safety|countries?)(/|$)", re.IGNORECASE),
        "국가별 안전정보는 새 Route가 아니라 SCR-001(`/`)의 안전정보 패널로만 구현한다.",
    ),
]

errors: list[dict[str, str]] = []


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(p).replace("\\", "/")


def record_error(check_no: int, file: str, screen_id: str, message: str, hint: str) -> None:
    errors.append(
        {
            "check": str(check_no),
            "file": file,
            "screen_id": screen_id,
            "message": message,
            "hint": hint,
        }
    )


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def load_contract() -> dict:
    if not SCREEN_ROUTE_CONTRACT_JSON.exists():
        print(f"[오류] {rel(SCREEN_ROUTE_CONTRACT_JSON)}가 없습니다.")
        sys.exit(1)
    try:
        return json.loads(SCREEN_ROUTE_CONTRACT_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"[오류] {rel(SCREEN_ROUTE_CONTRACT_JSON)} JSON 파싱 실패: {e}")
        sys.exit(1)


def load_manifest() -> list[dict[str, str]]:
    if not TASK_MANIFEST_CSV.exists():
        print(f"[오류] {rel(TASK_MANIFEST_CSV)}가 없습니다. 먼저 `python scripts/audit_tasks.py`를 실행하십시오.")
        sys.exit(1)
    with open(TASK_MANIFEST_CSV, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


# ---------------------------------------------------------------------------
# 검사 1 — 고정 화면 5개가 정확히 존재한다
# ---------------------------------------------------------------------------

def check_1_fixed_screens_exist(contract: dict) -> None:
    screens = {s.get("screen_id"): s.get("route") for s in contract.get("screens", [])}
    for sid, expected_route in FIXED_SCREENS.items():
        if sid not in screens:
            record_error(
                1, rel(SCREEN_ROUTE_CONTRACT_JSON), sid,
                f"고정 화면 {sid}가 screens[]에 없습니다.",
                f"screens[]에 screen_id={sid}, route={expected_route!r} 항목을 추가하십시오.",
            )
            continue
        actual_route = screens[sid]
        if actual_route != expected_route:
            record_error(
                1, rel(SCREEN_ROUTE_CONTRACT_JSON), sid,
                f"Route 불일치: 계약 route={actual_route!r}, 고정 화면 목록 route={expected_route!r}",
                f"{sid}의 route를 {expected_route!r}로 맞추거나, 고정 화면 목록 자체를 바꾸려면 먼저 사람 승인을 받으십시오.",
            )
    extra = sorted(set(screens) - set(FIXED_SCREENS) - {None})
    for sid in extra:
        record_error(
            1, rel(SCREEN_ROUTE_CONTRACT_JSON), sid or "-",
            "고정 화면 5개 목록에 없는 추가 Screen이 계약에 존재합니다.",
            "5개 고정 화면 외 Screen을 추가하려면 먼저 사람 승인을 받아 이 스크립트의 FIXED_SCREENS와 문서를 함께 개정하십시오.",
        )
    if len(screens) != 5:
        record_error(
            1, rel(SCREEN_ROUTE_CONTRACT_JSON), "-",
            f"screens[] 개수가 5가 아닙니다(실제 {len(screens)}개).",
            "screens[]를 정확히 5개(SCR-001~SCR-005)로 맞추십시오.",
        )


# ---------------------------------------------------------------------------
# 검사 2 — 각 화면의 Page Owner Task가 정확히 하나다
# ---------------------------------------------------------------------------

def check_2_one_page_owner_per_screen(manifest_rows: list[dict[str, str]]) -> None:
    page_owner_screens: dict[str, list[str]] = {}
    for row in manifest_rows:
        if row.get("Category") != "PAGE_OWNER":
            continue
        for sid in (s.strip() for s in row.get("Screen", "").split(";")):
            if not sid:
                continue
            page_owner_screens.setdefault(sid, []).append(row["Task ID"])

    for sid in SCREEN_ORDER:
        task_ids = page_owner_screens.get(sid, [])
        if len(task_ids) == 0:
            record_error(
                2, rel(TASK_MANIFEST_CSV), sid,
                "Page Owner Task가 없습니다.",
                f"{sid}용 PAGE_OWNER Task를 TASKS/00_TASK_LIST.md에 추가하고 audit_tasks.py로 Manifest를 갱신하십시오.",
            )
        elif len(task_ids) > 1:
            record_error(
                2, rel(TASK_MANIFEST_CSV), sid,
                f"Page Owner Task가 {len(task_ids)}개입니다: {', '.join(task_ids)}",
                f"{sid}에는 정확히 1개의 PAGE_OWNER Task만 있어야 합니다 — 중복 Task를 통합하거나 제거하십시오.",
            )

    extra_screens = sorted(set(page_owner_screens) - set(SCREEN_ORDER))
    for sid in extra_screens:
        record_error(
            2, rel(TASK_MANIFEST_CSV), sid,
            f"고정 5개 화면 밖의 Screen({sid})에 Page Owner Task가 있습니다: {', '.join(page_owner_screens[sid])}",
            "고정 화면 목록에 없는 Screen의 PAGE_OWNER Task는 만들지 않는다 — Task를 제거하거나 Screen 값을 바로잡으십시오.",
        )


# ---------------------------------------------------------------------------
# 검사 3 — 기술 경로를 사용자 화면으로 세지 않는다
# ---------------------------------------------------------------------------

def check_3_technical_routes_not_screens(contract: dict, manifest_rows: list[dict[str, str]]) -> None:
    screens = {s.get("screen_id"): s.get("route") for s in contract.get("screens", [])}

    for t in contract.get("technical_routes", []):
        route = t.get("route")
        if route not in ALLOWED_TECHNICAL_ROUTES:
            record_error(
                3, rel(SCREEN_ROUTE_CONTRACT_JSON), "-",
                f"technical_routes[]의 route {route!r}가 허용 기술 경로(/auth/callback, /api/*, not-found=\"*\") 밖입니다.",
                "route 값을 허용된 기술 경로 표기 중 하나로 수정하거나 이 항목을 제거하십시오.",
            )
        if t.get("counted_as_screen", False):
            record_error(
                3, rel(SCREEN_ROUTE_CONTRACT_JSON), "-",
                f"기술 경로 {route!r}의 counted_as_screen이 true입니다.",
                "technical_routes[].counted_as_screen을 false로 되돌리십시오(기술 경로는 5개 화면 수에 포함하지 않는다).",
            )

    for sid, route in screens.items():
        if route in ALLOWED_TECHNICAL_ROUTES or (route or "").startswith("/api"):
            record_error(
                3, rel(SCREEN_ROUTE_CONTRACT_JSON), sid or "-",
                f"기술 경로({route})가 screens[]에 사용자 화면으로 등록돼 있습니다.",
                "이 항목을 screens[]에서 제거하고 technical_routes[]로 옮기십시오.",
            )

    for row in manifest_rows:
        route = (row.get("Route") or "").strip()
        if not route:
            continue
        if route in ALLOWED_TECHNICAL_ROUTES or route.startswith("/api"):
            record_error(
                3, rel(TASK_MANIFEST_CSV), row.get("Screen") or "-",
                f"Task {row['Task ID']}의 Route({route})가 기술 경로인데 Screen 값이 설정돼 있습니다.",
                "기술 경로를 다루는 Task는 Screen 열을 비워 5개 사용자 화면에 집계되지 않게 하십시오.",
            )


def check_3_filesystem_technical_routes(mode: str) -> None:
    """mode=ci·release에서만: 기술 경로 아래에 사용자 화면(page.tsx)이 생기지 않았는지 확인한다."""
    if mode == "plan" or not SRC_APP_DIR.exists():
        return
    for p in sorted(SRC_APP_DIR.rglob("page.tsx")):
        rel_path = p.relative_to(SRC_APP_DIR).as_posix()
        if rel_path == "auth/callback/page.tsx" or rel_path.startswith("auth/callback/"):
            record_error(
                3, rel(p), "-",
                "기술 경로 /auth/callback 아래에 page.tsx(사용자 화면)가 있습니다.",
                "이 경로는 route.ts(Route Handler)만 가져야 합니다 — page.tsx를 제거하십시오.",
            )
        if rel_path.startswith("api/"):
            record_error(
                3, rel(p), "-",
                "기술 경로 /api/** 아래에 page.tsx(사용자 화면)가 있습니다.",
                "API 경로는 route.ts(Route Handler)만 가져야 합니다 — page.tsx를 제거하십시오.",
            )


# ---------------------------------------------------------------------------
# 검사 4 — 여행지 상세·안전정보를 새 Page로 만들지 않았는지 검사
# ---------------------------------------------------------------------------

def check_4_no_new_content_pages_contract(contract: dict, manifest_rows: list[dict[str, str]]) -> None:
    for s in contract.get("screens", []):
        route = s.get("route", "") or ""
        for pattern, hint in FORBIDDEN_NEW_SCREEN_PATTERNS:
            if pattern.match(route):
                record_error(
                    4, rel(SCREEN_ROUTE_CONTRACT_JSON), s.get("screen_id", "-"),
                    f"금지된 신규 Route 패턴과 일치: {route}",
                    hint,
                )

    for row in manifest_rows:
        route = (row.get("Route") or "").strip()
        if not route:
            continue
        for pattern, hint in FORBIDDEN_NEW_SCREEN_PATTERNS:
            if pattern.match(route):
                record_error(
                    4, rel(TASK_MANIFEST_CSV), row.get("Screen") or "-",
                    f"Task {row['Task ID']}의 Route({route})가 금지된 신규 Route 패턴과 일치합니다.",
                    hint,
                )


def check_4_filesystem_no_stray_pages(mode: str, contract: dict) -> None:
    """mode=ci·release에서만: 계약에 없는 여분의 page.tsx(=새로 만든 Page)가 있는지 확인한다."""
    if mode == "plan" or not SRC_APP_DIR.exists():
        return
    allowed_entries = {s.get("page_entry") for s in contract.get("screens", [])}
    for p in sorted(SRC_APP_DIR.rglob("page.tsx")):
        entry = "src/app/" + p.relative_to(SRC_APP_DIR).as_posix()
        if entry in allowed_entries:
            continue
        route_dir = p.relative_to(SRC_APP_DIR).parent.as_posix()
        route_guess = "" if route_dir == "." else route_dir
        looks_like_content_page = any(
            kw in route_guess.lower() for kw in ("destination", "safety", "countr")
        )
        if looks_like_content_page:
            hint = "여행지 상세·안전정보는 SCR-001의 Drawer/Modal로만 구현한다 — 이 Page 파일을 삭제하고 SCR-001 Component로 흡수하십시오."
        else:
            hint = (
                "고정 5개 화면 외의 새 Page를 만들지 않는다 — 불필요한 Page라면 삭제하고, "
                "정말 필요한 화면이면 먼저 design-reference/SCREEN_ROUTE_CONTRACT.json 개정과 사람 승인을 받으십시오."
            )
        record_error(
            4, rel(p), "-",
            f"고정 5개 화면·기술 경로 어디에도 없는 Page 파일: {entry}",
            hint,
        )


# ---------------------------------------------------------------------------
# 검사 5 — SCR-003 Task가 여행 입력과 동행 작성 양쪽 요구를 포함한다
# ---------------------------------------------------------------------------

def check_5_scr003_covers_both(manifest_rows: list[dict[str, str]]) -> None:
    scr003_page_owners = [
        row for row in manifest_rows
        if row.get("Category") == "PAGE_OWNER" and "SCR-003" in row.get("Screen", "").split(";")
    ]
    if not scr003_page_owners:
        record_error(
            5, rel(TASK_MANIFEST_CSV), "SCR-003",
            "SCR-003 Page Owner Task를 찾을 수 없습니다.",
            "검사 2가 이미 이 문제를 보고했을 것입니다 — 먼저 SCR-003 Page Owner Task부터 만드십시오.",
        )
        return

    for row in scr003_page_owners:
        req_refs = [r.strip() for r in row.get("Requirement Refs", "").split(";") if r.strip()]
        depends_on = [d.strip() for d in row.get("Depends On", "").split(";") if d.strip()]

        has_travel_input_req = any(r.startswith("REQ-FUNC-FLIGHT-") or r.startswith("REQ-FUNC-HOTEL-") for r in req_refs)
        has_mate_req = any(r.startswith("REQ-FUNC-MATE-") for r in req_refs)
        has_travel_component = any("FLIGHT" in d.upper() or "HOTEL" in d.upper() for d in depends_on)
        has_mate_component = any("MATE" in d.upper() for d in depends_on)

        if not (has_travel_input_req and has_travel_component):
            record_error(
                5, rel(TASK_MANIFEST_CSV), "SCR-003",
                f"{row['Task ID']}에 여행 입력(항공·숙소) Requirement Ref 또는 Component 연결이 부족합니다.",
                "Requirement Refs에 REQ-FUNC-FLIGHT-*/REQ-FUNC-HOTEL-*를 포함하고, Depends On에 FLIGHT-FORM·HOTEL-FORM Component Task를 연결하십시오.",
            )
        if not (has_mate_req and has_mate_component):
            record_error(
                5, rel(TASK_MANIFEST_CSV), "SCR-003",
                f"{row['Task ID']}에 동행 작성(MATE) Requirement Ref 또는 Component 연결이 부족합니다.",
                "Requirement Refs에 REQ-FUNC-MATE-*를 포함하고, Depends On에 MATE-COMPOSE Component Task를 연결하십시오.",
            )


# ---------------------------------------------------------------------------
# 검사 6 (release 전용) — Preview Checkpoint 확인
# ---------------------------------------------------------------------------

def check_6_preview_checkpoints(mode: str) -> None:
    if mode != "release":
        return
    for sid in SCREEN_ORDER:
        p = PREVIEW_CHECKS_DIR / f"{sid}.md"
        if not p.exists():
            record_error(
                6, rel(p), sid,
                "Preview Checkpoint 문서가 없습니다.",
                f"사람이 {sid} 화면을 실제로 Preview로 확인한 뒤 {rel(p)}를 작성하고 확인 상태를 CONFIRMED로 기록하십시오(루트 CLAUDE.md 규칙 22).",
            )
            continue
        text = p.read_text(encoding="utf-8")
        if not re.search(r"\bCONFIRMED\b", text, re.IGNORECASE):
            record_error(
                6, rel(p), sid,
                "Preview Checkpoint 문서는 있지만 CONFIRMED 표시가 없습니다.",
                "사람이 실제로 Preview를 확인한 뒤에만 CONFIRMED로 기록하십시오(추측이나 사전 채움 금지).",
            )


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Traveler 5개 화면 Screen/Route 계약 검사")
    parser.add_argument(
        "--mode",
        choices=["plan", "ci", "release"],
        required=True,
        help="plan: 계획 문서만 검사 / ci: 구현된 Page까지 검사 / release: ci + Preview Checkpoint 확인",
    )
    args = parser.parse_args()
    mode = args.mode

    contract = load_contract()
    manifest_rows = load_manifest()

    check_1_fixed_screens_exist(contract)
    check_2_one_page_owner_per_screen(manifest_rows)
    check_3_technical_routes_not_screens(contract, manifest_rows)
    check_3_filesystem_technical_routes(mode)
    check_4_no_new_content_pages_contract(contract, manifest_rows)
    check_4_filesystem_no_stray_pages(mode, contract)
    check_5_scr003_covers_both(manifest_rows)
    check_6_preview_checkpoints(mode)

    print("=" * 70)
    print(f"Traveler Screen/Route Contract — check_screen_contract.py (mode={mode})")
    print("=" * 70)

    if not errors:
        print(f"SCREEN_CONTRACT_PASS (mode={mode})")
        return 0

    for e in errors:
        print(f"[FAIL] 검사 {e['check']} | 파일: {e['file']} | 화면: {e['screen_id']}")
        print(f"        원인: {e['message']}")
        print(f"        수정 힌트: {e['hint']}")
        print()

    print(f"SCREEN_CONTRACT_FAIL (mode={mode}) — {len(errors)}건")
    return 1


if __name__ == "__main__":
    sys.exit(main())
