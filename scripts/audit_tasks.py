#!/usr/bin/env python3
"""
audit_tasks.py — Traveler Task 생성 Pipeline의 최종 감사 스크립트.

입력:
  - TASKS/00_TASK_LIST.md   (Task List 원본)
  - TASKS/TASK-*.md         (Task 상세 파일)
  - docs/PROJECT_SCOPE.md   (Baseline Requirement 77개 IMPLEMENT/EXCLUDED 정본)
  - design-reference/SCREEN_ROUTE_CONTRACT.json (Screen/Route/Page Entry 정본)

18개 검사를 수행하고, 산출물로 TASKS/TASK_MANIFEST.csv와
TASKS/TASK_AUDIT_REPORT.md를 생성한다. 표준 라이브러리만 사용한다.

출력:
  - 성공 시: "AUDIT_PASS"와 검사 수를 출력하고 exit 0
  - 실패 시: 실패한 검사와 상세를 출력하고 exit 1
"""

from __future__ import annotations

import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

TASK_LIST_MD = ROOT / "TASKS" / "00_TASK_LIST.md"
TASKS_DIR = ROOT / "TASKS"
PROJECT_SCOPE_MD = ROOT / "docs" / "PROJECT_SCOPE.md"
SCREEN_ROUTE_CONTRACT_JSON = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"

MANIFEST_CSV = ROOT / "TASKS" / "TASK_MANIFEST.csv"
AUDIT_REPORT_MD = ROOT / "TASKS" / "TASK_AUDIT_REPORT.md"

HARNESS_SCHEMA = "traveler-screen-route-v1"

REQUIRED_DB_TABLES = {
    "profiles",
    "mate_posts",
    "mate_applications",
    "user_blocks",
    "reports",
    "app_settings",
}
# "6개 기본 테이블을 크게 넘지 않음" — 정확히 6개를 넘어서도 소폭의 여유(보조 타입/뷰 등)는
# 허용하되, 그 이상 늘어나면 위반으로 본다.
DB_TABLE_COUNT_TOLERANCE = 3  # 6 + 3 = 9까지 허용

FORBIDDEN_KEYWORDS = ["EC2", "AWS", "자동 병합", "auto-merge", "auto merge", "automerge"]
NEGATION_MARKERS = [
    "금지", "않는다", "제외", "구성하지", "추가하지", "만들지", "사용하지",
    "구축하지", "없다", "미구현", "제거", "미사용",
    "no_active", "not_", "not implemented", "forbidden", "prohibited",
]

_MD_COLUMNS = [
    "seq", "task_id", "title", "category", "impl_status", "req_ref", "screen",
    "route", "page_entry", "depends_on", "expected_files", "functional_ac",
    "visual_ac", "security_privacy_ac", "verify", "priority",
]

CANONICAL_SCREENS = [f"SCR-{i:03d}" for i in range(1, 6)]

RESULTS: list[tuple[int, str, bool, str]] = []


def check(no: int, name: str, ok: bool, detail: str = "") -> None:
    RESULTS.append((no, name, ok, detail))


def fail_and_exit(message: str) -> int:
    print(message)
    return 1


def _strip_backticks(s: str) -> str:
    return s.strip().strip("`").strip()


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def load_tasks() -> list[dict] | None:
    if not TASK_LIST_MD.exists():
        return None
    text = TASK_LIST_MD.read_text(encoding="utf-8")
    tasks = []
    for line in text.splitlines():
        if not re.match(r"^\|\s*\d+\s*\|", line):
            continue
        parts = [p.strip() for p in line.split("|")][1:-1]
        if len(parts) != len(_MD_COLUMNS):
            continue
        row = dict(zip(_MD_COLUMNS, parts))

        dep_raw = row["depends_on"].strip()
        depends_on = [] if dep_raw in ("-", "") else [d.strip() for d in dep_raw.split(",")]

        req_ids = re.findall(r"REQ-(?:FUNC|NFR)-[A-Z]+-\d{3}(?:-\d+)?", row["req_ref"])

        page_entry = _strip_backticks(row["page_entry"])
        page_entry = None if page_entry in ("N/A", "-", "") else page_entry
        route = _strip_backticks(row["route"])
        route = None if route in ("-", "") else route

        screen_raw = row["screen"].strip()
        screens: list[str] = []
        if screen_raw not in ("-", ""):
            for token in screen_raw.split(","):
                token = token.strip()
                range_match = re.match(r"^SCR-(\d+)~SCR-(\d+)$", token)
                if range_match:
                    start, end = int(range_match.group(1)), int(range_match.group(2))
                    screens.extend(f"SCR-{n:03d}" for n in range(start, end + 1))
                else:
                    screens.append(token)

        expected_files = re.findall(r"`([^`]+)`", row["expected_files"])

        tasks.append({
            "seq": row["seq"],
            "task_id": row["task_id"],
            "title": row["title"],
            "category": row["category"],
            "screens": screens,
            "screen_id": screens[0] if screens else None,
            "route": route,
            "page_entry": page_entry,
            "depends_on": depends_on,
            "requirement_refs": req_ids,
            "expected_files": expected_files,
            "functional_ac": row["functional_ac"],
            "security_privacy_ac": row["security_privacy_ac"],
            "detail_file": f"TASK-{row['task_id']}.md",
        })
    return tasks


