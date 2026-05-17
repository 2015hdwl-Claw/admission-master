"""
Scrape real pathway milestone dates from techadmi.edu.tw.
Replaces hardcoded deadlines in schedules.py with live data.

Each pathway page has a "辦理日程" section with rows of:
  <div class="col-sm-4 text-danger">milestone name</div>
  <div class="col-sm-8">date(s)</div>

Output: src/data/pathway-deadlines.json
"""
import re
import sys
from datetime import datetime
from pathlib import Path

from bs4 import BeautifulSoup

# Allow importing scraper_utils from the same directory
sys.path.insert(0, str(Path(__file__).parent))
from scraper_utils import (
    fetch_with_retry,
    get_techadmi_session,
    log_debug,
    parse_roc_date_range,
    parse_roc_dot_date,
    save_json,
)

# ── Configuration ──

PATHWAYS = [
    {"code": "comc07", "pathwayType": "stars",       "pathwayName": "繁星計畫"},
    {"code": "comc01", "pathwayType": "selection",    "pathwayName": "甄選入學"},
    {"code": "comc03", "pathwayType": "distribution", "pathwayName": "聯合登記分發"},
    {"code": "comc06", "pathwayType": "skills",       "pathwayName": "技優甄審"},
    {"code": "comc05", "pathwayType": "guarantee",    "pathwayName": "技優保送"},
    {"code": "comc08", "pathwayType": "special",      "pathwayName": "特殊選才"},
]

BASE_URL = "https://www.techadmi.edu.tw/edutype_list.php?type=1&type2={code}"
YEAR = 115


# ── HTML Parsing ──

def extract_schedule_pairs(html: str) -> list[tuple[str, str]]:
    """Extract (name, date_text) pairs from the 辦理日程 section.

    The HTML structure uses pairs of divs:
      <div class="col-sm-4 text-danger">milestone name</div>
      <div class="col-sm-8">date text</div>
    """
    soup = BeautifulSoup(html, "html.parser")

    # Find the 辦理日程 section heading
    schedule_heading = None
    for h4 in soup.find_all("h4"):
        if "辦理日程" in h4.get_text():
            schedule_heading = h4
            break

    if not schedule_heading:
        return []

    # Navigate to the accordion container that holds the milestone rows
    # Structure: h4 -> parent div -> next sibling div.row -> accordion -> card -> card-body -> row
    parent = schedule_heading.parent
    schedule_div = parent.find_next_sibling("div", class_="row")
    if not schedule_div:
        return []

    card_body = schedule_div.find("div", class_="card-body")
    if not card_body:
        return []

    inner_row = card_body.find("div", class_="row")
    if not inner_row:
        return []

    # Extract all col-sm-4 / col-sm-8 pairs
    pairs = []
    children = inner_row.find_all(recursive=False)
    i = 0
    while i < len(children) - 1:
        child = children[i]
        next_child = children[i + 1]

        # Skip <hr> elements
        if child.name == "hr":
            i += 1
            continue

        # Check if this is a name div (col-sm-4)
        classes = child.get("class", [])
        if "col-sm-4" in classes:
            name_text = child.get_text(strip=True)
            date_text = next_child.get_text(strip=True) if next_child.name != "hr" else ""
            if name_text and date_text:
                pairs.append((name_text, date_text))
            i += 2  # Skip both name and date divs
        else:
            i += 1

    return pairs


def parse_date_from_text(text: str) -> str:
    """Parse the first ROC date from text like '115.5.15(五)~5.22(五)'.

    Returns ISO date string for the start date, or empty string if not parseable.
    For date ranges, returns the start date.
    """
    # Try full ROC date with optional weekday marker
    m = re.search(r'(\d{3})\.(\d{1,2})\.(\d{1,2})', text)
    if not m:
        return ""

    year = int(m.group(1))
    month = int(m.group(2))
    day = int(m.group(3))
    iso_year = year + 1911
    return f"{iso_year:04d}-{month:02d}-{day:02d}"


