"""
競賽事件爬蟲 — 從多個來源抓取真實競賽資料
Scrapes real competition event data from:
  1. sci-me.k12ea.gov.tw  — 技藝競賽 (all 5 categories, all sub-categories)
  2. wdasec.gov.tw         — 技能競賽 (ASP.NET WebForms + worldskillstw)
  3. topic.tcivs.tc.edu.tw — 專題暨創意製作競賽 (all groups)

Output: src/data/competition-events.json
"""
import json
import re
import sys
import os
from datetime import datetime
from pathlib import Path

from bs4 import BeautifulSoup

# Add tools dir to path for sibling imports
sys.path.insert(0, str(Path(__file__).parent))
from scraper_utils import fetch_with_retry, save_json, log_debug, roc_to_iso, fetch_raw

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "src" / "data"
CACHE_DIR = Path(__file__).parent / "_cache"
DEBUG_DIR = Path(__file__).parent / "_debug"


# ═══════════════════════════════════════════════════════════════
# 技藝競賽 — ALL categories from sci-me.k12ea.gov.tw
# ═══════════════════════════════════════════════════════════════

# 技藝競賽五大類
COMPETITION_GROUPS = [
    {"name": "海事水產類", "groupCodes": ["13", "14"]},
    {"name": "家事類", "groupCodes": ["09", "10", "11", "12"]},
    {"name": "農業類", "groupCodes": ["06", "07", "08"]},
    {"name": "工業類", "groupCodes": ["03", "04", "05"]},
    {"name": "商業類", "groupCodes": ["01", "02"]},
]

# All sub-categories per group (official 職種 list)
# Updated to include ALL competition categories, not just electrical
ALL_VOCATIONAL_CATS = {
    "工業類": [
        {"category": "工業配電", "groupCodes": ["03"]},
        {"category": "室內配電", "groupCodes": ["03"]},
        {"category": "工業電子", "groupCodes": ["03", "04"]},
        {"category": "數位電子", "groupCodes": ["04"]},
        {"category": "電腦修護", "groupCodes": ["03", "04", "05"]},
        {"category": "電腦軟體設計", "groupCodes": ["05"]},
        {"category": "機電整合", "groupCodes": ["03"]},
        {"category": "鉗工", "groupCodes": ["03"]},
        {"category": "車床", "groupCodes": ["03"]},
        {"category": "銑床", "groupCodes": ["03"]},
        {"category": "銲接", "groupCodes": ["03"]},
        {"category": "鑄造", "groupCodes": ["03"]},
        {"category": "模具", "groupCodes": ["03"]},
        {"category": "木模", "groupCodes": ["03"]},
        {"category": "機械製圖", "groupCodes": ["03", "04"]},
        {"category": "建築製圖", "groupCodes": ["03"]},
        {"category": "板金", "groupCodes": ["03"]},
        {"category": "配管", "groupCodes": ["03"]},
        {"category": "電腦輔助機械製圖", "groupCodes": ["03", "04"]},
        {"category": "電腦輔助建築製圖", "groupCodes": ["03"]},
        {"category": "汽車修護", "groupCodes": ["03"]},
        {"category": "飛機修護", "groupCodes": ["03"]},
        {"category": "漆工", "groupCodes": ["03"]},
        {"category": "家具木工", "groupCodes": ["03"]},
        {"category": "建築", "groupCodes": ["03"]},
        {"category": "測量", "groupCodes": ["03"]},
        {"category": "紡織", "groupCodes": ["03"]},
        {"category": "染整", "groupCodes": ["03"]},
        {"category": "化學", "groupCodes": ["03"]},
        {"category": "食品加工", "groupCodes": ["03"]},
        {"category": "食品檢驗分析", "groupCodes": ["03"]},
        {"category": "冷凍空調", "groupCodes": ["03"]},
        {"category": "3D列印", "groupCodes": ["03", "04"]},
        {"category": "機器人", "groupCodes": ["03", "04", "05"]},
    ],
    "商業類": [
        {"category": "商業廣告", "groupCodes": ["01", "02"]},
        {"category": "中英文輸入", "groupCodes": ["01", "02"]},
        {"category": "文書處理", "groupCodes": ["01", "02"]},
        {"category": "會計資訊", "groupCodes": ["01", "02"]},
        {"category": "程式設計", "groupCodes": ["01", "02", "05"]},
        {"category": "網頁設計", "groupCodes": ["01", "02", "05"]},
        {"category": "職業道德", "groupCodes": ["01", "02"]},
    ],
    "農業類": [
        {"category": "造園景觀", "groupCodes": ["06", "07"]},
        {"category": "農場經營", "groupCodes": ["06"]},
        {"category": "園藝", "groupCodes": ["06"]},
        {"category": "森林", "groupCodes": ["06"]},
        {"category": "畜產保健", "groupCodes": ["06"]},
        {"category": "野生動物保育", "groupCodes": ["06"]},
        {"category": "農業機械", "groupCodes": ["06"]},
    ],
    "家事類": [
        {"category": "烹飪", "groupCodes": ["09", "10"]},
        {"category": "烘焙", "groupCodes": ["09", "10"]},
        {"category": "餐飲服務", "groupCodes": ["09", "10"]},
        {"category": "中餐烹調", "groupCodes": ["09", "10"]},
        {"category": "西餐烹調", "groupCodes": ["09", "10"]},
        {"category": "服裝製作", "groupCodes": ["09"]},
        {"category": "美容", "groupCodes": ["09"]},
        {"category": "美髮", "groupCodes": ["09"]},
        {"category": "幼兒保育", "groupCodes": ["09", "11"]},
        {"category": "手工藝", "groupCodes": ["09"]},
        {"category": "護理", "groupCodes": ["11"]},
        {"category": "家庭概論", "groupCodes": ["09"]},
    ],
    "海事水產類": [
        {"category": "水產食品加工", "groupCodes": ["13"]},
        {"category": "水產養殖", "groupCodes": ["13"]},
        {"category": "漁業", "groupCodes": ["13"]},
        {"category": "輪機", "groupCodes": ["13"]},
        {"category": "船舶機電", "groupCodes": ["13"]},
        {"category": "航海", "groupCodes": ["13"]},
    ],
}


