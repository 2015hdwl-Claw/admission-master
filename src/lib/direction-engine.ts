import type { UserFact, DirectionResult, InterestAnswer, InterestQuestion, OnboardingProfile } from '@/types';
import { DIRECTION_RULES } from '@/data/direction-rules';

/**
 * Tag extraction: convert user facts into normalized tags used by rules.
 */
function extractTags(facts: UserFact[]): Set<string> {
  const tags = new Set<string>();

  for (const fact of facts) {
    const detail = fact.detail.toLowerCase();
    const label = fact.label.toLowerCase();

    // Academic performance tags
    if (fact.category === 'academic') {
      if (label.includes('前10%') || label.includes('top')) tags.add('top-rank');
      if (label.includes('前20%')) tags.add('top-rank');
      if (detail.includes('數學') || label.includes('數學')) tags.add('math-strong');
      if (detail.includes('自然') || detail.includes('物理') || detail.includes('化學') || detail.includes('生物')) tags.add('science-strong');
      if (detail.includes('社會') || detail.includes('歷史') || detail.includes('地理') || detail.includes('公民')) tags.add('social-science-strong');
    }

    // Club experience tags
    if (fact.category === 'club') {
      if (label.includes('社長') || label.includes('會長') || label.includes('隊長')) tags.add('leadership');
      if (label.includes('幹部')) tags.add('leadership');
    }

    // Extracurricular tags
    if (fact.category === 'extracurricular') {
      if (detail.includes('比賽') || detail.includes('競賽') || label.includes('比賽')) tags.add('competition');
      if (detail.includes('全國') || detail.includes('國際')) tags.add('competition');
      if (detail.includes('辯論') || detail.includes('演講')) tags.add('debate');
      if (detail.includes('志工') || detail.includes('服務') || label.includes('志工')) tags.add('volunteer-care');
    }

    // Self-study tags
    if (fact.category === 'selfStudy') {
      if (detail.includes('程式') || detail.includes('python') || detail.includes('javascript') || detail.includes('coding') || detail.includes('寫程式')) tags.add('programming');
      if (detail.includes('英文') || detail.includes('日文') || detail.includes('韓文') || detail.includes('外語') || detail.includes('英語') || detail.includes('toefl') || detail.includes('ielts') || detail.includes('gept')) tags.add('language');
      if (detail.includes('繪畫') || detail.includes('畫畫') || detail.includes('素描') || detail.includes('美術')) tags.add('art');
      if (detail.includes('設計') || detail.includes('ui') || detail.includes('ux') || detail.includes('平面')) tags.add('design');
      if (detail.includes('音樂') || detail.includes('樂器') || detail.includes('鋼琴') || detail.includes('吉他') || detail.includes('小提琴')) tags.add('music');
      if (detail.includes('表演') || detail.includes('戲劇') || detail.includes('話劇') || detail.includes('舞台')) tags.add('performance');
    }

    // Other tags
    if (fact.category === 'other') {
      if (detail.includes('打工') || detail.includes('創業') || detail.includes('攤位')) tags.add('finance-interest');
    }

    // Cross-category: writing detection
    if (detail.includes('寫作') || detail.includes('作文') || detail.includes('閱讀') || detail.includes('看書') || label.includes('寫作')) {
      tags.add('writing');
    }
    if (detail.includes('閱讀') || detail.includes('看書') || detail.includes('讀書') || label.includes('閱讀')) {
      tags.add('reading');
    }
    if (detail.includes('歷史') || detail.includes('考古') || detail.includes('文明')) {
      tags.add('history-interest');
    }
    if (detail.includes('實驗') || detail.includes('lab')) {
      tags.add('lab');
    }
    if (detail.includes('電子') || detail.includes('電路') || detail.includes('arduino') || detail.includes('電子電路')) {
      tags.add('electronics');
    }
    if (detail.includes('機械') || detail.includes('3d列印') || detail.includes('動手做') || detail.includes('手工')) {
      tags.add('mechanical');
      tags.add('making');
    }
    if (detail.includes('生物') || detail.includes('生命科學')) {
      tags.add('biology');
    }
    if (detail.includes('化學')) {
      tags.add('chemistry');
    }
    if (detail.includes('地球科學') || detail.includes('地質') || detail.includes('氣象')) {
      tags.add('earth-science');
    }
    if (detail.includes('金融') || detail.includes('投資') || detail.includes('股票') || detail.includes('經濟')) {
      tags.add('finance-interest');
    }
  }

  return tags;
}

