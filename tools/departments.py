"""
統一科系資料管線 — 抓取 + 標籤 + 職涯 + 管道條件
一個腳本搞定所有科系資料

Steps:
1. 抓取電機群科系 (warehouse.js)
2. 標籤系統 (regex 規則)
3. 104 職涯薪資 (be.guide.104.com.tw API)
4. 管道條件 (技優證照/競賽對照)

輸出: src/data/departments.json
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DEPT_JSON = ROOT / "src" / "data" / "departments.json"

# Import individual steps
# Each step is a function that processes departments.json


def step_scrape():
    """Step 1: Scrape departments from warehouse.js"""
    print("\n[Step 1/4] 抓取科系資料")
    result = subprocess.run(
        [sys.executable, str(Path(__file__).parent / "scrape_electrical_departments.py"),
         "--year", "114", "--group", "03"],
        capture_output=True, timeout=300
    )
    with open(Path(__file__).parent / "_debug" / "step1.log", "w", encoding="utf-8") as f:
        f.write(f"exit={result.returncode}\n")
        f.write(result.stdout.decode("utf-8", errors="replace"))
        f.write(result.stderr.decode("utf-8", errors="replace"))
    if result.returncode != 0:
        print("  [FAIL] Step 1 failed")
        return False
    print("  [OK] Step 1 complete")
    return True


def step_tags():
    """Step 2: Enrich tags"""
    print("\n[Step 2/4] 標籤系統")
    result = subprocess.run(
        [sys.executable, str(Path(__file__).parent / "enrich_tags.py")],
        capture_output=True, timeout=120
    )
    with open(Path(__file__).parent / "_debug" / "step2.log", "w", encoding="utf-8") as f:
        f.write(f"exit={result.returncode}\n")
        f.write(result.stdout.decode("utf-8", errors="replace"))
    if result.returncode != 0:
        print("  [FAIL] Step 2 failed")
        return False
    print("  [OK] Step 2 complete")
    return True


def step_career():
    """Step 3: Enrich career outcomes from 104"""
    print("\n[Step 3/4] 104 職涯薪資")
    result = subprocess.run(
        [sys.executable, str(Path(__file__).parent / "enrich_career_104.py")],
        capture_output=True, timeout=600
    )
    with open(Path(__file__).parent / "_debug" / "step3.log", "w", encoding="utf-8") as f:
        f.write(f"exit={result.returncode}\n")
        f.write(result.stdout.decode("utf-8", errors="replace"))
    if result.returncode != 0:
        print("  [FAIL] Step 3 failed")
        return False
    print("  [OK] Step 3 complete")
    return True


def step_pathways():
    """Step 4: Enrich pathway requirements"""
    print("\n[Step 4/4] 管道條件")
    result = subprocess.run(
        [sys.executable, str(Path(__file__).parent / "enrich_pathways.py")],
        capture_output=True, timeout=60
    )
    with open(Path(__file__).parent / "_debug" / "step4.log", "w", encoding="utf-8") as f:
        f.write(f"exit={result.returncode}\n")
        f.write(result.stdout.decode("utf-8", errors="replace"))
    if result.returncode != 0:
        print("  [FAIL] Step 4 failed")
        return False
    print("  [OK] Step 4 complete")
    return True


def validate():
    """Validate final output"""
    print("\n[Validate] departments.json")
    with open(DEPT_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    errors = []
    if len(data) != 181:
        errors.append(f"Expected 181, got {len(data)}")

    for i, d in enumerate(data):
        if not d.get("features"):
            errors.append(f"[{i}] {d.get('id','?')}: no features")
        if not d.get("careerOutcomes"):
            errors.append(f"[{i}] {d.get('id','?')}: no careerOutcomes")
        skills_certs = d.get("pathways", {}).get("skills", {}).get("requiredCertificates", [])
        if not skills_certs:
            errors.append(f"[{i}] {d.get('id','?')}: no skills requiredCertificates")

    if errors:
        print(f"  [FAIL] {len(errors)} errors:")
        for e in errors[:10]:
            print(f"    {e}")
        return False

    # Stats
    career = sum(1 for d in data if d.get("careerOutcomes"))
    salary = sum(1 for d in data if d.get("careerOutcomes", {}).get("avgSalary", 0) > 0)
    skills = sum(1 for d in data if d["pathways"].get("skills", {}).get("requiredCertificates"))
    print(f"  Total: {len(data)} departments")
    print(f"  Career outcomes: {career}/{len(data)}")
    print(f"  With salary: {salary}/{len(data)}")
    print(f"  Skills certs: {skills}/{len(data)}")
    print("  [PASS] All validations passed!")
    return True


def main():
    print("═══ 科系資料管線 ═══")
    print("Steps: scrape → tags → career → pathways → validate")

    ok = True
    if ok:
        ok = step_scrape()
    if ok:
        ok = step_tags()
    if ok:
        ok = step_career()
    if ok:
        ok = step_pathways()
    if ok:
        ok = validate()

    if ok:
        print("\n═══ 全部完成 ═══")
    else:
        print("\n═══ 有步驟失敗 ═══")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