def load_excluded_requirements_from_tasklist() -> list[str]:
    if not TASK_LIST_MD.exists():
        return []
    text = TASK_LIST_MD.read_text(encoding="utf-8")
    lines = text.splitlines()
    excluded = []
    in_section = False
    for line in lines:
        if line.startswith("## 16."):
            in_section = True
            continue
        if in_section and line.startswith("## 17."):
            break
        if in_section and re.match(r"^\|\s*REQ-", line):
            parts = [p.strip() for p in line.split("|")][1:-1]
            if parts:
                excluded.append(parts[0])
    return excluded


def load_project_scope_requirements() -> dict[str, str]:
    """Parse docs/PROJECT_SCOPE.md tables: {requirement_id: 'IMPLEMENT'|'EXCLUDED'}."""
    if not PROJECT_SCOPE_MD.exists():
        return {}
    text = PROJECT_SCOPE_MD.read_text(encoding="utf-8")
    # 일부 행은 "IMPLEMENT(단순화)", "IMPLEMENT(구조적 충족)", "IMPLEMENT(모범사례 수준)"처럼
    # 괄호 주석이 붙어 있으므로 그 뒤의 괄호는 선택적으로 허용한다.
    pattern = re.compile(
        r"^\|\s*(REQ-(?:FUNC|NFR)-[A-Z0-9-]+)\s*\|[^|]*\|\s*(IMPLEMENT|EXCLUDED)(?:\([^)]*\))?\s*\|",
        re.MULTILINE,
    )
    result: dict[str, str] = {}
    for req_id, status in pattern.findall(text):
        result[req_id] = status
    return result


