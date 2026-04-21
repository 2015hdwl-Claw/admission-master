import { NextRequest, NextResponse } from 'next/server';

const AI_API_BASE = process.env.AI_API_BASE_URL || process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/';
const AI_API_KEY = process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || process.env.NEXT_PUBLIC_AI_MODEL || 'glm-4.7-flash';

interface StrategyRequestBody {
  direction: string;
  directionGroup: string;
  grade: string;
  track: string;
  selectedDirections: string[];
  portfolioCount: number;
}

export async function POST(request: NextRequest) {
  const body: StrategyRequestBody = await request.json();
  const { direction, directionGroup, grade, track, selectedDirections, portfolioCount } = body;

  const prompt = `你是一位台灣大學升學策略專家。請根據以下學生資料，生成一份完整的科系策略報告。

## 學生資料
- 年級：${grade}
- 分組：${track}
- 主要方向：${direction}（${directionGroup}學群）
- 其他考慮方向：${selectedDirections.join('、') || '無'}
- 已有素材數量：${portfolioCount} 件

請回傳 JSON 格式：
{
  "departments": [
    {
      "rank": 1,
      "name": "科系名稱",
      "university": "大學名稱",
      "category": "學類",
      "scoreRange": "預估錄取門檻（如 50-55 級分）",
      "keyRequirement": "錄取關鍵要求",
      "portfolioFocus": "備審重點建議"
    }
  ],
  "timeline": ["時間規劃建議1", "時間規劃建議2", ...],
  "portfolioAdvice": "整體備審資料建議（2-3 段）",
  "interviewAdvice": "面試準備建議（2-3 段）",
  "overallStrategy": "整體策略建議（3-4 段，結合年級和時間給出具體建議）"
}

規則：
1. departments 提供 10 個推薦科系，從最匹配到保底
2. 科系要真實存在於台灣大學
3. scoreRange 基於學測 60 級分制
4. timeline 至少 5 項具體時間規劃
5. 建議要具體可執行，不要泛泛而談
6. 考慮${grade}的時間限制給出現實建議`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${AI_API_BASE}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('AI API error:', response.status, errText);
      if (response.status === 429) {
        return NextResponse.json({ error: 'AI 請求太頻繁，請稍等 1-2 分鐘再試' }, { status: 429 });
      }
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
      }
    }
    return NextResponse.json({
      direction,
      directionGroup,
      grade,
      departments: (parsed.departments || []).slice(0, 10).map((d: Record<string, unknown>, i: number) => ({
        rank: i + 1,
        name: d.name || '',
        university: d.university || '',
        category: d.category || '',
        scoreRange: d.scoreRange || '',
        keyRequirement: d.keyRequirement || '',
        portfolioFocus: d.portfolioFocus || '',
      })),
      timeline: parsed.timeline || [],
      portfolioAdvice: parsed.portfolioAdvice || '',
      interviewAdvice: parsed.interviewAdvice || '',
      overallStrategy: parsed.overallStrategy || '',
    });
  } catch {
    clearTimeout(timeoutId);
    return NextResponse.json({ error: 'Request timeout or parse error' }, { status: 504 });
  }
}
