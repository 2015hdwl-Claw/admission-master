"""
爬蟲：從 jctv.ntut.edu.tw 抓取電機群（群 03）全部科系的甄選入學資料
資料來源：warehouse.js（靜態 JS 檔案，含 2714 個系所、83 個欄位）
輸出：src/data/departments.json（與現有格式相容）

用法：
    python tools/scrape_electrical_departments.py [--year 114] [--group 03]
    python tools/scrape_electrical_departments.py --year 115 --group 04
"""

import re
import json
import sys
import os
import argparse
from pathlib import Path
from datetime import datetime

import requests

# ── 常量 ──

BASE_URL = "https://www.jctv.ntut.edu.tw/downloads/{year}/apply/ugcdrom/js/warehouse.js"

# 群類別對照
GROUP_NAMES = {
    "01": "機械群", "02": "動力機械群", "03": "電機與電子群電機類",
    "04": "電機與電子群資電類", "05": "化工群", "06": "土木與建築群",
    "07": "設計群", "08": "工程與管理類", "09": "商業與管理群",
    "10": "衛生與護理類", "11": "食品群", "12": "家政群幼保類",
    "13": "家政群生活應用類", "14": "農業群", "15": "外語群英語類",
    "16": "外語群日語類", "17": "餐旅群", "18": "海事群",
    "19": "水產群", "20": "藝術群影視類",
}

REGION_MAP = {"1": "北區", "2": "中區", "3": "南區", "4": "東區", "5": "離島"}
TYPE_MAP = {"1": "公立", "0": "私立"}
SCHOOL_TYPE_MAP = {
    "1": "科技大學", "2": "技術學院", "3": "專科",
    "4": "一般大學", "5": "一般學院",
}

# ── 下載與解析 ──

def fetch_warehouse(year: int) -> str:
    url = BASE_URL.format(year=year)
    print(f"[INFO] 下載 {url} ...")
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    raw_bytes = resp.content
    print(f"[INFO] 下載完成，大小: {len(raw_bytes):,} bytes")

    # 嘗試各種編碼，優先 Big5（台灣官方網站常見）
    for encoding in ["big5", "cp950", "big5-hkscs", "utf-8"]:
        try:
            text = raw_bytes.decode(encoding)
            if "國立" in text or "科技大學" in text:
                print(f"[INFO] 解碼成功 ({encoding})")
                return text
        except (UnicodeDecodeError, LookupError):
            continue

    # fallback: 用 utf-8 + error handling
    text = raw_bytes.decode("utf-8", errors="replace")
    print(f"[WARN] 使用 fallback utf-8 解碼")
    return text


def parse_js_array(js_text: str, var_name: str) -> list:
    """從 JS 檔案中提取變數賦值的二維陣列（支援 new Array() 和 [] 格式）"""
    # 匹配 var xxx = new Array(...) 或 var xxx = [...]
    pattern = rf"(?:var|let|const)\s+{var_name}\s*=\s*(?:new\s+Array|)\s*\((.*?)\)\s*;"
    if not re.search(pattern, js_text, re.DOTALL):
        # 嘗試方括號格式
        pattern = rf"(?:var|let|const)\s+{var_name}\s*=\s*\[(.*?)\]\s*;"
    match = re.search(pattern, js_text, re.DOTALL)
    if not match:
        raise ValueError(f"找不到變數 {var_name}")

    array_text = match.group(1)
    # 每個元素是 ['val1','val2',...] 或 ["val1","val2",...]
    elements = re.findall(r"\[([^\]]+)\]", array_text)
    result = []
    for elem in elements:
        fields = [f.strip().strip("'\"") for f in elem.split(",")]
        result.append(fields)
    return result


def parse_college_data(js_text: str) -> dict:
    """解析學校資料，返回 {schoolCode: {name, region, publicPrivate, ...}}"""
    raw = parse_js_array(js_text, "collegeData")
    colleges = {}
    for row in raw:
        if len(row) < 5:
            continue
        code = row[0]
        colleges[code] = {
            "code": code,
            "name": row[1],
            "region": REGION_MAP.get(row[2], "未知"),
            "publicPrivate": TYPE_MAP.get(row[3], "未知"),
            "schoolType": SCHOOL_TYPE_MAP.get(row[4], "其他"),
        }
    return colleges


