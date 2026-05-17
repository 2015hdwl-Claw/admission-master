"""
升學大師 — 一鍵資料管線
python tools/pipeline.py             # 全跑
python tools/pipeline.py depts       # 只跑科系
python tools/pipeline.py desc        # 只跑科系簡介（techadmi + GLM）
python tools/pipeline.py schedules   # 跑全部時程（管道+考試+競賽+行事曆）
python tools/pipeline.py pathways    # 只跑管道里程碑
python tools/pipeline.py exams       # 只跑證照考試
python tools/pipeline.py comps       # 只跑競賽事件
python tools/pipeline.py calendar    # 只跑行事曆產生
"""
import subprocess
import sys
from pathlib import Path

TOOLS = Path(__file__).parent


def run(name: str, script: str) -> bool:
    print(f"\n{'═'*60}")
    print(f"[RUN] {name}")
    print('═'*60)
    result = subprocess.run(
        [sys.executable, str(TOOLS / script)],
        capture_output=False, timeout=600
    )
    with open(TOOLS / "_debug" / f"{name}.log", "w", encoding="utf-8") as f:
        f.write(f"exit={result.returncode}\n")
    if result.returncode != 0:
        print(f"  [FAIL] exit={result.returncode}")
        return False
    print(f"  [OK]")
    return True


def main():
    args = set(sys.argv[1:])
    run_all = len(args) == 0

    ok = True

    # ── 科系資料 ──
    if run_all or "depts" in args:
        ok = run("departments", "departments.py")

    # ── 科系簡介（techadmi + GLM） ──
    if ok and (run_all or "desc" in args):
        ok = run("techadmi", "enrich_techadmi.py")
        if ok:
            ok = run("descriptions", "enrich_descriptions_glm.py")

    # ── 時程資料（獨立爬蟲） ──
    if ok and (run_all or "schedules" in args or "pathways" in args):
        ok = run("pathways", "scrape_pathway_deadlines.py")

    if ok and (run_all or "schedules" in args or "exams" in args):
        ok = run("exams", "scrape_exam_schedules.py")

    if ok and (run_all or "schedules" in args or "comps" in args):
        ok = run("comps", "scrape_competition_events.py")

    # ── 行事曆產生（依賴上面的輸出） ──
    if ok and (run_all or "schedules" in args or "calendar" in args):
        ok = run("calendar", "generate_calendar.py")

    # ── 舊版 schedules.py 保留（向後相容） ──
    if ok and "schedules-legacy" in args:
        ok = run("schedules-legacy", "schedules.py")

    if ok:
        print(f"\n{'═'*60}")
        print("[DONE] 全部完成！")
        print('═'*60)
    else:
        print(f"\n{'═'*60}")
        print("[FAIL] 有步驟失敗，請檢查 _debug/ 目錄的 log")
        print('═'*60)

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
