"""
四技二專科系資料生成器 (GLM API)
用途：從 GLM API 批次生成所有技專校院科系資料
輸出：src/data/departments.json

策略：
- 逐校處理，每校獨立 retry
- 指數退避：429 時等待 30s → 60s → 120s
- 成功後冷卻 15s，避免連續觸發 rate limit
- 可中斷續傳（cache file）
"""

import json
import os
import sys
import time
from pathlib import Path

# Force UTF-8 output on Windows (cp950 can't handle Chinese from API responses)
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Config ──
API_KEY = os.getenv("CLASSIFIER_API_KEY", "7571f91152a74a669179d3a2c67c513a.E6KUmy0NNEwTYdKK")
BASE_URL = os.getenv("CLASSIFIER_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/")
MODEL = os.getenv("CLASSIFIER_MODEL", "glm-4.7-flash")
COOLDOWN = int(os.getenv("SCRAPER_COOLDOWN", "15"))  # seconds between successful requests

# ── Target schools ──
SCHOOLS = [
    # 國立科大
    {"id": "ntust", "name": "國立臺灣科技大學", "type": "public"},
    {"id": "ntut", "name": "國立臺北科技大學", "type": "public"},
    {"id": "yuntech", "name": "國立雲林科技大學", "type": "public"},
    {"id": "nkust", "name": "國立高雄科技大學", "type": "public"},
    {"id": "nfcu", "name": "國立虎尾科技大學", "type": "public"},
    {"id": "ncut", "name": "國立勤益科技大學", "type": "public"},
    {"id": "npust", "name": "國立屏東科技大學", "type": "public"},
    {"id": "ntou", "name": "國立臺灣海洋大學", "type": "public"},
    {"id": "nchu", "name": "國立中興大學", "type": "public"},
    {"id": "ncyu", "name": "國立嘉義大學", "type": "public"},
    {"id": "nutn", "name": "國立臺南大學", "type": "public"},
    {"id": "ncnu", "name": "國立暨南國際大學", "type": "public"},
    {"id": "nkmu", "name": "國立高雄餐旅大學", "type": "public"},
    {"id": "npue", "name": "國立臺東大學", "type": "public"},
    {"id": "nznu", "name": "國立臺中教育大學", "type": "public"},
    {"id": "cyut", "name": "國立聯合大學", "type": "public"},
    # 私立科大
    {"id": "lhu", "name": "龍華科技大學", "type": "private"},
    {"id": "stust", "name": "南臺科技大學", "type": "private"},
    {"id": "mdu", "name": "明志科技大學", "type": "private"},
    {"id": "sjtu", "name": "聖約翰科技大學", "type": "private"},
    {"id": "kuas", "name": "崑山科技大學", "type": "private"},
    {"id": "tust", "name": "淡江大學", "type": "private"},
    {"id": "hwu", "name": "弘光科技大學", "type": "private"},
    {"id": "ctust", "name": "中臺科技大學", "type": "private"},
    {"id": "cust", "name": "中華科技大學", "type": "private"},
    {"id": "tit", "name": "臺北城市科技大學", "type": "private"},
    {"id": "wzu", "name": "吳鳳科技大學", "type": "private"},
    {"id": "dlit", "name": "東南科技大學", "type": "private"},
]

# ── 職群對照 ──
GROUPS = {
    "01": "餐旅群", "02": "機械群", "03": "電機群", "04": "電子群",
    "05": "資訊群", "06": "商業與管理群", "07": "設計群", "08": "農業群",
    "09": "化工群", "10": "土木群", "11": "海事群", "12": "護理群",
    "13": "家政群", "14": "語文群", "15": "商業與管理群",
}

PATHWAYS = ["stars", "selection", "distribution", "skills", "guarantee", "special"]

