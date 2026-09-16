#!/usr/bin/env python3
"""
validate_inputs.py — Traveler Task 생성 Pipeline의 입력 검증 스크립트.

`.claude/skills/traveler-project-pipeline/SKILL.md`에 정의된 규칙을 근거로,
Task List(/gen-tasklist)를 생성하기 *전에* 입력 문서/현재 코드 트리가
일관된 상태인지 확인한다. 표준 라이브러리만 사용한다(외부 의존성 없음).

검사 11개:
  1. package.json에 Next.js 의존성이 있다.
  2. src/app/page.tsx와 src/app/layout.tsx가 존재한다.
  3. PRD·SRS·Project Scope·UI 문서가 존재한다.
  4. D-001 DESIGN.md와 LOCKED Manifest가 존재한다.
  5. SCREEN_ROUTE_CONTRACT.json을 JSON으로 파싱할 수 있다.
  6. Screen 수가 정확히 5개다.
  7. SCR-001~005가 모두 존재한다.
  8. Route가 `/`, `/about`, `/travel-tools`, `/mates`, `/account`다.
  9. Page Entry가 실제 Next.js App Router 경로 형식이다.
  10. PROJECT_SCOPE에 Baseline Requirement ID가 모두 등장한다.
  11. AWS·EC2가 활성 기술로 정의되지 않았다.

출력:
  성공 시 "VALIDATE_INPUTS_PASS"와 검사 수를 출력한다.
  실패 시 누락된 파일·Screen·Requirement ID를 출력하고 exit 1로 종료한다.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

EXPECTED_SCREEN_COUNT = 5
EXPECTED_SCREEN_IDS = [f"SCR-{i:03d}" for i in range(1, 6)]
EXPECTED_ROUTES = {"/", "/about", "/travel-tools", "/mates", "/account"}
PAGE_ENTRY_PATTERN = re.compile(r"^src/app(/[A-Za-z0-9_\-\[\]]+)*/page\.tsx$")

PRD_FILE = "docs/01_PRD.md"
SRS_FILE = "docs/02_SRS_BASELINE.md"
PROJECT_SCOPE_FILE = "docs/PROJECT_SCOPE.md"
UI_DOC_FILES = ["docs/03_UI_COVERAGE_ANALYSIS.md", "docs/04_UIUX_PLAN.md"]
DESIGN_MD_FILE = "design-reference/D-001/DESIGN.md"
DESIGN_MANIFEST_FILE = "design-reference/DESIGN_MANIFEST.md"
SCREEN_ROUTE_CONTRACT_FILE = "design-reference/SCREEN_ROUTE_CONTRACT.json"
TRACEABILITY_FILE = "docs/UIUX_TRACEABILITY.md"

FORBIDDEN_ACTIVE_TECH = ["aws", "ec2"]

# 이 프로젝트의 실제 Baseline Requirement 총수는 REQ-FUNC 42개 + REQ-NFR 35개(합계 77개,
# 도메인 접두어 ID 체계)다. "REQ-FUNC 80개·REQ-NF 34개"(합계 114개) 같은 순번 표기는
# 이 프로젝트에 존재하지 않는다(SKILL.md §0 참조). 검사 10은 하드코딩된 80/34가 아니라
# docs/UIUX_TRACEABILITY.md에 등재된 실제 Baseline ID 전체가 PROJECT_SCOPE.md에도
# 빠짐없이 등장하는지를 검증한다.
REQUIREMENT_ID_PATTERN = re.compile(r"REQ-(?:FUNC|NFR)-[A-Z]+-\d{3}(?:-\d+)?")

CHECK_COUNT = 11

missing_files: list[str] = []
missing_screens: list[str] = []
missing_requirement_ids: list[str] = []
other_failures: list[str] = []

check_results: list[tuple[int, str, bool]] = []


def record(check_no: int, name: str, ok: bool) -> None:
    check_results.append((check_no, name, ok))


def read_text(rel_path: str) -> str | None:
    p = ROOT / rel_path
    if not p.exists():
        return None
    return p.read_text(encoding="utf-8")


def check_file_exists(rel_path: str) -> bool:
    exists = (ROOT / rel_path).exists()
    if not exists:
        missing_files.append(rel_path)
    return exists


# 1. package.json에 Next.js 의존성이 있다.
def check_1_next_dependency() -> bool:
    text = read_text("package.json")
    if text is None:
        missing_files.append("package.json")
        return False
    try:
        pkg = json.loads(text)
    except json.JSONDecodeError:
        other_failures.append("package.json 파싱 실패(유효한 JSON 아님)")
        return False
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    ok = "next" in deps
    if not ok:
        other_failures.append("package.json에 next 의존성이 없습니다.")
    return ok


# 2. src/app/page.tsx와 src/app/layout.tsx가 존재한다.
def check_2_app_entrypoints() -> bool:
    ok1 = check_file_exists("src/app/page.tsx")
    ok2 = check_file_exists("src/app/layout.tsx")
    return ok1 and ok2


# 3. PRD·SRS·Project Scope·UI 문서가 존재한다.
def check_3_core_docs() -> bool:
    ok = check_file_exists(PRD_FILE)
    ok = check_file_exists(SRS_FILE) and ok
    ok = check_file_exists(PROJECT_SCOPE_FILE) and ok
    for f in UI_DOC_FILES:
        ok = check_file_exists(f) and ok
    return ok


# 4. D-001 DESIGN.md와 LOCKED Manifest가 존재한다.
def check_4_design_locked() -> bool:
    ok = check_file_exists(DESIGN_MD_FILE)
    manifest_text = read_text(DESIGN_MANIFEST_FILE)
    if manifest_text is None:
        missing_files.append(DESIGN_MANIFEST_FILE)
        return False
    locked_ok = "LOCKED" in manifest_text
    if not locked_ok:
        other_failures.append(f"{DESIGN_MANIFEST_FILE}에 'LOCKED' 상태 표기가 없습니다.")
    return ok and locked_ok


# 5. SCREEN_ROUTE_CONTRACT.json을 JSON으로 파싱할 수 있다.
def check_5_parse_screen_route_contract() -> dict | None:
    text = read_text(SCREEN_ROUTE_CONTRACT_FILE)
    if text is None:
        missing_files.append(SCREEN_ROUTE_CONTRACT_FILE)
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        other_failures.append(f"{SCREEN_ROUTE_CONTRACT_FILE} JSON 파싱 오류: {exc}")
        return None


# 6. Screen 수가 정확히 5개다.
def check_6_screen_count(contract: dict | None) -> bool:
    if contract is None:
        return False
    screens = contract.get("screens", [])
    ok = len(screens) == EXPECTED_SCREEN_COUNT
    if not ok:
        other_failures.append(
            f"Screen 수가 {EXPECTED_SCREEN_COUNT}개가 아닙니다(실제 {len(screens)}개)."
        )
    return ok


# 7. SCR-001~005가 모두 존재한다.
def check_7_all_screen_ids_present(contract: dict | None) -> bool:
    if contract is None:
        return False
    screens = contract.get("screens", [])
    found_ids = {s.get("screen_id") for s in screens}
    missing = [sid for sid in EXPECTED_SCREEN_IDS if sid not in found_ids]
    missing_screens.extend(missing)
    return not missing


# 8. Route가 `/`, `/about`, `/travel-tools`, `/mates`, `/account`다.
def check_8_routes_match(contract: dict | None) -> bool:
    if contract is None:
        return False
    screens = contract.get("screens", [])
    routes = {s.get("route") for s in screens}
    ok = routes == EXPECTED_ROUTES
    if not ok:
        missing = sorted(EXPECTED_ROUTES - routes)
        extra = sorted(routes - EXPECTED_ROUTES)
        if missing:
            other_failures.append(f"누락된 Route: {missing}")
        if extra:
            other_failures.append(f"예상 밖 Route: {extra}")
    return ok


# 9. Page Entry가 실제 Next.js App Router 경로 형식이다.
def check_9_page_entry_format(contract: dict | None) -> bool:
    if contract is None:
        return False
    screens = contract.get("screens", [])
    bad = [
        (s.get("screen_id"), s.get("page_entry"))
        for s in screens
        if not (s.get("page_entry") and PAGE_ENTRY_PATTERN.match(s.get("page_entry")))
    ]
    if bad:
        other_failures.append(f"App Router 형식(src/app/.../page.tsx)이 아닌 Page Entry: {bad}")
    return not bad


# 10. PROJECT_SCOPE에 Baseline Requirement ID가 모두 등장한다.
def check_10_project_scope_requirement_coverage() -> bool:
    scope_text = read_text(PROJECT_SCOPE_FILE)
    trace_text = read_text(TRACEABILITY_FILE)
    if scope_text is None:
        missing_files.append(PROJECT_SCOPE_FILE)
        return False
    if trace_text is None:
        missing_files.append(TRACEABILITY_FILE)
        return False

    baseline_ids = sorted(set(REQUIREMENT_ID_PATTERN.findall(trace_text)))
    if not baseline_ids:
        other_failures.append(
            f"{TRACEABILITY_FILE}에서 Baseline Requirement ID를 하나도 찾지 못했습니다."
        )
        return False

    scope_ids = set(REQUIREMENT_ID_PATTERN.findall(scope_text))
    missing = [rid for rid in baseline_ids if rid not in scope_ids]
    missing_requirement_ids.extend(missing)

    func_total = sum(1 for r in baseline_ids if r.startswith("REQ-FUNC-"))
    nfr_total = sum(1 for r in baseline_ids if r.startswith("REQ-NFR-"))
    print(
        f"  [info] Baseline Requirement 실제 총수: REQ-FUNC {func_total}개 + REQ-NFR {nfr_total}개 "
        f"= {len(baseline_ids)}개 (docs/UIUX_TRACEABILITY.md 기준; "
        f"'REQ-FUNC 80개·REQ-NF 34개' 표기는 이 프로젝트의 실제 ID 체계와 다릅니다)"
    )

    return not missing


# 11. AWS·EC2가 활성 기술로 정의되지 않았다.
def check_11_no_active_aws_ec2() -> bool:
    text = read_text("package.json")
    if text is None:
        missing_files.append("package.json")
        return False
    try:
        pkg = json.loads(text)
    except json.JSONDecodeError:
        other_failures.append("package.json 파싱 실패(유효한 JSON 아님)")
        return False
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    active = [name for name in deps if any(kw in name.lower() for kw in FORBIDDEN_ACTIVE_TECH)]
    if active:
        other_failures.append(f"package.json에 활성 AWS/EC2 관련 의존성이 있습니다: {active}")
    return not active


def main() -> int:
    contract = check_5_parse_screen_route_contract()

    record(1, "next_dependency", check_1_next_dependency())
    record(2, "app_entrypoints", check_2_app_entrypoints())
    record(3, "core_docs_exist", check_3_core_docs())
    record(4, "design_locked", check_4_design_locked())
    record(5, "screen_route_contract_parses", contract is not None)
    record(6, "screen_count_is_5", check_6_screen_count(contract))
    record(7, "all_screen_ids_present", check_7_all_screen_ids_present(contract))
    record(8, "routes_match_expected", check_8_routes_match(contract))
    record(9, "page_entry_is_app_router_format", check_9_page_entry_format(contract))
    record(10, "project_scope_covers_all_requirements", check_10_project_scope_requirement_coverage())
    record(11, "no_active_aws_ec2", check_11_no_active_aws_ec2())

    print("=" * 70)
    print("Traveler Task Pipeline — validate_inputs.py")
    print("=" * 70)
    for no, name, ok in check_results:
        print(f"[{'PASS' if ok else 'FAIL'}] {no:02d}. {name}")
    print("-" * 70)

    failed = [r for r in check_results if not r[2]]
    if not failed:
        print(f"VALIDATE_INPUTS_PASS ({len(check_results)}/{CHECK_COUNT} 검사 통과)")
        return 0

    print(f"검사 실패: {len(failed)}/{CHECK_COUNT}")
    if missing_files:
        print(f"누락된 파일: {sorted(set(missing_files))}")
    if missing_screens:
        print(f"누락된 Screen: {sorted(set(missing_screens))}")
    if missing_requirement_ids:
        print(f"누락된 Requirement ID: {sorted(set(missing_requirement_ids))}")
    for f in other_failures:
        print(f"- {f}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