/**
 * Match direction rules against extracted tags.
 * Returns deduplicated, sorted results (top 5).
 */
export function deriveDirections(facts: UserFact[]): DirectionResult[] {
  if (facts.length === 0) return [];

  const tags = extractTags(facts);
  const resultMap = new Map<string, DirectionResult>();

  for (const rule of DIRECTION_RULES) {
    const matched = rule.conditions.every(cond => tags.has(cond));
    if (!matched) continue;

    const existing = resultMap.get(rule.direction);
    if (existing) {
      if (rule.confidence > existing.confidence) {
        existing.confidence = rule.confidence;
      }
      existing.reasons.push(rule.reason);
      existing.factCount += rule.conditions.length;
      const newIds = rule.relatedCategoryIds.filter(id => !existing.relatedCategoryIds.includes(id));
      existing.relatedCategoryIds.push(...newIds);
    } else {
      resultMap.set(rule.direction, {
        direction: rule.direction,
        directionGroup: rule.directionGroup,
        confidence: rule.confidence,
        reasons: [rule.reason],
        relatedCategoryIds: [...rule.relatedCategoryIds],
        factCount: rule.conditions.length,
      });
    }
  }

  const results = Array.from(resultMap.values());
  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, 5);
}

/**
 * Interest-based fallback questions for users with no facts.
 */
export const INTEREST_QUESTIONS: InterestQuestion[] = [
  {
    id: 1,
    question: '閒暇時間你最常做什麼？',
    options: [
      { value: 'read', label: '看書、閱讀文章' },
      { value: 'code', label: '寫程式、研究科技' },
      { value: 'create', label: '畫畫、做手工藝、音樂' },
      { value: 'social', label: '跟朋友聚會、參加活動' },
      { value: 'sports', label: '運動、戶外活動' },
    ],
  },
  {
    id: 2,
    question: '哪類新聞最吸引你點進去看？',
    options: [
      { value: 'tech', label: '科技、AI、新產品' },
      { value: 'society', label: '社會議題、政治、國際' },
      { value: 'business', label: '財經、股市、創業' },
      { value: 'culture', label: '文化、藝術、娛樂' },
      { value: 'science', label: '科學發現、醫學新知' },
    ],
  },
  {
    id: 3,
    question: '你比較喜歡哪種工作方式？',
    options: [
      { value: 'alone', label: '獨自專注研究或創作' },
      { value: 'team', label: '跟團隊一起合作解決問題' },
      { value: 'lead', label: '帶領團隊、做決策' },
      { value: 'help', label: '幫助他人、服務社會' },
      { value: 'express', label: '表達想法、創造內容' },
    ],
  },
  {
    id: 4,
    question: '以下哪個情境最讓你興奮？',
    options: [
      { value: 'invent', label: '發明一個解決問題的新產品' },
      { value: 'research', label: '發現一個科學新知' },
      { value: 'write', label: '寫出一篇感動人心的文章' },
      { value: 'organize', label: '策劃一場大型活動' },
      { value: 'heal', label: '幫助一個人恢复健康' },
    ],
  },
  {
    id: 5,
    question: '你最不想做什麼？',
    options: [
      { value: 'hate-math', label: '算數學、看數據' },
      { value: 'hate-writing', label: '寫很多文字報告' },
      { value: 'hate-lab', label: '在實驗室做實驗' },
      { value: 'hate-speak', label: '上台演講或表演' },
      { value: 'hate-rote', label: '背誦大量資料' },
    ],
  },
  {
    id: 6,
    question: '高中你一定想選的選修是？',
    options: [
      { value: 'math-adv', label: '進階數學' },
      { value: 'science-adv', label: '進階物理/化學/生物' },
      { value: 'language-adv', label: '第二外語' },
      { value: 'art-adv', label: '藝術或音樂' },
      { value: 'social-adv', label: '社會學探究' },
    ],
  },
  {
    id: 7,
    question: '你覺得最重要的能力是？',
    options: [
      { value: 'logic', label: '邏輯思考能力' },
      { value: 'creativity', label: '創意和想像力' },
      { value: 'empathy', label: '同理心和溝通能力' },
      { value: 'execution', label: '執行力和效率' },
      { value: 'analysis', label: '分析和批判思考' },
    ],
  },
  {
    id: 8,
    question: '你未來最想住的城市是？',
    options: [
      { value: 'city-tech', label: '台北（科技產業中心）' },
      { value: 'city-finance', label: '上海/新加坡（金融中心）' },
      { value: 'city-culture', label: '東京/巴黎（文化藝術）' },
      { value: 'city-nature', label: '不特別，只要有大自然' },
      { value: 'city-any', label: '都可以，看工作機會' },
    ],
  },
];

