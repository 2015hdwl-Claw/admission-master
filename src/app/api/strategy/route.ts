import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseAIJson } from '@/lib/ai-helper';
import { ACADEMIC_CATEGORIES } from '@/data/academic-categories';

interface StrategyRequestBody {
  direction: string;
  directionGroup: string;
  grade: string;
  track: string;
  selectedDirections: string[];
  portfolioCount: number;
}

interface StrategyDepartment {
  rank: number;
  name: string;
  university: string;
  category: string;
  scoreRange: string;
  keyRequirement: string;
  portfolioFocus: string;
}

interface StrategyResponse {
  direction: string;
  directionGroup: string;
  grade: string;
  departments: StrategyDepartment[];
  timeline: string[];
  portfolioAdvice: string;
  interviewAdvice: string;
  overallStrategy: string;
}

function generateFallbackReport(body: StrategyRequestBody): StrategyResponse {
  const { direction, directionGroup, grade, track } = body;

  // Find matching academic categories
  const matchingCategories = ACADEMIC_CATEGORIES.filter(
    cat => cat.group === directionGroup,
  );

  // Build departments from academic categories data
  const departments: StrategyDepartment[] = matchingCategories.slice(0, 10).map((cat, i) => {
    const exampleDept = cat.exampleDepartments[0] ?? '';
    const universityMatch = exampleDept.match(/^(.+?)([^\s]+系|學系|學類)$/);
    const university = universityMatch ? universityMatch[1] : '';
    const deptName = cat.name;

    return {
      rank: i + 1,
      name: deptName,
      university,
      category: cat.name,
      scoreRange: i < 2 ? '58-60 級分' : i < 5 ? '54-58 級分' : '50-54 級分',
      keyRequirement: cat.suggestedCodes.length > 0
        ? `建議準備 ${cat.suggestedCodes.join('、')} 類學習歷程`
        : '備審資料需展現對該領域的熱忱與理解',
      portfolioFocus: `建議包含與${cat.name}相關的探究報告或實作作品`,
    };
  });

  // Build timeline based on grade
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const timeline = buildTimeline(grade, currentYear, currentMonth);

  const portfolioAdvice = buildPortfolioAdvice(directionGroup, direction, body.portfolioCount);
  const interviewAdvice = buildInterviewAdvice(direction, directionGroup);
  const overallStrategy = buildOverallStrategy(direction, directionGroup, grade, track);

  return {
    direction,
    directionGroup,
    grade,
    departments,
    timeline,
    portfolioAdvice,
    interviewAdvice,
    overallStrategy,
  };
}

function buildTimeline(grade: string, year: number, month: number): string[] {
  const isSenior = grade === '高三';
  const isJunior = grade === '高二';

  if (isSenior) {
    return [
      `${month}月：完成個人簡歷與自傳初稿，整理高中以來的重要經歷`,
      `${month + 1}月：針對目標科系要求，補強缺少的學習歷程檔案`,
      '9月：參加大學博覽會或校園參訪，確認目標校系',
      '10月：完成備審資料修飾，請老師或學長姐提供回饋',
      '11月：開始面試準備，練習自我介紹與常見問題',
      '12月-1月：申請入學第一階段學測成績篩選',
      '2-3月：準備第二階段面試/備審資料審查',
      '4月：查榜與放榜，完成繁星推薦作業',
      '5-6月：分發入學志願選填',
      '7月：放榜與入學準備',
    ];
  }

  if (isJunior) {
    return [
      `${month}月：開始探索有興趣的學群與科系，建立初步方向`,
      `${month + 1}月：參加至少一個與目標領域相關的營隊或活動`,
      `${month + 2}月：開始撰寫第一份書面報告（B類）或實作作品（C類）`,
      `${month + 3}月：建立學習歷程檔案的整理習慣，每月紀錄`,
      '暑假：參加大學營隊或暑期研究計畫，豐富經歷',
      `${year + 1}年9月：進入高三，開始整合所有學習歷程`,
      `${year + 1}年10月：完成備審資料初稿，請師長提供回饋`,
      `${year + 1}年11月：開始面試模擬練習`,
      `${year + 1}年12月：完成備審資料最終版`,
      `${year + 1}年1月：學測衝刺與申請入學準備`,
    ];
  }

  // High school year 1
  return [
    `${month}月：廣泛探索各學群，參加多元社團與活動`,
    `${month + 1}月：建立學科優勢，找出自己最擅長的科目`,
    `${month + 2}月：開始閱讀與目標領域相關的書籍或文章`,
    '暑假：參加學術營隊或社團幹部選舉，累積領導經驗',
    '高二上：選修與目標方向相關的課程，開始撰寫學習歷程',
    '高二下：參加學科競賽或校際活動，豐富備審內容',
    '高二暑假：參加大學營隊，深入了解目標科系',
    '高三上：整合所有學習歷程，完成備審資料',
    '高三上：開始面試準備與模擬練習',
    '高三下：學測衝刺與申請入學作業',
  ];
}

