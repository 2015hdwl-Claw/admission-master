"""
全職類證照考試時程爬蟲 — 從 skill.tcte.edu.tw 爬取所有職類的考試梯次

與 schedules.py 只爬電機群(03) 18 個職類不同，這個腳本：
1. 從 skill_query2.php 取得全部 ~200 個職類代碼和名稱
2. 逐一查詢每個職類在各級別（甲/乙/丙）可報考的梯次
3. 從 schedule.php 解析三個梯次的完整日期
4. 將職類對應到高職群組（groupCode）
5. 輸出完整的 exam-schedules.json

資料來源：
  - skill.tcte.edu.tw/skill_query2.php — 職類列表
  - skill.tcte.edu.tw/skill_query_detail.php — 各職類梯次查詢
  - skill.tcte.edu.tw/schedule.php — 梯次日期
"""
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
import urllib3
from bs4 import BeautifulSoup

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from scraper_utils import fetch_with_retry, save_json, log_debug, roc_to_iso

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "src" / "data"
CACHE_DIR = Path(__file__).parent / "_cache"
DEBUG_DIR = Path(__file__).parent / "_debug"

# ═══════════════════════════════════════════════════════════
# Group Code Mapping — 高職群組對應
# ═══════════════════════════════════════════════════════════

GROUP_NAMES = {
    "01": "機械群", "02": "動力機械群", "03": "電機與電子群電機類",
    "04": "電機與電子群資電類", "05": "化工群", "06": "土木與建築群",
    "07": "設計群", "08": "工程與管理類", "09": "商業與管理群",
    "10": "衛生與護理類", "11": "食品群", "12": "家政群幼保類",
    "13": "家政群生活應用類", "14": "農業群", "15": "外語群英語類",
    "16": "外語群日語類", "17": "餐旅群", "18": "海事群",
    "19": "水產群", "20": "藝術群影視類",
}