/**
 * Derive directions from interest quiz answers.
 */
export function deriveFromInterests(answers: InterestAnswer[]): DirectionResult[] {
  const answerValues = answers.map(a => a.answer);
  const directions: DirectionResult[] = [];

  const has = (v: string | string[]) => {
    const arr = Array.isArray(v) ? v : [v];
    return arr.some(val => answerValues.includes(val));
  };

  // Engineering / CS signals
  if (has(['code', 'tech', 'alone', 'invent', 'math-adv', 'logic', 'city-tech'])) {
    directions.push({
      direction: '資訊工程',
      directionGroup: '工程',
      confidence: 0.75,
      reasons: ['你對科技和程式設計有興趣，且喜歡獨立解決問題的模式。'],
      relatedCategoryIds: ['computer-science', 'information-management'],
      factCount: 3,
    });
  }

  if (has(['invent', 'science', 'science-adv', 'hate-writing'])) {
    directions.push({
      direction: '工程學群（電機/機械）',
      directionGroup: '工程',
      confidence: 0.70,
      reasons: ['喜歡發明和科學，工程領域可以將創意變成實際產品。'],
      relatedCategoryIds: ['electrical-engineering', 'mechanical-engineering'],
      factCount: 2,
    });
  }

  // Medical signals
  if (has(['science', 'heal', 'hate-speak', 'empathy'])) {
    directions.push({
      direction: '醫藥衛生',
      directionGroup: '醫藥衛',
      confidence: 0.72,
      reasons: ['你對科學有興趣且關心他人健康，醫藥衛生領域非常適合。'],
      relatedCategoryIds: ['medicine', 'nursing', 'biology'],
      factCount: 2,
    });
  }

  // Business signals
  if (has(['business', 'lead', 'organize', 'execution', 'city-finance'])) {
    directions.push({
      direction: '商管學群',
      directionGroup: '商管',
      confidence: 0.73,
      reasons: ['你對財經有興趣且喜歡領導和組織，商管領域可以發揮這些特質。'],
      relatedCategoryIds: ['business-administration', 'finance', 'international-business'],
      factCount: 2,
    });
  }

  // Social science signals
  if (has(['society', 'social', 'help', 'analysis', 'social-adv'])) {
    directions.push({
      direction: '社會科學',
      directionGroup: '社會',
      confidence: 0.70,
      reasons: ['你關心社會議題且喜歡分析問題，社會科學領域能滿足你的好奇心。'],
      relatedCategoryIds: ['sociology', 'political-science', 'economics', 'law'],
      factCount: 2,
    });
  }

  // Humanities signals
  if (has(['read', 'write', 'express', 'hate-math', 'hate-lab', 'city-culture'])) {
    directions.push({
      direction: '人文學群',
      directionGroup: '人文',
      confidence: 0.68,
      reasons: ['你喜歡閱讀和表達想法，人文學群能讓你深入探索文化和思想。'],
      relatedCategoryIds: ['chinese-literature', 'foreign-languages', 'history', 'philosophy'],
      factCount: 2,
    });
  }

  // Art signals
  if (has(['create', 'culture', 'creativity', 'art-adv'])) {
    directions.push({
      direction: '藝術學群',
      directionGroup: '藝術',
      confidence: 0.72,
      reasons: ['你喜歡創作和藝術，藝術學群能讓你專注發展創意能力。'],
      relatedCategoryIds: ['fine-arts', 'design', 'music', 'drama-film'],
      factCount: 2,
    });
  }

  // Natural science signals
  if (has(['research', 'science', 'science-adv', 'city-nature'])) {
    directions.push({
      direction: '自然科學',
      directionGroup: '自然',
      confidence: 0.68,
      reasons: ['你對科學發現有熱情，自然科學領域可以滿足你的探究精神。'],
      relatedCategoryIds: ['physics', 'chemistry', 'biology', 'earth-science'],
      factCount: 2,
    });
  }

  directions.sort((a, b) => b.confidence - a.confidence);
  return directions.slice(0, 5);
}

// --- AI Direction Derivation ---

interface AIDirectionResponse {
  directions: {
    direction: string;
    directionGroup: string;
    confidence: number;
    reasons: string[];
  }[];
}

const AI_API_BASE = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/')
  : 'https://open.bigmodel.cn/api/paas/v4/';
const AI_API_KEY = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_AI_API_KEY || '')
  : '';