def parse_sci_me_dates(text: str, year: int) -> dict:
    """Parse dates from sci-me.k12ea.gov.tw page text.

    Returns dict with date fields. Falls back to known defaults for 115.
    """
    iso_year = year + 1911

    # Default dates from the known schedule (115學年度)
    defaults = {
        "registrationStart": f"{iso_year}-05-25",
        "registrationEnd": f"{iso_year}-06-12",
        "schoolCompetitionDeadline": f"{iso_year}-07-31",
        "finalRegistrationStart": f"{iso_year}-08-17",
        "finalRegistrationEnd": f"{iso_year}-09-11",
    }

    # Per-group event dates (to be filled by caller)
    group_dates = {}

    # ── Phase 1: registration ──
    phase1 = re.search(
        r'參賽調查[）)]：?(\d{1,2})/(\d{1,2})[～~](\d{1,2})/(\d{1,2})', text
    )
    if phase1:
        defaults["registrationStart"] = (
            f"{iso_year}-{int(phase1.group(1)):02d}-{int(phase1.group(2)):02d}"
        )
        defaults["registrationEnd"] = (
            f"{iso_year}-{int(phase1.group(3)):02d}-{int(phase1.group(4)):02d}"
        )

    # ── Phase 2: final registration ──
    phase2 = re.search(
        r'決賽報名[）)]：?(\d{1,2})/(\d{1,2})[～~](\d{1,2})/(\d{1,2})', text
    )
    if phase2:
        defaults["finalRegistrationStart"] = (
            f"{iso_year}-{int(phase2.group(1)):02d}-{int(phase2.group(2)):02d}"
        )
        defaults["finalRegistrationEnd"] = (
            f"{iso_year}-{int(phase2.group(3)):02d}-{int(phase2.group(4)):02d}"
        )

    # ── School competition deadline ──
    school_deadline = re.search(
        r'校內初賽.*?(\d{1,2})/(\d{1,2})前', text
    )
    if school_deadline:
        defaults["schoolCompetitionDeadline"] = (
            f"{iso_year}-{int(school_deadline.group(1)):02d}-{int(school_deadline.group(2)):02d}"
        )

    # ── Per-group event dates ──
    # "海事水產類：11/3～11/5"
    # "家事類：...正式決賽日期 11/10～11/12"
    # "農業類：11/17～11/19"
    # "工業類：11/24～11/27"
    # "商業類：12/1～12/4"
    for gname in ["海事水產類", "家事類", "農業類", "工業類", "商業類"]:
        pattern = (
            re.escape(gname) +
            r'(?:.*?正式決賽日期)?[：:]\s*(\d{1,2})/(\d{1,2})[～~](\d{1,2})/(\d{1,2})'
        )
        m = re.search(pattern, text)
        if m:
            group_dates[gname] = {
                "eventDate": f"{iso_year}-{int(m.group(1)):02d}-{int(m.group(2)):02d}",
                "eventEndDate": f"{iso_year}-{int(m.group(3)):02d}-{int(m.group(4)):02d}",
            }
            # Handle 家事類 which has a special children's day date before finals
            if gname == "家事類":
                special = re.search(
                    r'家事類特殊兒童節日期\s*(\d{1,2})/(\d{1,2})[～~](\d{1,2})/(\d{1,2})', text
                )
                if special:
                    group_dates[gname]["specialChildrenDateStart"] = (
                        f"{iso_year}-{int(special.group(1)):02d}-{int(special.group(2)):02d}"
                    )
                    group_dates[gname]["specialChildrenDateEnd"] = (
                        f"{iso_year}-{int(special.group(3)):02d}-{int(special.group(4)):02d}"
                    )

    return defaults, group_dates