def parse_date_range_from_text(text: str) -> dict:
    """Parse date range or single date from milestone text.

    Returns:
        {"date": "2026-05-15"} for single dates
        {"date": "2026-05-15", "endDate": "2026-05-22"} for ranges
        {} if no date found
    """
    # First try parse_roc_date_range from utils (handles 115.5.15(五)~5.22(五))
    result = parse_roc_date_range(text)
    if result:
        if "start" in result and "end" in result:
            return {"date": result["start"], "endDate": result["end"]}
        if "date" in result:
            return {"date": result["date"]}

    # Fallback: just extract the first date
    date = parse_date_from_text(text)
    if date:
        return {"date": date}

    return {}


def build_milestone(name: str, date_text: str) -> dict | None:
    """Build a milestone dict from name and raw date text."""
    parsed = parse_date_range_from_text(date_text)
    if not parsed:
        return None

    milestone = {
        "name": name,
        "date": parsed["date"],
        "description": name,
    }
    if "endDate" in parsed:
        milestone["endDate"] = parsed["endDate"]

    # Append extra context from date text (e.g., 【各校自訂】)
    if "各校自訂" in date_text:
        milestone["description"] = f"{name}（各校自訂）"
    elif "由高級中等學校辦理" in date_text:
        milestone["description"] = f"{name}（由高中辦理）"

    return milestone


# ── Main Scraper ──

def scrape_pathway(pathway_info: dict) -> dict | None:
    """Scrape a single pathway's milestones from techadmi."""
    code = pathway_info["code"]
    url = BASE_URL.format(code=code)
    pathway_type = pathway_info["pathwayType"]
    pathway_name = pathway_info["pathwayName"]

    print(f"  Fetching {pathway_name} ({code})...")

    try:
        html = fetch_with_retry(url, verify=False)
        log_debug(f"pathway_{code}.html", html)

        pairs = extract_schedule_pairs(html)
        if not pairs:
            print(f"    [WARN] No schedule found for {code}")
            return None

        milestones = []
        for name, date_text in pairs:
            milestone = build_milestone(name, date_text)
            if milestone:
                milestones.append(milestone)

        print(f"    Found {len(milestones)} milestones")

        return {
            "id": f"{YEAR}-{pathway_type}",
            "pathwayType": pathway_type,
            "pathwayName": pathway_name,
            "year": YEAR,
            "milestones": milestones,
            "source": url,
            "fetchedAt": datetime.now().isoformat(),
        }

    except Exception as e:
        print(f"    [ERROR] Failed to scrape {code}: {e}")
        return None


# ── Fallback Data ──
# Kept from the original schedules.py hardcoded values, used when scraping fails.