def parse_dept_data(js_text: str, group_code: str) -> list:
    """解析系所資料，只保留指定群別"""
    raw = parse_js_array(js_text, "deptData")
    # 群代碼對應 categoryData 的 index（03 → index 3）
    group_index = str(int(group_code))
    filtered = [row for row in raw if len(row) > 3 and row[3] == group_index]
    print(f"[INFO] 群 {group_code} 系所數量: {len(filtered)} (全部: {len(raw)})")
    return filtered


def extract_website_link(notes_text: str) -> str:
    """從備註欄位提取系網連結"""
    if not notes_text or notes_text == "--":
        return ""
    urls = re.findall(r"https?://[^\s<>\"'。，、；]+", notes_text)
    url = urls[0].rstrip("。,;") if urls else ""
    return url


def safe_int(val: str) -> int:
    try:
        return int(val) if val and val not in ("--", "") else 0
    except ValueError:
        return 0


def safe_float(val: str) -> float:
    try:
        return float(val) if val and val not in ("--", "") else 0.0
    except ValueError:
        return 0.0


# ── 轉換為 DepartmentInfo 格式 ──

def convert_dept(row: list, college: dict, group_code: str, year: int) -> dict:
    """將 warehouse.js 的一筆資料轉為 DepartmentInfo 格式"""

    school_code = row[0]
    dept_code = row[1]
    dept_name = row[2]
    school_name = college.get("name", row[4])
    public_private = college.get("publicPrivate", "未知")
    region = college.get("region", "未知")

    # 名額
    gc_quota = safe_int(row[5])
    gc_quota_acc = safe_int(row[6])

    # 篩選倍率
    chi_filter = safe_float(row[17])
    eng_filter = safe_float(row[18])
    mat_filter = safe_float(row[19])
    pro1_filter = safe_float(row[20])
    pro2_filter = safe_float(row[21])

    # 成績加權
    chi_weight = safe_float(row[27])
    eng_weight = safe_float(row[28])
    mat_weight = safe_float(row[29])
    pro1_weight = safe_float(row[30])
    pro2_weight = safe_float(row[31])

    # 統測總權重（用來算百分比）
    test_total_weight = chi_weight + eng_weight + mat_weight + pro1_weight + pro2_weight

    # 指定項目（備審、面試等）
    stage1_rate = safe_int(row[32])  # 第一階段（統測）佔比
    assign1_name = row[33] if row[33] and row[33] != "--" else ""
    assign1_rate = safe_int(row[35])
    assign2_name = row[36] if row[36] and row[36] != "--" else ""
    assign2_rate = safe_int(row[38])
    assign3_name = row[39] if row[39] and row[39] != "--" else ""
    assign3_rate = safe_int(row[41])

    # 日期
    deadline = row[56] if row[56] and row[56] != "--" else ""
    exam_date = row[58] if row[58] and row[58] != "--" else ""

    # 系網連結
    website = extract_website_link(row[81]) if len(row) > 81 else ""

    # 學制
    dept_type = row[82] if len(row) > 82 else "四技"

    # 產生 ID（符合 RPG 相容性：用可讀格式）
    school_slug = re.sub(r"[^a-z0-9]", "", school_name.lower().replace("國立", "").replace("私立", "").replace("科技大學", "").replace("技術學院", "").replace("大學", "").replace("學院", ""))
    dept_slug = re.sub(r"[^a-z0-9]", "", dept_name.replace("系", "").replace("組", "").replace("(", "").replace(")", ""))
    dept_id = f"{school_slug}-{dept_slug}" if school_slug and dept_slug else f"d{dept_code}"

    # 計算統測/備審/面試權重百分比
    test_pct = round(test_total_weight / max(test_total_weight, 1) * stage1_rate) if test_total_weight > 0 and stage1_rate > 0 else 0
    portfolio_pct = 0
    interview_pct = 0

    for name, rate in [(assign1_name, assign1_rate), (assign2_name, assign2_rate), (assign3_name, assign3_rate)]:
        if not name or rate <= 0:
            continue
        name_lower = name.lower()
        if any(kw in name_lower for kw in ["備審", "審查", "學習歷程", "資料審查"]):
            portfolio_pct += rate
        elif any(kw in name_lower for kw in ["面試", "甄試", "口試", "筆試"]):
            interview_pct += rate

    return {
        "id": dept_id,
        "schoolId": school_code,
        "schoolName": school_name,
        "departmentName": dept_name,
        "groupCode": group_code,
        "groupName": GROUP_NAMES.get(group_code, "未知"),
        "publicPrivate": public_private,
        "region": region,
        "deptType": dept_type,
        "description": "",
        "website": website,
        "features": [],
        "researchAreas": [],
        "careerPaths": [],
        "source": {
            "year": year,
            "deptCode": dept_code,
            "crawledAt": datetime.now().isoformat(),
        },
        "pathways": {
            "stars": {
                "available": True,
                "acceptanceRate": 0,
                "deadline": "",
                "quota": 0,
                "specialNote": "需學校推薦",
                "needSchoolRecommendation": True,
            },
            "selection": {
                "available": True,
                "acceptanceRate": 0,
                "deadline": deadline,
                "quota": gc_quota,
                "lowestScore": 0,
                "testScoreWeight": test_pct,
                "portfolioWeight": portfolio_pct,
                "interviewWeight": interview_pct,
                "filterRates": {
                    "chi": chi_filter,
                    "eng": eng_filter,
                    "mat": mat_filter,
                    "pro1": pro1_filter,
                    "pro2": pro2_filter,
                },
                "scoreWeights": {
                    "chi": chi_weight,
                    "eng": eng_weight,
                    "mat": mat_weight,
                    "pro1": pro1_weight,
                    "pro2": pro2_weight,
                },
                "assignedItems": [],
                "examDate": exam_date,
            },
            "distribution": {
                "available": True,
                "acceptanceRate": 0,
                "deadline": "",
                "quota": 0,
                "lowestScore": 0,
            },
            "skills": {
                "available": True,
                "acceptanceRate": 0,
                "deadline": "",
                "quota": 0,
                "requiredCertificates": [],
                "certificateMatchRule": "any",
            },
            "guarantee": {
                "available": True,
                "acceptanceRate": 0,
                "deadline": "",
                "quota": 0,
                "requiredCompetitions": [],
                "requiredCompetitionLevel": "全國",
                "requiredPlacing": "前三名",
            },
            "special": {
                "available": False,
                "acceptanceRate": 0,
                "deadline": "",
                "specialConditions": [],
            },
        },
    }