# Map cert code -> list of groupCodes
# Based on official 技專校院入學測驗中心 group-category mapping
# and the 115 年度全國技術士技能檢定簡章 classification
CERT_TO_GROUPS = {
    # ── 機械群 (01) ──
    "01100": ["01"],   # 鑄造
    "01500": ["01"],   # 冷作
    "02100": ["01"], "02102": ["01"], "02103": ["01"], "02104": ["01"],  # 熱處理
    "07900": ["01"],   # 油壓
    "08000": ["01"],   # 氣壓
    "15200": ["01"],   # 電腦輔助立體製圖
    "15300": ["01"],   # 汽車車體板金
    "16400": ["01"],   # 車輛塗裝
    "18200": ["01"], "18201": ["01"],  # 銑床
    "18300": ["01"], "18301": ["01"],  # 車床
    "18400": ["01"], "18401": ["01"], "18402": ["01"],  # 模具
    "18500": ["01"],   # 機械加工
    "20800": ["01"],   # 電腦輔助機械設計製圖
    "21400": ["01"],   # 金屬成形
    # ── 動力機械群 (02) ──
    "02000": ["02"],   # 汽車修護
    "05200": ["02"],   # 農業機械修護
    "14500": ["02"],   # 機器腳踏車修護
    "17600": ["02"],   # 飛機修護
    # ── 電機與電子群 電機類 (03) ──
    "00100": ["03"],   # 冷凍空調裝修
    "00700": ["03"],   # 室內配線
    "01000": ["03"],   # 電器修護
    "01300": ["03"],   # 工業配線
    "03200": ["03"],   # 變壓器裝修
    "04000": ["03"],   # 配電線路裝修
    "06400": ["03"],   # 升降機裝修
    "07400": ["03"],   # 配電電纜裝修
    "12100": ["03"],   # 工業用管配管
    "15500": ["03"],   # 特定瓦斯器具裝修
    "15600": ["03"],   # 通信技術(電信線路)
    "16500": ["03"],   # 工程泵(幫浦)類檢修
    "16600": ["03"],   # 用電設備檢驗
    "16700": ["03"],   # 變電設備裝修
    "16800": ["03"],   # 輸電地下電纜裝修
    "16900": ["03"],   # 輸電架空線路裝修
    "17000": ["03"],   # 機電整合
    "17200": ["03"],   # 網路架設
    "21000": ["03"],   # 太陽光電設置
    # ── 電機與電子群 資電類 (04) ──
    "02900": ["04"],   # 視聽電子
    "11500": ["04"],   # 儀表電子
    "11600": ["04"],   # 電力電子
    "11700": ["04"],   # 數位電子
    "12000": ["04"],   # 電腦硬體裝修
    # ── 化工群 (05) ──
    "03000": ["05"],   # 化學
    "03100": ["05"], "03101": ["05"],  # 鍋爐操作
    "03600": ["05"],   # 工業儀器
    "12300": ["05"],   # 化工
    "09200": ["05"],   # 食品檢驗分析
    "22300": ["05"],   # 物理性因子作業環境監測
    "22400": ["05"],   # 化學性因子作業環境監測
    # ── 土木與建築群 (06) ──
    "00900": ["06"], "00901": ["06"], "00902": ["06"], "00903": ["06"],  # 泥水
    "01600": ["06"],   # 自來水管配管
    "01800": ["06"],   # 鋼筋
    "01900": ["06"],   # 模板
    "03900": ["06"],   # 門窗木工
    "04200": ["06"], "04202": ["06"], "04203": ["06"],  # 測量
    "06900": ["06"],   # 建築工程管理
    "12200": ["06"],   # 氣體燃料導管配管
    "12500": ["06"],   # 建築物室內設計
    "12600": ["06"],   # 建築物室內裝修工程管理
    "17100": ["06"],   # 裝潢木工
    "17500": ["06"],   # 混凝土
    "18000": ["06"],   # 營造工程管理
    "20500": ["06"],   # 下水道用戶排水設備配管
    "20701": ["06"],   # 金屬帷幕牆
    "21100": ["06"], "21101": ["06"], "21102": ["06"],  # 建築製圖應用
    "17401": ["06"], "17402": ["06"], "17403": ["06"],
    "17404": ["06"], "17405": ["06"], "17406": ["06"],  # 營建防水
    # ── 設計群 (07) ──
    "01200": ["07"],   # 家具木工
    "04800": ["07"],   # 女裝
    "07100": ["07"], "07101": ["07"], "07102": ["07"],  # 製鞋
    "08700": ["07"],   # 平版印刷
    "14600": ["07"],   # 金銀珠寶飾品加工
    "14800": ["07"],   # 建築塗裝
    "19102": ["07"], "19103": ["07"], "19104": ["07"], "19105": ["07"],  # 印前製程
    "19200": ["07"], "19201": ["07"], "19202": ["07"],  # 網版製版印刷
    "20100": ["07"], "20101": ["07"], "20102": ["07"], "20103": ["07"],
    "20104": ["07"], "20105": ["07"], "20106": ["07"], "20107": ["07"],
    "20108": ["07"],   # 視覺傳達設計
    "20400": ["07"],   # 攝影
    "21300": ["07"],   # 陶瓷手拉坯
    "05400": ["07"],   # 陶瓷-石膏模
    # ── 工程與管理類 (08) ──
    "14901": ["08"], "14902": ["08"],  # 會計事務
    "18100": ["08"],   # 門市服務
    "19500": ["08"],   # 就業服務
    "20000": ["08"],   # 國貿業務
    # ── 商業與管理群 (09) ──
    # (often shares with 08 — cert codes overlap)
    # ── 衛生與護理類 (10) ──
    "17800": ["10"],   # 照顧服務員
    "15400": ["10"],   # 托育人員
    "22000": ["10"],   # 職業安全管理
    "22100": ["10"],   # 職業衛生管理
    "22200": ["10"],   # 職業安全衛生管理
    # ── 食品群 (11) ──
    "07601": ["11"], "07602": ["11"],  # 中餐烹調
    "07704": ["11"], "07705": ["11"], "07711": ["11"], "07715": ["11"],
    "07721": ["11"], "07725": ["11"], "07726": ["11"], "07727": ["11"],
    "07728": ["11"],  # 烘焙食品
    "09403": ["11"], "09405": ["11"], "09407": ["11"], "09408": ["11"],  # 肉製品加工
    "09503": ["11"], "09506": ["11"], "09507": ["11"],  # 中式米食加工
    "09601": ["11"], "09602": ["11"], "09603": ["11"],  # 中式麵食加工
    "14000": ["11"],   # 西餐烹調
    "20600": ["11"],   # 飲料調製
    "21500": ["11"],   # 餐飲服務
    "21800": ["11"],   # 食物製備
    # ── 家政群 幼保類 (12) ──
    "15400": ["12"],   # 托育人員 (also 10)
    # ── 家政群 生活應用類 (13) ──
    "10000": ["13"],   # 美容
    "06000": ["13"],   # 男子理髮
    "06700": ["13"],   # 女子美髮
    "07800": ["13"],   # 眼鏡鏡片製作
    "13900": ["13"],   # 寵物美容
    # ── 農業群 (14) ──
    "05200": ["14"],   # 農業機械修護 (also 02)
    "13000": ["14"],   # 水族養殖
    "13300": ["14"],   # 園藝
    "13400": ["14"],   # 農藝
    "13600": ["14"],   # 造園景觀
    "15702": ["14"], "15704": ["14"], "15705": ["14"],  # 農田灌溉排水
    "16100": ["14"],   # 製茶技術
    # ── 外語群 英語類 (15) ──
    "20000": ["15"],   # 國貿業務 (also 08)
    # ── 餐旅群 (17) ──
    "07601": ["17"], "07602": ["17"],  # 中餐烹調 (also 11)
    "14000": ["17"],   # 西餐烹調 (also 11)
    "20600": ["17"],   # 飲料調製 (also 11)
    "21500": ["17"],   # 餐飲服務 (also 11)
    "21600": ["17"],   # 旅館客房服務
    # ── 海事群 (18) ──
    "09800": ["18"],   # 職業潛水
    # ── 水產群 (19) ──
    "13000": ["19"],   # 水族養殖 (also 14)
    "13201": ["19"], "13204": ["19"], "13207": ["19"],  # 水產食品加工
    # ── 藝術群影視類 (20) ──
    "20400": ["20"],   # 攝影 (also 07)
    "21300": ["20"],   # 陶瓷手拉坯 (also 07)
    # ── 多群共用職類 ──
    "07200": ["10"],   # 按摩
    "02702": ["01"],   # 重機械修護-引擎
    "06102": ["06"], "06104": ["06"], "06105": ["06"],
    "06106": ["06"], "06107": ["06"],  # 固定式起重機操作
    "06201": ["06"], "06202": ["06"], "06203": ["06"],  # 移動式起重機操作
    "06300": ["06"],   # 人字臂起重桿操作
    "07001": ["06"], "07002": ["06"], "07004": ["06"],
    "07005": ["06"], "07006": ["06"],  # 重機械操作
    "08101": ["06"], "08102": ["06"], "08103": ["06"], "08104": ["06"],  # 下水道設施
    "09100": ["01"],   # 氬氣鎢極電銲
    "00400": ["01"],   # 一般手工電銲
    "09700": ["01"],   # 半自動電銲
    "09900": ["05"],   # 第一種壓力容器操作
    "12700": ["06"],   # 機械停車設備裝修
    "15100": ["06"],   # 堆高機操作
    "17300": ["04", "05"],  # 網頁設計
    "11800": ["04"],   # 電腦軟體應用
    "11900": ["04"],   # 電腦軟體設計
    "17700": ["08"],   # 手語翻譯
    "20300": ["08"],   # 喪禮服務
    "22600": ["10"],   # 民俗調理業傳統整復推拿
    "22700": ["10"],   # 民俗調理業腳底按摩
}


