"""
升學大師 — 一鍵資料管線
python tools/pipeline.py           # 全跑
python tools/pipeline.py depts     # 只跑科系
python tools/pipeline.py schedules # 只跑時程
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
        capture_output=True, timeout=600
    )
    with open(TOOLS / "_debug" / f"{name}.log", "w", encoding="utf-8") as f:
        f.write(f"exit={result.returncode}\n")
        f.write(result.stdout.decode("utf-8", errors="replace"))
        f.write(result.stderr.decode("utf-8", errors="replace"))
    if result.returncode != 0:
        print(f"  [FAIL] exit={result.returncode}")
        return False
    print(f"  [OK]")
    return True


def main():
    args = set(sys.argv[1:])
    run_all = len(args) == 0

    ok = True

    # 科系資料
    if run_all or "depts" in args:
        ok = run("departments", "departments.py")

    # 時程資料
    if ok and (run_all or "schedules" in args):
        ok = run("schedules", "schedules.py")

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
