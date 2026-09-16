#!/usr/bin/env python3
"""
validate_harness.py — Traveler 프로젝트의 Agent Harness(거버넌스 구성) 자체 검증 스크립트.

`validate_inputs.py`(입력 문서 검증)·`audit_tasks.py`(Task 산출물 감사)와는 다른 계층을
검증한다: 루트 `CLAUDE.md`·`.claude/skills/traveler-project-pipeline/SKILL.md`·
`.claude/commands/*.md`·`design-reference/SCREEN_ROUTE_CONTRACT.json`이 서로 정합하며,
Harness Marker·핵심 규칙이 실제로 문서에 존재하는지 확인한다. 표준 라이브러리만 사용한다.

검사 13개:
  1. CLAUDE.md 존재
  2. Claude Code Skill 파일 존재
  3. 7개 Command 존재
  4. traveler-screen-route-v1 Marker 존재
  5. D-001 DESIGN 경로 일치
  6. Screen Contract 경로 일치
  7. Page Owner 5개 규칙 존재
  8. DB Table 6개 기본 범위 존재
  9. 외부 입력 비저장 규칙 존재
  10. Playwright Chromium Smoke 규칙 존재
  11. AUTO_MERGE=false
  12. AWS_ENABLED=false
  13. EXCLUDED 보호 규칙 존재

출력:
  성공 시 "VALIDATE_HARNESS_PASS"와 검사 수를 출력한다.
  실패 시 누락된 파일·규칙을 출력하고 exit 1로 종료한다.
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

CLAUDE_MD_FILE = "CLAUDE.md"
SKILL_FILE = ".claude/skills/traveler-project-pipeline/SKILL.md"
COMMANDS_DIR = ".claude/commands"
DESIGN_MD_FILE = "design-reference/D-001/DESIGN.md"
DESIGN_MANIFEST_FILE = "design-reference/DESIGN_MANIFEST.md"
SCREEN_CONTRACT_FILE = "design-reference/SCREEN_ROUTE_CONTRACT.json"
TASK_LIST_FILE = "TASKS/00_TASK_LIST.md"
ARCHITECTURE_FILE = "docs/ARCHITECTURE.md"

EXPECTED_COMMANDS = [
    "gen-tasklist.md",
    "gen-task-details.md",
    "audit-tasks.md",
    "prepare-task.md",
    "implement-task.md",
    "run-wave.md",
    "release-check.md",
]

EXPECTED_DB_TABLES = [
    "profiles",
    "mate_posts",
    "mate_applications",
    "user_blocks",
    "reports",
    "app_settings",
]

EXPECTED_PAGE_OWNER_IDS = [f"PAGE-SCR00{i}" for i in range(1, 6)]
PAGE_OWNER_ROW_PATTERN = re.compile(
    r"^\|\s*\d+\s*\|\s*(PAGE-SCR00[1-5])\s*\|[^\n]*\|\s*PAGE_OWNER\s*\|", re.MULTILINE
)

CHECK_COUNT = 13

missing_files: list[str] = []
missing_rules: list[str] = []
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


# 1. CLAUDE.md 존재
def check_1_claude_md_exists() -> bool:
    return check_file_exists(CLAUDE_MD_FILE)


# 2. Claude Code Skill 파일 존재
def check_2_skill_file_exists() -> bool:
    return check_file_exists(SKILL_FILE)


# 3. 7개 Command 존재
def check_3_seven_commands_exist() -> bool:
    ok = True
    for cmd in EXPECTED_COMMANDS:
        if not check_file_exists(f"{COMMANDS_DIR}/{cmd}"):
            ok = False
    return ok


# 4. traveler-screen-route-v1 Marker 존재
def check_4_harness_schema_marker(claude_text: str | None) -> bool:
    if claude_text is None:
        return False
    ok = "HARNESS_SCHEMA=traveler-screen-route-v1" in claude_text
    if not ok:
        missing_rules.append("CLAUDE.md에 'HARNESS_SCHEMA=traveler-screen-route-v1' Marker가 없습니다.")
    return ok


# 5. D-001 DESIGN 경로 일치
def check_5_design_path_matches(claude_text: str | None) -> bool:
    if claude_text is None:
        return False
    marker_ok = "DESIGN_PATH=design-reference/D-001/DESIGN.md" in claude_text
    if not marker_ok:
        missing_rules.append("CLAUDE.md에 'DESIGN_PATH=design-reference/D-001/DESIGN.md' Marker가 없습니다.")

    file_ok = check_file_exists(DESIGN_MD_FILE)

    manifest_text = read_text(DESIGN_MANIFEST_FILE)
    manifest_ok = False
    if manifest_text is None:
        missing_files.append(DESIGN_MANIFEST_FILE)
    else:
        manifest_ok = "D-001" in manifest_text and "LOCKED" in manifest_text
        if not manifest_ok:
            missing_rules.append(f"{DESIGN_MANIFEST_FILE}에 'D-001'·'LOCKED' 상태 표기가 없습니다.")

    return marker_ok and file_ok and manifest_ok


# 6. Screen Contract 경로 일치
def check_6_screen_contract_matches(claude_text: str | None) -> dict | None:
    if claude_text is None:
        return None
    marker_ok = "SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json" in claude_text
    if not marker_ok:
        missing_rules.append(
            "CLAUDE.md에 'SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json' Marker가 없습니다."
        )

    text = read_text(SCREEN_CONTRACT_FILE)
    if text is None:
        missing_files.append(SCREEN_CONTRACT_FILE)
        return None
    try:
        contract = json.loads(text)
    except json.JSONDecodeError as exc:
        other_failures.append(f"{SCREEN_CONTRACT_FILE} JSON 파싱 오류: {exc}")
        return None

    schema_ok = contract.get("schema_version") == "traveler-screen-route-v1"
    if not schema_ok:
        other_failures.append(
            f"{SCREEN_CONTRACT_FILE}의 schema_version이 'traveler-screen-route-v1'이 아닙니다"
            f"(실제: {contract.get('schema_version')!r})."
        )

    if marker_ok and schema_ok:
        return contract
    return None


# 7. Page Owner 5개 규칙 존재
def check_7_page_owner_five_rule(claude_text: str | None, contract: dict | None) -> bool:
    rule_ok = False
    if claude_text is not None:
        rule_ok = "Page Owner" in claude_text and "조립" in claude_text
        if not rule_ok:
            missing_rules.append("CLAUDE.md에 Page Owner 조립 전용 규칙(규칙 9) 문구가 없습니다.")

    contract_ok = False
    if contract is not None:
        screens = contract.get("screens", [])
        owner_count = sum(1 for s in screens if s.get("page_owner_task_required") is True)
        contract_ok = owner_count == 5
        if not contract_ok:
            other_failures.append(
                f"{SCREEN_CONTRACT_FILE}에서 page_owner_task_required=true인 Screen이 5개가 아닙니다"
                f"(실제 {owner_count}개)."
            )

    task_list_text = read_text(TASK_LIST_FILE)
    task_list_ok = False
    if task_list_text is None:
        missing_files.append(TASK_LIST_FILE)
    else:
        found_ids = sorted(set(PAGE_OWNER_ROW_PATTERN.findall(task_list_text)))
        task_list_ok = found_ids == EXPECTED_PAGE_OWNER_IDS
        if not task_list_ok:
            other_failures.append(
                f"{TASK_LIST_FILE}에서 Category=PAGE_OWNER 행이 {EXPECTED_PAGE_OWNER_IDS}와 "
                f"일치하지 않습니다(실제: {found_ids})."
            )

    return rule_ok and contract_ok and task_list_ok


# 8. DB Table 6개 기본 범위 존재
def check_8_db_six_tables() -> bool:
    text = read_text(ARCHITECTURE_FILE)
    if text is None:
        missing_files.append(ARCHITECTURE_FILE)
        return False
    missing_tables = [t for t in EXPECTED_DB_TABLES if f"`{t}`" not in text]
    if missing_tables:
        other_failures.append(f"{ARCHITECTURE_FILE}에 다음 테이블명이 없습니다: {missing_tables}")
    limit_ok = "6개 테이블" in text or "6개로 제한" in text
    if not limit_ok:
        missing_rules.append(f"{ARCHITECTURE_FILE}에 'DB는 6개 테이블로 제한' 규칙 문구가 없습니다.")
    return not missing_tables and limit_ok


# 9. 외부 입력 비저장 규칙 존재
def check_9_external_input_no_persist_rule(claude_text: str | None) -> bool:
    if claude_text is None:
        return False
    ok = "항공" in claude_text and "숙소" in claude_text and "서버 API, DB, URL" in claude_text
    if not ok:
        missing_rules.append("CLAUDE.md에 항공·숙소 입력값 서버/DB/URL 미전송 규칙(규칙 12) 문구가 없습니다.")
    return ok


# 10. Playwright Chromium Smoke 규칙 존재
def check_10_playwright_chromium_smoke_rule(claude_text: str | None) -> bool:
    if claude_text is None:
        return False
    marker_ok = "PLAYWRIGHT_SCOPE=chromium-smoke" in claude_text
    if not marker_ok:
        missing_rules.append("CLAUDE.md에 'PLAYWRIGHT_SCOPE=chromium-smoke' Marker가 없습니다.")
    rule_ok = "Chromium Smoke Test" in claude_text
    if not rule_ok:
        missing_rules.append("CLAUDE.md에 'Chromium Smoke Test만' 작성 규칙(규칙 18) 문구가 없습니다.")
    return marker_ok and rule_ok


# 11. AUTO_MERGE=false
def check_11_auto_merge_false(claude_text: str | None) -> bool:
    if claude_text is None:
        return False
    ok = "AUTO_MERGE=false" in claude_text
    if not ok:
        missing_rules.append("CLAUDE.md에 'AUTO_MERGE=false' Marker가 없습니다.")
    return ok


# 12. AWS_ENABLED=false
def check_12_aws_enabled_false(claude_text: str | None) -> bool:
    if claude_text is None:
        return False
    ok = "AWS_ENABLED=false" in claude_text
    if not ok:
        missing_rules.append("CLAUDE.md에 'AWS_ENABLED=false' Marker가 없습니다.")
    return ok


# 13. EXCLUDED 보호 규칙 존재
def check_13_excluded_protection_rule(claude_text: str | None) -> bool:
    rule_ok = False
    if claude_text is not None:
        rule_ok = "EXCLUDED" in claude_text and "임의로 구현하지 않는다" in claude_text
        if not rule_ok:
            missing_rules.append("CLAUDE.md에 EXCLUDED 임의 구현 금지 규칙(규칙 19) 문구가 없습니다.")

    task_list_text = read_text(TASK_LIST_FILE)
    section_ok = False
    if task_list_text is None:
        missing_files.append(TASK_LIST_FILE)
    else:
        section_ok = "NON_IMPLEMENTATION" in task_list_text
        if not section_ok:
            other_failures.append(f"{TASK_LIST_FILE}에 §16 'NON_IMPLEMENTATION' 절이 없습니다.")

    return rule_ok and section_ok


def main() -> int:
    claude_text = read_text(CLAUDE_MD_FILE)
    if claude_text is None:
        missing_files.append(CLAUDE_MD_FILE)

    record(1, "claude_md_exists", check_1_claude_md_exists())
    record(2, "skill_file_exists", check_2_skill_file_exists())
    record(3, "seven_commands_exist", check_3_seven_commands_exist())
    record(4, "harness_schema_marker", check_4_harness_schema_marker(claude_text))
    record(5, "design_path_matches", check_5_design_path_matches(claude_text))

    contract = check_6_screen_contract_matches(claude_text)
    record(6, "screen_contract_matches", contract is not None)

    record(7, "page_owner_five_rule", check_7_page_owner_five_rule(claude_text, contract))
    record(8, "db_six_tables_scope", check_8_db_six_tables())
    record(9, "external_input_no_persist_rule", check_9_external_input_no_persist_rule(claude_text))
    record(10, "playwright_chromium_smoke_rule", check_10_playwright_chromium_smoke_rule(claude_text))
    record(11, "auto_merge_false", check_11_auto_merge_false(claude_text))
    record(12, "aws_enabled_false", check_12_aws_enabled_false(claude_text))
    record(13, "excluded_protection_rule", check_13_excluded_protection_rule(claude_text))

    print("=" * 70)
    print("Traveler Agent Harness — validate_harness.py")
    print("=" * 70)
    for no, name, ok in check_results:
        print(f"[{'PASS' if ok else 'FAIL'}] {no:02d}. {name}")
    print("-" * 70)

    failed = [r for r in check_results if not r[2]]
    if not failed:
        print(f"VALIDATE_HARNESS_PASS ({len(check_results)}/{CHECK_COUNT} 검사 통과)")
        return 0

    print(f"검사 실패: {len(failed)}/{CHECK_COUNT}")
    if missing_files:
        print(f"누락된 파일: {sorted(set(missing_files))}")
    if missing_rules:
        print(f"누락된 규칙: {sorted(set(missing_rules))}")
    for f in other_failures:
        print(f"- {f}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
