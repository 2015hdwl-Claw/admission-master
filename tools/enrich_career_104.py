"""
Step 3: Enrich departments with career outcomes from 104 guide API
Uses public API at be.guide.104.com.tw (no auth needed)

Strategy:
1. Map our careerPaths tags to 104 job codes via search API
2. Fetch salary + skills for each unique job
3. Add careerOutcomes to each department
"""

import json
import time
import requests
from pathlib import Path
from collections import defaultdict

BASE = "https://be.guide.104.com.tw"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://guide.104.com.tw/",
    "Origin": "https://guide.104.com.tw",
}

# ── Step 1: Build career tag → 104 job code mapping ──

def search_job(keyword: str) -> dict | None:
    """Search for a job by keyword, return first match"""
    try:
        resp = requests.post(
            f"{BASE}/wow/search/job",
            headers={**HEADERS, "Content-Type": "application/json"},
            json={"keyword": keyword},
            timeout=15,
        )
        data = resp.json()
        if isinstance(data, list) and data:
            return {"jobCode": data[0]["jobCode"], "jobName": data[0]["jobName"]}
    except Exception as e:
        print(f"  [WARN] search '{keyword}' failed: {e}")
    return None


def fetch_wage(job_code: str) -> dict | None:
    """Fetch salary data for a job"""
    try:
        resp = requests.get(f"{BASE}/wow/jobCard/wage?jobCode={job_code}", headers=HEADERS, timeout=15)
        return resp.json()
    except Exception as e:
        print(f"  [WARN] wage {job_code} failed: {e}")
    return None


def fetch_certs(job_code: str) -> dict | None:
    """Fetch tools/skills/certs for a job"""
    try:
        resp = requests.get(f"{BASE}/wow/jobCard/cert?jobCode={job_code}", headers=HEADERS, timeout=15)
        return resp.json()
    except Exception as e:
        print(f"  [WARN] certs {job_code} failed: {e}")
    return None


def build_job_mapping(departments: list) -> dict:
    """Map all unique career tags to 104 job codes"""
    all_careers = set()
    for dept in departments:
        all_careers.update(dept.get("careerPaths", []))

    print(f"[INFO] Unique career tags: {len(all_careers)}")

    # Check cache
    cache_path = Path("tools/_104_job_cache.json")
    cache = {}
    if cache_path.exists():
        with open(cache_path, "r", encoding="utf-8") as f:
            cache = json.load(f)
        print(f"[INFO] Cached job mappings: {len(cache)}")

    mapping = {}
    for i, career in enumerate(sorted(all_careers)):
        if career in cache:
            mapping[career] = cache[career]
            continue

        print(f"  [{i+1}/{len(all_careers)}] Searching: {career}")
        result = search_job(career)
        if result:
            mapping[career] = result
            cache[career] = result
            print(f"    → {result['jobCode']}: {result['jobName']}")
        else:
            print(f"    → not found")
            mapping[career] = None
            cache[career] = None

        time.sleep(0.3)  # Rate limit

    # Save cache
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    return mapping


def fetch_job_details(job_code: str) -> dict:
    """Fetch salary + skills for one job code"""
    wage = fetch_wage(job_code)
    certs = fetch_certs(job_code)

    result = {"jobCode": job_code}

    if wage:
        result["sampleSize"] = wage.get("wageNumber", 0)
        result["freshSalary"] = wage.get("newAvg", 0)
        result["avgSalary"] = wage.get("oldAvg", 0)
        # Salary by experience
        exp_salary = {}
        for item in wage.get("wageAverageList", []):
            if item.get("salary"):
                exp_salary[item["desc"]] = item["salary"]
        result["salaryByExp"] = exp_salary
        # Top industries
        industries = []
        for item in wage.get("wageIndustryList", []):
            if item.get("salary"):
                industries.append({"name": item["desc"], "salary": item["salary"]})
        result["topIndustries"] = industries[:5]

    if certs:
        result["tools"] = [t["name"] for t in certs.get("hardToolList", [])]
        result["skills"] = [s["name"] for s in certs.get("hardSkillList", [])]
        result["certificates"] = [c["name"] for c in certs.get("hardCertList", [])]

    return result


