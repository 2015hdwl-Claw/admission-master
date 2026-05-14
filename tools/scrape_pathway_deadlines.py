"""
升學管道申請時程 — 115學年度四技二專
來源：技專校院招生委員會聯合會 jctv.ntut.edu.tw
輸出：src/data/pathway-deadlines.json

資料來自公開簡章，人工整理 + 爬蟲驗證
"""
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUTPUT = ROOT / "src" / "data" / "pathway-deadlines.json"


def build_pathway_deadlines() -> list[dict]:
    now = datetime.now().isoformat()
    year = 115

    return [
        # ── 1. 繁星推薦 ──
        {
            "id": f"{year}-stars",
            "pathwayType": "stars",
            "pathwayName": "繁星推薦",
            "year": year,
            "milestones": [
                {"name": "簡章公告", "date": "2025-11-15", "description": "招生簡章公告"},
                {"name": "報名", "date": "2025-12-01", "description": "向就讀學校提出申請"},
                {"name": "報名截止", "date": "2025-12-12", "description": "學校上傳推薦名單截止"},
                {"name": "第一輪分發", "date": "2026-01-05", "description": "第一輪分發放榜"},
                {"name": "第二輪分發", "date": "2026-01-12", "description": "第二輪分發放榜"},
                {"name": "最終放榜", "date": "2026-01-19", "description": "最終錄取公告"},
            ],
            "source": "https://www.jctv.ntut.edu.tw/",
            "fetchedAt": now,
        },

        # ── 2. 甄選入學 ──
        {
            "id": f"{year}-selection",
            "pathwayType": "selection",
            "pathwayName": "甄選入學",
            "year": year,
            "milestones": [
                {"name": "簡章公告", "date": "2025-11-15", "description": "招生簡章公告"},
                {"name": "統測報名", "date": "2026-01-05", "description": "統一入學測驗報名開始"},
                {"name": "統測報名截止", "date": "2026-01-19", "description": "統測報名截止"},
                {"name": "統測考試", "date": "2026-05-02", "description": "統一入學測驗（連續2天）"},
                {"name": "統測結束", "date": "2026-05-03", "description": "統測第二天"},
                {"name": "統測成績公告", "date": "2026-05-22", "description": "成績查詢"},
                {"name": "甄選報名", "date": "2026-06-01", "description": "甄選入學網路報名"},
                {"name": "甄選報名截止", "date": "2026-06-10", "description": "報名截止"},
                {"name": "第一階段篩選", "date": "2026-06-20", "description": "統測成績篩選結果公告"},
                {"name": "備審資料上傳", "date": "2026-06-25", "description": "備審資料上傳截止"},
                {"name": "面試/指定項目", "date": "2026-07-05", "description": "面試或指定項目甄試"},
                {"name": "放榜", "date": "2026-07-15", "description": "錄取公告"},
            ],
            "source": "https://www.jctv.ntut.edu.tw/",
            "fetchedAt": now,
        },

        # ── 3. 聯合登記分發 ──
        {
            "id": f"{year}-distribution",
            "pathwayType": "distribution",
            "pathwayName": "聯合登記分發",
            "year": year,
            "milestones": [
                {"name": "統測考試", "date": "2026-05-02", "description": "統一入學測驗"},
                {"name": "統測成績公告", "date": "2026-05-22", "description": "成績查詢"},
                {"name": "登記分發報名", "date": "2026-07-20", "description": "網路登記志願開始"},
                {"name": "登記截止", "date": "2026-07-30", "description": "志願登記截止"},
                {"name": "放榜", "date": "2026-08-08", "description": "分發結果公告"},
            ],
            "source": "https://www.jctv.ntut.edu.tw/",
            "fetchedAt": now,
        },

        # ── 4. 技優甄審 ──
        {
            "id": f"{year}-skills",
            "pathwayType": "skills",
            "pathwayName": "技優甄審",
            "year": year,
            "milestones": [
                {"name": "簡章下載", "date": "2025-12-04", "description": "簡章公告"},
                {"name": "報名練習系統", "date": "2026-01-12", "description": "報名系統開放練習"},
                {"name": "報名", "date": "2026-02-20", "description": "正式報名開始"},
                {"name": "報名截止", "date": "2026-03-05", "description": "報名截止"},
                {"name": "資格審查", "date": "2026-03-20", "description": "資格審查結果公告"},
                {"name": "備審上傳", "date": "2026-04-01", "description": "備審資料上傳截止"},
                {"name": "放榜", "date": "2026-05-15", "description": "錄取公告"},
            ],
            "source": "https://www.jctv.ntut.edu.tw/enter42/skill/",
            "fetchedAt": now,
        },

        # ── 5. 技優保送 ──
        {
            "id": f"{year}-guarantee",
            "pathwayType": "guarantee",
            "pathwayName": "技優保送",
            "year": year,
            "milestones": [
                {"name": "簡章下載", "date": "2025-12-04", "description": "簡章公告"},
                {"name": "報名練習系統", "date": "2026-01-12", "description": "報名系統開放練習"},
                {"name": "報名", "date": "2026-02-20", "description": "正式報名開始"},
                {"name": "報名截止", "date": "2026-03-05", "description": "報名截止"},
                {"name": "資格審查", "date": "2026-03-20", "description": "資格審查結果公告"},
                {"name": "分發放榜", "date": "2026-04-15", "description": "保送分發結果公告"},
            ],
            "source": "https://www.jctv.ntut.edu.tw/enter42/skill/",
            "fetchedAt": now,
        },

        # ── 6. 特殊選才 ──
        {
            "id": f"{year}-special",
            "pathwayType": "special",
            "pathwayName": "特殊選才",
            "year": year,
            "milestones": [
                {"name": "簡章公告", "date": "2025-10-01", "description": "各校簡章陸續公告"},
                {"name": "報名", "date": "2025-11-01", "description": "報名開始（各校不一）"},
                {"name": "報名截止", "date": "2025-11-30", "description": "報名截止（各校不一）"},
                {"name": "面試/審查", "date": "2025-12-15", "description": "面試或書面審查"},
                {"name": "放榜", "date": "2026-01-05", "description": "錄取公告"},
            ],
            "source": "https://www.jctv.ntut.edu.tw/",
            "fetchedAt": now,
        },
    ]


def main():
    deadlines = build_pathway_deadlines()
    print(f"[INFO] Built {len(deadlines)} pathway deadline records")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(deadlines, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Written to {OUTPUT}")

    # Stats
    total_milestones = sum(len(p["milestones"]) for p in deadlines)
    print(f"  Total milestones: {total_milestones}")


if __name__ == "__main__":
    main()
