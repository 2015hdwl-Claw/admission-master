"""
從 techadmi.edu.tw 抓取科系簡介 + techadmiUrl
用途：為 departments.json 中的科系補充 fullDescription 和 techadmiUrl
策略：
  1. 先從學校科系列表頁 (schools_detail.php) 取得各科系的 seq 參數
  2. 再從科系詳細頁 (schools_detail_search.php?seq=X&psrid=Y) 抓取簡介
"""

import json
import re
import sys
import time
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    import requests
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
except ImportError:
    print("[ERROR] pip install requests")
    sys.exit(1)

DEPARTMENTS = Path(__file__).parent.parent / "src" / "data" / "departments.json"
CACHE = Path(__file__).parent / "_cache" / "_techadmi_cache.json"
CACHE.parent.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "zh-TW,zh;q=0.9",
}


def load_cache() -> dict:
    if CACHE.exists():
        with open(CACHE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache: dict):
    with open(CACHE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def fetch_school_depts(school_id: str) -> dict[str, str]:
    """Fetch the school's department list page and extract seq mappings.
    Returns dict of {dept_name: seq_id}
    """
    url = f"https://www.techadmi.edu.tw/schools_detail.php?sch_id={school_id}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, verify=False)
        resp.encoding = "utf-8"
        if resp.status_code != 200:
            return {}
        html = resp.text
        # Find all links like schools_detail_search.php?seq=XXXX&psrid=YYY
        # and extract the department name near the link
        results = {}
        # Pattern: href="schools_detail_search.php?seq=4204&psrid=202" ... >電機工程系<
        matches = re.findall(
            r'schools_detail_search\.php\?seq=(\d+)&psrid=(\d+)"[^>]*>[^<]*<[^>]*>([^<]+)',
            html
        )
        for seq, psrid, name in matches:
            clean_name = name.strip()
            if clean_name and seq:
                results[clean_name] = seq

        # Fallback: simpler pattern
        if not results:
            matches2 = re.findall(
                r'seq=(\d+)&psrid=(\d+)',
                html
            )
            # Find dept names near these links
            dept_blocks = re.findall(
                r'schools_detail_search\.php\?seq=(\d+)&psrid=(\d+)[^"]*"[^>]*>\s*(?:<[^>]*>)*\s*([^<]+)',
                html
            )
            for seq, psrid, name in dept_blocks:
                clean = name.strip()
                if clean:
                    results[clean] = seq

        return results
    except Exception as e:
        print(f"  [WARN] Failed to fetch school page {school_id}: {e}")
        return {}


def fetch_dept_detail(seq: str, school_id: str) -> tuple[str, str]:
    """Fetch the department detail page. Returns (fullDescription, techadmiUrl)."""
    url = f"https://www.techadmi.edu.tw/schools_detail_search.php?seq={seq}&psrid={school_id}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, verify=False)
        resp.encoding = "utf-8"
        if resp.status_code != 200:
            return "", url
        html = resp.text
        desc = extract_description(html)
        return desc, url
    except Exception as e:
        print(f"  [WARN] Failed to fetch {url}: {e}")
        return "", url


def extract_description(html: str) -> str:
    """Extract the research/特色 section from techadmi HTML."""
    patterns = [
        r"研究發展及特色\s*(?:</[^>]*>)?\s*(.*?)(?=課程規劃|就業發展|教學設備|升學進修)",
        r"教學目標\s*(?:</[^>]*>)?\s*(.*?)(?=研究發展|課程規劃|教學設備)",
    ]

    def strip_html(text: str) -> str:
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        # Remove numbered list markers
        text = re.sub(r"\d+\.", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    for pattern in patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            raw = match.group(1)
            clean = strip_html(raw)
            if len(clean) > 30:
                if len(clean) > 200:
                    clean = clean[:197] + "..."
                return clean

    return ""


def match_dept_name(name_in_json: str, name_in_techadmi: str) -> bool:
    """Flexible matching between department names."""
    # Exact match
    if name_in_json == name_in_techadmi:
        return True
    # One contains the other (e.g. "電機工程系" in "電機工程系生醫電子系統組")
    if name_in_json in name_in_techadmi or name_in_techadmi in name_in_json:
        return True
    return False


def main():
    print("=== techadmi 科系簡介 + URL 抓取 ===\n")

    with open(DEPARTMENTS, "r", encoding="utf-8") as f:
        departments = json.load(f)

    cache = load_cache()
    updated = 0
    skipped = 0

    # Group by school for efficient batch fetching
    schools: dict[str, list[tuple[int, dict]]] = {}
    for i, dept in enumerate(departments):
        sid = dept.get("schoolId", "")
        if sid not in schools:
            schools[sid] = []
        schools[sid].append((i, dept))

    for school_id, dept_list in schools.items():
        school_name = dept_list[0][1].get("schoolName", school_id)
        print(f"\n🏫 {school_name} ({school_id}) — {len(dept_list)} 個科系")

        # Check if all depts already have fullDescription and techadmiUrl
        all_done = all(
            d.get("fullDescription") and d.get("techadmiUrl")
            for _, d in dept_list
        )
        if all_done:
            skipped += len(dept_list)
            print(f"  ⏩ 全部已有資料，跳過")
            continue

        # Step 1: Fetch school page to get seq mappings
        print(f"  📡 抓取學校科系列表...")
        seq_map = fetch_school_depts(school_id)
        if seq_map:
            print(f"  📋 找到 {len(seq_map)} 個科系連結")
        else:
            print(f"  ⚠️ 未找到科系連結，嘗試直接搜尋...")

        time.sleep(1)

        # Step 2: For each department, find seq and fetch detail
        for idx, dept in dept_list:
            dept_name = dept.get("departmentName", "")
            cache_key = f"{school_id}_{dept_name}"

            # Check cache
            if cache_key in cache and cache[cache_key].get("desc"):
                cached = cache[cache_key]
                if not dept.get("fullDescription"):
                    dept["fullDescription"] = cached.get("desc", "")
                if not dept.get("techadmiUrl"):
                    dept["techadmiUrl"] = cached.get("url", "")
                updated += 1
                continue

            if dept.get("fullDescription") and dept.get("techadmiUrl"):
                skipped += 1
                continue

            # Find seq from school page
            seq = None
            for techadmi_name, techadmi_seq in seq_map.items():
                if match_dept_name(dept_name, techadmi_name):
                    seq = techadmi_seq
                    break

            if seq:
                desc, url = fetch_dept_detail(seq, school_id)
                if desc:
                    dept["fullDescription"] = desc
                dept["techadmiUrl"] = url
                cache[cache_key] = {"desc": desc, "url": url}
                updated += 1
                status = "✅" if desc else "⚠️ URL only"
                print(f"  {status} {dept_name}: {desc[:40] if desc else 'no desc'}...")
                time.sleep(1)
            else:
                # Fallback: try the schools_detail page URL (no seq)
                dept["techadmiUrl"] = f"https://www.techadmi.edu.tw/schools_detail.php?sch_id={school_id}"
                cache[cache_key] = {"desc": "", "url": dept["techadmiUrl"]}
                print(f"  ⚠️ {dept_name}: 未找到 seq，使用學校頁面")

    # Save
    save_cache(cache)
    with open(DEPARTMENTS, "w", encoding="utf-8") as f:
        json.dump(departments, f, ensure_ascii=False, indent=2)

    total_with_desc = sum(1 for d in departments if d.get("fullDescription"))
    total_with_url = sum(1 for d in departments if d.get("techadmiUrl"))
    print(f"\n{'═'*60}")
    print(f"[DONE] Updated: {updated}")
    print(f"  fullDescription: {total_with_desc}/{len(departments)}")
    print(f"  techadmiUrl: {total_with_url}/{len(departments)}")
    print(f"  Skipped: {skipped}")


if __name__ == "__main__":
    main()
