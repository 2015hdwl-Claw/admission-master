"""
用本地規則 + 模板為科系生成 fullDescription
不需要 API，秒級完成
"""

import json
import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DEPARTMENTS = Path(__file__).resolve().parent.parent / "src" / "data" / "departments.json"

# Template patterns based on features/research/careers
TEMPLATES = [
    "專注於{features}領域，培養具備{research}專業能力的技術人才，畢業後可從事{careers}等高薪職務。",
    "以{research}為核心發展方向，結合{features}實務訓練，為{careers}等產業培育專業工程師。",
    "聚焦{features}技術發展，透過{research}課程訓練，畢業生多投入{careers}等熱門產業。",
    "深耕{features}專業領域，強調{research}的理論與實務整合，為高科技產業培養{careers}人才。",
    "以{features}為教學主軸，搭配{research}研究發展，學生畢業後可勝任{careers}等職位。",
]

SCHOOL_AFFIXES = {
    "國立臺灣科技大學": "台科大",
    "國立臺北科技大學": "北科大",
    "國立雲林科技大學": "雲科大",
    "國立高雄科技大學": "高科大",
    "國立虎尾科技大學": "虎尾科大",
    "國立勤益科技大學": "勤益科大",
    "國立屏東科技大學": "屏科大",
    "龍華科技大學": "龍華科大",
    "南臺科技大學": "南臺科大",
    "明志科技大學": "明志科大",
    "崑山科技大學": "崑山科大",
    "聖約翰科技大學": "聖約翰科大",
    "亞東科技大學": "亞東科大",
    "健行科技大學": "健行科大",
    "修平科技大學": "修平科大",
    "明新科技大學": "明新科大",
}


def generate_description(dept: dict) -> str:
    features = dept.get("features", [])
    research = dept.get("researchAreas", [])
    careers = dept.get("careerPaths", [])
    salary = dept.get("careerOutcomes", {}).get("avgSalary", 0)

    feat_str = "、".join(features[:2]) if features else "工程技術"
    res_str = "、".join(research[:2]) if research else "應用科學"
    career_str = "、".join(careers[:2]) if careers else "相關工程師"

    import random
    template = TEMPLATES[random.randint(0, len(TEMPLATES) - 1)]
    desc = template.format(features=feat_str, research=res_str, careers=career_str)

    # Add salary info if available
    if salary > 0:
        desc += f" 平均起薪約{(salary/1000):.0f}K/月。"

    return desc


def main():
    print("=== 本地科系介紹生成 ===\n")

    with open(DEPARTMENTS, "r", encoding="utf-8") as f:
        departments = json.load(f)

    updated = 0
    for dept in departments:
        if not dept.get("fullDescription"):
            dept["fullDescription"] = generate_description(dept)
            updated += 1

    with open(DEPARTMENTS, "w", encoding="utf-8") as f:
        json.dump(departments, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Updated: {updated}/{len(departments)}")


if __name__ == "__main__":
    main()