# ── 主程式 ──

def main():
    parser = argparse.ArgumentParser(description="抓取電機群科系甄選入學資料")
    parser.add_argument("--year", type=int, default=114, help="學年度 (預設 114)")
    parser.add_argument("--group", type=str, default="03", help="群代碼 (預設 03=電機群)")
    parser.add_argument("--output", type=str, default=None, help="輸出路徑 (預設 src/data/departments.json)")
    args = parser.parse_args()

    year = args.year
    group_code = args.group

    if group_code not in GROUP_NAMES:
        print(f"[ERROR] 不支援的群代碼: {group_code}")
        print(f"  可用: {', '.join(GROUP_NAMES.keys())}")
        sys.exit(1)

    # 下載資料
    js_text = fetch_warehouse(year)

    # 解析學校資料
    colleges = parse_college_data(js_text)
    print(f"[INFO] 學校數量: {len(colleges)}")

    # 解析系所資料
    dept_rows = parse_dept_data(js_text, group_code)
    if not dept_rows:
        print(f"[ERROR] 群 {group_code} 沒有找到任何系所")
        sys.exit(1)

    # 轉換格式
    departments = []
    for row in dept_rows:
        school_code = row[0]
        college = colleges.get(school_code, {})
        dept = convert_dept(row, college, group_code, year)

        # 填入指定項目名稱
        for idx in [33, 36, 39]:
            name = row[idx] if len(row) > idx and row[idx] and row[idx] != "--" else ""
            rate = safe_int(row[idx + 2]) if len(row) > idx + 2 else 0
            if name and rate > 0:
                dept["pathways"]["selection"]["assignedItems"].append({
                    "name": name,
                    "rate": rate,
                })

        departments.append(dept)

    # 輸出
    output_path = args.output
    if not output_path:
        script_dir = Path(__file__).parent.parent
        output_path = str(script_dir / "src" / "data" / "departments.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(departments, f, ensure_ascii=False, indent=2)

    # 統計
    schools = set(d["schoolName"] for d in departments)
    public = sum(1 for d in departments if d.get("publicPrivate") == "公立")
    private = sum(1 for d in departments if d.get("publicPrivate") == "私立")
    has_website = sum(1 for d in departments if d.get("website"))

    print(f"\n{'='*60}")
    print(f"[DONE] {year} 學年度 群 {group_code} ({GROUP_NAMES[group_code]})")
    print(f"  科系數量: {len(departments)}")
    print(f"  學校數量: {len(schools)}")
    print(f"  公立: {public} / 私立: {private}")
    print(f"  有系網連結: {has_website}")
    print(f"  輸出: {output_path}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
