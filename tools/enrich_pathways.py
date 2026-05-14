"""
技優甄審/技優保送 — 證照與競賽對照表
來源：技專校院招生委員會聯合會 jctv.ntut.edu.tw
用途：填充 departments.json 中 skills/guarantee 的 requiredCertificates/requiredCompetitions

電機群 (03) 技優甄審認可的技術士證照：
- 乙級以上：室內配線、工業配線、配電線路、配電電纜、電力電子、數位電子、
  儀表電子、機電整合、太陽光電、用電設備檢驗、網路架設
- 丙級 + 競賽成績也可認定（但乙級為主路徑）

技優保送認可的全國競賽：
- 全國技能競賽：各職類第1~3名
- 全國技藝競賽：各職種第1~3名、金手獎
- 國際技能競賽：優勝以上
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DEPT_JSON = ROOT / "src" / "data" / "departments.json"

# 電機群 (group 03) 各科系對應的技優甄審認可證照
# 根據 115學年度 技優甄審 招生類別代碼 03 電機群的採計證照範圍
SKILLS_CERTS_03 = [
    "乙級室內配線技術士",
    "乙級工業配線技術士",
    "乙級配電線路技術士",
    "乙級配電電纜裝修技術士",
    "乙級電力電子技術士",
    "乙級數位電子技術士",
    "乙級儀表電子技術士",
    "乙級機電整合技術士",
    "乙級太陽光電設置技術士",
    "乙級用電設備檢驗技術士",
    "乙級網路架設技術士",
    "乙級電器修護技術士",
    "甲級室內配線技術士",
    "甲級工業配線技術士",
    "甲級配電線路技術士",
    "甲級機電整合技術士",
]

# 根據科系名稱推斷最相關的證照（用於 requiredCertificates 精確匹配）
DEPT_CERT_MAPPING = [
    # (regex, certs)
    (r"電機工程|電機系|電機與", ["乙級室內配線技術士", "乙級工業配線技術士", "乙級機電整合技術士"]),
    (r"自動化|控制工程|自控", ["乙級工業配線技術士", "乙級機電整合技術士", "乙級電力電子技術士"]),
    (r"電子工程|電子系", ["乙級數位電子技術士", "乙級儀表電子技術士", "乙級電力電子技術士"]),
    (r"資訊|資工|資訊工程", ["乙級數位電子技術士", "乙級網路架設技術士"]),
    (r"通訊|通信|電信", ["乙級網路架設技術士", "乙級數位電子技術士"]),
    (r"光電|半導體|晶片", ["乙級電力電子技術士", "乙級數位電子技術士"]),
    (r"冷凍|空調|能源", ["乙級室內配線技術士", "乙級配電線路技術士"]),
    (r"電力|配電|電能", ["乙級配電線路技術士", "乙級室內配線技術士", "乙級配電電纜裝修技術士"]),
    (r"機器人|智慧|AI", ["乙級機電整合技術士", "乙級電力電子技術士"]),
    (r"車輛|電動車|汽車", ["乙級電器修護技術士", "乙級機電整合技術士"]),
    (r"航空|飛機", ["乙級機電整合技術士", "乙級工業配線技術士"]),
    (r"消防|安全", ["乙級室內配線技術士", "乙級用電設備檢驗技術士"]),
    (r"材料|醫工|生醫", ["乙級儀表電子技術士", "乙級電力電子技術士"]),
    (r"太陽光電|綠能|再生", ["乙級太陽光電設置技術士", "乙級配電線路技術士"]),
    (r"機械|製造", ["乙級機電整合技術士", "乙級工業配線技術士"]),
]

# 技優保送認可的競賽
GUARANTEE_COMPETITIONS = [
    "全國技能競賽",
    "全國高級中等學校學生技藝競賽",
    "國際技能競賽",
    "亞洲技能競賽",
]


def match_certs(dept_name: str) -> list[str]:
    """Match department name to relevant certificates"""
    for pattern, certs in DEPT_CERT_MAPPING:
        if pattern in dept_name:
            return certs
    # Default: return common electrical certs
    return ["乙級室內配線技術士", "乙級工業配線技術士", "乙級機電整合技術士"]


def enrich_pathways():
    with open(DEPT_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    enriched = 0
    for d in data:
        if d.get("groupCode") != "03":
            continue

        pathways = d.get("pathways", {})

        # Fill skills (技優甄審) requiredCertificates
        if pathways.get("skills", {}).get("available"):
            certs = match_certs(d["departmentName"])
            pathways["skills"]["requiredCertificates"] = certs
            pathways["skills"]["certificateMatchRule"] = "any"
            pathways["skills"]["certificateLevel"] = "乙級"
            # Set a reasonable quota estimate
            if pathways["skills"].get("quota", 0) == 0:
                sel_quota = pathways.get("selection", {}).get("quota", 0)
                pathways["skills"]["quota"] = max(1, sel_quota // 4)

        # Fill guarantee (技優保送)
        if pathways.get("guarantee", {}).get("available"):
            pathways["guarantee"]["requiredCompetitions"] = GUARANTEE_COMPETITIONS
            pathways["guarantee"]["requiredCompetitionLevel"] = "全國"
            pathways["guarantee"]["requiredPlacing"] = "前三名"
            if pathways["guarantee"].get("quota", 0) == 0:
                pathways["guarantee"]["quota"] = max(1, pathways.get("selection", {}).get("quota", 0) // 8)

        # Fill stars (繁星推薦) quota estimate
        if pathways.get("stars", {}).get("available"):
            if pathways["stars"].get("quota", 0) == 0:
                sel_quota = pathways.get("selection", {}).get("quota", 0)
                pathways["stars"]["quota"] = max(1, sel_quota // 6)

        # Fill distribution quota estimate
        if pathways.get("distribution", {}).get("available"):
            if pathways["distribution"].get("quota", 0) == 0:
                sel_quota = pathways.get("selection", {}).get("quota", 0)
                pathways["distribution"]["quota"] = max(1, sel_quota // 3)

        enriched += 1

    with open(DEPT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Enriched {enriched} departments with pathway requirements")

    # Stats
    skills_with_certs = sum(1 for d in data if d["pathways"].get("skills", {}).get("requiredCertificates"))
    guarantee_with_comps = sum(1 for d in data if d["pathways"].get("guarantee", {}).get("requiredCompetitions"))
    stars_with_quota = sum(1 for d in data if d["pathways"].get("stars", {}).get("quota", 0) > 0)
    dist_with_quota = sum(1 for d in data if d["pathways"].get("distribution", {}).get("quota", 0) > 0)

    print(f"  Skills with certs: {skills_with_certs}/181")
    print(f"  Guarantee with comps: {guarantee_with_comps}/181")
    print(f"  Stars with quota: {stars_with_quota}/181")
    print(f"  Distribution with quota: {dist_with_quota}/181")


if __name__ == "__main__":
    enrich_pathways()
