import type { VocationalUserFact, VocationalGroup, DirectionResult, InterestAnswer, InterestQuestion, OnboardingProfile } from '@/types';
import { VOCATIONAL_DIRECTION_RULES, VOCATIONAL_INTEREST_QUESTIONS } from '@/data/vocational-direction-rules';

function extractTags(facts: VocationalUserFact[]): Set<string> {
  const tags = new Set<string>();

  const tagKeywords: Record<string, string[]> = {
    'programming': ['程式', 'python', 'javascript', 'coding', '寫程式', 'scratch', 'app開發', '軟體', '前端', '後端'],
    'web-design': ['網頁', 'html', 'css', '網站', 'web', '響應式'],
    'database': ['資料庫', 'sql', 'mysql', 'mongo', 'firebase'],
    'networking': ['網路', '路由器', '交換器', 'tcp/ip', 'dns', '防火牆', '伺服器'],
    'hardware': ['硬體', '電腦組裝', '主機板', 'cpu', '維修'],
    'game-design': ['遊戲', 'game', 'unity', 'unreal', 'rpg', '遊戲設計'],
    'animation': ['動畫', 'animation', 'after effects', 'maya', 'blender', '3d動畫'],
    'circuit': ['電路', 'circuit', '基本電學', '電工', '電子學'],
    'electrical-wiring': ['配線', '電力', '內線', '外線', '高低壓'],
    'automation': ['自動化', '控制', '控制系統', '機電整合'],
    'plc': ['plc', '可程式控制器', '西門子', '三菱'],
    'soldering': ['焊接', '銲接', 'soldering', '烙鐵', 'smt'],
    'circuit-design': ['電路設計', 'pcb', '電路板', 'layout', 'altium', 'kicad'],
    'semiconductor': ['半導體', '晶圓', '封裝', '製程', 'ic'],
    'ic-design': ['ic設計', 'asic', 'fpga', 'verilog', 'vhdl', '數位電路設計'],
    'iot': ['物聯網', 'iot', 'mqtt', '嵌入式', 'embedded', 'arduino', 'raspberry', '樹莓派'],
    'sensor': ['感測器', 'sensor', '溫度', '濕度', '光感'],
    'cnc': ['cnc', '數值控制', '工具機', '銑床', '車床'],
    'machining': ['加工', '切削', '研磨', '機械加工'],
    'welding': ['焊接', '銲接', 'tig', 'mig', '弧焊', '氣焊'],
    'metalwork': ['金屬', '鈑金', '金工', '金屬加工'],
    'cad': ['cad', 'autocad', 'solidworks', 'inventor', 'pro-e'],
    '3d-modeling': ['3d', '建模', '3d列印', '3d建模', '建模', '渲染'],
    'cooking': ['烹飪', '廚藝', '料理', '炒菜', '中式', '西式', '刀工'],
    'baking': ['烘焙', '麵包', '蛋糕', '甜點', '糕點', '餅乾'],
    'service-hospitality': ['服務', '接待', '客服', '櫃檯', '飯店'],
    'tourism': ['旅遊', '導遊', '領隊', '觀光', '旅行社'],
    'accounting': ['會計', '記帳', '傳票', '財報', '稅務'],
    'finance': ['理財', '金融', '銀行', '投資', '保險'],
    'marketing': ['行銷', '行銷', '社群', '廣告', '品牌'],
    'ecommerce': ['電商', '網拍', '蝦皮', 'shopify', 'momo'],
    'leadership': ['社長', '會長', '隊長', '幹部', '班長', '組長'],
    'event-planning': ['活動企劃', '策展', '活動', '企劃'],
    'sales': ['銷售', '業務', '推銷', '業績'],
    'communication': ['溝通', '簡報', '談判', '人際'],
    'graphic-design': ['平面設計', '海報', '傳單', 'dm', 'illustrator', 'photoshop'],
    'ui-design': ['ui', 'ux', '使用者介面', '介面設計', 'figma', 'wireframe'],
    'interior-design': ['室內設計', '裝潢', '空間設計', '室內裝修'],
    'space-planning': ['空間規劃', '動線', '平面配置'],
    'drawing': ['繪畫', '畫畫', '素描', '手繪', '水彩'],
    'illustration': ['插畫', 'illustration', '角色設計', '人物設計'],
    'photography': ['攝影', '相機', '拍照', '修圖', 'lightroom'],
    'video-editing': ['影片', '剪輯', 'video', 'premiere', 'final cut', '短影音'],
    'farming': ['農作', '農業', '耕種', '插秧', '收割'],
    'plant-cultivation': ['栽培', '園藝', '植物', '育苗', '花卉'],
    'biotech': ['生物技術', '基因', '組織培養', '生物科技'],
    'lab-work': ['實驗', 'lab', '實驗室', '研究'],
    'chemistry': ['化學', '有機', '無機', '分析化學'],
    'lab-experiment': ['實驗', '化學實驗', '配藥', '滴定'],
    'construction': ['施工', '建築', '營造', '鋼筋', '模板'],
    'surveying': ['測量', '水準', '經緯', '全站儀'],
    'nursing': ['護理', '護士', '看護'],
    'patient-care': ['病患', '照護', '病房', '醫療'],
    'health-care': ['健康', '醫療保健', '公共衛生'],
    'first-aid': ['急救', 'cpr', 'aed', '包紮'],
    'service-learning': ['服務學習', '志工', '公益', '弱勢'],
    'sailing': ['航海', '船舶', '航行', '輪機'],
    'maritime': ['海事', '船員', '船務', '航海'],
    'food-science': ['食品科學', '食品安全', '食品加工', '微生物'],
    'nutrition': ['營養', '膳食', '營養師'],
    'childcare': ['育幼', '幼教', '幼稚園', '托育', '兒童'],
    'elderly-care': ['長照', '老人', '銀髮', '照護'],
    'english': ['英文', '英語', 'english', 'toefl', 'ielts', 'gept', '多益'],
    'translation': ['翻譯', '筆譯', '口譯'],
    'japanese': ['日文', '日语', '日語', 'japanese', 'jlpt', 'n1', 'n2'],
    'korean': ['韓文', '韩语', '韓語', 'korean', 'topik'],
  };

  for (const fact of facts) {
    const detail = fact.detail.toLowerCase();
    const label = fact.label.toLowerCase();
    const combined = `${label} ${detail}`;

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      for (const kw of keywords) {
        if (combined.includes(kw.toLowerCase())) {
          tags.add(tag);
          break;
        }
      }
    }

    if (fact.category === 'certification') {
      if (combined.includes('丙級') || combined.includes('技術士')) tags.add('certification');
      if (combined.includes('乙級')) tags.add('certification');
      if (combined.includes('技能檢定')) tags.add('certification');
    }

    if (fact.category === 'competition') {
      if (combined.includes('全國') || combined.includes('國際')) tags.add('competition');
      if (combined.includes('技能競賽')) tags.add('competition');
    }

    if (fact.category === 'capstone') {
      if (combined.includes('專題')) tags.add('capstone');
    }

    if (fact.category === 'internship') {
      if (combined.includes('實習') || combined.includes('打工') || combined.includes('產學')) {
        tags.add('internship');
      }
    }
  }

  return tags;
}