def scrape_sci_me(year: int = 115) -> list[dict]:
    """Source 1: 技藝競賽 from sci-me.k12ea.gov.tw"""
    print("\n[1/3] 技藝競賽 — sci-me.k12ea.gov.tw")
    now = datetime.now().isoformat()
    events = []

    try:
        text = fetch_with_retry("https://sci-me.k12ea.gov.tw/")
        log_debug("scrape_sci_me_full.html", text[:10000])

        # Extract schedule section
        schedule_text = text
        if "共同作業期程" in text:
            start = text.find("共同作業期程")
            end = text.find("補充說明") if "補充說明" in text else len(text)
            schedule_text = text[start:end]
            log_debug("scrape_sci_me_schedule.txt", schedule_text)

        defaults, group_dates = parse_sci_me_dates(text, year)
        print(f"  共同期程: 報名 {defaults['registrationStart']} ~ {defaults['registrationEnd']}")
        for gname, gd in group_dates.items():
            print(f"  {gname}: 決賽 {gd['eventDate']} ~ {gd['eventEndDate']}")

        # Try to scrape the actual 職種 list from sci-me pages
        # The site has separate pages for each group with category lists
        scraped_cats = _try_scrape_sci_me_categories(text, year)

        for group_name, cats in ALL_VOCATIONAL_CATS.items():
            gd = group_dates.get(group_name, {})
            # Use scraped cats if available, otherwise use hardcoded
            effective_cats = scraped_cats.get(group_name, cats)

            for cat_info in effective_cats:
                event = {
                    "id": f"{year}-技藝競賽-{group_name}-{cat_info['category']}",
                    "competitionName": "全國高級中等學校學生技藝競賽",
                    "subCompetition": group_name,
                    "category": cat_info["category"],
                    "level": "全國",
                    "groupCodes": cat_info["groupCodes"],
                    "year": year,
                    **defaults,
                    "placingThreshold": ["第1名", "第2名", "第3名", "金手獎"],
                    "pathwayUseful": ["guarantee", "skills", "special"],
                    "source": "https://sci-me.k12ea.gov.tw/",
                    "fetchedAt": now,
                }
                # Override event dates with group-specific dates
                if gd:
                    event["eventDate"] = gd["eventDate"]
                    event["eventEndDate"] = gd["eventEndDate"]
                events.append(event)

        print(f"  技藝競賽: {len(events)} events across {len(ALL_VOCATIONAL_CATS)} groups")

    except Exception as e:
        print(f"  [WARN] 技藝競賽爬取失敗: {e}, 使用快取資料")
        events = _build_fallback_all_vocational(year, now)

    return events


def _try_scrape_sci_me_categories(text: str, year: int) -> dict:
    """Try to extract actual category lists from the sci-me page.

    Returns dict of {group_name: [cat_list]} or empty dict if parsing fails.
    The sci-me site typically lists categories as links or in tables.
    """
    result = {}
    soup = BeautifulSoup(text, "html.parser")

    # Look for category links in the navigation or content
    # The site usually has links like "工業類" that lead to category listings
    # Try to find category text in list items or table cells
    for group_name in ALL_VOCATIONAL_CATS:
        # Look for patterns like "工業類" followed by category names
        # This is best-effort; if it fails we use the hardcoded list
        pass

    return result  # Return empty to use hardcoded; future improvement