def load_screen_route_contract() -> dict | None:
    if not SCREEN_ROUTE_CONTRACT_JSON.exists():
        return None
    try:
        return json.loads(SCREEN_ROUTE_CONTRACT_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def detail_path(task: dict) -> Path:
    return TASKS_DIR / task["detail_file"]


def detail_text(task: dict) -> str:
    p = detail_path(task)
    return p.read_text(encoding="utf-8") if p.exists() else ""


# ---------------------------------------------------------------------------
# Checks 1~18
# ---------------------------------------------------------------------------

def check_01_one_to_one(tasks: list[dict]) -> None:
    task_ids = {t["task_id"] for t in tasks}
    on_disk = {p.name[len("TASK-"):-len(".md")] for p in TASKS_DIR.glob("TASK-*.md")}
    missing_files = sorted(task_ids - on_disk)
    orphan_files = sorted(on_disk - task_ids)
    ok = not missing_files and not orphan_files
    detail = ""
    if not ok:
        parts = []
        if missing_files:
            parts.append(f"상세 파일 없는 Task: {missing_files}")
        if orphan_files:
            parts.append(f"Task List에 없는 orphan 파일: {orphan_files}")
        detail = "; ".join(parts)
    check(1, "task_list_id_and_detail_file_1to1", ok, detail)


def check_02_no_duplicate_ids(tasks: list[dict]) -> None:
    ids = [t["task_id"] for t in tasks]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    check(2, "duplicate_task_id_count_is_0", not dupes, f"중복 Task ID: {dupes}" if dupes else "")


def check_03_depends_on_exist(tasks: list[dict]) -> None:
    ids = {t["task_id"] for t in tasks}
    missing = []
    for t in tasks:
        for dep in t["depends_on"]:
            if dep not in ids:
                missing.append((t["task_id"], dep))
    check(3, "depends_on_missing_count_is_0", not missing, f"존재하지 않는 Depends On 참조: {missing}" if missing else "")


def check_04_no_dependency_cycle(tasks: list[dict]) -> None:
    graph = {t["task_id"]: t["depends_on"] for t in tasks}
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {tid: WHITE for tid in graph}
    cycle_path: list[str] = []

    def dfs(node: str, stack: list[str]) -> bool:
        color[node] = GRAY
        stack.append(node)
        for dep in graph.get(node, []):
            if dep not in color:
                continue
            if color[dep] == GRAY:
                idx = stack.index(dep) if dep in stack else 0
                cycle_path.extend(stack[idx:] + [dep])
                return True
            if color[dep] == WHITE:
                if dfs(dep, stack):
                    return True
        stack.pop()
        color[node] = BLACK
        return False

    has_cycle = False
    for tid in graph:
        if color[tid] == WHITE:
            if dfs(tid, []):
                has_cycle = True
                break
    check(4, "dependency_cycle_count_is_0", not has_cycle, f"순환 의존 발견: {' -> '.join(cycle_path)}" if has_cycle else "")


def check_05_page_owner_per_screen(tasks: list[dict]) -> dict[str, dict]:
    page_owners = [t for t in tasks if t["category"] == "PAGE_OWNER"]
    by_screen: dict[str, list[dict]] = {}
    for po in page_owners:
        by_screen.setdefault(po["screen_id"], []).append(po)
    issues = []
    for sid in CANONICAL_SCREENS:
        n = len(by_screen.get(sid, []))
        if n != 1:
            issues.append(f"{sid}: Page Owner {n}개")
    extra_screens = set(by_screen) - set(CANONICAL_SCREENS)
    if extra_screens:
        issues.append(f"정의되지 않은 Screen에 Page Owner 존재: {sorted(extra_screens)}")
    check(5, "each_of_5_screens_has_exactly_1_page_owner", not issues, "; ".join(issues) if issues else "")
    return by_screen


def check_06_route_page_entry_expected_files_match(tasks: list[dict], contract: dict | None) -> None:
    page_owners = [t for t in tasks if t["category"] == "PAGE_OWNER"]
    contract_screens = {s["screen_id"]: s for s in (contract or {}).get("screens", [])}
    issues = []
    for po in page_owners:
        sid = po["screen_id"]
        ref = contract_screens.get(sid)
        if ref is None:
            issues.append(f"{po['task_id']}: SCREEN_ROUTE_CONTRACT.json에 {sid} 없음")
            continue
        if po["route"] != ref.get("route"):
            issues.append(f"{po['task_id']}: route 불일치 ({po['route']} != {ref.get('route')})")
        if po["page_entry"] != ref.get("page_entry"):
            issues.append(f"{po['task_id']}: page_entry 불일치 ({po['page_entry']} != {ref.get('page_entry')})")
        if ref.get("page_entry") not in po["expected_files"]:
            issues.append(f"{po['task_id']}: Expected Files에 page_entry({ref.get('page_entry')}) 없음")
    check(6, "route_page_entry_expected_files_match", not issues, "; ".join(issues) if issues else "")


def check_07_no_component_only_screen(tasks: list[dict], page_owner_screens: dict[str, list[dict]]) -> None:
    all_screens: set[str] = set()
    for t in tasks:
        for s in t["screens"]:
            all_screens.add(s)
    orphan_screens = sorted(s for s in all_screens if s not in page_owner_screens or not page_owner_screens.get(s))
    check(7, "component_only_screen_count_is_0", not orphan_screens, f"Page Owner 없이 Component/기타 Task만 참조하는 Screen: {orphan_screens}" if orphan_screens else "")


def check_08_scr001_starter_removal_ac(tasks_by_id: dict[str, dict]) -> None:
    t = tasks_by_id.get("PAGE-SCR001")
    if not t:
        check(8, "scr001_starter_removal_ac_exists", False, "PAGE-SCR001 Task가 없습니다.")
        return
    text = t["functional_ac"] + " " + detail_text(t)
    ok = ("Create Next App" in text or "스타터" in text) and ("제거" in text)
    check(8, "scr001_starter_removal_ac_exists", ok, "" if ok else "PAGE-SCR001에 Create Next App 스타터 제거 AC 문구가 없습니다.")


def check_09_scr003_three_tabs_ac(tasks_by_id: dict[str, dict]) -> None:
    t = tasks_by_id.get("PAGE-SCR003")
    if not t:
        check(9, "scr003_three_tab_assembly_ac_exists", False, "PAGE-SCR003 Task가 없습니다.")
        return
    text = t["functional_ac"] + " " + detail_text(t)
    ok = all(kw in text for kw in ("항공편", "숙소", "동행"))
    check(9, "scr003_three_tab_assembly_ac_exists", ok, "" if ok else "PAGE-SCR003에 항공편/숙소/동행 3개 탭 조립 AC 문구가 모두 있지 않습니다.")


def check_10_scr005_role_states_ac(tasks_by_id: dict[str, dict]) -> None:
    t = tasks_by_id.get("PAGE-SCR005")
    if not t:
        check(10, "scr005_role_state_assembly_ac_exists", False, "PAGE-SCR005 Task가 없습니다.")
        return
    text = t["functional_ac"] + " " + detail_text(t)
    ok = all(kw in text for kw in ("Guest", "Member", "Admin"))
    check(10, "scr005_role_state_assembly_ac_exists", ok, "" if ok else "PAGE-SCR005에 Guest/Member/Admin 역할별 상태 조립 AC 문구가 모두 있지 않습니다.")


def check_11_db_lifecycle_tasks_exist(tasks_by_id: dict[str, dict]) -> None:
    required = ["DB-SCHEMA-BASE", "DB-RLS-BASE", "DB-ACCESS", "DB-SEED-BASE"]
    missing = [r for r in required if r not in tasks_by_id]
    check(11, "db_schema_rls_access_seed_tasks_exist", not missing, f"누락된 DB Task: {missing}" if missing else "")


def check_12_db_table_scope(tasks_by_id: dict[str, dict]) -> None:
    t = tasks_by_id.get("DB-SCHEMA-BASE")
    if not t:
        check(12, "db_table_count_within_tolerance", False, "DB-SCHEMA-BASE Task가 없어 테이블 범위를 확인할 수 없습니다.")
        return
    scope_text = t["functional_ac"]
    found = set(re.findall(r"`([a-z_]+)`", scope_text))
    missing_required = REQUIRED_DB_TABLES - found
    over_limit = len(found) > len(REQUIRED_DB_TABLES) + DB_TABLE_COUNT_TOLERANCE
    issues = []
    if missing_required:
        issues.append(f"필수 테이블 누락: {sorted(missing_required)}")
    if over_limit:
        issues.append(f"테이블(또는 유사 식별자) {len(found)}개 발견 — 6개 기본 테이블 + 허용치({DB_TABLE_COUNT_TOLERANCE})를 초과")
    check(12, "db_table_count_within_tolerance", not issues, "; ".join(issues) if issues else "")


def check_13_external_input_no_persist_ac(tasks_by_id: dict[str, dict]) -> None:
    candidates = ["COMP-SCR003-FLIGHT-FORM", "COMP-SCR003-HOTEL-FORM", "PAGE-SCR003"]
    hit = False
    checked_any = False
    for tid in candidates:
        t = tasks_by_id.get(tid)
        if not t:
            continue
        checked_any = True
        text = t["functional_ac"] + " " + t["security_privacy_ac"] + " " + detail_text(t)
        if "서버" in text and ("미저장" in text or "미전송" in text or "저장하지 않는다" in text):
            hit = True
    ok = checked_any and hit
    check(
        13,
        "external_input_no_persist_ac_exists",
        ok,
        "" if ok else "항공/숙소 외부 입력값의 서버 비저장·미전송 AC 문구를 찾지 못했습니다.",
    )


def check_14_auth_adult_rls_ac(tasks_by_id: dict[str, dict]) -> None:
    issues = []
    auth_client = tasks_by_id.get("AUTH-SUPABASE-CLIENT")
    if not auth_client:
        issues.append("AUTH-SUPABASE-CLIENT Task 없음")
    adult = tasks_by_id.get("AUTH-ADULT-VERIFICATION")
    if not adult:
        issues.append("AUTH-ADULT-VERIFICATION Task 없음")
    elif "성인" not in (adult["functional_ac"] + detail_text(adult)):
        issues.append("AUTH-ADULT-VERIFICATION에 성인 확인 관련 AC 문구 없음")
    rls = tasks_by_id.get("DB-RLS-BASE")
    if not rls:
        issues.append("DB-RLS-BASE Task 없음")
    elif "RLS" not in (rls["functional_ac"] + detail_text(rls)):
        issues.append("DB-RLS-BASE에 RLS 관련 AC 문구 없음")
    check(14, "auth_adult_verification_and_basic_rls_ac_exists", not issues, "; ".join(issues) if issues else "")


def check_15_playwright_chromium_smoke_task_exists(tasks: list[dict], tasks_by_id: dict[str, dict]) -> None:
    e2e_tasks = [t for t in tasks if t["category"] == "E2E_TEST"]
    if not e2e_tasks:
        check(15, "playwright_chromium_smoke_task_exists", False, "E2E_TEST Task가 없습니다.")
        return
    non_compliant = []
    for t in e2e_tasks:
        text = (t["functional_ac"] + " " + detail_text(t)).lower()
        if "chromium" not in text or "smoke" not in text:
            non_compliant.append(t["task_id"])
    check(
        15,
        "playwright_chromium_smoke_task_exists",
        not non_compliant,
        f"Chromium/Smoke 문구가 없는 E2E Task: {non_compliant}" if non_compliant else "",
    )


def check_16_no_aws_ec2_automerge_task(tasks: list[dict]) -> None:
    violations = []
    haystacks = [("TASKS/00_TASK_LIST.md", TASK_LIST_MD.read_text(encoding="utf-8"))]
    for t in tasks:
        haystacks.append((t["detail_file"], detail_text(t)))
    for source, text in haystacks:
        for line in text.splitlines():
            for kw in FORBIDDEN_KEYWORDS:
                if re.search(re.escape(kw), line, re.IGNORECASE):
                    if not any(marker in line for marker in NEGATION_MARKERS):
                        violations.append(f"{source}: '{kw}' — {line.strip()[:100]}")
    check(16, "aws_ec2_automerge_implementation_task_count_is_0", not violations, "; ".join(violations) if violations else "")


def check_17_all_requirements_present(tasks: list[dict]) -> tuple[dict[str, str], list[str]]:
    scope_reqs = load_project_scope_requirements()
    func_total = sum(1 for r in scope_reqs if r.startswith("REQ-FUNC-"))
    nfr_total = sum(1 for r in scope_reqs if r.startswith("REQ-NFR-"))
    print(
        f"  [info] docs/PROJECT_SCOPE.md에서 파싱한 Baseline Requirement: "
        f"REQ-FUNC {func_total}개 + REQ-NFR {nfr_total}개 = {len(scope_reqs)}개. "
        f"'REQ-FUNC 80개·REQ-NF 34개'(합계 114개) 표기는 이 프로젝트의 실제 ID 체계와 다릅니다."
    )

    excluded_in_tasklist = set(load_excluded_requirements_from_tasklist())
    covered_by_tasks: set[str] = set()
    for t in tasks:
        covered_by_tasks |= set(t["requirement_refs"])

    all_accounted = covered_by_tasks | excluded_in_tasklist
    missing = sorted(set(scope_reqs) - all_accounted)
    check(
        17,
        "all_baseline_requirements_present_in_tasks_or_excluded_table",
        not missing,
        f"Task에도 EXCLUDED 표에도 없는 Requirement: {missing}" if missing else "",
    )
    return scope_reqs, sorted(excluded_in_tasklist)


def check_18_excluded_have_no_detail_file(tasks: list[dict], scope_reqs: dict[str, str], excluded_in_tasklist: list[str]) -> None:
    excluded_ids = {r for r, status in scope_reqs.items() if status == "EXCLUDED"} | set(excluded_in_tasklist)
    violations = []
    for t in tasks:
        hit = set(t["requirement_refs"]) & excluded_ids
        if hit:
            violations.append(f"{t['task_id']} (파일 {t['detail_file']})가 EXCLUDED Requirement를 구현 대상으로 참조: {sorted(hit)}")
    check(
        18,
        "excluded_requirements_have_no_implementation_detail_file",
        not violations,
        "; ".join(violations) if violations else "",
    )


# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

def write_manifest_csv(tasks: list[dict]) -> None:
    MANIFEST_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Seq", "Task ID", "Title", "Category", "Screen", "Route", "Page Entry",
            "Depends On", "Requirement Refs", "Detail File", "Detail File Exists",
        ])
        for t in tasks:
            writer.writerow([
                t["seq"],
                t["task_id"],
                t["title"],
                t["category"],
                ";".join(t["screens"]),
                t["route"] or "",
                t["page_entry"] or "",
                ";".join(t["depends_on"]),
                ";".join(t["requirement_refs"]),
                t["detail_file"],
                "TRUE" if detail_path(t).exists() else "FALSE",
            ])