function buildPortfolioAdvice(directionGroup: string, direction: string, portfolioCount: number): string {
  const groupAdvice: Record<string, string> = {
    '工程': `針對${direction}方向，建議準備以下素材：
1. 自然探究（D類）：選擇與${direction}相關的主題進行科學探究，展現你的研究能力與邏輯思維。
2. 實作作品（C類）：如果有程式設計或動手做的經驗，記錄過程與成果，展現你的實踐能力。
3. 競賽表現（J類）：參加科展、程式設計競賽等，展現你的專業能力。
${portfolioCount === 0 ? '\n目前尚無素材，建議盡快開始準備第一份作品！' : `\n你已有 ${portfolioCount} 件素材，建議補強缺少的類型。`}`,
    '醫藥衛': `針對${direction}方向，備審資料建議：
1. 服務學習（I類）：展現你關心他人的特質，醫藥衛生領域非常看重服務精神。
2. 自然探究（D類）：選擇與生物、化學或健康相關的主題進行探究。
3. 社團或幹部（G/H類）：展現你的領導力與團隊合作能力。
${portfolioCount === 0 ? '\n目前尚無素材，醫學相關科系競爭激烈，建議盡早開始累積。' : ''}`,
    '商管': `針對${direction}方向，建議準備以下素材：
1. 社會探究（E類）：針對商業或社會議題進行調查分析，展現你的分析能力。
2. 幹部經驗（H類）：展現領導力與組織能力，商管領域非常看重。
3. 競賽或檢定（J/L類）：商業競賽或外語檢定都是加分項目。
${portfolioCount === 0 ? '\n目前尚無素材，建議從社團幹部或探究報告開始。' : ''}`,
    '人文': `針對${direction}方向，備審資料建議：
1. 書面報告（B類）：選擇與文學、語言或文化相關的主題撰寫深度報告。
2. 自主學習（F類）：展現你在人文領域的自主探索精神。
3. 作品集（K類）：如果有文學創作、翻譯作品等，整理成作品集。
${portfolioCount === 0 ? '\n目前尚無素材，建議開始撰寫閱讀心得或文學創作。' : ''}`,
    '社會': `針對${direction}方向，建議準備：
1. 社會探究（E類）：針對社會議題進行調查研究，展現你的分析與批判思考能力。
2. 書面報告（B類）：撰寫與社會、法律或政治相關的深度報告。
3. 服務學習（I類）：展現你對社會的關注與參與。
${portfolioCount === 0 ? '\n目前尚無素材，建議開始關注社會議題並撰寫探究報告。' : ''}`,
    '自然': `針對${direction}方向，備審資料建議：
1. 自然探究（D類）：選擇物理、化學、生物或地科的主題進行實驗或研究。
2. 實作作品（C類）：如果有科展或研究計畫經驗，完整記錄過程。
3. 競賽表現（J類）：參加科學展覽或學科競賽。
${portfolioCount === 0 ? '\n目前尚無素材，建議開始參與科學探究活動。' : ''}`,
    '藝術': `針對${direction}方向，備審資料建議：
1. 作品集（K類）：整理你最好的藝術/設計/音樂/表演作品。
2. 自主學習（F類）：記錄你在藝術領域的自主學習過程。
3. 社團（G類）：如果參加過藝術相關社團，記錄你的參與與成長。
${portfolioCount === 0 ? '\n目前尚無素材，藝術類科系非常看重作品集，建議盡早開始準備。' : ''}`,
  };

  return groupAdvice[directionGroup] ?? `針對${direction}方向，建議準備多樣化的學習歷程檔案，展現你的熱忱與能力。${portfolioCount === 0 ? '\n目前尚無素材，建議盡快開始準備。' : ''}`;
}

