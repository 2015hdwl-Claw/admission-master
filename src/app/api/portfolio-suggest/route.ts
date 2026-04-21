import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseAIJson } from '@/lib/ai-helper';
import { ACADEMIC_CATEGORIES } from '@/data/academic-categories';
import { DIRECTION_RULES } from '@/data/direction-rules';
import type { LearningCode } from '@/types';

interface PortfolioSuggestRequestBody {
  direction: string;
  directionGroup: string;
  portfolioItems: Array<{ code: string; title: string; content: string }>;
}

/** Recommended learning codes by direction group */
const GROUP_CODE_PRIORITY: Record<string, LearningCode[]> = {
  '工程': ['D', 'C', 'J', 'K', 'B'],
  '醫藥衛': ['D', 'I', 'C', 'B', 'G'],
  '商管': ['E', 'H', 'D', 'B', 'F'],
  '人文': ['B', 'F', 'K', 'E', 'G'],
  '社會': ['E', 'I', 'B', 'H', 'D'],
  '自然': ['D', 'C', 'J', 'B', 'K'],
  '藝術': ['K', 'G', 'F', 'C', 'B'],
};

const CODE_LABELS: Record<string, string> = {
  B: '書面報告',
  C: '實作作品',
  D: '自然探究',
  E: '社會探究',
  F: '自主學習',
  G: '社團',
  H: '幹部',
  I: '服務學習',
  J: '競賽',
  K: '作品',
  L: '檢定',
  M: '特殊表現',
};

function generateFallbackSuggestion(
  direction: string,
  directionGroup: string,
  portfolioItems: Array<{ code: string; title: string; content: string }>,
): { missingCodes: string[]; suggestions: string[]; priority: string } {
  const existingCodes = new Set(portfolioItems.map(item => item.code));
  const priorityCodes = GROUP_CODE_PRIORITY[directionGroup] ?? ['B', 'C', 'D', 'E', 'F'];
  const missingCodes = priorityCodes.filter(code => !existingCodes.has(code));

  // Find matching academic categories for direction context
  const matchingCategories = ACADEMIC_CATEGORIES.filter(cat => cat.group === directionGroup);

  // Find relevant direction rules
  const relevantRules = DIRECTION_RULES.filter(
    rule => rule.direction === direction || rule.directionGroup === directionGroup,
  );

  const suggestions: string[] = [];

  // Suggest missing codes with specific advice
  for (const code of missingCodes.slice(0, 5)) {
    const label = CODE_LABELS[code] ?? code;
    const codeSuggestion = getCodeSpecificSuggestion(code, direction, directionGroup, matchingCategories);
    suggestions.push(`【${label}】${codeSuggestion}`);
  }

  // Suggest improvements for existing items
  if (portfolioItems.length > 0) {
    suggestions.push(`你已有 ${portfolioItems.length} 件素材，建議檢視每件素材的完整性，確保有明確的動機、過程紀錄與反思。`);
  }

  const priority = missingCodes.length > 0
    ? `最建議優先補充「${CODE_LABELS[missingCodes[0]]}」類素材，因為這是${directionGroup}學群的科系最看重的學習歷程類型。${matchingCategories.length > 0 ? `例如${matchingCategories[0].name}特別重視 ${matchingCategories[0].suggestedCodes.map(c => CODE_LABELS[c] ?? c).join('、')}。` : ''}`
    : '你的素材涵蓋了主要的學習歷程類型，建議專注提升現有素材的品質。';

  return { missingCodes, suggestions, priority };
}

function getCodeSpecificSuggestion(
  code: string,
  direction: string,
  directionGroup: string,
  categories: { name: string; suggestedCodes: string[] }[],
): string {
  // Find categories that recommend this code
  const relevantCats = categories.filter(cat => cat.suggestedCodes.includes(code));

  const codeAdvice: Record<string, string> = {
    B: `撰寫一篇與${direction}相關的深度書面報告。${relevantCats.length > 0 ? `參考${relevantCats[0].name}的學習重點來選題。` : ''}報告應包含研究動機、方法、發現與反思。`,
    C: `完成一個與${direction}相關的實作作品。可以是一個小專案、模型或設計成品，記錄完整的製作過程與問題解決歷程。`,
    D: `進行一個自然探究實驗，選擇與${direction}相關的科學問題，遵循科學方法進行觀察、假設、實驗與結論。`,
    E: `針對與${direction}相關的社會議題進行調查研究，設計問卷或訪談，收集數據並分析。`,
    F: `規劃一個與${direction}相關的自主學習計畫，設定明確的學習目標、過程紀錄與成果展示。`,
    G: `積極參與與${direction}相關的社團活動，記錄你的參與過程與成長收穫。`,
    H: `爭取擔任社團或班級幹部，展現你的領導力與組織能力，這對申請非常有幫助。`,
    I: `參與志工服務或社區活動，${directionGroup === '醫藥衛' ? '醫療相關志工特別加分' : '展現你關心社會的特質'}。`,
    J: `參加與${direction}相關的學科競賽或專題競賽，展現你的專業能力。`,
    K: `整理你最好的作品成為作品集，${directionGroup === '藝術' ? '這是藝術類科系最重要的審查項目' : '展現你的創意與實作能力'}。`,
    L: `取得與${direction}相關的能力檢定，如外語檢定、電腦技能證照等，作為能力的客觀證明。`,
    M: '如果有特殊的表現或成就（如發明、出版、表演等），完整記錄下來，這會是備審資料的亮點。',
  };

  return codeAdvice[code] ?? `準備${code}類學習歷程，與${direction}方向相關即可。`;
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

  // Try AI first
  const aiResult = await callAI({
    userPrompt: prompt,
    temperature: 0.5,
  });

  if (aiResult.ok && aiResult.content) {
    const parsed = parseAIJson<{
      missingCodes: string[];
      suggestions: string[];
      priority: string;
    }>(aiResult.content);

    if (parsed) {
      return NextResponse.json({
        missingCodes: parsed.missingCodes ?? [],
        suggestions: parsed.suggestions ?? [],
        priority: parsed.priority ?? '',
        _fallback: false,
      });
    }
  }

  // Fallback to rule-based suggestion
  console.error('Portfolio-suggest AI unavailable, using fallback:', aiResult.error);
  const fallback = generateFallbackSuggestion(direction, directionGroup, portfolioItems);

  return NextResponse.json({
    ...fallback,
    _fallback: true,
    _aiError: aiResult.isRateLimited
      ? 'AI 服務目前請求頻繁，已改用基本建議。'
      : 'AI 服務暫時不可用，已改用基本建議。',
  });
}
