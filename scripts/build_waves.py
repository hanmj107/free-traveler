#!/usr/bin/env python3
"""
build_waves.py — Task DAG(TASK_MANIFEST.csv의 Depends On)를 읽어 Wave 실행 계획을 만든다.

입력:
  - TASKS/TASK_MANIFEST.csv                      (Task ID·Category·Screen·Depends On·Requirement Refs 정본,
                                                    scripts/audit_tasks.py가 생성/갱신한다 — 이 스크립트를
                                                    실행하기 전에 audit_tasks.py를 먼저 실행해 최신 상태로
                                                    맞춰야 한다. audit_tasks.py를 이 스크립트 "뒤에" 다시
                                                    실행하면 Wave ID 열이 없는 CSV로 덮어써지므로 주의)
  - TASKS/TASK-*.md                              (Task 상세 파일 — Expected Files 파싱용. 입력 스펙의
                                                    "TASKS/details/TASK-*.md" 경로는 이 저장소에 존재하지
                                                    않는다: TASKS/details/ 디렉터리 자체가 없고, 상세 파일은
                                                    전부 TASKS/ 바로 아래 TASK-<ID>.md로 평면 저장돼 있다
                                                    — scripts/audit_tasks.py·scripts/validate_harness.py도
                                                    동일하게 실제 경로를 사용한다)
  - design-reference/SCREEN_ROUTE_CONTRACT.json  (Screen/Route 정본 — Wave 설명 문구·검증용)

출력:
  - TASKS/TASK_DAG.md         (위상 정렬 순서, 순환 의존성 검사 결과, Task별 Level/그룹/Wave 배정 근거)
  - TASKS/WAVE_PLAN.md        (Wave별 Task ID 실행 순서 — `.claude/commands/run-wave.md`가 읽는 계획 파일과
                                동일한 3열 표 형식)
  - TASKS/WAVE_STATE.json     (Wave 실행 상태 시드 — schema_version/generated_at/waves[] 구조)
  - TASKS/TASK_MANIFEST.csv   ("Wave ID" 열을 덧붙여 다시 쓴다. 기존 11개 열은 그대로 보존한다)

Wave ID는 W00~W10으로 미리 고정하지 않는다. "Wave 그룹 순서"(10개, GROUP_TITLES) 안에서 Task 수·의존성
깊이·파일 충돌에 따라 그룹 하나가 여러 Wave로 나뉠 수 있으며, Wave ID는 실제로 생성된 순서대로
W01, W02, ...로 순차 부여한다.

이 스크립트는 Git Branch·PR·Merge를 생성하지 않으며, 실패 시 자동으로 재시도하거나 스스로 계획을
고쳐 쓰는 로직(예: "최대 3회 자동 수정")도 두지 않는다 — 한 번 계산하고, 검증하고, 통과하면 그대로
출력하고, 실패하면 즉시 중단한다.

출력:
  - 성공 시: 순환 의존성 수·Wave별 Task 수·Page Owner 위치를 출력하고 exit 0
  - 실패 시(순환 의존성 발견, 분류되지 않은 Task 발견, Wave 순서 위반 등): 원인을 출력하고 exit 1
"""

from __future__ import annotations

import csv
import heapq
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
TASKS_DIR = ROOT / "TASKS"
MANIFEST_CSV = TASKS_DIR / "TASK_MANIFEST.csv"
SCREEN_ROUTE_CONTRACT_JSON = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"

TASK_DAG_MD = TASKS_DIR / "TASK_DAG.md"
WAVE_PLAN_MD = TASKS_DIR / "WAVE_PLAN.md"
WAVE_STATE_JSON = TASKS_DIR / "WAVE_STATE.json"

MAX_WAVE_SIZE = 7
MIN_WAVE_SIZE_HINT = 4  # "기본적으로 4~7개" 목표치. 의존성 깊이·Page Owner 격리가 이보다 우선한다.