function buildInterviewAdvice(direction: string, directionGroup: string): string {
  const groupAdvice: Record<string, string> = {
    '工程': `${direction}方向的面試準備重點：

1. 自我介紹：準備 1-2 分鐘的自我介紹，強調你對${direction}的興趣來源與相關經驗。
2. 專業知識：了解${direction}的基本概念與最新發展趨勢，展現你的主動學習精神。
3. 實作經驗：準備好解釋你的實作作品或探究報告，面試官可能會深入追問細節。
4. 情境問題：練習回答「如果遇到這個問題你會怎麼解決」類型的問題，展現邏輯思維。
5. 動機問題：清楚表達為什麼選擇${direction}，以及未來的發展規劃。`,
    '醫藥衛': `${direction}方向的面試準備重點：

1. 同理心展現：醫藥衛生領域看重關懷他人的特質，準備能展現同理心的經歷。
2. 生命教育：了解當前醫療議題（如高齡化、疫情應對、醫療資源分配等）。
3. 團隊合作：準備你在團隊中合作的經驗，醫療工作需要跨領域合作。
4. 壓力應對：面試官可能測試你在壓力下的反應，保持冷靜與理性。
5. 倫理思考：思考醫療倫理相關的議題，展現你的批判性思考能力。`,
    '商管': `${direction}方向的面試準備重點：

1. 時事敏感度：了解近期的重要財經新聞與商業趨勢。
2. 領導經驗：準備好分享你的領導經驗與團隊合作案例。
3. 數據分析：展現你分析問題的能力，可能會給你一個案例讓你分析。
4. 創新思維：準備展現你的創意與創業思維。
5. 國際視野：了解全球化對商業的影響，展現你的國際觀。`,
    '人文': `${direction}方向的面試準備重點：

1. 閱讀深度：準備好分享你最近讀過的書與心得，展現閱讀的廣度與深度。
2. 批判思考：練習對文化、社會議題提出獨到見解。
3. 寫作經驗：分享你的寫作過程與創作理念。
4. 跨領域連結：展現你能將人文知識與其他領域連結的能力。
5. 表達能力：面試時注意表達的清晰度與邏輯性。`,
    '社會': `${direction}方向的面試準備重點：

1. 社會關懷：展現你對社會議題的關注與參與經驗。
2. 議題分析：練習分析社會問題的多面向，展現批判性思考。
3. 實踐經驗：分享你參與社會活動、志工服務的具體經歷。
4. 價值觀表達：清楚表達你的社會價值觀與未來願景。
5. 溝通能力：展現你能傾聽不同意見並有效溝通的能力。`,
    '自然': `${direction}方向的面試準備重點：

1. 研究經驗：詳細準備你的探究報告或實驗經驗，面試官會深入追問。
2. 科學素養：了解科學方法論與當前重要的科學發現。
3. 實驗技能：展現你的實驗操作能力與安全意識。
4. 學術熱情：表達你對科學研究的熱情與未來學術規劃。
5. 邏輯表達：用清晰、有條理的方式解釋科學概念。`,
    '藝術': `${direction}方向的面試準備重點：

1. 作品介紹：準備好介紹你的代表作品，說明創作理念與過程。
2. 藝術觀點：展現你對藝術的理解與個人風格。
3. 創作過程：面試官可能想了解你的創作習慣與思考方式。
4. 藝術影響：分享影響你的藝術家或作品，展現你的藝術視野。
5. 未來規劃：表達你在藝術領域的發展目標與計畫。`,
  };

  return groupAdvice[directionGroup] ?? `${direction}方向的面試準備建議：\n\n1. 準備好自我介紹，說明你選擇此方向的原因\n2. 展現你對該領域的了解與熱情\n3. 分享相關的學習或活動經驗\n4. 練習情境問題的回答\n5. 保持真誠與自信`;
}

