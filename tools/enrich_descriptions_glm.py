"""
用 GLM API 為缺少 fullDescription 的科系生成完整介紹
用途：補充 departments.json 中的 fullDescription 欄位
策略：用科系名稱 + 學校名 + features + researchAreas 生成 30-50 字介紹
"""

import json
import os
import sys
import time
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from openai import OpenAI
except ImportError:
    print("[ERROR] pip install openai")
    sys.exit(1)

DEPARTMENTS = Path(__file__).resolve().parent.parent / "src" / "data" / "departments.json"

API_KEY = os.getenv("CLASSIFIER_API_KEY", "7571f91152a74a669179d3a2c67c513a.E6KUmy0NNEwTYdKK")
BASE_URL = os.getenv("CLASSIFIER_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/")
MODEL = os.getenv("CLASSIFIER_MODEL", "glm-4.7-flash")
COOLDOWN = int(os.getenv("SCRAPER_COOLDOWN", "5"))

PROMPT_TEMPLATE = """請為以下科系撰寫一段 30-50 字的介紹，描述這個科系的核心定位和特色。

學校：{school_name}
科系：{dept_name}
特色：{features}
研究方向：{research}
畢業出路：{careers}

要求：
1. 30-50 個中文字
2. 不用「該系」「本科」等自稱，用第三人稱描述
3. 提及核心技術領域和就業方向
4. 直接輸出介紹文字，不要加引號或其他格式"""


def main():
    print("=== GLM 科系介紹生成 ===\n")
    sys.stdout.flush()

    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

    with open(DEPARTMENTS, "r", encoding="utf-8") as f:
        departments = json.load(f)

    to_update = [d for d in departments if not d.get("fullDescription")]
    print(f"需更新: {len(to_update)} / {len(departments)} 個科系\n")

    if not to_update:
        print("[DONE] 所有科系已有介紹！")
        return

    updated = 0
    for i, dept in enumerate(to_update):
        school = dept.get("schoolName", "")
        name = dept.get("departmentName", "")
        features = ", ".join(dept.get("features", [])[:3])
        research = ", ".join(dept.get("researchAreas", [])[:3])
        careers = ", ".join(dept.get("careerPaths", [])[:3])

        prompt = PROMPT_TEMPLATE.format(
            school_name=school,
            dept_name=name,
            features=features or "暫無",
            research=research or "暫無",
            careers=careers or "暫無",
        )

        print(f"  [{i+1}/{len(to_update)}] {school} - {name}")

        for attempt in range(3):
            try:
                resp = client.chat.completions.create(
                    model=MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.7,
                )
                desc = resp.choices[0].message.content.strip().strip('"').strip("'")
                if desc:
                    dept["fullDescription"] = desc
                    updated += 1
                    print(f"    ✅ {desc[:50]}...")
                break
            except Exception as e:
                err = str(e)
                print(f"    ⚠️ Attempt {attempt+1}: {err[:80]}")
                if "429" in err or "rate" in err.lower():
                    wait = 30 * (attempt + 1)
                    print(f"    ⏳ Waiting {wait}s...")
                    time.sleep(wait)
                else:
                    break

        time.sleep(COOLDOWN)

    # Save
    with open(DEPARTMENTS, "w", encoding="utf-8") as f:
        json.dump(departments, f, ensure_ascii=False, indent=2)

    print(f"\n[DONE] Updated: {updated}/{len(to_update)}")


if __name__ == "__main__":
    main()
