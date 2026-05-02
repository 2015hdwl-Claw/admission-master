/**
 * AI 備審素材審查 API — 學自 Yory 的三維度評分
 * 免費版：規則引擎審查（字數、STAR 結構、關鍵字）
 * 付費版：AI 審查（結構完整性/內容深度/與職群關聯性）
 */

import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseAIJson } from '@/lib/ai-helper';

// ── Types ─────────────────────────────────────────────────────────────

interface ReviewRequest {
  content: string;
  category: string;
  directionGroup?: string;
  useAI?: boolean;
}

interface ReviewDimension {
  name: string;
  score: number; // 0-10
  feedback: string;
  suggestions: string[];
}

interface ReviewResult {
  overallScore: number; // 0-10
  dimensions: ReviewDimension[];
  summary: string;
  improved: string; // AI-improved version (only if useAI)
  usedAI: boolean;
}

// ── Rule-based Review (Free) ──────────────────────────────────────────

function ruleBasedReview(content: string, category: string, directionGroup?: string): ReviewResult {
  const charCount = content.length;
  const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
  const hasSituation = /情境|背景|起因|緣由|現況|問題/.test(content);
  const hasTask = /任務|目標|負責|需要|挑戰|挑戰/.test(content);
  const hasAction = /行動|做法|步驟|過程|執行|進行|利用|使用|撰寫|開發|設計|實作|練習/.test(content);
  const hasResult = /結果|成果|收穫|學到|完成|提升|改善|獲得|取得|達成/.test(content);

  // Dimension 1: Structure
  let structureScore = 0;
  const structureFeedback: string[] = [];
  if (paragraphs.length >= 3) { structureScore += 3; } else { structureFeedback.push('建議至少分成 3 段，讓人更容易看懂'); }
  if (hasSituation && hasTask) { structureScore += 2; } else { structureFeedback.push('一開始要先說「為什麼要做這件事」'); }
  if (hasAction) { structureScore += 3; } else { structureFeedback.push('最重要的部分：你實際做了什麼？要寫詳細一點'); }
  if (hasResult) { structureScore += 2; } else { structureFeedback.push('最後要寫「結果怎麼樣」或「你學到什麼」'); }

  // Dimension 2: Content Depth
  let depthScore = 0;
  const depthFeedback: string[] = [];
  if (charCount >= 200) { depthScore += 3; } else { depthFeedback.push(`目前才 ${charCount} 字，建議至少寫 200 字以上`); }
  if (charCount >= 400) { depthScore += 2; }
  const hasNumbers = /\d+/.test(content);
  if (hasNumbers) { depthScore += 2; } else { depthFeedback.push('加一些具體數字（像是做了幾次、花多少時間、成績第幾名）會更有說服力'); }
  const hasSpecific = /例如|比如|像是|具體|實際/.test(content);
  if (hasSpecific) { depthScore += 2; } else { depthFeedback.push('舉一兩個具體的例子，不要只寫空泛的描述'); }
  if (paragraphs.some(p => p.length > 50)) { depthScore += 1; }

  // Dimension 3: Direction Relevance
  let relevanceScore = 5;
  const relevanceFeedback: string[] = [];
  if (directionGroup && directionGroup !== '未決定') {
    const groupKeywords: Record<string, string[]> = {
      '資訊群': ['程式', '軟體', '系統', '資料', '網路', 'AI', '開發', '設計', '技術', 'code', 'app'],
      '機械群': ['機械', '加工', 'CNC', '製造', '零件', '模具', '車床', '銑床'],
      '電機群': ['電路', '電力', '馬達', '控制', '感測', 'PLC', '配線', '自動化'],
      '電子群': ['電子', '電路板', '焊接', 'IC', '微控制器', '通訊', '信號'],
      '餐旅群': ['烹飪', '餐飲', '服務', '食材', '菜單', '廚房', '料理', '顧客'],
      '商管群': ['行銷', '管理', '企劃', '財務', '市場', '營運', '顧客', '業務'],
      '設計群': ['設計', '視覺', '品牌', '色彩', '排版', '創意', 'UI', 'UX'],
      '農業群': ['栽培', '農業', '作物', '畜牧', '土壤', '肥料', '溫室', '有機'],
      '化工群': ['化學', '實驗', '材料', '反應', '分析', '處理', '檢測'],
      '土木群': ['建築', '結構', '工程', '施工', '測量', '材料', '設計', '規劃'],
      '護理群': ['護理', '健康', '照護', '醫療', '病患', '衛教', '評估'],
      '家政群': ['烹飪', '育兒', '照護', '營養', '家管', '服務'],
      '語文群': ['語言', '翻譯', '寫作', '溝通', '表達', '閱讀', '外語'],
      '海事群': ['航海', '輪機', '船舶', '海洋', '操船', '通訊'],
      '商業與管理群': ['商業', '會計', '貿易', '經營', '企劃', '管理'],
    };
    const keywords = groupKeywords[directionGroup] || [];
    const matched = keywords.filter(kw => content.includes(kw));
    relevanceScore = Math.min(10, 4 + matched.length * 2);
    if (matched.length === 0) {
      relevanceFeedback.push(`建議加一些跟「${directionGroup}」有關的專業術語或技術細節`);
    }
    if (matched.length <= 2) {
      relevanceFeedback.push(`可以多寫一點跟${directionGroup}直接相關的技術或知識`);
    }
  } else {
    relevanceFeedback.push('先設定你想讀的方向，可以得到更準確的建議');
    relevanceScore = 5;
  }

  const overall = Math.round((structureScore + depthScore + relevanceScore) / 3 * 10) / 10;

  const dimensions: ReviewDimension[] = [
    {
      name: '有沒有說清楚',
      score: structureScore,
      feedback: structureScore >= 7 ? '結構很清楚，該寫的都有寫到' : '結構需要加強',
      suggestions: structureFeedback,
    },
    {
      name: '內容夠不夠具體',
      score: depthScore,
      feedback: depthScore >= 7 ? '內容夠詳細，有具體的細節' : '內容可以再寫詳細一點',
      suggestions: depthFeedback,
    },
    {
      name: '跟目標科的關聯',
      score: relevanceScore,
      feedback: relevanceScore >= 7 ? '跟你選的方向很相關' : '可以多加一些跟你選的方向有關的內容',
      suggestions: relevanceFeedback,
    },
  ];

  const summary = overall >= 8
    ? '寫得很好！結構清楚、內容具體、跟你選的方向也很相關。'
    : overall >= 6
    ? '已有基本內容，根據下面的建議改一下會更好。'
    : '需要再補充一下。建議先寫清楚「為什麼做、做了什麼、結果怎樣」，再加一些具體細節。';

  return { overallScore: overall, dimensions, summary, improved: '', usedAI: false };
}

