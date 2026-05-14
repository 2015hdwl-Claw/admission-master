"""
全國競賽行事曆 — 電機群相關
來源：教育部 sci-me.k12ea.gov.tw + 勞動部 wdasec.gov.tw + 電機電子群科中心
輸出：src/data/competition-events.json

資料來自公開簡章與官方平台公告，人工整理 + 爬蟲驗證
"""
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUTPUT = ROOT / "src" / "data" / "competition-events.json"


def build_competition_events() -> list[dict]:
    now = datetime.now().isoformat()
    events = []

    # ── 1. 全國高級中等學校學生技藝競賽 (五大類) ──
    # 來源：sci-me.k12ea.gov.tw
    # 115學年度 (2026-2027)
    electrical_categories = [
        {"category": "工業配電", "groupCodes": ["03"]},
        {"category": "室內配電", "groupCodes": ["03"]},
        {"category": "工業電子", "groupCodes": ["03", "04"]},
        {"category": "數位電子", "groupCodes": ["04"]},
        {"category": "電腦修護", "groupCodes": ["03", "04", "05"]},
        {"category": "電腦軟體設計", "groupCodes": ["05"]},
        {"category": "機電整合", "groupCodes": ["03"]},
    ]

    for cat_info in electrical_categories:
        events.append({
            "id": f"115-技藝競賽-工業類-{cat_info['category']}",
            "competitionName": "全國高級中等學校學生技藝競賽",
            "subCompetition": "工業類",
            "category": cat_info["category"],
            "level": "全國",
            "groupCodes": cat_info["groupCodes"],
            "year": 115,
            "registrationStart": "2026-05-25",
            "registrationEnd": "2026-06-12",
            "schoolCompetitionDeadline": "2026-07-31",
            "finalRegistrationStart": "2026-08-17",
            "finalRegistrationEnd": "2026-09-11",
            "eventDate": "2026-11-24",
            "eventEndDate": "2026-11-27",
            "resultDate": None,
            "placingThreshold": ["第1名", "第2名", "第3名", "金手獎"],
            "pathwayUseful": ["guarantee", "skills", "special"],
            "source": "https://sci-me.k12ea.gov.tw/",
            "fetchedAt": now,
        })

    # ── 2. 全國技能競賽 (第56屆, 115年) ──
    # 來源：wdasec.gov.tw
    skill_competition_categories = [
        {"category": "電氣裝配", "groupCodes": ["03"]},
        {"category": "工業控制", "groupCodes": ["03"]},
        {"category": "電子", "groupCodes": ["03", "04"]},
        {"category": "機電整合", "groupCodes": ["03"]},
        {"category": "資訊網路布建", "groupCodes": ["03", "05"]},
        {"category": "自主移動機器人", "groupCodes": ["03", "05"]},
        {"category": "冷凍空調", "groupCodes": ["03"]},
    ]

    for cat_info in skill_competition_categories:
        # 分區賽
        events.append({
            "id": f"115-技能競賽-分區賽-{cat_info['category']}",
            "competitionName": "全國技能競賽",
            "subCompetition": "分區技能競賽",
            "category": cat_info["category"],
            "level": "分區",
            "groupCodes": cat_info["groupCodes"],
            "year": 115,
            "registrationStart": "2025-12-08",
            "registrationEnd": "2025-12-17",
            "schoolCompetitionDeadline": None,
            "finalRegistrationStart": None,
            "finalRegistrationEnd": None,
            "eventDate": "2026-03-23",
            "eventEndDate": "2026-03-28",
            "resultDate": None,
            "placingThreshold": ["第1名", "第2名", "第3名"],
            "pathwayUseful": ["guarantee", "skills", "special"],
            "source": "https://www.wdasec.gov.tw/",
            "fetchedAt": now,
        })
        # 全國賽
        events.append({
            "id": f"115-技能競賽-全國賽-{cat_info['category']}",
            "competitionName": "全國技能競賽",
            "subCompetition": "全國技能競賽",
            "category": cat_info["category"],
            "level": "全國",
            "groupCodes": cat_info["groupCodes"],
            "year": 115,
            "registrationStart": None,
            "registrationEnd": None,
            "schoolCompetitionDeadline": None,
            "finalRegistrationStart": None,
            "finalRegistrationEnd": None,
            "eventDate": "2026-07-30",
            "eventEndDate": "2026-08-01",
            "resultDate": None,
            "placingThreshold": ["第1名", "第2名", "第3名"],
            "pathwayUseful": ["guarantee", "skills", "special"],
            "source": "https://worldskillstw.wdasec.gov.tw/",
            "fetchedAt": now,
        })

    # ── 3. 全國高級中等學校專題暨創意製作競賽 (電機與電子群) ──
    # 來源：vtedu.k12ea.gov.tw + topic.tcivs.tc.edu.tw
    for comp_type in ["專題組", "創意組"]:
        events.append({
            "id": f"115-專題競賽-電機電子群-{comp_type}",
            "competitionName": "全國高級中等學校專題暨創意製作競賽",
            "subCompetition": "電機與電子群",
            "category": comp_type,
            "level": "全國",
            "groupCodes": ["03", "04"],
            "year": 115,
            "registrationStart": "2026-01-20",
            "registrationEnd": "2026-02-06",
            "schoolCompetitionDeadline": None,
            "finalRegistrationStart": None,
            "finalRegistrationEnd": None,
            "eventDate": "2026-04-30",
            "eventEndDate": "2026-05-02",
            "resultDate": None,
            "placingThreshold": ["第1名", "第2名", "第3名", "優勝", "佳作"],
            "pathwayUseful": ["skills", "special", "selection"],
            "source": "https://topic.tcivs.tc.edu.tw/",
            "fetchedAt": now,
        })

    return events


def main():
    events = build_competition_events()
    print(f"[INFO] Built {len(events)} competition events")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Written to {OUTPUT}")

    # Stats
    unique_comps = set(e["competitionName"] for e in events)
    unique_cats = set(e["category"] for e in events)
    print(f"  Competitions: {len(unique_comps)}")
    print(f"  Categories: {len(unique_cats)}")


if __name__ == "__main__":
    main()