def get_group_for_cert(cert_code: str) -> list[str]:
    """Return groupCodes for a cert code. Falls back to heuristic."""
    if cert_code in CERT_TO_GROUPS:
        return CERT_TO_GROUPS[cert_code]

    # Heuristic fallback based on code ranges
    code = int(cert_code)
    if code <= 1300:
        return ["01", "03"]      # general mechanical/electrical
    elif code <= 3200:
        return ["01"]            # mechanical/industrial
    elif code <= 5000:
        return ["06"]            # construction
    elif code <= 7500:
        return ["01", "02"]      # heavy machinery
    elif code <= 8200:
        return ["06"]            # plumbing
    elif code <= 10000:
        return ["01"]            # welding/industrial
    elif code <= 12000:
        return ["03", "04"]      # electronics
    elif code <= 13600:
        return ["14"]            # agriculture
    elif code <= 15500:
        return ["01", "06"]      # mixed
    elif code <= 17500:
        return ["03", "06"]      # electrical/construction
    elif code <= 18500:
        return ["01"]            # machining
    elif code <= 19200:
        return ["07"]            # printing
    elif code <= 20100:
        return ["07", "08"]      # design/business
    elif code <= 21000:
        return ["06", "08"]      # construction/business
    elif code <= 21500:
        return ["01"]            # drafting
    elif code <= 22400:
        return ["10"]            # safety/health
    else:
        return ["08"]            # misc


