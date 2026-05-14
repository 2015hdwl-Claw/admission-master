"""End-to-end test: run scraper → enrich tags → validate output"""
import json
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent.parent
DEPT_JSON = ROOT / "src" / "data" / "departments.json"

def run(cmd):
    print(f"\n{'='*60}")
    print(f"[RUN] {cmd}")
    print('='*60)
    result = subprocess.run(cmd, shell=True, capture_output=True, timeout=300)
    stdout = result.stdout.decode("utf-8", errors="replace")
    stderr = result.stderr.decode("utf-8", errors="replace")
    # Write to file to avoid console encoding issues
    with open("tools/_last_run.log", "w", encoding="utf-8") as f:
        f.write(f"STDOUT:\n{stdout}\n\nSTDERR:\n{stderr}\n")
    print(f"  exit={result.returncode}, log written to tools/_last_run.log")
    if result.returncode != 0:
        print(f"[FAIL] exit code: {result.returncode}")
        return False
    return True

def validate():
    print(f"\n{'='*60}")
    print("[VALIDATE] departments.json")
    print('='*60)

    with open(DEPT_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    errors = []

    # Must have 181 entries for group 03
    if len(data) != 181:
        errors.append(f"Expected 181 departments, got {len(data)}")

    for i, d in enumerate(data):
        # Required fields
        for field in ["id", "schoolId", "schoolName", "departmentName", "groupCode",
                       "groupName", "publicPrivate", "region", "features", "researchAreas",
                       "careerPaths", "pathways", "source"]:
            if field not in d:
                errors.append(f"[{i}] {d.get('id','?')}: missing field '{field}'")

        # No "未知" in publicPrivate or region
        if d.get("publicPrivate") == "未知":
            errors.append(f"[{i}] {d.get('id','?')}: publicPrivate is 未知")
        if d.get("region") == "未知":
            errors.append(f"[{i}] {d.get('id','?')}: region is 未知")

        # Must have tags
        if not d.get("features"):
            errors.append(f"[{i}] {d.get('id','?')} ({d.get('departmentName','?')}): no features")

        # Must have career outcomes
        if not d.get("careerOutcomes"):
            errors.append(f"[{i}] {d.get('id','?')}: no careerOutcomes")

        # Must have pathways
        if not d.get("pathways"):
            errors.append(f"[{i}] {d.get('id','?')}: no pathways")

    if errors:
        print(f"[FAIL] {len(errors)} errors:")
        for e in errors[:20]:
            print(f"  {e}")
        if len(errors) > 20:
            print(f"  ... and {len(errors)-20} more")
        return False

    # Stats
    pp = {}
    rg = {}
    feat_count = 0
    career_count = 0
    salary_count = 0
    for d in data:
        pp[d["publicPrivate"]] = pp.get(d["publicPrivate"], 0) + 1
        rg[d["region"]] = rg.get(d["region"], 0) + 1
        if d["features"]:
            feat_count += 1
        if d.get("careerOutcomes"):
            career_count += 1
            if d["careerOutcomes"].get("avgSalary", 0) > 0:
                salary_count += 1

    print(f"  Total: {len(data)} departments")
    print(f"  publicPrivate: {pp}")
    print(f"  region: {rg}")
    print(f"  Tagged: {feat_count}/{len(data)}")
    print(f"  Career outcomes: {career_count}/{len(data)}")
    print(f"  With salary: {salary_count}/{len(data)}")
    print(f"  Schools: {len(set(d['schoolId'] for d in data))}")
    print("[PASS] All validations passed!")
    return True

if __name__ == "__main__":
    ok = True

    # Step 1: scrape
    if not run("python tools/scrape_electrical_departments.py --year 114 --group 03"):
        ok = False

    # Step 2: enrich tags
    if ok and not run("python tools/enrich_tags.py"):
        ok = False

    # Step 3: enrich career outcomes from 104
    if ok and not run("python tools/enrich_career_104.py"):
        ok = False

    # Step 4: validate
    if ok:
        ok = validate()

    sys.exit(0 if ok else 1)