def write_audit_report(exit_code: int, tasks_count: int) -> None:
    AUDIT_REPORT_MD.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    lines = [
        "# Traveler Task List — Final Audit Report",
        "",
        f"- **실행 시각(UTC):** {timestamp}",
        f"- **대상 Task 수:** {tasks_count}",
        f"- **결과:** {'AUDIT_PASS' if exit_code == 0 else 'AUDIT_FAIL'}",
        f"- **검사 수:** {len(RESULTS)}",
        "",
        "| # | 검사 | 결과 | 상세 |",
        "|---:|---|---|---|",
    ]
    for no, name, ok, detail in RESULTS:
        lines.append(f"| {no} | {name} | {'PASS' if ok else 'FAIL'} | {detail or '-'} |")
    AUDIT_REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def print_report() -> int:
    print("=" * 70)
    print("Traveler Task List — audit_tasks.py")
    print("=" * 70)
    failed = [r for r in RESULTS if not r[2]]
    for no, name, ok, detail in RESULTS:
        mark = "PASS" if ok else "FAIL"
        line = f"[{mark}] {no:02d}. {name}"
        if detail:
            line += f" — {detail}"
        print(line)
    print("-" * 70)
    exit_code = 1 if failed else 0
    if exit_code == 0:
        print(f"AUDIT_PASS ({len(RESULTS)}/{len(RESULTS)} 검사 통과)")
    else:
        print(f"AUDIT_FAIL ({len(RESULTS) - len(failed)}/{len(RESULTS)} 검사 통과, {len(failed)}개 실패)")
    print(f"산출물: {MANIFEST_CSV.relative_to(ROOT)}, {AUDIT_REPORT_MD.relative_to(ROOT)}")
    return exit_code