export function deriveDirections(facts: VocationalUserFact[]): DirectionResult[] {
  if (facts.length === 0) return [];

  const tags = extractTags(facts);
  const resultMap = new Map<string, DirectionResult>();

  for (const rule of VOCATIONAL_DIRECTION_RULES) {
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

export { VOCATIONAL_INTEREST_QUESTIONS as INTEREST_QUESTIONS } from '@/data/vocational-direction-rules';

const VOCATIONAL_GROUPS: VocationalGroup[] = [
  '資訊群', '電機群', '電子群', '機械群', '餐旅群', '商管群',
  '設計群', '農業群', '化工群', '土木群', '護理群', '海事群',
  '家政群', '語文群', '商業與管理群',
];

interface InterestGroupMapping {
  matchValues: string[];
  directionGroup: VocationalGroup;
  direction: string;
  confidence: number;
  reason: string;
  relatedCategoryIds: string[];
}

const INTEREST_GROUP_RULES: InterestGroupMapping[] = [
  {
    matchValues: ['tech-skill', 'tech-topic', 'tech-content', 'logic', 'desk', 'solving', 'building'],
    directionGroup: '資訊群',
    direction: '軟體開發',
    confidence: 0.75,
    reason: '你對科技和程式設計有興趣，喜歡解決問題的模式，資訊群很適合你。',
    relatedCategoryIds: ['info-software'],
  },
  {
    matchValues: ['building', 'hands-on', 'practical', 'factory'],
    directionGroup: '電機群',
    direction: '電機維修',
    confidence: 0.70,
    reason: '你喜歡動手操作和實際製造，電機群能滿足你的實作需求。',
    relatedCategoryIds: ['elec-maintenance'],
  },
  {
    matchValues: ['solving', 'invent', 'logic', 'tech-topic'],
    directionGroup: '電子群',
    direction: '電子技術',
    confidence: 0.70,
    reason: '你喜歡發明和解決問題，電子群的物聯網應用方向很適合你。',
    relatedCategoryIds: ['elec-circuit'],
  },
  {
    matchValues: ['hands-on', 'building', 'practical', 'factory', 'outdoor'],
    directionGroup: '機械群',
    direction: '精密加工',
    confidence: 0.70,
    reason: '你喜歡動手操作，機械群的精密加工是工業4.0的核心技能。',
    relatedCategoryIds: ['mech-machining'],
  },
  {
    matchValues: ['creating', 'care', 'food-topic', 'life-content', 'people'],
    directionGroup: '餐旅群',
    direction: '餐飲管理',
    confidence: 0.72,
    reason: '你喜歡創造和照顧他人，餐旅群的服務與創作兼具這些特質。',
    relatedCategoryIds: ['hospitality-food'],
  },
  {
    matchValues: ['business', 'biz-content', 'connect', 'desk', 'office'],
    directionGroup: '商管群',
    direction: '商業管理',
    confidence: 0.73,
    reason: '你對商業和溝通有興趣，商管群能發揮你的領導和企劃能力。',
    relatedCategoryIds: ['biz-admin'],
  },
  {
    matchValues: ['creative', 'creative-work', 'art-content', 'design-topic', 'express'],
    directionGroup: '設計群',
    direction: '商業設計',
    confidence: 0.75,
    reason: '你喜歡創作和設計，設計群能讓你專注發展創意能力。',
    relatedCategoryIds: ['design-graphic'],
  },
  {
    matchValues: ['nurture', 'life-content', 'outdoor'],
    directionGroup: '農業群',
    direction: '農業技術',
    confidence: 0.65,
    reason: '你喜歡培養和照顧事物，農業群的生物技術方向很適合你。',
    relatedCategoryIds: ['agri-tech'],
  },
  {
    matchValues: ['solving', 'logic', 'lab', 'factory'],
    directionGroup: '化工群',
    direction: '化工技術',
    confidence: 0.65,
    reason: '你喜歡解決問題和實驗，化工群的實作特性符合你的興趣。',
    relatedCategoryIds: ['chem-process'],
  },
  {
    matchValues: ['building', 'outdoor', 'hands-on', 'practical'],
    directionGroup: '土木群',
    direction: '土木技術',
    confidence: 0.68,
    reason: '你喜歡動手建造，土木群的施工和測量能滿足你的實作需求。',
    relatedCategoryIds: ['civil-construction'],
  },
  {
    matchValues: ['helping', 'nurture', 'care', 'service-work', 'people', 'service-topic'],
    directionGroup: '護理群',
    direction: '護理照護',
    confidence: 0.72,
    reason: '你喜歡幫助和照顧他人，護理群是最能發揮這些特質的方向。',
    relatedCategoryIds: ['nursing-care'],
  },
  {
    matchValues: ['outdoor', 'building', 'hands-on'],
    directionGroup: '海事群',
    direction: '航海技術',
    confidence: 0.60,
    reason: '你喜歡戶外和動手操作，海事群提供獨特的航海職涯。',
    relatedCategoryIds: ['maritime-navigation'],
  },
  {
    matchValues: ['nurture', 'care', 'food-topic', 'life-content', 'service-work'],
    directionGroup: '家政群',
    direction: '食品與營養',
    confidence: 0.70,
    reason: '你喜歡照顧和生活相關的主題，家政群的食品與營養方向很適合。',
    relatedCategoryIds: ['home-food'],
  },
  {
    matchValues: ['express', 'connect', 'social', 'artistic'],
    directionGroup: '語文群',
    direction: '應用外語',
    confidence: 0.68,
    reason: '你喜歡表達和交流，語文群能培養你的外語溝通能力。',
    relatedCategoryIds: ['lang-applications'],
  },
  {
    matchValues: ['business', 'connect', 'social', 'desk', 'office', 'biz-content'],
    directionGroup: '商業與管理群',
    direction: '會計事務',
    confidence: 0.70,
    reason: '你對商業和管理有興趣，商業與管理群的會計方向穩定且實用。',
    relatedCategoryIds: ['biz-accounting'],
  },
];

export function deriveFromInterests(answers: InterestAnswer[]): DirectionResult[] {
  const answerValues = answers.map(a => a.answer);
  const directions: DirectionResult[] = [];
  const matchedGroups = new Set<string>();

  const has = (v: string | string[]) => {
    const arr = Array.isArray(v) ? v : [v];
    return arr.some(val => answerValues.includes(val));
  };

  for (const rule of INTEREST_GROUP_RULES) {
    const matchCount = rule.matchValues.filter(v => answerValues.includes(v)).length;
    if (matchCount < 2) continue;
    if (matchedGroups.has(rule.directionGroup)) continue;

    matchedGroups.add(rule.directionGroup);
    directions.push({
      direction: rule.direction,
      directionGroup: rule.directionGroup,
      confidence: Math.min(0.9, rule.confidence + matchCount * 0.03),
      reasons: [rule.reason],
      relatedCategoryIds: [...rule.relatedCategoryIds],
      factCount: matchCount,
    });
  }

  if (directions.length === 0 && answerValues.length > 0) {
    const first = answerValues[0];
    const fallback = INTEREST_GROUP_RULES.find(r => r.matchValues.includes(first));
    if (fallback) {
      directions.push({
        direction: fallback.direction,
        directionGroup: fallback.directionGroup,
        confidence: 0.5,
        reasons: ['根據你的興趣初步推薦，建議填寫更多資料以獲得精準分析。'],
        relatedCategoryIds: [...fallback.relatedCategoryIds],
        factCount: 1,
      });
    }
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

const AI_MODEL_FALLBACKS = [AI_MODEL, 'glm-4.5-air', 'glm-4-flash'];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildAIPrompt(profile: OnboardingProfile, ruleResults: DirectionResult[]): string {
  const factsText = profile.facts.map(f => `[${f.category}] ${f.label}: ${f.detail}`).join('\n');

  const ruleSummary = ruleResults.length > 0
    ? ruleResults.map(r => `${r.direction} (${r.directionGroup}) - 匹配度 ${(r.confidence * 100).toFixed(0)}%`).join('\n')
    : '無匹配結果';

  const groupsList = VOCATIONAL_GROUPS.join('、');

  return `你是一位台灣高職升學輔導專家。根據以下學生資料，推導最適合的高職群科升學方向。

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
      "direction": "方向名稱（如：軟體開發、電機維修、餐飲管理）",
      "directionGroup": "群科名稱",
      "confidence": 0.0-1.0 的匹配度,
      "reasons": ["推薦原因1", "推薦原因2"]
    }
  ]
}

規則：
1. 方向要具體（如「軟體開發」而非「資訊群」）
2. directionGroup 必須是以下之一：${groupsList}
3. confidence 為 0-1 之間的浮點數，代表匹配度
4. 每個方向至少 1 個推薦原因
5. 根據學生的實際資料分析，參考專題實作、技能檢定、實習經驗等高職特色
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

  for (const model of AI_MODEL_FALLBACKS) {
    const result = await tryAIModel(model, prompt);
    if (result) return { directions: result, usedAI: true };
  }

  await sleep(2000);
  const retryResult = await tryAIModel(AI_MODEL, prompt);
  if (retryResult) return { directions: retryResult, usedAI: true };

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
      directionGroup: (d.directionGroup || '資訊群') as DirectionResult['directionGroup'],
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
