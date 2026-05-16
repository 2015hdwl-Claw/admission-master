"""
從 techadmi.edu.tw 抓取科系簡介 + techadmiUrl + YouTube 連結

策略：
  1. 先訪問 schools.php?group_id=03 建立 session
  2. 訪問 schools_detail.php?psrid={schoolId} 取得 <option> 裡的 seq 映射
  3. 用 schools_detail_search.php?seq={seq}&psrid={schoolId} 抓取：
     - fullDescription: 研究發展及特色
     - youtubeUrl: YouTube 影片連結
     - techadmiUrl: 科系詳細頁 URL

注意：
  - schools_detail.php 需要 session，否則返回 redirect
  - 科系名稱對應為 many-to-one（如「電機工程系生醫電子系統組」→「電機工程系」）
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
CACHE = Path(__file__).parent / "_cache" / "_techadmi_v2_cache.json"
CACHE.parent.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}


def load_cache() -> dict:
    if CACHE.exists():
        with open(CACHE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache: dict):
    with open(CACHE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def create_session() -> requests.Session:
    """Create session and warm up by visiting group page."""
    s = requests.Session()
    s.headers.update(HEADERS)
    s.get("https://www.techadmi.edu.tw/schools.php?group_id=03", verify=False, timeout=15)
    return s


def fetch_seq_map(session: requests.Session, school_id: str) -> dict[str, str]:
    """Fetch school detail page and extract {dept_name: seq} from <option> tags."""
    url = f"https://www.techadmi.edu.tw/schools_detail.php?psrid={school_id}"
    try:
        resp = session.get(url, verify=False, timeout=15)
        resp.encoding = "utf-8"
        if resp.status_code != 200 or len(resp.text) < 100:
            return {}

        options = re.findall(
            r'<option\s+value="(\d+)"\s*>([^<]+)</option>', resp.text
        )
        return {name.strip(): seq for seq, name in options if name.strip()}
    except Exception as e:
        print(f"    [WARN] Failed to fetch school page {school_id}: {e}")
        return {}


def extract_description(html: str) -> str:
    """Extract '研究發展及特色' from techadmi HTML."""
    patterns = [
        (r'研究發展及特色\s*(?:</[^>]*>)?\s*(.*?)(?=課程規劃|教學設備|就業發展|升學進修)', True),
        (r'教學目標\s*(?:</[^>]*>)?\s*(.*?)(?=研究發展|課程規劃|教學設備)', True),
    ]
    for pattern, _ in patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            text = clean_html(match.group(1))
            if len(text) > 30:
                return text[:500]
    return ""


def extract_youtube(html: str) -> str:
    """Extract YouTube video URL from techadmi HTML."""
    for pattern in [
        r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'youtu\.be/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
    ]:
        match = re.search(pattern, html)
        if match:
            return f"https://www.youtube.com/watch?v={match.group(1)}"
    return ""


def clean_html(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&nbsp;|&#160;', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def match_dept_name(name_in_json: str, name_in_techadmi: str) -> bool:
    """Match department names (many-to-one: sub-group -> base dept)."""
    n1 = name_in_json.replace(' ', '')
    n2 = name_in_techadmi.replace(' ', '')
    if n1 == n2:
        return True
    # e.g. "電機工程系生醫電子系統組" contains "電機工程系"
    if n2 in n1:
        return True
    return False


def main():
    print("=== techadmi 科系完整資料抓取 (v2) ===\n")

    with open(DEPARTMENTS, "r", encoding="utf-8") as f:
        departments = json.load(f)

    cache = load_cache()
    stats = {"updated": 0, "desc": 0, "youtube": 0, "skipped": 0, "no_seq": 0}

    # Create session
    print("🌐 建立 session...")
    session = create_session()
    print("✅ Session 已建立\n")

    # Group by school
    schools: dict[str, list[tuple[int, dict]]] = {}
    for i, dept in enumerate(departments):
        sid = dept.get("schoolId", "")
        if sid not in schools:
            schools[sid] = []
        schools[sid].append((i, dept))

    for school_id, dept_list in schools.items():
        school_name = dept_list[0][1].get("schoolName", school_id)
        print(f"\n🏫 {school_name} ({school_id}) — {len(dept_list)} 個科系")

        # Step 1: Get seq map from school detail page
        seq_map = fetch_seq_map(session, school_id)
        if seq_map:
            print(f"  📋 找到 {len(seq_map)} 個科系: {list(seq_map.keys())[:5]}...")
        else:
            print(f"  ⚠️ 未找到科系 seq 映射")

        time.sleep(0.3)

        # Step 2: Process each department
        for idx, dept in dept_list:
            dept_name = dept.get("departmentName", "")
            cache_key = f"{school_id}_{dept_name}"

            # Check cache
            if cache_key in cache:
                cached = cache[cache_key]
                if cached.get("desc"):
                    dept["fullDescription"] = cached["desc"]
                    stats["desc"] += 1
                if cached.get("url"):
                    dept["techadmiUrl"] = cached["url"]
                    stats["updated"] += 1
                if cached.get("youtube"):
                    dept["youtubeUrl"] = cached["youtube"]
                    stats["youtube"] += 1
                continue

            # Skip if already complete
            if dept.get("fullDescription") and dept.get("techadmiUrl") and dept.get("youtubeUrl"):
                stats["skipped"] += 1
                continue

            # Find matching seq
            seq = None
            for techadmi_name, techadmi_seq in seq_map.items():
                if match_dept_name(dept_name, techadmi_name):
                    seq = techadmi_seq
                    break

            if seq:
                detail_url = f"https://www.techadmi.edu.tw/schools_detail_search.php?seq={seq}&psrid={school_id}"
                try:
                    resp = session.get(detail_url, verify=False, timeout=15)
                    resp.encoding = "utf-8"
                    html = resp.text

                    desc = extract_description(html)
                    youtube = extract_youtube(html)

                    if desc:
                        dept["fullDescription"] = desc
                        stats["desc"] += 1
                    dept["techadmiUrl"] = detail_url
                    if youtube:
                        dept["youtubeUrl"] = youtube
                        stats["youtube"] += 1

                    cache[cache_key] = {"desc": desc, "url": detail_url, "youtube": youtube}
                    stats["updated"] += 1

                    parts = []
                    if desc:
                        parts.append(f"簡介{len(desc)}字")
                    if youtube:
                        parts.append("影片")
                    status = "✅ " + " + ".join(parts) if parts else "⚠️ 無簡介"
                    print(f"  {status} — {dept_name}")
                except Exception as e:
                    dept["techadmiUrl"] = detail_url
                    cache[cache_key] = {"desc": "", "url": detail_url, "youtube": ""}
                    print(f"  ⚠️ 錯誤: {dept_name}: {e}")

                time.sleep(0.3)
            else:
                school_url = f"https://www.techadmi.edu.tw/schools_detail.php?psrid={school_id}"
                dept["techadmiUrl"] = school_url
                cache[cache_key] = {"desc": "", "url": school_url, "youtube": ""}
                stats["no_seq"] += 1
                print(f"  ⚠️ 無匹配 seq: {dept_name}")

    # Save
    save_cache(cache)
    with open(DEPARTMENTS, "w", encoding="utf-8") as f:
        json.dump(departments, f, ensure_ascii=False, indent=2)

    total_desc = sum(1 for d in departments if d.get("fullDescription"))
    total_url = sum(1 for d in departments if d.get("techadmiUrl"))
    total_yt = sum(1 for d in departments if d.get("youtubeUrl"))

    print(f"\n{'═'*60}")
    print(f"[DONE] 處理完成")
    print(f"  fullDescription: {total_desc}/{len(departments)}")
    print(f"  techadmiUrl:     {total_url}/{len(departments)}")
    print(f"  youtubeUrl:      {total_yt}/{len(departments)}")
    print(f"  Skipped:         {stats['skipped']}")
    print(f"  No seq match:    {stats['no_seq']}")


if __name__ == "__main__":
    main()