function buildOverallStrategy(direction: string, directionGroup: string, grade: string, track: string): string {
  const gradeUrgency: Record<string, string> = {
    '高一': '你還有充足的時間探索與準備。建議廣泛參與各類活動，找出自己真正熱愛的方向。不要急著鎖定單一科系，多嘗試才能做出最好的選擇。建立良好的學習習慣與成績基礎，這是未來申請的最重要資本。',
    '高二': '你已經進入關鍵的準備期。建議在這學期確定主要方向，開始有目標地累積相關經歷。每個月至少完成一件有意義的學習歷程作品。同時保持學業成績，學測成績是第一階段篩選的關鍵。',
    '高三': '時間非常緊迫，需要高效地分配精力。首先確認目標校系的學測門檻，確保學業成績達標。然後專注準備備審資料與面試。善用已有的素材，不要貪多求全，質量比數量重要。記得預留時間準備學測。',
  };

  const trackAdvice = track === '自然組'
    ? '自然組的學生在工程、醫藥衛、自然等學群有優勢，但也要注意社會科成績，許多跨領域科系（如資管、財金）也看重社會科表現。'
    : track === '社會組'
      ? '社會組的學生在人文、社會、商管等學群有優勢，但一些自然學群的科系也接受社會組學生，可以多了解跨領域的選項。'
      : '建議盡早確定分組，不同分組會影響可選擇的科系範圍。可以參考各校系的選修科目要求來做決定。';

  return `## ${direction}方向 — 整體升學策略

### 年級建議
${gradeUrgency[grade] ?? '根據你目前的階段，持續累積相關經歷並保持學業表現。'}

### 分組考量
${trackAdvice}

### 方向聚焦
針對${directionGroup}學群的${direction}方向，建議採取以下策略：

1. **深入了解**：多參加大學開放日、系所網站、在校生分享，了解各科系的真正內容與出路。
2. **對口準備**：針對目標科系的要求準備備審資料，不要用一套資料申請所有科系。
3. **差異化競爭**：找出你與其他申請者的差異點，在備審資料中突出你的獨特經歷或見解。
4. **面試實戰**：多進行面試模擬練習，熟悉面試流程，建立自信。
5. **保底策略**：除了衝刺理想校系，也要準備 2-3 個保底選項，確保有學可上。`;
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

  // Try AI first
  const aiResult = await callAI({
    userPrompt: prompt,
    temperature: 0.5,
    timeoutMs: 30000,
  });

  if (aiResult.ok && aiResult.content) {
    const parsed = parseAIJson<{
      departments: StrategyDepartment[];
      timeline: string[];
      portfolioAdvice: string;
      interviewAdvice: string;
      overallStrategy: string;
    }>(aiResult.content);

    if (parsed) {
      return NextResponse.json({
        direction,
        directionGroup,
        grade,
        departments: (parsed.departments || []).slice(0, 10).map((d, i) => ({
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
    }
  }

  // Fallback to rule-based report
  console.error('Strategy AI unavailable, using fallback:', aiResult.error);
  const fallback = generateFallbackReport(body);

  return NextResponse.json({
    ...fallback,
    _fallback: true,
    _aiError: aiResult.isRateLimited
      ? 'AI 服務目前請求頻繁，已改用基本報告。稍後重試可獲得 AI 個人化報告。'
      : 'AI 服務暫時不可用，已改用基本報告。',
  });
}