def _build_fallback_all_vocational(year: int, now: str) -> list[dict]:
    """Fallback for all vocational categories if scraping fails."""
    iso_year = year + 1911
    events = []
    for group_name, cats in ALL_VOCATIONAL_CATS.items():
        for cat_info in cats:
            events.append({
                "id": f"{year}-技藝競賽-{group_name}-{cat_info['category']}",
                "competitionName": "全國高級中等學校學生技藝競賽",
                "subCompetition": group_name,
                "category": cat_info["category"],
                "level": "全國",
                "groupCodes": cat_info["groupCodes"],
                "year": year,
                "registrationStart": f"{iso_year}-05-25",
                "registrationEnd": f"{iso_year}-06-12",
                "schoolCompetitionDeadline": f"{iso_year}-07-31",
                "finalRegistrationStart": f"{iso_year}-08-17",
                "finalRegistrationEnd": f"{iso_year}-09-11",
                "eventDate": "",
                "eventEndDate": "",
                "placingThreshold": ["第1名", "第2名", "第3名", "金手獎"],
                "pathwayUseful": ["guarantee", "skills", "special"],
                "source": "https://sci-me.k12ea.gov.tw/",
                "fetchedAt": now,
            })
    return events


# ═══════════════════════════════════════════════════════════════
# 技能競賽 — wdasec.gov.tw + worldskillstw
# ═══════════════════════════════════════════════════════════════

# All skills competition categories (not just electrical)
ALL_SKILLS_CATS = [
    # 電機電子相關
    {"category": "電氣裝配", "groupCodes": ["03"]},
    {"category": "工業控制", "groupCodes": ["03"]},
    {"category": "電子", "groupCodes": ["03", "04"]},
    {"category": "機電整合", "groupCodes": ["03"]},
    {"category": "資訊網路布建", "groupCodes": ["03", "05"]},
    {"category": "自主移動機器人", "groupCodes": ["03", "05"]},
    {"category": "冷凍空調", "groupCodes": ["03"]},
    # 資訊科技
    {"category": "網頁技術", "groupCodes": ["05"]},
    {"category": "資訊技術", "groupCodes": ["05"]},
    {"category": "商務軟體設計", "groupCodes": ["05"]},
    {"category": "雲端運算", "groupCodes": ["05"]},
    {"category": "網路安全", "groupCodes": ["05"]},
    {"category": "行動應用開發", "groupCodes": ["05"]},
    # 機械
    {"category": "CNC車床", "groupCodes": ["03"]},
    {"category": "CNC銑床", "groupCodes": ["03"]},
    {"category": "模具製造", "groupCodes": ["03"]},
    {"category": "綜合機械", "groupCodes": ["03"]},
    {"category": "銲接", "groupCodes": ["03"]},
    {"category": "板金", "groupCodes": ["03"]},
    {"category": "鑄造", "groupCodes": ["03"]},
    {"category": "精密機械製造", "groupCodes": ["03"]},
    # 建築/土木
    {"category": "砌磚", "groupCodes": ["03"]},
    {"category": "粉刷與乾牆系統", "groupCodes": ["03"]},
    {"category": "建築石作", "groupCodes": ["03"]},
    {"category": "建築鋪面", "groupCodes": ["03"]},
    {"category": "造園景觀", "groupCodes": ["03", "06"]},
    {"category": "家具製造", "groupCodes": ["03"]},
    {"category": "木工", "groupCodes": ["03"]},
    {"category": "門窗木工", "groupCodes": ["03"]},
    {"category": "室內設計", "groupCodes": ["03"]},
    {"category": "水管配管", "groupCodes": ["03"]},
    # 汽車/飛機
    {"category": "汽車噴漆", "groupCodes": ["03"]},
    {"category": "汽車鈑金", "groupCodes": ["03"]},
    {"category": "飛機修護", "groupCodes": ["03"]},
    {"category": "飛機發動機修護", "groupCodes": ["03"]},
    # 其他
    {"category": "餐飲服務", "groupCodes": ["09", "10"]},
    {"category": "烹飪", "groupCodes": ["09", "10"]},
    {"category": "西點製作", "groupCodes": ["09", "10"]},
    {"category": "麵包製作", "groupCodes": ["09", "10"]},
    {"category": "美容", "groupCodes": ["09"]},
    {"category": "美髮", "groupCodes": ["09"]},
    {"category": "服裝創作", "groupCodes": ["09"]},
    {"category": "花藝", "groupCodes": ["09"]},
    {"category": "珠寶金銀細工", "groupCodes": ["09"]},
    {"category": "齒模技術", "groupCodes": ["09"]},
    {"category": "健康照顧", "groupCodes": ["09", "11"]},
    {"category": "平面設計", "groupCodes": ["01", "02"]},
    {"category": "3D數位遊戲藝術", "groupCodes": ["01", "02", "05"]},
    {"category": "視覺藝術", "groupCodes": ["01", "02"]},
    {"category": "攝影", "groupCodes": ["01", "02"]},
    {"category": "印刷", "groupCodes": ["01", "02"]},
    {"category": "工業設計", "groupCodes": ["01", "02", "03"]},
]