# ═══════════════════════════════════════════════════════════
# Level class mapping
# ═══════════════════════════════════════════════════════════

LEVEL_CLASS_MAP = {"1": "甲", "2": "乙", "3": "丙"}


# ═══════════════════════════════════════════════════════════
# HTTP session
# ═══════════════════════════════════════════════════════════

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

_session = None

def get_session() -> requests.Session:
    global _session
    if _session is None:
        s = requests.Session()
        s.verify = False
        s.headers.update(HEADERS)
        _session = s
    return _session


def get_csrf() -> str:
    """Fetch CSRF token from skill_query2.php"""
    s = get_session()
    resp = s.get("https://skill.tcte.edu.tw/skill_query2.php", timeout=30)
    resp.encoding = "utf-8"
    m = re.search(r"name=_FmID_AntiCSRF value='([^']+)'", resp.text)
    return m.group(1) if m else ""


# ═══════════════════════════════════════════════════════════
# 1. Fetch all job codes
# ═══════════════════════════════════════════════════════════

def fetch_all_job_codes() -> dict[str, str]:
    """Fetch all certification codes and names from skill_query2.php.

    Returns: {code: name}
    """
    print("[1/3] 取得全部職類代碼...")
    text = fetch_with_retry("https://skill.tcte.edu.tw/skill_query2.php")
    soup = BeautifulSoup(text, "html.parser")

    codes = {}
    sel = soup.find("select", {"name": "skill_code"})
    if not sel:
        print("  [ERROR] 找不到職類下拉選單")
        return {}

    for opt in sel.find_all("option"):
        val = opt.get("value", "").strip()
        txt = opt.get_text(strip=True)
        if val and val.isdigit():
            # Format: "00700  室內配線(屋內線路裝修)"
            name = re.sub(r"^\d{5}\s+", "", txt).strip()
            codes[val] = name

    print(f"  取得 {len(codes)} 個職類代碼")
    return codes


# ═══════════════════════════════════════════════════════════
# 2. Query batch availability per code+level
# ═══════════════════════════════════════════════════════════

def query_batches_for_code(cert_code: str) -> dict[str, list[int]]:
    """Query which batches are available for each level of a cert code.

    Returns: {"甲": [1, 3], "乙": [2], ...}
    """
    s = get_session()
    result = {}

    for cls_val, level_name in LEVEL_CLASS_MAP.items():
        try:
            csrf = get_csrf()
            data = {
                "_FmID_AntiCSRF": csrf,
                "txtPRF": "",
                "skill_code": cert_code,
                "skill_class": cls_val,
            }
            resp = s.post(
                "https://skill.tcte.edu.tw/skill_query_detail.php",
                data=data,
                timeout=30,
            )
            resp.encoding = "utf-8"

            # Extract batch numbers
            batch_section = re.search(
                r"可報檢梯次(.*?)(?:報名費用|報檢資格|$)", resp.text, re.DOTALL
            )
            if batch_section:
                text = batch_section.group(1)
                batches = re.findall(r"第\s*(\d+)\s*梯次", text)
                if batches:
                    result[level_name] = [int(b) for b in batches]

        except Exception as e:
            print(f"    [WARN] {cert_code} {level_name}級查詢失敗: {e}")

    return result