FALLBACK_DEADLINES = [
    {
        "id": f"{YEAR}-stars",
        "pathwayType": "stars",
        "pathwayName": "繁星計畫",
        "year": YEAR,
        "milestones": [
            {"name": "簡章公告", "date": "2025-11-15", "description": "招生簡章公告"},
            {"name": "報名截止", "date": "2025-12-12", "description": "學校上傳推薦名單截止"},
            {"name": "第一輪放榜", "date": "2026-01-05", "description": "第一輪分發結果"},
            {"name": "最終放榜", "date": "2026-01-19", "description": "最終錄取公告"},
        ],
        "source": "https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comc07",
    },
    {
        "id": f"{YEAR}-selection",
        "pathwayType": "selection",
        "pathwayName": "甄選入學",
        "year": YEAR,
        "milestones": [
            {"name": "統測報名", "date": "2026-01-05", "description": "統一入學測驗報名開始"},
            {"name": "統測報名截止", "date": "2026-01-19", "description": "報名截止"},
            {"name": "統測考試", "date": "2026-05-02", "description": "統一入學測驗"},
            {"name": "成績公告", "date": "2026-05-22", "description": "成績查詢"},
            {"name": "甄選報名", "date": "2026-06-01", "description": "甄選入學網路報名"},
            {"name": "報名截止", "date": "2026-06-10", "description": "報名截止"},
            {"name": "第一階段篩選", "date": "2026-06-20", "description": "統測成績篩選"},
            {"name": "備審上傳截止", "date": "2026-06-25", "description": "備審資料上傳截止"},
            {"name": "放榜", "date": "2026-07-15", "description": "錄取公告"},
        ],
        "source": "https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comc01",
    },
    {
        "id": f"{YEAR}-distribution",
        "pathwayType": "distribution",
        "pathwayName": "聯合登記分發",
        "year": YEAR,
        "milestones": [
            {"name": "統測考試", "date": "2026-05-02", "description": "統一入學測驗"},
            {"name": "成績公告", "date": "2026-05-22", "description": "成績查詢"},
            {"name": "登記志願", "date": "2026-07-20", "description": "網路登記志願開始"},
            {"name": "登記截止", "date": "2026-07-30", "description": "志願登記截止"},
            {"name": "放榜", "date": "2026-08-08", "description": "分發結果公告"},
        ],
        "source": "https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comc03",
    },
    {
        "id": f"{YEAR}-skills",
        "pathwayType": "skills",
        "pathwayName": "技優甄審",
        "year": YEAR,
        "milestones": [
            {"name": "簡章公告", "date": "2025-12-04", "description": "簡章下載"},
            {"name": "報名", "date": "2026-02-20", "description": "正式報名開始"},
            {"name": "報名截止", "date": "2026-03-05", "description": "報名截止"},
            {"name": "資格審查", "date": "2026-03-20", "description": "資格審查結果"},
            {"name": "備審上傳截止", "date": "2026-04-01", "description": "備審資料上傳截止"},
            {"name": "放榜", "date": "2026-05-15", "description": "錄取公告"},
        ],
        "source": "https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comc06",
    },
    {
        "id": f"{YEAR}-guarantee",
        "pathwayType": "guarantee",
        "pathwayName": "技優保送",
        "year": YEAR,
        "milestones": [
            {"name": "簡章公告", "date": "2025-12-04", "description": "簡章下載"},
            {"name": "報名", "date": "2026-02-20", "description": "正式報名開始"},
            {"name": "報名截止", "date": "2026-03-05", "description": "報名截止"},
            {"name": "資格審查", "date": "2026-03-20", "description": "資格審查結果"},
            {"name": "放榜", "date": "2026-04-15", "description": "保送分發結果"},
        ],
        "source": "https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comc05",
    },
    {
        "id": f"{YEAR}-special",
        "pathwayType": "special",
        "pathwayName": "特殊選才",
        "year": YEAR,
        "milestones": [
            {"name": "簡章公告", "date": "2025-10-01", "description": "各校簡章陸續公告"},
            {"name": "報名", "date": "2025-11-01", "description": "報名開始（各校不一）"},
            {"name": "報名截止", "date": "2025-11-30", "description": "報名截止"},
            {"name": "放榜", "date": "2026-01-05", "description": "錄取公告"},
        ],
        "source": "https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comc08",
    },
]

FALLBACK_BY_TYPE = {d["pathwayType"]: d for d in FALLBACK_DEADLINES}


def main():
    print(f"=== Scraping pathway deadlines from techadmi.edu.tw (Year {YEAR}) ===\n")

    results = []
    scraped_types = set()

    for pathway_info in PATHWAYS:
        scraped = scrape_pathway(pathway_info)
        if scraped:
            results.append(scraped)
            scraped_types.add(pathway_info["pathwayType"])
        else:
            # Use fallback data
            fallback = FALLBACK_BY_TYPE.get(pathway_info["pathwayType"])
            if fallback:
                fallback["fetchedAt"] = datetime.now().isoformat()
                results.append(fallback)
                print(f"    Using fallback data for {pathway_info['pathwayName']}")

    # Sort by pathway order
    type_order = {p["pathwayType"]: i for i, p in enumerate(PATHWAYS)}
    results.sort(key=lambda x: type_order.get(x["pathwayType"], 99))

    # Save
    save_json("pathway-deadlines.json", results)

    # Summary
    total_milestones = sum(len(r["milestones"]) for r in results)
    scraped_count = len(scraped_types)
    fallback_count = len(results) - scraped_count
    print(f"\n=== Summary ===")
    print(f"  Scraped: {scraped_count} pathways")
    print(f"  Fallback: {fallback_count} pathways")
    print(f"  Total: {len(results)} pathways, {total_milestones} milestones")

    # Print each pathway's milestones for verification
    for r in results:
        source_tag = "LIVE" if r["pathwayType"] in scraped_types else "FALLBACK"
        print(f"\n  [{source_tag}] {r['pathwayName']} ({r['pathwayType']}):")
        for m in r["milestones"]:
            end_str = f" ~ {m['endDate']}" if "endDate" in m else ""
            print(f"    {m['date']}{end_str}  {m['name']}")


if __name__ == "__main__":
    main()