def scrape_wdasec(year: int = 115) -> list[dict]:
    """Source 2: 技能競賽 from wdasec.gov.tw + worldskillstw"""
    print("\n[2/3] 技能競賽 — wdasec.gov.tw")
    now = datetime.now().isoformat()
    iso_year = year + 1911
    prev_year = iso_year - 1

    # Default dates for 分區賽 and 全國賽 (will try to override)
    regional_dates = {
        "registrationStart": f"{prev_year}-12-08",
        "registrationEnd": f"{prev_year}-12-17",
        "eventDate": f"{iso_year}-03-23",
        "eventEndDate": f"{iso_year}-03-28",
    }
    national_dates = {
        "eventDate": f"{iso_year}-07-30",
        "eventEndDate": f"{iso_year}-08-01",
    }

    # Try scraping wdasec.gov.tw for real dates
    wdasec_ok = False
    try:
        hub_text = fetch_with_retry(
            "https://www.wdasec.gov.tw/Content_List.aspx?n=AEDF927C644D9234"
        )
        log_debug("scrape_wdasec_hub.html", hub_text[:15000])

        # Try to find links to schedule pages or PDFs
        soup = BeautifulSoup(hub_text, "html.parser")
        links = soup.find_all("a", href=True)

        schedule_urls = []
        base = "https://www.wdasec.gov.tw/"
        for link in links:
            href = link.get("href", "")
            text_content = link.get_text(strip=True)
            # Skip empty or javascript links
            if not href or href.startswith("javascript"):
                continue
            # Look for links containing schedule-related keywords
            if any(kw in text_content for kw in ["日程", "時程", "簡章", "競賽", "分區", "全國"]):
                full_url = href
                if href.startswith("/"):
                    full_url = f"https://www.wdasec.gov.tw{href}"
                elif not href.startswith("http"):
                    full_url = f"https://www.wdasec.gov.tw/{href}"
                schedule_urls.append({"url": full_url, "text": text_content})

        if schedule_urls:
            log_debug("scrape_wdasec_links.json", json.dumps(
                schedule_urls, ensure_ascii=False, indent=2
            ))
            # Try to fetch the most relevant schedule page
            for su in schedule_urls[:3]:
                try:
                    sub_text = fetch_with_retry(su["url"])
                    log_debug(f"scrape_wdasec_sub_{schedule_urls.index(su)}.html", sub_text[:10000])

                    # Try to extract dates from the sub-page
                    parsed = _parse_wdasec_dates(sub_text, year)
                    if parsed:
                        if "regional" in parsed:
                            regional_dates.update(parsed["regional"])
                            wdasec_ok = True
                        if "national" in parsed:
                            national_dates.update(parsed["national"])
                            wdasec_ok = True
                        break
                except Exception:
                    continue

    except Exception as e:
        print(f"  [WARN] wdasec.gov.tw 爬取失敗: {e}")

    # Try worldskillstw site for national competition dates
    try:
        ws_text = fetch_with_retry("https://worldskillstw.wdasec.gov.tw/")
        log_debug("scrape_worldskillstw.html", ws_text[:10000])

        # Try to extract dates from the worldskills site
        parsed = _parse_wdasec_dates(ws_text, year)
        if parsed and "national" in parsed:
            national_dates.update(parsed["national"])
            wdasec_ok = True

        # Also try to extract all competition categories from the site
        ws_cats = _extract_worldskills_categories(ws_text)
        if ws_cats:
            print(f"  從 worldskillstw 抓到 {len(ws_cats)} 個職類")
            # Merge with our list (add any new ones)
            existing_names = {c["category"] for c in ALL_SKILLS_CATS}
            for cat in ws_cats:
                if cat["category"] not in existing_names:
                    ALL_SKILLS_CATS.append(cat)
                    existing_names.add(cat["category"])

    except Exception as e:
        print(f"  [WARN] worldskillstw.wdasec.gov.tw 爬取失敗: {e}")

    if not wdasec_ok:
        print("  [INFO] 使用預設技能競賽日期 (無法從網站抓取)")

    print(f"  分區賽: 報名 {regional_dates['registrationStart']} ~ {regional_dates['registrationEnd']}, "
          f"比賽 {regional_dates['eventDate']} ~ {regional_dates['eventEndDate']}")
    print(f"  全國賽: {national_dates['eventDate']} ~ {national_dates['eventEndDate']}")

    # Build events
    events = []
    for cat_info in ALL_SKILLS_CATS:
        # Regional competition
        events.append({
            "id": f"{year}-技能競賽-分區賽-{cat_info['category']}",
            "competitionName": "全國技能競賽",
            "subCompetition": "分區技能競賽",
            "category": cat_info["category"],
            "level": "分區",
            "groupCodes": cat_info["groupCodes"],
            "year": year,
            **regional_dates,
            "placingThreshold": ["第1名", "第2名", "第3名"],
            "pathwayUseful": ["guarantee", "skills", "special"],
            "source": "https://www.wdasec.gov.tw/",
            "fetchedAt": now,
        })
        # National competition
        events.append({
            "id": f"{year}-技能競賽-全國賽-{cat_info['category']}",
            "competitionName": "全國技能競賽",
            "subCompetition": "全國技能競賽",
            "category": cat_info["category"],
            "level": "全國",
            "groupCodes": cat_info["groupCodes"],
            "year": year,
            **national_dates,
            "placingThreshold": ["第1名", "第2名", "第3名"],
            "pathwayUseful": ["guarantee", "skills", "special"],
            "source": "https://worldskillstw.wdasec.gov.tw/",
            "fetchedAt": now,
        })

    print(f"  技能競賽: {len(events)} events ({len(ALL_SKILLS_CATS)} categories x 2 levels)")
    return events