const AI_MODEL = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_AI_MODEL || 'glm-4.7-flash')
  : 'glm-4.7-flash';

/** Models to try in order of preference */
const AI_MODEL_FALLBACKS = [AI_MODEL, 'glm-4.5-air', 'glm-4-flash'];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildAIPrompt(profile: OnboardingProfile, ruleResults: DirectionResult[]): string {
  const factsText = profile.facts.map(f => `[${f.category}] ${f.label}: ${f.detail}`).join('\n');

  const ruleSummary = ruleResults.length > 0
    ? ruleResults.map(r => `${r.direction} (${r.directionGroup}) - 匹配度 ${(r.confidence * 100).toFixed(0)}%`).join('\n')
    : '無匹配結果';

  return `你是一位台灣高中升學輔導專家。根據以下學生資料，推導最適合的升學方向。

## 學生背景
- 年級：${profile.grade}
- 分組：${profile.track}
- 事實資料（共 ${profile.facts.length} 項）：
${factsText}

## 規則引擎結果
${ruleSummary}

請回傳 JSON 格式，包含 3-5 個推薦方向：
{
  "directions": [
    {
      "direction": "方向名稱（如：資訊工程）",
      "directionGroup": "學群（人文/社會/自然/工程/商管/醫藥衛/藝術）",
      "confidence": 0.0-1.0 的匹配度,
      "reasons": ["推薦原因1", "推薦原因2"]
    }
  ]
}

規則：
1. 方向要具體（如「資訊工程」而非「工程」）
2. directionGroup 必須是以下之一：人文、社會、自然、工程、商管、醫藥衛、藝術
3. confidence 為 0-1 之間的浮點數，代表匹配度
4. 每個方向至少 1 個推薦原因
5. 根據學生的實際資料分析，不要給泛泛的建議
6. 如果規則引擎已有好的結果，AI 結果應與之互補`;
}

function mergeDirectionResults(
  ruleResults: DirectionResult[],
  aiResults: DirectionResult[]
): DirectionResult[] {
  const merged = new Map<string, DirectionResult>();

  for (const r of ruleResults) {
    merged.set(r.direction, { ...r });
  }

  for (const ai of aiResults) {
    const existing = merged.get(ai.direction);
    if (existing) {
      const avgConfidence = (existing.confidence + ai.confidence) / 2;
      const allReasons = [...new Set([...existing.reasons, ...ai.reasons])];
      const allCategoryIds = [...new Set([...existing.relatedCategoryIds, ...ai.relatedCategoryIds])];
      merged.set(ai.direction, {
        ...existing,
        confidence: avgConfidence,
        reasons: allReasons,
        relatedCategoryIds: allCategoryIds,
        factCount: Math.max(existing.factCount, ai.factCount),
      });
    } else {
      merged.set(ai.direction, ai);
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

export async function deriveDirectionsWithAI(
  profile: OnboardingProfile,
  ruleResults: DirectionResult[]
): Promise<{
  directions: DirectionResult[];
  usedAI: boolean;
}> {
  const maxConfidence = ruleResults.length > 0 ? ruleResults[0].confidence : 0;
  const shouldUseAI = maxConfidence < 0.6 || profile.facts.length > 5;

  if (!shouldUseAI) {
    return { directions: ruleResults, usedAI: false };
  }

  if (!AI_API_KEY) {
    return { directions: ruleResults, usedAI: false };
  }

  const prompt = buildAIPrompt(profile, ruleResults);

  // Try each model with retry
  for (const model of AI_MODEL_FALLBACKS) {
    const result = await tryAIModel(model, prompt);
    if (result) return { directions: result, usedAI: true };
  }

  // All models failed, try retry on original model once
  await sleep(2000);
  const retryResult = await tryAIModel(AI_MODEL, prompt);
  if (retryResult) return { directions: retryResult, usedAI: true };

  // Silent fallback to rule engine
  return { directions: ruleResults, usedAI: false };
}

async function tryAIModel(
  model: string,
  prompt: string,
): Promise<DirectionResult[] | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${AI_API_BASE}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return null;

    const parsed: AIDirectionResponse = JSON.parse(content);
    const aiDirections: DirectionResult[] = (parsed.directions || []).map(d => ({
      direction: d.direction,
      directionGroup: (d.directionGroup || '工程') as DirectionResult['directionGroup'],
      confidence: Math.min(1, Math.max(0, d.confidence || 0.5)),
      reasons: d.reasons || [],
      relatedCategoryIds: [],
      factCount: 0,
    }));

    return aiDirections;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