def main():
    dept_path = Path("src/data/departments.json")
    with open(dept_path, "r", encoding="utf-8") as f:
        departments = json.load(f)

    # Step 1: Map career tags to job codes
    print("\n=== Step 1: Building career → job code mapping ===")
    mapping = build_job_mapping(departments)
    found = sum(1 for v in mapping.values() if v)
    print(f"[DONE] Mapped {found}/{len(mapping)} careers to job codes")

    # Step 2: Fetch job details for unique job codes
    print("\n=== Step 2: Fetching salary + skills ===")
    unique_codes = set()
    for v in mapping.values():
        if v:
            unique_codes.add(v["jobCode"])

    # Check detail cache
    detail_cache_path = Path("tools/_104_detail_cache.json")
    detail_cache = {}
    if detail_cache_path.exists():
        with open(detail_cache_path, "r", encoding="utf-8") as f:
            detail_cache = json.load(f)

    job_details = {}
    for i, code in enumerate(sorted(unique_codes)):
        if code in detail_cache:
            job_details[code] = detail_cache[code]
            continue

        print(f"  [{i+1}/{len(unique_codes)}] Fetching: {code}")
        details = fetch_job_details(code)
        job_details[code] = details
        detail_cache[code] = details
        time.sleep(0.3)

    with open(detail_cache_path, "w", encoding="utf-8") as f:
        json.dump(detail_cache, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Fetched details for {len(job_details)} jobs")

    # Step 3: Enrich departments with career outcomes
    print("\n=== Step 3: Enriching departments ===")
    for dept in departments:
        careers = dept.get("careerPaths", [])
        if not careers:
            dept["careerOutcomes"] = None
            continue

        # Collect unique job codes for this department's careers
        top_jobs = []
        tools_set = set()
        skills_set = set()
        certs_set = set()
        salary_samples = []
        industries = []

        for career in careers:
            mapped = mapping.get(career)
            if not mapped:
                continue
            code = mapped["jobCode"]
            details = job_details.get(code, {})

            top_jobs.append({
                "title": mapped["jobName"],
                "freshSalary": details.get("freshSalary", 0),
                "avgSalary": details.get("avgSalary", 0),
            })

            tools_set.update(details.get("tools", []))
            skills_set.update(details.get("skills", []))
            certs_set.update(details.get("certificates", []))
            if details.get("sampleSize"):
                salary_samples.append(details["sampleSize"])
            industries.extend(details.get("topIndustries", []))

        # Deduplicate industries (keep highest salary per name)
        industry_map = {}
        for ind in industries:
            name = ind["name"]
            if name not in industry_map or ind["salary"] > industry_map[name]["salary"]:
                industry_map[name] = ind

        dept["careerOutcomes"] = {
            "topJobs": top_jobs[:5],
            "freshAvgSalary": sum(j["freshSalary"] for j in top_jobs if j["freshSalary"]) // max(1, sum(1 for j in top_jobs if j["freshSalary"])) or 0,
            "avgSalary": sum(j["avgSalary"] for j in top_jobs if j["avgSalary"]) // max(1, sum(1 for j in top_jobs if j["avgSalary"])) or 0,
            "topIndustries": sorted(industry_map.values(), key=lambda x: x["salary"], reverse=True)[:5],
            "requiredTools": list(tools_set)[:5],
            "requiredSkills": list(skills_set)[:5],
            "requiredCerts": list(certs_set)[:3],
            "source": "104升學就業地圖",
            "fetchedAt": time.strftime("%Y-%m-%d"),
        }

    # Save
    with open(dept_path, "w", encoding="utf-8") as f:
        json.dump(departments, f, ensure_ascii=False, indent=2)

    # Stats
    enriched = sum(1 for d in departments if d.get("careerOutcomes"))
    with_salary = sum(1 for d in departments if d.get("careerOutcomes", {}).get("avgSalary", 0) > 0)
    print(f"[DONE] Enriched: {enriched}/{len(departments)} departments")
    print(f"  With salary data: {with_salary}")


if __name__ == "__main__":
    main()