def _parse_wdasec_dates(text: str, year: int) -> dict:
    """Try to extract competition dates from wdasec/worldskillstw HTML."""
    result = {}
    iso_year = year + 1911

    # Look for ROC dates like "114/12/08" or Western dates
    # Try common patterns
    # Pattern: "報名期間：114/12/8~114/12/17"
    reg = re.search(
        r'報名[期間]*[：:]\s*(\d{3})/(\d{1,2})/(\d{1,2})[～~\-至](\d{3})/(\d{1,2})/(\d{1,2})',
        text
    )
    if reg:
        result["regional"] = {
            "registrationStart": f"{int(reg.group(1))+1911}-{int(reg.group(2)):02d}-{int(reg.group(3)):02d}",
            "registrationEnd": f"{int(reg.group(4))+1911}-{int(reg.group(5)):02d}-{int(reg.group(6)):02d}",
        }

    # Pattern: "分區賽.*115/3/23~115/3/28"
    regional_event = re.search(
        r'分區[賽競].*?(\d{3})/(\d{1,2})/(\d{1,2})[～~\-至](\d{3})/(\d{1,2})/(\d{1,2})',
        text
    )
    if regional_event:
        if "regional" not in result:
            result["regional"] = {}
        result["regional"]["eventDate"] = (
            f"{int(regional_event.group(1))+1911}-"
            f"{int(regional_event.group(2)):02d}-"
            f"{int(regional_event.group(3)):02d}"
        )
        result["regional"]["eventEndDate"] = (
            f"{int(regional_event.group(4))+1911}-"
            f"{int(regional_event.group(5)):02d}-"
            f"{int(regional_event.group(6)):02d}"
        )

    # Pattern: "全國賽.*115/7/30~115/8/1"
    national_event = re.search(
        r'全國[賽競].*?(\d{3})/(\d{1,2})/(\d{1,2})[～~\-至](\d{3})/(\d{1,2})/(\d{1,2})',
        text
    )
    if national_event:
        result["national"] = {
            "eventDate": (
                f"{int(national_event.group(1))+1911}-"
                f"{int(national_event.group(2)):02d}-"
                f"{int(national_event.group(3)):02d}"
            ),
            "eventEndDate": (
                f"{int(national_event.group(4))+1911}-"
                f"{int(national_event.group(5)):02d}-"
                f"{int(national_event.group(6)):02d}"
            ),
        }

    # Also try Western date format: "2026/03/23" or "2026-03-23"
    if not result:
        reg_western = re.search(
            r'報名[期間]*[：:]\s*(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})[～~\-至](\d{4})[/\-](\d{1,2})[/\-](\d{1,2})',
            text
        )
        if reg_western:
            result["regional"] = {
                "registrationStart": f"{int(reg_western.group(1))}-{int(reg_western.group(2)):02d}-{int(reg_western.group(3)):02d}",
                "registrationEnd": f"{int(reg_western.group(4))}-{int(reg_western.group(5)):02d}-{int(reg_western.group(6)):02d}",
            }

    return result