GROUP_TITLES = {
    1: "Scaffold, 문서, Harness 확인",
    2: "Airbnb 스타일 공통 UI, 정적 데이터, Layout",
    3: "Supabase Auth, 6개 Table, 기본 RLS",
    4: "SCR-001 메인 Component와 Page Owner",
    5: "SCR-002 대표 소개 Component와 Page Owner",
    6: "SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner",
    7: "SCR-004 동행 목록·상세·신청 Component와 Page Owner",
    8: "SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner",
    9: "Unit·Playwright·접근성·CI",
    10: "Vercel Preview와 Release 확인",
}

SCREEN_GROUP = {
    "SCR-001": 4,
    "SCR-002": 5,
    "SCR-003": 6,
    "SCR-004": 7,
    "SCR-005": 8,
}


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def load_manifest() -> list[dict]:
    if not MANIFEST_CSV.exists():
        print(f"[오류] {MANIFEST_CSV.relative_to(ROOT)}가 없습니다. 먼저 `python scripts/audit_tasks.py`를 실행해 생성하십시오.")
        sys.exit(1)
    tasks: list[dict] = []
    with open(MANIFEST_CSV, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            depends_on = [d.strip() for d in row["Depends On"].split(";") if d.strip()]
            screens = [s.strip() for s in row["Screen"].split(";") if s.strip()]
            req_refs = [r.strip() for r in row["Requirement Refs"].split(";") if r.strip()]
            tasks.append({
                "seq": row["Seq"],
                "task_id": row["Task ID"],
                "title": row["Title"],
                "category": row["Category"],
                "screens": screens,
                "route": row.get("Route", ""),
                "page_entry": row.get("Page Entry", ""),
                "depends_on": depends_on,
                "requirement_refs": req_refs,
                "detail_file": row["Detail File"],
            })
    return tasks


def load_expected_files(task_id: str) -> set[str]:
    p = TASKS_DIR / f"TASK-{task_id}.md"
    if not p.exists():
        return set()
    text = p.read_text(encoding="utf-8")
    m = re.search(r"##\s*Expected Files\s*\n(.*?)(?:\n##\s|\Z)", text, re.DOTALL)
    if not m:
        return set()
    return set(re.findall(r"`([^`]+)`", m.group(1)))


def load_screen_route_contract() -> dict | None:
    if not SCREEN_ROUTE_CONTRACT_JSON.exists():
        return None
    try:
        return json.loads(SCREEN_ROUTE_CONTRACT_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


# ---------------------------------------------------------------------------
# 1. 순환 의존성 검사 + 위상 정렬 (규칙 1)
# ---------------------------------------------------------------------------

def topo_sort(tasks: list[dict]) -> tuple[list[str], list[str]]:
    """Kahn 알고리즘. (위상 정렬 순서, 순환에 걸려 정렬되지 못한 Task ID 목록)을 반환한다."""
    ids = {t["task_id"] for t in tasks}
    depends_on = {t["task_id"]: [d for d in t["depends_on"] if d in ids] for t in tasks}
    dependents: dict[str, list[str]] = {tid: [] for tid in ids}
    for tid, deps in depends_on.items():
        for d in deps:
            dependents[d].append(tid)
    indegree = {tid: len(deps) for tid, deps in depends_on.items()}
    heap = [tid for tid in ids if indegree[tid] == 0]
    heapq.heapify(heap)
    order: list[str] = []
    remaining = dict(indegree)
    while heap:
        node = heapq.heappop(heap)
        order.append(node)
        for child in sorted(dependents[node]):
            remaining[child] -= 1
            if remaining[child] == 0:
                heapq.heappush(heap, child)
    cycle_nodes = sorted(ids - set(order))
    return order, cycle_nodes


def find_cycle_path(tasks: list[dict], cycle_nodes: list[str]) -> list[str]:
    """cycle_nodes(순환에 걸린 Task) 중 하나에서 시작해 실제 순환 경로 하나를 DFS로 찾는다."""
    depends_on = {t["task_id"]: t["depends_on"] for t in tasks}
    cycle_set = set(cycle_nodes)
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {tid: WHITE for tid in cycle_set}

    def dfs(node: str, stack: list[str]) -> list[str] | None:
        color[node] = GRAY
        stack.append(node)
        for dep in depends_on.get(node, []):
            if dep not in cycle_set:
                continue
            if color[dep] == GRAY:
                idx = stack.index(dep)
                return stack[idx:] + [dep]
            if color[dep] == WHITE:
                found = dfs(dep, stack)
                if found:
                    return found
        stack.pop()
        color[node] = BLACK
        return None

    for tid in sorted(cycle_set):
        if color[tid] == WHITE:
            found = dfs(tid, [])
            if found:
                return found
    return cycle_nodes


def compute_levels(tasks: list[dict], topo_order: list[str]) -> dict[str, int]:
    """전체 그래프 기준 Longest-path Level(0-base). 같은 Level의 두 Task는 서로 의존 관계가 없다."""
    ids = {t["task_id"] for t in tasks}
    depends_on = {t["task_id"]: [d for d in t["depends_on"] if d in ids] for t in tasks}
    level: dict[str, int] = {}
    for tid in topo_order:
        deps = depends_on[tid]
        level[tid] = 0 if not deps else 1 + max(level[d] for d in deps)
    return level


# ---------------------------------------------------------------------------
# 2. Wave 그룹 분류 (규칙: "Wave 그룹 순서" 1~10)
# ---------------------------------------------------------------------------

def nominal_group(task: dict) -> int | None:
    """Category·Screen 기준 1차(명목상) 그룹. 실제 배치는 §3의 effective_group에서 의존성으로 보정한다."""
    tid = task["task_id"]
    cat = task["category"]
    if tid in ("COMP-COMMON-HEADER", "COMP-COMMON-FOOTER"):
        return 2  # Airbnb 스타일 공통 UI
    if cat == "DATA":
        return 2  # 정적 데이터
    if cat in ("DB", "AUTH", "API"):
        # API Route Handler는 "SCR-00N Component" 어느 그룹에도 해당하지 않고, 모든 화면의
        # Component가 이를 선행 조건으로 삼는 순수 백엔드 계층이므로 Supabase 그룹(3)에 포함한다.
        return 3
    if cat in ("UNIT_TEST", "INTEGRATION_TEST", "E2E_TEST"):
        return 9
    if tid == "CI-PIPELINE-SETUP":
        return 9
    if tid == "CHECK-MANUAL-ACCESSIBILITY":
        return 9
    if tid in ("CHECK-MANUAL-PERFORMANCE", "RELEASE-CHECK-VERCEL-SUPABASE"):
        return 10
    if cat in ("PAGE_OWNER", "COMPONENT"):
        screen = task["screens"][0] if task["screens"] else None
        if screen in SCREEN_GROUP:
            return SCREEN_GROUP[screen]
    return None


def compute_effective_groups(tasks: list[dict], topo_order: list[str]) -> tuple[dict[str, int], list[str], list[tuple[str, int, int]]]:
    """
    명목 그룹(nominal_group)에서 시작해, 실제 의존성이 더 늦은 그룹을 요구하면 그룹을 뒤로 민다
    (규칙 2 "선행 Task가 뒤 Wave에 배치되면 실패한다"를 그룹 단계에서 먼저 만족시킨다).
    반환: (task_id -> effective_group, 분류 실패 Task 목록, [그룹이 재배치된 (task_id, nominal, effective)])
    """
    by_id = {t["task_id"]: t for t in tasks}
    ids = {t["task_id"] for t in tasks}
    nominal: dict[str, int | None] = {t["task_id"]: nominal_group(t) for t in tasks}
    unclassified = sorted(tid for tid, g in nominal.items() if g is None)
    effective: dict[str, int] = {}
    for tid in topo_order:
        deps = [d for d in by_id[tid]["depends_on"] if d in ids]
        base = nominal[tid] if nominal[tid] is not None else 1
        dep_max = max((effective[d] for d in deps if d in effective), default=0)
        effective[tid] = max(base, dep_max)
    reassigned = sorted(
        (tid, nominal[tid], effective[tid])
        for tid in effective
        if nominal[tid] is not None and nominal[tid] != effective[tid]
    )
    return effective, unclassified, reassigned


# ---------------------------------------------------------------------------
# 3. 그룹 내부를 Wave로 분할 (규칙 3·4·5·6)
# ---------------------------------------------------------------------------

def compute_intra_group_levels(group_task_ids: list[str], depends_on: dict[str, list[str]]) -> dict[str, int]:
    """그룹 내부 Task만으로 만든 부분 그래프 기준 Longest-path Level(그룹 밖 의존성은 이미 앞선
    그룹의 Wave에서 해소된 것으로 간주하고 무시한다)."""
    ids = set(group_task_ids)
    local_deps = {tid: [d for d in depends_on[tid] if d in ids] for tid in ids}
    dependents: dict[str, list[str]] = {tid: [] for tid in ids}
    for tid, deps in local_deps.items():
        for d in deps:
            dependents[d].append(tid)
    indegree = {tid: len(deps) for tid, deps in local_deps.items()}
    heap = sorted(tid for tid in ids if indegree[tid] == 0)
    heapq.heapify(heap)
    order: list[str] = []
    remaining = dict(indegree)
    while heap:
        node = heapq.heappop(heap)
        order.append(node)
        for child in sorted(dependents[node]):
            remaining[child] -= 1
            if remaining[child] == 0:
                heapq.heappush(heap, child)
    level: dict[str, int] = {}
    for tid in order:
        deps = local_deps[tid]
        level[tid] = 0 if not deps else 1 + max(level[d] for d in deps)
    return level


def chunk_level_tasks(tasks_at_level: list[str], file_map: dict[str, set[str]]) -> list[list[str]]:
    """
    같은 Level(=서로 의존 관계 없음)의 Task를 최대 MAX_WAVE_SIZE 크기로 균등 분할하고(규칙 3),
    같은 조각 안에서 Expected Files가 겹치는 Task가 있으면 다시 분리한다(규칙 5).
    같은 Level끼리는 서로 의존하지 않으므로 어떻게 나누어도 규칙 1·2(순서 위반)에는 영향이 없다.
    """
    tasks_sorted = sorted(tasks_at_level)
    n = len(tasks_sorted)
    if n == 0:
        return []
    chunk_count = -(-n // MAX_WAVE_SIZE)  # ceil(n / MAX_WAVE_SIZE)
    base, rem = divmod(n, chunk_count)
    sizes = [base + 1] * rem + [base] * (chunk_count - rem)
    size_chunks: list[list[str]] = []
    idx = 0
    for size in sizes:
        size_chunks.append(tasks_sorted[idx: idx + size])
        idx += size

    final_chunks: list[list[str]] = []
    for chunk in size_chunks:
        current: list[str] = []
        used_files: set[str] = set()
        for tid in chunk:
            files = file_map.get(tid, set())
            if files & used_files:
                if current:
                    final_chunks.append(current)
                current = []
                used_files = set()
            current.append(tid)
            used_files |= files
        if current:
            final_chunks.append(current)
    return final_chunks


def assemble_waves(
    tasks: list[dict],
    effective_group: dict[str, int],
    depends_on: dict[str, list[str]],
    file_map: dict[str, set[str]],
) -> list[dict]:
    by_id = {t["task_id"]: t for t in tasks}
    waves: list[dict] = []
    wave_counter = 0
    for group_no in range(1, 11):
        group_task_ids = sorted(tid for tid, g in effective_group.items() if g == group_no)
        if not group_task_ids:
            continue
        levels = compute_intra_group_levels(group_task_ids, depends_on)
        max_level = max(levels.values(), default=-1)
        for lvl in range(0, max_level + 1):
            at_level = [tid for tid, l in levels.items() if l == lvl]
            if not at_level:
                continue
            for chunk in chunk_level_tasks(at_level, file_map):
                wave_counter += 1
                wave_id = f"W{wave_counter:02d}"
                categories = {by_id[tid]["category"] for tid in chunk}
                waves.append({
                    "wave_id": wave_id,
                    "group_no": group_no,
                    "group_title": GROUP_TITLES[group_no],
                    "level": lvl,
                    "task_ids": chunk,
                    "checkpoint_required": "PAGE_OWNER" in categories,
                })
    return waves


def validate_wave_order(waves: list[dict], tasks: list[dict]) -> list[tuple[str, str]]:
    """규칙 2 최종 자체 검증: 어떤 Task도 자신의 선행 Task보다 앞선(또는 같은) Wave에 있으면 안 된다.
    같은 Wave 배치는 규칙 6(Task ID 순 실행)과 충돌할 수 있어 위반으로 취급한다."""
    wave_index_of: dict[str, int] = {}
    for i, w in enumerate(waves):
        for tid in w["task_ids"]:
            wave_index_of[tid] = i
    violations: list[tuple[str, str]] = []
    for t in tasks:
        tid = t["task_id"]
        if tid not in wave_index_of:
            continue
        for dep in t["depends_on"]:
            if dep not in wave_index_of:
                continue
            if wave_index_of[dep] >= wave_index_of[tid]:
                violations.append((tid, dep))
    return violations


# ---------------------------------------------------------------------------
# 4. 출력 파일 작성
# ---------------------------------------------------------------------------

def write_task_dag_md(
    tasks: list[dict],
    topo_order: list[str],
    levels: dict[str, int],
    effective_group: dict[str, int],
    reassigned: list[tuple[str, int, int]],
    wave_of: dict[str, str],
    timestamp: str,
) -> None:
    by_id = {t["task_id"]: t for t in tasks}
    lines = [
        "# Traveler Task DAG",
        "",
        f"- **생성 시각(UTC):** {timestamp}",
        f"- **생성 스크립트:** `scripts/build_waves.py`",
        f"- **대상 Task 수:** {len(tasks)}",
        "",
        "이 문서는 `TASKS/TASK_MANIFEST.csv`의 Depends On 열로 만든 의존성 그래프의 위상 정렬 결과다.",
        "코드/Task 정의를 변경하지 않으며, `TASKS/WAVE_PLAN.md`·`TASKS/WAVE_STATE.json`의 산출 근거를 기록한다.",
        "",
        "---",
        "",
        "## 1. 순환 의존성 검사",
        "",
        "순환 의존성 0건 — 전체 Task가 위상 정렬 가능한 DAG를 이룬다.",
        "",
        "## 2. 위상 정렬 순서 (전체)",
        "",
        "`" + " → ".join(topo_order) + "`",
        "",
        "## 3. Wave 그룹 재배치",
        "",
    ]
    if reassigned:
        lines.append("아래 Task는 \"Wave 그룹 순서\"상 명목 그룹보다 늦은 그룹으로 재배치됐다(자신의 선행 Task가 더 늦은 그룹에 있기 때문 — 규칙 2를 그룹 단계에서부터 지키기 위함).")
        lines.append("")
        lines.append("| Task ID | 명목 그룹 | 실제(effective) 그룹 | 사유 |")
        lines.append("|---|---:|---:|---|")
        for tid, nom, eff in reassigned:
            deps = ", ".join(f"`{d}`" for d in by_id[tid]["depends_on"]) or "-"
            lines.append(f"| `{tid}` | {nom}. {GROUP_TITLES[nom]} | {eff}. {GROUP_TITLES[eff]} | Depends On: {deps} |")
    else:
        lines.append("재배치된 Task 없음 — 모든 Task가 명목 그룹 그대로 배치됐다.")
    lines.append("")
    lines.append("## 4. Task별 Level·그룹·Wave")
    lines.append("")
    lines.append("| Task ID | Category | Screen | Depends On | Level(전체) | Effective 그룹 | Wave ID |")
    lines.append("|---|---|---|---|---:|---|---|")
    for tid in topo_order:
        t = by_id[tid]
        screen = ";".join(t["screens"]) or "-"
        deps = ";".join(t["depends_on"]) or "-"
        g = effective_group[tid]
        lines.append(f"| `{tid}` | {t['category']} | {screen} | {deps} | {levels[tid]} | {g}. {GROUP_TITLES[g]} | {wave_of.get(tid, '-')} |")
    lines.append("")
    TASK_DAG_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_wave_plan_md(waves: list[dict], tasks: list[dict], contract: dict | None, timestamp: str) -> None:
    by_id = {t["task_id"]: t for t in tasks}
    contract_screens = {s["screen_id"]: s for s in (contract or {}).get("screens", [])}
    lines = [
        "# Free Traveler — Wave Plan",
        "",
        f"- **생성 시각(UTC):** {timestamp}",
        f"- **생성 스크립트:** `scripts/build_waves.py`(자동 생성) — `TASKS/TASK_MANIFEST.csv`의 Depends On을 기준으로",
        "  계산한 제안이다. `/run-wave`로 실행을 시작하기 전에 사람이 한 번 훑어보길 권장한다",
        "  (`docs/DECISION_LOG.md` DEC-010: Wave 경계는 사람이 최종 확인한다).",
        f"- **Wave 수:** {len(waves)}개 (Wave ID는 W00~W10으로 고정하지 않고 실제 생성된 순서대로 W01부터 순차 부여했다)",
        "",
        "이 파일이 `.claude/commands/run-wave.md`가 읽는 `TASKS/WAVE_PLAN.md` 정본이다. 이후 `/run-wave`는",
        "여기 적힌 실제 Wave ID를 기준으로 동작해야 한다(W00~W10 같은 고정 번호를 가정하지 않는다).",
        "",
        "---",
        "",
        "| Wave | Task IDs (실행 순서) | 설명 |",
        "|---|---|---|",
    ]
    for w in waves:
        task_ids_str = ", ".join(w["task_ids"])
        desc = f"{w['group_title']}"
        # SCR-00N 그룹이면 Route를 덧붙여 설명을 보강한다(SCREEN_ROUTE_CONTRACT.json 활용).
        screens_in_wave = sorted({s for tid in w["task_ids"] for s in by_id[tid]["screens"]})
        if screens_in_wave:
            routes = [contract_screens[s]["route"] for s in screens_in_wave if s in contract_screens]
            if routes:
                desc += f" ({', '.join(sorted(set(routes)))})"
        if w["checkpoint_required"]:
            desc += " — Page Owner 통합 Wave, 완료 후 사람 Preview 확인 필요"
        lines.append(f"| {w['wave_id']} | {task_ids_str} | {desc} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Preview Checkpoint가 필요한 Wave")
    lines.append("")
    checkpoint_waves = [w["wave_id"] for w in waves if w["checkpoint_required"]]
    if checkpoint_waves:
        lines.append("아래 Wave는 `Category: PAGE_OWNER` Task로 끝나므로, 완료 후 사람이 실제 화면을 Preview로")
        lines.append("확인하기 전까지 다음 Wave로 자동 진행하지 않는다(루트 `CLAUDE.md` 규칙 22).")
        lines.append("")
        lines.append(", ".join(checkpoint_waves))
    else:
        lines.append("없음")
    lines.append("")
    WAVE_PLAN_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_wave_state_json(waves: list[dict], timestamp: str) -> None:
    payload = {
        "schema_version": "traveler-wave-state-v1",
        "generated_at": timestamp,
        "waves": [
            {
                "wave_id": w["wave_id"],
                "title": w["group_title"],
                "task_ids": w["task_ids"],
                "status": "pending",
                "checkpoint_required": w["checkpoint_required"],
                "checkpoint_result": None,
            }
            for w in waves
        ],
    }
    WAVE_STATE_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_manifest_with_wave_id(wave_of: dict[str, str]) -> None:
    with open(MANIFEST_CSV, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)
    if "Wave ID" not in fieldnames:
        fieldnames.append("Wave ID")
    for row in rows:
        row["Wave ID"] = wave_of.get(row["Task ID"], "")
    with open(MANIFEST_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main() -> int:
    tasks = load_manifest()
    by_id = {t["task_id"]: t for t in tasks}
    depends_on = {t["task_id"]: t["depends_on"] for t in tasks}
    contract = load_screen_route_contract()

    # 0. Depends On이 실제로 존재하는 Task를 가리키는지 먼저 확인한다(정본 CSV는 audit_tasks.py check 03이
    #    이미 검증했어야 하지만, 이 스크립트도 독립적으로 다시 확인한다).
    ids = set(by_id)
    dangling = sorted(
        (tid, dep) for tid, deps in depends_on.items() for dep in deps if dep not in ids
    )
    if dangling:
        print("[오류] 존재하지 않는 Task를 가리키는 Depends On 발견:")
        for tid, dep in dangling:
            print(f"  - {tid} -> {dep}")
        print("먼저 `python scripts/audit_tasks.py`로 TASK_MANIFEST.csv를 최신 상태로 재생성하십시오.")
        return 1

    # 1. 순환 의존성 검사(규칙 1)
    topo_order, cycle_nodes = topo_sort(tasks)
    if cycle_nodes:
        cycle_path = find_cycle_path(tasks, cycle_nodes)
        print(f"[오류] 순환 의존성 발견 ({len(cycle_nodes)}개 Task가 위상 정렬 불가): " + " -> ".join(cycle_path))
        print("Wave를 생성하지 않았습니다. TASKS/00_TASK_LIST.md의 Depends On을 수정한 뒤 다시 실행하십시오.")
        return 1

    levels = compute_levels(tasks, topo_order)

    # 2. Wave 그룹 분류
    effective_group, unclassified, reassigned = compute_effective_groups(tasks, topo_order)
    if unclassified:
        print("[오류] \"Wave 그룹 순서\"(1~10) 분류 규칙에 해당하지 않는 Task 발견:")
        for tid in unclassified:
            t = by_id[tid]
            print(f"  - {tid} (Category={t['category']}, Screen={';'.join(t['screens']) or '-'})")
        print("scripts/build_waves.py의 nominal_group() 분류 규칙을 이 Task에 맞게 먼저 갱신해야 합니다.")
        return 1

    # 3. 그룹 내부를 Wave로 분할(규칙 3·4·5)
    file_map = {t["task_id"]: load_expected_files(t["task_id"]) for t in tasks}
    waves = assemble_waves(tasks, effective_group, depends_on, file_map)

    # 4. 최종 자체 검증(규칙 2)
    violations = validate_wave_order(waves, tasks)
    if violations:
        print("[오류] Wave 순서 위반(선행 Task가 뒤 Wave에 배치되거나 동일 Wave에 배치됨):")
        for tid, dep in violations:
            print(f"  - {tid}가 자신의 선행 Task {dep}보다 먼저/같은 Wave에 배치됨")
        print("Wave를 생성하지 않았습니다(이 스크립트의 자체 검증 실패 — 버그로 간주하고 보고하십시오).")
        return 1

    wave_of = {tid: w["wave_id"] for w in waves for tid in w["task_ids"]}

    timestamp = datetime.now(timezone.utc).isoformat()
    write_task_dag_md(tasks, topo_order, levels, effective_group, reassigned, wave_of, timestamp)
    write_wave_plan_md(waves, tasks, contract, timestamp)
    write_wave_state_json(waves, timestamp)
    write_manifest_with_wave_id(wave_of)

    # 종료 보고
    print("=" * 70)
    print("Traveler Task List — build_waves.py")
    print("=" * 70)
    print(f"순환 의존성 수: 0 (DAG 확인됨, {len(tasks)}개 Task 전수 위상 정렬)")
    if reassigned:
        print(f"그룹 재배치: {len(reassigned)}건 (상세는 TASKS/TASK_DAG.md §3 참고)")
    print("-" * 70)
    print("Wave별 Task 수:")
    for w in waves:
        flag = " [Preview Checkpoint]" if w["checkpoint_required"] else ""
        print(f"  {w['wave_id']} ({w['group_no']}. {w['group_title']}, Level {w['level']}): {len(w['task_ids'])}개{flag} — {', '.join(w['task_ids'])}")
    print("-" * 70)
    print("Page Owner 위치:")
    for t in tasks:
        if t["category"] == "PAGE_OWNER":
            print(f"  {t['task_id']} ({';'.join(t['screens'])}) -> {wave_of[t['task_id']]}")
    print("-" * 70)
    empty_groups = [g for g in range(1, 11) if not any(effective_group[tid] == g for tid in effective_group)]
    if empty_groups:
        print("Task가 없어 Wave가 생성되지 않은 그룹: " + ", ".join(f"{g}.{GROUP_TITLES[g]}" for g in empty_groups))
    print(f"산출물: {TASK_DAG_MD.relative_to(ROOT)}, {WAVE_PLAN_MD.relative_to(ROOT)}, {WAVE_STATE_JSON.relative_to(ROOT)}, {MANIFEST_CSV.relative_to(ROOT)}(Wave ID 열 갱신)")
    print("BUILD_WAVES_PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