// ── AI Review (Pro) ──────────────────────────────────────────────────

async function aiReview(content: string, category: string, directionGroup?: string): Promise<ReviewResult> {
  const systemPrompt = `你是一位台灣四技二專申請入學的自傳審查老師。你的任務是審查學生的技能紀錄，從三個維度評分並給出具體改進建議。用高中生看得懂的話來寫回饋。

三個評分維度（各 0-10 分）：
1. 結構完整性：有沒有把背景、做了什麼、怎麼做的、結果如何說清楚
2. 內容深度：有沒有具體的細節、數據、例子，不要太空泛
3. 與目標方向的關聯：有沒有展現出跟想讀的科有關的能力

請以 JSON 格式回應：
{
  "overallScore": 7.5,
  "dimensions": [
    { "name": "結構完整性", "score": 8, "feedback": "...", "suggestions": ["...", "..."] },
    { "name": "內容深度", "score": 7, "feedback": "...", "suggestions": ["...", "..."] },
    { "name": "方向關聯性", "score": 7, "feedback": "...", "suggestions": ["...", "..."] }
  ],
  "summary": "整體評語...",
  "improved": "根據建議改寫後的完整版本..."
}

注意：
- improved 欄位要輸出完整的改寫後版本，不是摘要
- 改寫時保持原本的事實，只是改善結構和表達
- 建議要具體可執行，不要空泛
- 用高中生看得懂的話，不要用太難的詞
- 用繁體中文回應`;

  const userPrompt = `請審查以下技能紀錄：
技能類別：${category}
${directionGroup ? `目標職群：${directionGroup}` : '目標職群：未指定'}

內容：
${content}`;

  try {
    const result = await callAI({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      timeoutMs: 7000 // Reduce timeout for Vercel compatibility
    });

    if (!result.ok || !result.content) {
      console.warn('AI review failed, falling back to rule-based:', result.error);
      return ruleBasedReview(content, category, directionGroup);
    }

    const parsed = parseAIJson<{
      overallScore: number;
      dimensions: ReviewDimension[];
      summary: string;
      improved: string;
    }>(result.content);

    if (!parsed) {
      console.warn('AI response parsing failed, falling back to rule-based');
      return ruleBasedReview(content, category, directionGroup);
    }

    return {
      overallScore: parsed.overallScore ?? 0,
      dimensions: parsed.dimensions ?? [],
      summary: parsed.summary ?? '',
      improved: parsed.improved ?? '',
      usedAI: true,
    };
  } catch (error) {
    console.error('AI review error, falling back to rule-based:', error);
    return ruleBasedReview(content, category, directionGroup);
  }
}

// ── API Route ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReviewRequest;
    const { content, category, directionGroup, useAI } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '請輸入要審查的內容' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: '請指定技能類別' }, { status: 400 });
    }

    let result: ReviewResult;

    if (useAI) {
      result = await aiReview(content, category, directionGroup);
    } else {
      result = ruleBasedReview(content, category, directionGroup);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Review API error:', err);
    return NextResponse.json(
      { error: '審查失敗，請稍後再試' },
      { status: 500 },
    );
  }
}