def query_all_batches(
    job_codes: dict[str, str],
    cache_file: str = "_exam_batch_cache.json",
    rate_limit: float = 0.3,
) -> dict[str, dict[str, list[int]]]:
    """Query batch availability for all codes with caching and rate limiting.

    Returns: {code: {"甲": [1], "乙": [2, 3], ...}}
    """
    # Load cache
    cache_path = CACHE_DIR / cache_file
    cached = {}
    if cache_path.exists():
        with open(cache_path, "r", encoding="utf-8") as f:
            cached = json.load(f)
        print(f"  已載入 {len(cached)} 筆快取")

    to_query = [c for c in job_codes if c not in cached]
    print(f"  需查詢 {len(to_query)} 個職類（已有 {len(cached)} 筆快取）")

    for i, code in enumerate(to_query):
        batches = query_batches_for_code(code)
        if batches:
            cached[code] = batches
        else:
            # No batches available for any level — still cache as empty
            cached[code] = {}

        # Save cache every 20 codes
        if (i + 1) % 20 == 0 or i == len(to_query) - 1:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(cached, f, ensure_ascii=False, indent=2)
            print(f"    進度: {i + 1}/{len(to_query)} ({code})")

        time.sleep(rate_limit)

    print(f"  全部完成: {len(cached)} 個職類")
    return cached


# ═══════════════════════════════════════════════════════════
# 3. Parse schedule dates
# ═══════════════════════════════════════════════════════════

def parse_schedule_dates(year: int = 115) -> list[dict]:
    """Parse 3 batch schedules from schedule.php.

    Returns list of 3 dicts with batch/registration/writtenTestDate/resultDate.
    """
    print("\n[2/3] 解析梯次日期...")
    text = fetch_with_retry("https://skill.tcte.edu.tw/schedule.php")
    all_dates = re.findall(r"\d{3}/\d{2}/\d{2}", text)

    if len(all_dates) < 24:
        print(f"  [ERROR] 日期數量不足: {len(all_dates)}")
        return []

    log_debug("exam_schedule_dates.txt", "\n".join(
        f"[{i}] {d}" for i, d in enumerate(all_dates)
    ))

    idx = 0
    batches = []

    # 簡章發售 (3 ranges, skip)
    idx += 6  # 3 ranges x 2 dates

    # 報名日期 (3 ranges)
    registration = []
    for _ in range(3):
        registration.append({
            "start": roc_to_iso(all_dates[idx]),
            "end": roc_to_iso(all_dates[idx + 1]),
        })
        idx += 2

    # 准考證 + 試場公告 (skip 6)
    idx += 6

    # 學科測試 (3 dates)
    written = [roc_to_iso(all_dates[idx + i]) for i in range(3)]
    idx += 3

    # 學科疑義 (3 ranges, skip)
    idx += 6

    # 成績公告 (3 dates)
    results = [roc_to_iso(all_dates[idx + i]) for i in range(3)]
    idx += 3

    for b in range(3):
        batches.append({
            "batch": b + 1,
            "registration": registration[b],
            "writtenTestDate": written[b],
            "resultDate": results[b],
        })

    for b in batches:
        print(
            f"  梯次 {b['batch']}: "
            f"報名 {b['registration']['start']} ~ {b['registration']['end']}, "
            f"測試 {b['writtenTestDate']}, "
            f"公告 {b['resultDate']}"
        )

    return batches


# ═══════════════════════════════════════════════════════════
# 4. Build records
# ═══════════════════════════════════════════════════════════

