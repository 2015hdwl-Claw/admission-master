"""
Generate national-calendar.ts from scraped pathway deadlines, exam schedules,
and competition events. Replaces hardcoded calendar with auto-generated data.
"""
import json
from datetime import datetime
from pathlib import Path

from scraper_utils import DATA_DIR, save_ts

ROOT = Path(__file__).parent.parent
DATA = ROOT / "src" / "data"


def load_json(filename: str) -> list:
    path = DATA / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def main():
    print("═══ 產生國家行事曆 ═══")

    pathways = load_json("pathway-deadlines.json")
    exams = load_json("exam-schedules.json")
    competitions = load_json("competition-events.json")

    events = []
    seen_dates = set()

    # ── Pathway milestones → calendar events ──
    pathway_type_map = {
        "stars": "activity",
        "selection": "activity",
        "distribution": "activity",
        "skills": "activity",
        "guarantee": "activity",
        "special": "activity",
    }

    for pathway in pathways:
        ptype = pathway["pathwayType"]
        pname = pathway["pathwayName"]
        year = pathway["year"]

        for ms in pathway.get("milestones", []):
            date = ms.get("date", "")
            if not date:
                continue

            # Deduplicate by date+title
            key = f"{date}:{ms['name']}"
            if key in seen_dates:
                continue
            seen_dates.add(key)

            events.append({
                "id": f"cal-{ptype}-{ms['name'][:6]}-{date}",
                "title": f"{year}{pname} {ms['name']}",
                "date": date,
                "type": pathway_type_map.get(ptype, "activity"),
                "isNational": True,
                "learningCodes": [],
                "vocational": True,
            })

    # ── Exam batches → certification events ──
    # Group by batch and level to avoid flooding
    batch_dates = {}
    for exam in exams:
        bn = f"batch{exam['batch']}"
        level = exam["level"]
        key = f"{bn}-{level}"
        if key not in batch_dates:
            batch_dates[key] = {
                "batch": exam["batch"],
                "level": level,
                "reg_start": exam["registrationStart"],
                "reg_end": exam["registrationEnd"],
                "test_date": exam["writtenTestDate"],
                "result_date": exam["resultDate"],
            }

    level_labels = {"丙": "丙級", "乙": "乙級", "甲": "甲級"}
    for key, info in batch_dates.items():
        level = info["level"]
        bn = info["batch"]
        label = level_labels.get(level, level)

        # Registration deadline
        if info["reg_end"]:
            key_r = f"{info['reg_end']}:報名截止"
            if key_r not in seen_dates:
                seen_dates.add(key_r)
                events.append({
                    "id": f"cal-cert-reg-{level}-b{bn}",
                    "title": f"{label}技術士技能檢定 第{bn}梯次 報名截止",
                    "date": info["reg_end"],
                    "type": "certification",
                    "isNational": True,
                    "learningCodes": [],
                    "vocational": True,
                })

        # Written test date
        if info["test_date"]:
            key_t = f"{info['test_date']}:學科測試"
            if key_t not in seen_dates:
                seen_dates.add(key_t)
                events.append({
                    "id": f"cal-cert-test-{level}-b{bn}",
                    "title": f"{label}技術士技能檢定 第{bn}梯次 學科測試",
                    "date": info["test_date"],
                    "type": "certification",
                    "isNational": True,
                    "learningCodes": [],
                    "vocational": True,
                })

        # Result date
        if info["result_date"]:
            key_res = f"{info['result_date']}:成績公告"
            if key_res not in seen_dates:
                seen_dates.add(key_res)
                events.append({
                    "id": f"cal-cert-result-{level}-b{bn}",
                    "title": f"{label}技術士技能檢定 第{bn}梯次 成績公告",
                    "date": info["result_date"],
                    "type": "certification",
                    "isNational": True,
                    "learningCodes": [],
                    "vocational": True,
                })

    # ── Competition events ──
    for comp in competitions:
        event_date = comp.get("eventDate", "")
        if not event_date:
            continue

        key_c = f"{event_date}:{comp['competitionName']}:{comp.get('category', '')}"
        if key_c in seen_dates:
            continue
        seen_dates.add(key_c)

        # Only add one event per competition (deduplicate by competition name + date)
        comp_key = f"{comp['competitionName']}:{event_date}"
        if any(e["id"] == f"cal-comp-{comp['id']}" for e in events):
            continue

        events.append({
            "id": f"cal-comp-{comp['id']}",
            "title": f"{comp['competitionName']} {comp.get('subCompetition', '')} {comp.get('category', '')}".strip(),
            "date": event_date,
            "type": "competition",
            "isNational": True,
            "learningCodes": [],
            "vocational": True,
        })

    # Sort by date
    events.sort(key=lambda e: e["date"])

    # Generate TypeScript
    ts_lines = []
    ts_lines.append("import type { CalendarEvent } from '@/types';")
    ts_lines.append("")
    ts_lines.append("// Auto-generated from scraped data (pathway-deadlines + exam-schedules + competition-events)")
    ts_lines.append(f"// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    ts_lines.append("")
    ts_lines.append("export const NATIONAL_CALENDAR_EVENTS: CalendarEvent[] = [")

    for ev in events:
        ts_lines.append(
            f"  {{ id: '{ev['id']}', title: '{ev['title']}', date: '{ev['date']}', "
            f"type: '{ev['type']}', isNational: {str(ev['isNational']).lower()}, "
            f"learningCodes: [], vocational: {str(ev['vocational']).lower()} }},"
        )

    ts_lines.append("];")

    # Static lookup tables (unchanged)
    ts_lines.append("")
    ts_lines.append("export const EVENT_TYPE_LABELS: Record<string, string> = {")
    ts_lines.append("  exam: '考試',")
    ts_lines.append("  activity: '活動',")
    ts_lines.append("  competition: '競賽',")
    ts_lines.append("  certification: '技能檢定',")
    ts_lines.append("  capstone: '專題實作',")
    ts_lines.append("  other: '其他',")
    ts_lines.append("};")
    ts_lines.append("")
    ts_lines.append("export const EVENT_TYPE_COLORS: Record<string, string> = {")
    ts_lines.append("  exam: 'bg-red-100 text-red-700',")
    ts_lines.append("  activity: 'bg-blue-100 text-blue-700',")
    ts_lines.append("  competition: 'bg-amber-100 text-amber-700',")
    ts_lines.append("  certification: 'bg-green-100 text-green-700',")
    ts_lines.append("  capstone: 'bg-purple-100 text-purple-700',")
    ts_lines.append("  other: 'bg-gray-100 text-gray-700',")
    ts_lines.append("};")
    ts_lines.append("")
    ts_lines.append("export const LEARNING_CODE_LABELS: Record<string, string> = {")
    ts_lines.append("  B: 'B 書面報告', C: 'C 實作', D: 'D 自然探究', E: 'E 社會探究',")
    ts_lines.append("  F: 'F 自主學習', G: 'G 社團', H: 'H 幹部', I: 'I 服務學習',")
    ts_lines.append("  J: 'J 競賽', K: 'K 作品', L: 'L 檢定', M: 'M 特殊表現',")
    ts_lines.append("};")
    ts_lines.append("")
    ts_lines.append("export const LEARNING_CODE_COLORS: Record<string, string> = {")
    ts_lines.append("  B: 'bg-blue-500', C: 'bg-green-500', D: 'bg-teal-500', E: 'bg-orange-500',")
    ts_lines.append("  F: 'bg-purple-500', G: 'bg-pink-500', H: 'bg-indigo-500', I: 'bg-cyan-500',")
    ts_lines.append("  J: 'bg-amber-500', K: 'bg-rose-500', L: 'bg-lime-500', M: 'bg-fuchsia-500',")
    ts_lines.append("};")

    save_ts("national-calendar.ts", "\n".join(ts_lines) + "\n")
    print(f"  {len(events)} calendar events generated")
    print(f"  Pathway milestones: {sum(1 for e in events if e['type'] == 'activity')}")
    print(f"  Certification events: {sum(1 for e in events if e['type'] == 'certification')}")
    print(f"  Competition events: {sum(1 for e in events if e['type'] == 'competition')}")


if __name__ == "__main__":
    main()