PROMPT_TEMPLATE = """請列出「{school_name}」所有四技日間部科系（含學士班）的資料。

每個科系必須包含以下欄位，以 JSON array 輸出：
- departmentName: 科系全名
- groupCode: 對應職群代碼（{group_list}），如果科系對應多個職群選最主要的
- groupName: 職群名稱
- description: 一句話介紹（15字以內）
- website: 科系官網完整網址（格式如 https://www.xxx.edu.tw/yyy/）
- features: 教學特色，2-3個字串
- researchAreas: 研究方向，2-3個字串
- careerPaths: 畢業出路，3-5個字串
- pathways: 6種入學管道的資料，每個包含：
  - available: boolean
  - acceptanceRate: 去年錄取率（%，整數，合理估計即可）
  - deadline: 截止日期（如 10/15）
  - quota: 招生名額（整數，合理估計）
  - lowestScore: 去年最低錄取分（如有）
  - requiredCertificate: 需要的證照（如有）
  - requiredCompetition: 需要的競賽成績（如有）
  - specialNote: 特別備註（如有）
  - minGradePercentile: 在校成績門檻百分比（如有，如 15 表示前15%）

6種管道 key：stars（繁星推薦）, selection（甄選入學）, distribution（聯合登記分發）, skills（技優甄審）, guarantee（技優保送）, special（特殊選才）

注意：
1. 只列四技日間部科系，不要列研究所或進修部
2. 網址必須是該科系的官方網頁
3. 錄取率、名額、分數用合理估計
4. 如果某個管道不適用，available 設為 false，其他欄位可省略

輸出格式：
{{"departments": [...]}}"""


def call_glm(prompt: str, max_retries: int = 3) -> str:
    """Call GLM API with exponential backoff."""
    import urllib.request
    import urllib.error

    url = f"{BASE_URL}chat/completions"
    payload = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "你是台灣技專校院科系資料專家。請用 JSON 格式回答，不要加 markdown code block。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 4000,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 30 * (2 ** attempt)  # 30s → 60s → 120s
                print(f"  [WARN] Rate limited (attempt {attempt+1}/{max_retries}), waiting {wait}s...")
                time.sleep(wait)
            elif e.code == 1113:
                print(f"  [WARN] Token limit reached")
                return ""
            else:
                body = e.read().decode()[:200] if hasattr(e, 'read') else ''
                print(f"  [FAIL] HTTP {e.code}: {body}")
                time.sleep(10)
        except Exception as e:
            print(f"  [FAIL] Error: {e}")
            time.sleep(10)

    return ""


def generate_departments_for_school(school: dict) -> list:
    """Use GLM API to generate department data for a school."""
    group_list = ', '.join(f'{k}={v}' for k, v in GROUPS.items())
    prompt = PROMPT_TEMPLATE.format(school_name=school['name'], group_list=group_list)

    print(f"\n>> Generating departments for {school['name']}...")
    result = call_glm(prompt)

    if not result:
        print(f"  [FAIL] No response from API")
        return []

    try:
        clean = result.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()

        data = json.loads(clean)
        departments = data.get("departments", [])
        if not departments:
            if isinstance(data, list):
                departments = data
        print(f"  [OK] Got {len(departments)} departments")
        return departments
    except json.JSONDecodeError as e:
        print(f"  [FAIL] JSON parse error: {e}")
        print(f"     Response preview: {result[:300]}")
        return []