def build_records(
    job_codes: dict[str, str],
    batch_availability: dict[str, dict[str, list[int]]],
    schedule_batches: list[dict],
    year: int = 115,
) -> list[dict]:
    """Build exam schedule records for all codes/levels/batches."""
    print("\n[3/3] 產生考試記錄...")
    now = datetime.now().isoformat()
    records = []
    schedule_map = {b["batch"]: b for b in schedule_batches}

    for code, name in sorted(job_codes.items()):
        level_batches = batch_availability.get(code, {})
        groups = get_group_for_cert(code)

        for level, available_batches in level_batches.items():
            for bn in available_batches:
                if bn not in schedule_map:
                    continue

                sb = schedule_map[bn]
                reg = sb["registration"]

                # Use first group as primary groupCode
                primary_group = groups[0] if groups else "00"

                records.append({
                    "id": f"{year}-{bn}-{level}-{code}",
                    "certCode": code,
                    "certName": name,
                    "level": level,
                    "groupCode": primary_group,
                    "groupCodes": groups,
                    "year": year,
                    "batch": bn,
                    "registrationStart": reg["start"],
                    "registrationEnd": reg["end"],
                    "writtenTestDate": sb["writtenTestDate"],
                    "resultDate": sb["resultDate"],
                    "source": "https://skill.tcte.edu.tw/schedule.php",
                    "fetchedAt": now,
                })

    print(f"  產生 {len(records)} 筆記錄")
    return records


# ═══════════════════════════════════════════════════════════
# 5. Stats
# ═══════════════════════════════════════════════════════════

def print_stats(records: list[dict]):
    """Print summary statistics."""
    print("\n" + "=" * 60)
    print("統計數據")
    print("=" * 60)

    # Total
    print(f"  總記錄數: {len(records)}")

    # By level
    by_level = {}
    for r in records:
        lv = r["level"]
        by_level[lv] = by_level.get(lv, 0) + 1
    for lv in sorted(by_level):
        print(f"  {lv}級: {by_level[lv]} 筆")

    # By batch
    by_batch = {}
    for r in records:
        bn = r["batch"]
        by_batch[bn] = by_batch.get(bn, 0) + 1
    for bn in sorted(by_batch):
        print(f"  梯次 {bn}: {by_batch[bn]} 筆")

    # By group
    by_group = {}
    for r in records:
        g = r["groupCode"]
        gname = GROUP_NAMES.get(g, f"群{g}")
        by_group[gname] = by_group.get(gname, 0) + 1
    for gname in sorted(by_group, key=by_group.get, reverse=True)[:10]:
        print(f"  {gname}: {by_group[gname]} 筆")

    # Unique cert codes
    unique_codes = set(r["certCode"] for r in records)
    print(f"  不同職類數: {len(unique_codes)}")

    # Unique group codes
    unique_groups = set(r["groupCode"] for r in records)
    print(f"  涵蓋群組數: {len(unique_groups)} ({', '.join(sorted(unique_groups))})")


# ═══════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════

def main():
    year = 115
    print(f"{'=' * 60}")
    print(f"全職類證照考試時程爬蟲 — {year}年度")
    print(f"{'=' * 60}")

    # Step 1: Fetch all job codes
    job_codes = fetch_all_job_codes()
    if not job_codes:
        print("[ERROR] 無法取得職類代碼，中止")
        sys.exit(1)

    # Step 2: Query batch availability for each code
    print("\n查詢各職類可報考梯次...")
    batch_availability = query_all_batches(job_codes)

    # Step 3: Parse schedule dates
    schedule_batches = parse_schedule_dates(year)
    if not schedule_batches:
        print("[ERROR] 無法解析梯次日期，中止")
        sys.exit(1)

    # Step 4: Build records
    records = build_records(job_codes, batch_availability, schedule_batches, year)

    # Step 5: Save output
    if records:
        save_json("exam-schedules.json", records)
        log_debug(
            "exam_schedules_log.txt",
            f"Generated {len(records)} records at {datetime.now().isoformat()}\n"
            f"Year: {year}\n"
            f"Unique codes: {len(set(r['certCode'] for r in records))}\n"
            f"Groups: {sorted(set(r['groupCode'] for r in records))}\n",
        )

    # Step 6: Print stats
    print_stats(records)

    print(f"\n{'=' * 60}")
    print("完成")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