def main() -> int:
    tasks = load_tasks()
    if tasks is None:
        return fail_and_exit(f"{TASK_LIST_MD.relative_to(ROOT)}가 없습니다.")
    if not PROJECT_SCOPE_MD.exists():
        return fail_and_exit(f"{PROJECT_SCOPE_MD.relative_to(ROOT)}가 없습니다.")
    if not SCREEN_ROUTE_CONTRACT_JSON.exists():
        return fail_and_exit(f"{SCREEN_ROUTE_CONTRACT_JSON.relative_to(ROOT)}가 없습니다.")

    tasks_by_id = {t["task_id"]: t for t in tasks}
    contract = load_screen_route_contract()

    check_01_one_to_one(tasks)
    check_02_no_duplicate_ids(tasks)
    check_03_depends_on_exist(tasks)
    check_04_no_dependency_cycle(tasks)
    page_owner_screens = check_05_page_owner_per_screen(tasks)
    check_06_route_page_entry_expected_files_match(tasks, contract)
    check_07_no_component_only_screen(tasks, page_owner_screens)
    check_08_scr001_starter_removal_ac(tasks_by_id)
    check_09_scr003_three_tabs_ac(tasks_by_id)
    check_10_scr005_role_states_ac(tasks_by_id)
    check_11_db_lifecycle_tasks_exist(tasks_by_id)
    check_12_db_table_scope(tasks_by_id)
    check_13_external_input_no_persist_ac(tasks_by_id)
    check_14_auth_adult_rls_ac(tasks_by_id)
    check_15_playwright_chromium_smoke_task_exists(tasks, tasks_by_id)
    check_16_no_aws_ec2_automerge_task(tasks)
    scope_reqs, excluded_in_tasklist = check_17_all_requirements_present(tasks)
    check_18_excluded_have_no_detail_file(tasks, scope_reqs, excluded_in_tasklist)

    write_manifest_csv(tasks)
    exit_code = print_report()
    write_audit_report(exit_code, len(tasks))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