def build_department_entry(school: dict, dept_data: dict) -> dict:
    """Build a complete department entry from raw data."""
    # Generate ID
    raw_name = dept_data.get("departmentName", "")
    short = raw_name.replace("系", "").replace("學系", "").replace(" ", "")
    dept_id = f"{school['id']}-{short}".lower()

    pathways = {}
    raw_pathways = dept_data.get("pathways", {})
    if not isinstance(raw_pathways, dict):
        raw_pathways = {}
    for pw in PATHWAYS:
        raw = raw_pathways.get(pw, {})
        if not isinstance(raw, dict):
            raw = {}
        entry = {
            "available": raw.get("available", False),
            "acceptanceRate": raw.get("acceptanceRate", 0),
            "deadline": raw.get("deadline", ""),
        }
        if raw.get("quota"):
            entry["quota"] = raw["quota"]
        if raw.get("lowestScore"):
            entry["lowestScore"] = raw["lowestScore"]
        if raw.get("minGradePercentile"):
            entry["minGradePercentile"] = raw["minGradePercentile"]
        if raw.get("requiredCertificate"):
            entry["requiredCertificate"] = raw["requiredCertificate"]
        if raw.get("requiredCompetition"):
            entry["requiredCompetition"] = raw["requiredCompetition"]
        if raw.get("specialNote"):
            entry["specialNote"] = raw["specialNote"]
        pathways[pw] = entry

    return {
        "id": dept_id,
        "schoolId": school["id"],
        "schoolName": school["name"],
        "departmentName": raw_name,
        "groupCode": str(dept_data.get("groupCode", "05")),
        "groupName": dept_data.get("groupName", "資訊群"),
        "description": dept_data.get("description", ""),
        "website": dept_data.get("website", ""),
        "features": dept_data.get("features", []),
        "researchAreas": dept_data.get("researchAreas", []),
        "careerPaths": dept_data.get("careerPaths", []),
        "pathways": pathways,
    }


def main():
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "src" / "data"
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "departments.json"
    cache_file = Path(__file__).parent / "_cache_departments.json"

    # Load cache (resume support)
    all_departments = []
    processed_schools = set()
    failed_schools = set()

    if cache_file.exists():
        with open(cache_file, "r", encoding="utf-8") as f:
            cache = json.load(f)
            all_departments = cache.get("departments", [])
            processed_schools = set(cache.get("processed_schools", []))
            failed_schools = set(cache.get("failed_schools", []))
        print(f"[CACHE] Resuming: {len(all_departments)} departments, {len(processed_schools)} done, {len(failed_schools)} failed")

    total_schools = len(SCHOOLS)
    stats = {"success": len(processed_schools), "failed": len(failed_schools), "skipped": 0}

    for i, school in enumerate(SCHOOLS):
        if school["id"] in processed_schools:
            print(f"\n[SKIP] [{i+1}/{total_schools}] Skipping {school['name']} (already done)")
            stats["skipped"] += 1
            continue

        raw_depts = generate_departments_for_school(school)

        if raw_depts:
            for dept_data in raw_depts:
                entry = build_department_entry(school, dept_data)
                all_departments.append(entry)
            processed_schools.add(school["id"])
            failed_schools.discard(school["id"])
            stats["success"] += 1
            print(f"  [STATS] Total departments so far: {len(all_departments)}")
        else:
            failed_schools.add(school["id"])
            stats["failed"] += 1
            print(f"  [WARN] Will retry {school['name']} next run")

        # Save cache after each school
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump({
                "departments": all_departments,
                "processed_schools": list(processed_schools),
                "failed_schools": list(failed_schools),
            }, f, ensure_ascii=False, indent=2)

        # Cooldown between requests
        if i < total_schools - 1 and school["id"] not in processed_schools or raw_depts:
            print(f"  [COOLDOWN] {COOLDOWN}s...")
            time.sleep(COOLDOWN)

    # Deduplicate by id
    seen_ids = set()
    unique_departments = []
    for d in all_departments:
        if d["id"] not in seen_ids:
            seen_ids.add(d["id"])
            unique_departments.append(d)

    # Write final output
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(unique_departments, f, ensure_ascii=False, indent=2)

    # Stats
    schools_count = len(set(d["schoolId"] for d in unique_departments))
    print(f"\n{'='*50}")
    print(f"[DONE] {len(unique_departments)} departments across {schools_count} schools")
    print(f"   Output: {output_file}")
    print(f"   Stats: {stats['success']} success, {stats['failed']} failed, {stats['skipped']} skipped")

    if stats["failed"] > 0:
        print(f"\n[WARN] Failed schools (will retry next run):")
        for sid in failed_schools:
            s = next((s for s in SCHOOLS if s["id"] == sid), None)
            if s:
                print(f"   - {s['name']}")

    if not failed_schools and cache_file.exists():
        cache_file.unlink()
        print(f"[CLEANUP] Cache removed")


if __name__ == "__main__":
    main()