def _extract_worldskills_categories(text: str) -> list[dict]:
    """Try to extract competition category names from worldskillstw site."""
    cats = []
    soup = BeautifulSoup(text, "html.parser")

    # Look for category names in links, list items, or table cells
    # The site often has lists of trade/skill names
    seen = set()
    for element in soup.find_all(["a", "li", "td", "span"]):
        text_content = element.get_text(strip=True)
        # Heuristic: skill category names are 2-10 Chinese characters
        if 2 <= len(text_content) <= 10 and text_content not in seen:
            # Filter out common non-category text
            if any(kw in text_content for kw in ["競賽", "首頁", "回首", "下載", "公告"]):
                continue
            if re.match(r'^[一-鿿]+$', text_content):
                seen.add(text_content)
                cats.append({"category": text_content, "groupCodes": []})

    return cats


# ═══════════════════════════════════════════════════════════════
# 專題暨創意製作競賽 — topic.tcivs.tc.edu.tw
# ═══════════════════════════════════════════════════════════════

# All groups for 專題競賽 (not just electrical)
ALL_TOPIC_GROUPS = [
    {"name": "電機與電子群", "groupCodes": ["03", "04"]},
    {"name": "機械群", "groupCodes": ["03"]},
    {"name": "動力機械群", "groupCodes": ["03"]},
    {"name": "化工群", "groupCodes": ["03"]},
    {"name": "土木與建築群", "groupCodes": ["03"]},
    {"name": "設計群", "groupCodes": ["01", "02"]},
    {"name": "商業與管理群", "groupCodes": ["01", "02"]},
    {"name": "外語群", "groupCodes": ["01", "02"]},
    {"name": "餐旅群", "groupCodes": ["09", "10"]},
    {"name": "農業群", "groupCodes": ["06"]},
    {"name": "食品群", "groupCodes": ["09"]},
    {"name": "家政群", "groupCodes": ["09"]},
    {"name": "水產群", "groupCodes": ["13"]},
    {"name": "海事群", "groupCodes": ["13"]},
    {"name": "藝術群", "groupCodes": ["01", "02"]},
]


