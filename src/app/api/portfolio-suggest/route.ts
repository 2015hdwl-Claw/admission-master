import { NextRequest, NextResponse } from 'next/server';

const AI_API_BASE = process.env.AI_API_BASE_URL || process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/';
const AI_API_KEY = process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || process.env.NEXT_PUBLIC_AI_MODEL || 'glm-4.7-flash';

interface PortfolioSuggestRequestBody {
  direction: string;
  directionGroup: string;
  portfolioItems: Array<{ code: string; title: string; content: string }>;
}

export async function POST(request: NextRequest) {
  const body: PortfolioSuggestRequestBody = await request.json();
  const { direction, directionGroup, portfolioItems } = body;

  const itemsSummary = portfolioItems.map(item => `[${item.code}] ${item.title}: ${item.content}`).join('\n');

  const prompt = `你是一位台灣大學升學備審資料專家。學生的目標方向是${directionGroup}學群的${direction}。

## 已有素材（共 ${portfolioItems.length} 件）
${itemsSummary || '尚無素材'}

請分析並回傳 JSON：
{
  "missingCodes": ["缺少的代碼1", "缺少的代碼2"],
  "suggestions": [
    "具體建議1：該補什麼素材、為什麼重要",
    "具體建議2",
    "具體建議3"
  ],
  "priority": "最該優先補充的 1-2 件素材說明"
}

學習歷程代碼：B 書面報告、C 實作作品、D 自然探究、E 社會探究、F 自主學習、G 社團、H 幹部、I 服務學習、J 競賽、K 作品、L 檢定、M 特殊表現

規則：
1. 根據${direction}方向，分析哪些代碼最重要但目前缺失
2. 建議要具體，結合學生的目標方向
3. 如果已有素材，分析內容品質並建議如何強化
4. 優先級要明確`;

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
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    let parsed;
    try { parsed = JSON.parse(content); } catch { const m = content.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : {}; }
    return NextResponse.json({
      missingCodes: parsed.missingCodes || [],
      suggestions: parsed.suggestions || [],
      priority: parsed.priority || '',
    });
  } catch {
    clearTimeout(timeoutId);
    return NextResponse.json({ error: 'Request timeout or parse error' }, { status: 504 });
  }
}
