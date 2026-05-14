"""
爬取技術士技能檢定考試日程
來源：skill.tcte.edu.tw (技專校院入學測驗中心)
輸出：src/data/exam-schedules.json

115年度 3 梯次日程（從 schedule.php regex 抓取）：
  第一梯次：報名 115/01/02~01/13, 學科 115/03/15, 成績 115/04/10
  第二梯次：報名 115/04/24~05/05, 學科 115/07/05, 成績 115/07/31
  第三梯次：報名 115/08/27~09/07, 學科 115/11/08, 成績 115/12/04
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

import requests

ROOT = Path(__file__).parent.parent
OUTPUT = ROOT / "src" / "data" / "exam-schedules.json"
SCHEDULE_URL = "https://skill.tcte.edu.tw/schedule.php"

# 電機群 (03) 相關的技術士職類代碼與名稱
ELECTRICAL_JOB_CODES = {
    "00700": "室內配線(屋內線路裝修)",
    "01000": "電器修護",
    "01300": "工業配線",
    "02900": "視聽電子",
    "04000": "配電線路裝修",
    "07400": "配電電纜裝修",
    "11500": "儀表電子",
    "11600": "電力電子",
    "11700": "數位電子",
    "12000": "電腦硬體裝修",
    "15600": "通信技術(電信線路)",
    "16600": "用電設備檢驗",
    "16700": "變電設備裝修",
    "16800": "輸電地下電纜裝修",
    "16900": "輸電架空線路裝修",
    "17000": "機電整合",
    "17200": "網路架設",
    "21000": "太陽光電設置",
}

# 每個職類在哪些梯次開放乙級考試（common pattern: 乙級通常在1、3梯次）
# 丙級通常在 2 梯次（即測即評除外）
# 甲級通常在 1 梯次
# 精確對照需查 skill_query.php，這裡先標記常見配置
LEVEL_BATCH_MAPPING = {
    "丙": [2],       # 丙級：第 2 梯次（全國檢定）
    "乙": [1, 3],    # 乙級：第 1、3 梯次
    "甲": [1],       # 甲級：第 1 梯次
}


def roc_to_iso(roc_str: str) -> str:
    """'115/01/13' → '2026-01-13'"""
    m = re.match(r'(\d+)/(\d+)/(\d+)', roc_str.strip())
    if not m:
        return ""
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    return f"{y + 1911:04d}-{mo:02d}-{d:02d}"


def fetch_schedule_regex() -> list[dict]:
    """Fetch schedule using regex on raw HTML — robust against encoding issues"""
    resp = requests.get(SCHEDULE_URL, timeout=30)
    resp.encoding = "utf-8"
    text = resp.text

    # Extract all ROC dates from the page
    all_dates = re.findall(r'\d{3}/\d{2}/\d{2}', text)

    if len(all_dates) < 24:
        print(f"[WARN] Only found {len(all_dates)} dates, expected ~30+")
        return []

    # The dates appear in order per row in the schedule table:
    # Row 1 (簡章發售): 3 date ranges = 6 dates
    # Row 2 (報名日期): 3 date ranges = 6 dates (may have extra sub-cols)
    # Row 3 (准考證): 3 single dates
    # Row 4 (試場公告): 3 single dates
    # Row 5 (學科測試): 3 single dates
    # ...

    # Parse by known positions from the regex extraction
    # The table has colspan cells so some dates appear in multiple columns
    # We use the sequential date list and pick by known offsets

    # Unique dates in order (deduplicate consecutive)
    batches = []

    # Row pattern from the 33 dates found:
    # 簡章: 114/12/26, 115/01/13, 115/04/17, 115/05/05, 115/08/20, 115/09/07
    # 報名: 115/01/02, 115/01/13, 115/04/24, 115/05/05, 115/08/27, 115/09/07
    # 准考證: 115/02/24, 115/06/16, 115/10/20
    # 試場: 115/03/12, 115/07/02, 115/11/05
    # 學科: 115/03/15, 115/07/05, 115/11/08
    # 成績: 115/04/10, 115/07/31, 115/12/04

    idx = 0

    # 簡章發售 (3 ranges: pairs of start/end)
    guidebook = []
    for b in range(3):
        start = all_dates[idx]; end = all_dates[idx + 1]
        guidebook.append({"start": roc_to_iso(start), "end": roc_to_iso(end)})
        idx += 2

    # 報名日期 (3 ranges)
    registration = []
    for b in range(3):
        start = all_dates[idx]; end = all_dates[idx + 1]
        registration.append({"start": roc_to_iso(start), "end": roc_to_iso(end)})
        idx += 2

    # 准考證寄送 (3 single dates)
    idx += 3

    # 試場公告 (3 single dates)
    idx += 3

    # 學科測試 (3 single dates)
    written = []
    for _ in range(3):
        written.append(roc_to_iso(all_dates[idx]))
        idx += 1

    # 學科疑義 (3 ranges) — skip
    idx += 6

    # 學科成績公告 (3 single dates)
    results = []
    for _ in range(3):
        results.append(roc_to_iso(all_dates[idx]))
        idx += 1

    for b in range(3):
        batches.append({
            "batch": b + 1,
            "guidebook": guidebook[b],
            "registration": registration[b],
            "writtenTestDate": written[b],
            "resultDate": results[b],
        })

    return batches


def build_exam_records(batches: list[dict]) -> list[dict]:
    """Build exam schedule records for electrical job codes × levels × batches"""
    records = []
    now = datetime.now().isoformat()
    year = 115

    for batch_info in batches:
        batch_num = batch_info["batch"]
        reg = batch_info["registration"]
        written = batch_info["writtenTestDate"]
        result = batch_info["resultDate"]

        for code, name in ELECTRICAL_JOB_CODES.items():
            for level, available_batches in LEVEL_BATCH_MAPPING.items():
                if batch_num not in available_batches:
                    continue

                record = {
                    "id": f"{year}-{batch_num}-{level}-{code}",
                    "certCode": code,
                    "certName": name,
                    "level": level,
                    "groupCode": "03",
                    "year": year,
                    "batch": batch_num,
                    "registrationStart": reg["start"],
                    "registrationEnd": reg["end"],
                    "writtenTestDate": written,
                    "resultDate": result,
                    "source": SCHEDULE_URL,
                    "fetchedAt": now,
                }
                records.append(record)

    return records


def main():
    year = 115
    print(f"[INFO] Fetching {year}年度 exam schedule from {SCHEDULE_URL}")

    batches = fetch_schedule_regex()
    if not batches:
        print("[ERROR] Failed to fetch schedule data")
        sys.exit(1)

    # Log to file to avoid encoding issues
    with open("tools/_exam_schedule.log", "w", encoding="utf-8") as f:
        for b in batches:
            f.write(f"Batch {b['batch']}: 報名 {b['registration']['start']} ~ {b['registration']['end']}, "
                    f"學科 {b['writtenTestDate']}, 成績 {b['resultDate']}\n")
    print(f"[INFO] Found {len(batches)} batches (log: tools/_exam_schedule.log)")

    records = build_exam_records(batches)
    print(f"[INFO] Built {len(records)} exam records")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Written to {OUTPUT} ({len(records)} records)")


if __name__ == "__main__":
    main()