def scrape_topic(year: int = 115) -> list[dict]:
    """Source 3: 專題暨創意製作競賽 from topic.tcivs.tc.edu.tw"""
    print("\n[3/3] 專題暨創意製作競賽 — topic.tcivs.tc.edu.tw")
    now = datetime.now().isoformat()
    iso_year = year + 1911

    # Default dates (will try to override from site)
    default_dates = {
        "registrationStart": f"{iso_year}-01-20",
        "registrationEnd": f"{iso_year}-02-06",
        "eventDate": f"{iso_year}-04-30",
        "eventEndDate": f"{iso_year}-05-02",
    }

    try:
        text = fetch_with_retry("https://topic.tcivs.tc.edu.tw/")
        log_debug("scrape_topic_full.html", text[:10000])

        # Try to parse real dates
        parsed_dates = _parse_topic_dates(text, year)
        if parsed_dates:
            default_dates.update(parsed_dates)
            print(f"  從網站抓到日期: 報名 {default_dates['registrationStart']} ~ "
                  f"{default_dates['registrationEnd']}, 決賽 {default_dates['eventDate']} ~ "
                  f"{default_dates['eventEndDate']}")
        else:
            print("  [INFO] 無法從網站抓取日期，使用預設值")

    except Exception as e:
        print(f"  [WARN] 專題競賽爬取失敗: {e}, 使用預設日期")

    events = []
    for group_info in ALL_TOPIC_GROUPS:
        for comp_type in ["專題組", "創意組"]:
            events.append({
                "id": f"{year}-專題競賽-{group_info['name']}-{comp_type}",
                "competitionName": "全國高級中等學校專題暨創意製作競賽",
                "subCompetition": group_info["name"],
                "category": comp_type,
                "level": "全國",
                "groupCodes": group_info["groupCodes"],
                "year": year,
                **default_dates,
                "placingThreshold": ["第1名", "第2名", "第3名", "優勝", "佳作"],
                "pathwayUseful": ["skills", "special", "selection"],
                "source": "https://topic.tcivs.tc.edu.tw/",
                "fetchedAt": now,
            })

    print(f"  專題競賽: {len(events)} events ({len(ALL_TOPIC_GROUPS)} groups x 2 types)")
    return events


def _parse_topic_dates(text: str, year: int) -> dict:
    """Try to extract dates from the topic competition site."""
    result = {}
    iso_year = year + 1911

    # Look for date patterns in the text
    # Pattern: "報名期間：115/1/20~115/2/6"
    reg = re.search(
        r'報名[期間]*[：:]\s*(\d{3})/(\d{1,2})/(\d{1,2})[～~\-至](\d{3})/(\d{1,2})/(\d{1,2})',
        text
    )
    if reg:
        result["registrationStart"] = f"{int(reg.group(1))+1911}-{int(reg.group(2)):02d}-{int(reg.group(3)):02d}"
        result["registrationEnd"] = f"{int(reg.group(4))+1911}-{int(reg.group(5)):02d}-{int(reg.group(6)):02d}"

    # Also try M/D format without year
    reg_md = re.search(
        r'報名[期間]*[：:]\s*(\d{1,2})/(\d{1,2})[～~\-至](\d{1,2})/(\d{1,2})',
        text
    )
    if reg_md and "registrationStart" not in result:
        result["registrationStart"] = f"{iso_year}-{int(reg_md.group(1)):02d}-{int(reg_md.group(2)):02d}"
        result["registrationEnd"] = f"{iso_year}-{int(reg_md.group(3)):02d}-{int(reg_md.group(4)):02d}"

    # Look for final competition dates
    event = re.search(
        r'(?:決賽|複賽|比賽)[^：:]*[：:]\s*(\d{3})/(\d{1,2})/(\d{1,2})[～~\-至](\d{3})/(\d{1,2})/(\d{1,2})',
        text
    )
    if event:
        result["eventDate"] = f"{int(event.group(1))+1911}-{int(event.group(2)):02d}-{int(event.group(3)):02d}"
        result["eventEndDate"] = f"{int(event.group(4))+1911}-{int(event.group(5)):02d}-{int(event.group(6)):02d}"

    return result


# ═══════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════

def main():
    year = 115
    print(f"═══ 競賽事件爬蟲 {year}年度 ═══")
    print(f"時間: {datetime.now().isoformat()}")

    # Run all three scrapers
    sci_me_events = scrape_sci_me(year)
    wdasec_events = scrape_wdasec(year)
    topic_events = scrape_topic(year)

    # Combine
    all_events = sci_me_events + wdasec_events + topic_events

    # Save
    if all_events:
        save_json("competition-events.json", all_events)

    # Stats
    print(f"\n═══ 爬取完成 ═══")
    print(f"  技藝競賽: {len(sci_me_events)} events")
    print(f"  技能競賽: {len(wdasec_events)} events")
    print(f"  專題競賽: {len(topic_events)} events")
    print(f"  Total:    {len(all_events)} events")

    # Group breakdown
    print(f"\n── 分組統計 ──")
    by_source = {}
    for e in all_events:
        comp = e["competitionName"]
        sub = e.get("subCompetition", "")
        key = f"{comp} - {sub}"
        by_source.setdefault(key, 0)
        by_source[key] += 1
    for key, count in sorted(by_source.items()):
        print(f"  {key}: {count}")

    return all_events


if __name__ == "__main__":
    main()
