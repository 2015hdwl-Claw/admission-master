import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseAIJson } from '@/lib/ai-helper';

interface InterviewRequestBody {
  direction: string;
  directionGroup: string;
  round: number;
  maxRounds: number;
  userAnswer: string | null;
  chatHistory: Array<{ role: string; content: string }>;
}

/** Predefined fallback questions by direction group (academic) */
const FALLBACK_FIRST_QUESTIONS_ACADEMIC: Record<string, string[]> = {
  '工程': [
    '你好！歡迎來到面試。請先自我介紹，告訴我你為什麼對工程領域有興趣？',
    '在所有的工程領域中，哪一個最吸引你？是什麼原因讓你特別關注這個方向？',
    '你平常有動手做東西或寫程式的經驗嗎？可以分享一個你覺得最有成就感的專案嗎？',
  ],
  '醫藥衛': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼想走醫藥衛生這條路？',
    '醫療工作需要面對許多壓力和挑戰。你覺得自己具備哪些特質適合這個領域？',
    '你有參加過與醫療或健康相關的志工活動嗎？分享你的經驗和感受。',
  ],
  '商管': [
    '你好！歡迎來到面試。請自我介紹，告訴我你對商管領域的哪個方向最有興趣？',
    '你平常會關注財經新聞或商業趨勢嗎？最近有什麼讓你印象深刻的商業事件？',
    '如果你是某家公司的 CEO，你認為最重要的領導特質是什麼？',
  ],
  '人文': [
    '你好！歡迎來到面試。請自我介紹，並分享你最近讀過的一本書或一篇文章。',
    '你認為人文學科在現代社會中扮演什麼樣的角色？',
    '如果讓你推薦一個人文領域的議題讓大家關注，你會選什麼？',
  ],
  '社會': [
    '你好！歡迎來到面試。請自我介紹，並說說你最關心的社會議題是什麼？',
    '你認為造成這個社會問題的根本原因是什麼？你有想過可能的解決方案嗎？',
    '你有參與過社會服務或公共事務嗎？分享你的經驗。',
  ],
  '自然': [
    '你好！歡迎來到面試。請自我介紹，告訴我你對哪個科學領域最感興趣？',
    '你有做過科學探究或實驗嗎？可以分享你的研究過程和發現嗎？',
    '你認為科學研究對人類社會最大的貢獻是什麼？',
  ],
  '藝術': [
    '你好！歡迎來到面試。請自我介紹，並分享一件你最滿意的作品或創作經驗。',
    '什麼事物或人物啟發了你的創作靈感？',
    '你認為藝術在社会中扮演什麼角色？藝術家需要承擔社會責任嗎？',
  ],
};

/** Predefined fallback questions by vocational group (高職) */
const FALLBACK_FIRST_QUESTIONS_VOCATIONAL: Record<string, string[]> = {
  '資訊群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼選擇讀資訊科？',
    '你在校期間有做過專題實作嗎？可以分享一個你最投入的專案內容和你在其中負責什麼嗎？',
    '你有考取哪些技能檢定證照？或是你對哪種程式語言或技術最感興趣？',
  ],
  '電機群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼對電機領域有興趣？',
    '你在專題實作或實習中，有接觸過哪些自動化控制或電力系統的實務操作？',
    '你有參加過技能競賽或考取相關證照嗎？那個經驗讓你學到了什麼？',
  ],
  '電子群': [
    '你好！歡迎來到面試。請自我介紹，並說說你選擇電子領域的原因是什麼？',
    '你在校期間有做過與半導體或電路設計相關的專題實作嗎？可以分享過程中遇到的挑戰嗎？',
    '你對目前台灣的半導體產業有什麼看法？這如何影響你未來的升學規劃？',
  ],
  '機械群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼想走機械領域？',
    '你在專題實作或實習中，有操作過 CNC 工具機或其他的機械加工設備嗎？分享你的經驗。',
    '你有參加過技能競賽嗎？或是你對機械設計的哪個方向（如 CAD/CAM）最有興趣？',
  ],
  '餐旅群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼想進入餐旅產業？',
    '你在實習或校內實作中，有什麼讓你印象深刻的烹飪或服務經驗嗎？',
    '餐旅業很重視服務態度。你覺得自己具備哪些適合這個行業的特質？',
  ],
  '護理群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼想選擇護理這條路？',
    '你在實習或實作課程中，有什麼與病患互動的經驗嗎？分享你的感受。',
    '護理工作需要耐心和同理心。你覺得自己如何在壓力環境下保持良好的照護品質？',
  ],
  '商管群': [
    '你好！歡迎來到面試。請自我介紹，並說說你對商業與管理的哪個領域最有興趣？',
    '你在專題實作或實習中，有參與過什麼與商業運作相關的專案嗎？',
    '你有考取會計、電子商務或行銷相關的證照嗎？你認為這些技能對未來升學有什麼幫助？',
  ],
  '設計群': [
    '你好！歡迎來到面試。請自我介紹，並分享一件你最滿意的設計作品。',
    '你在專題實作中，是怎麼從構想到完成一個設計作品的？可以描述你的創作過程嗎？',
    '你平時會關注哪些設計趨勢或設計師？這些如何影響你的設計風格？',
  ],
  '農業群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼對農業或生物技術有興趣？',
    '你在校期間的專題實作或實習中，有接觸過哪些農業技術或生物科技的應用？',
    '你認為農業科技（如智慧農業、精準農業）對台灣的未來有什麼重要性？',
  ],
  '化工群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼選擇化工領域？',
    '你在專題實作或實習中，有操作過哪些化學程序或材料分析的實驗嗎？',
    '你對綠色化學或新材料的發展有什麼看法？這如何影響你未來的學習方向？',
  ],
  '土木群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼想走土木工程這條路？',
    '你在專題實作或實習中，有接觸過測量、施工或結構相關的實務操作嗎？',
    '你對台灣近年來推動的公共工程或基礎建設有什麼觀察？',
  ],
  '海事群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼想進入海事領域？',
    '你在校期間的實習或實作中，有什麼航海或船舶操作的經驗嗎？',
    '海事工作需要長時間在海上作業。你覺得自己具備哪些特質能夠適應這樣的工作環境？',
  ],
  '家政群': [
    '你好！歡迎來到面試。請自我介紹，並說說你對家政領域的哪個方向最有興趣？',
    '你在專題實作中，有做過與食品科學或營養學相關的研究嗎？可以分享你的發現嗎？',
    '你認為現代人最需要具備哪些飲食或營養方面的知識？',
  ],
  '語文群': [
    '你好！歡迎來到面試。請自我介紹，並說說你為什麼想專精語文能力？',
    '你在校期間有參加過語文相關的競賽、檢定或跨文化交流的活動嗎？',
    '你覺得語言能力在未來的職場中扮演什麼角色？你有想過未來想運用語文能力從事什麼工作嗎？',
  ],
  '商業與管理群': [
    '你好！歡迎來到面試。請自我介紹，並說說你對商業運營或創新管理有什麼興趣？',
    '你在專題實作或實習中，有參與過什麼商業企劃或經營模擬的專案嗎？',
    '你有考取會計、資料處理或行銷相關的技能檢定嗎？你覺得實務經驗對升學有多大幫助？',
  ],
};

/** Combined lookup: vocational groups first, then academic groups */
const FALLBACK_FIRST_QUESTIONS: Record<string, string[]> = {
  ...FALLBACK_FIRST_QUESTIONS_ACADEMIC,
  ...FALLBACK_FIRST_QUESTIONS_VOCATIONAL,
};

const DEFAULT_FIRST_QUESTIONS = [
  '你好！歡迎來到面試。請先自我介紹，告訴我你的興趣和為什麼選擇這個方向。',
  '在你的學習過程中，哪一段經歷對你影響最深？為什麼？',
  '你對未來的大學生活有什麼期待？',
];

/** Fallback follow-up questions based on round */
const FALLBACK_FOLLOW_UPS = [
  '這是一個很好的回答。你提到這個經歷讓你學到了很多，能具體說說最大的收穫是什麼嗎？',
  '有趣的想法。如果讓你重新來過，你會做出不同的選擇嗎？為什麼？',
  '你的回答展現了深入的思考。接著我想問：你覺得大學四年最應該培養的能力是什麼？',
  '很好的分享。我想進一步了解：你如何面對挫折或失敗的經驗？',
  '謝謝你的分享。最後一個問題：你認為自己最獨特的優勢是什麼？這個優勢如何幫助你在這個領域發展？',
];

/** Vocational group names for context-aware prompts */
const VOCATIONAL_GROUPS = new Set(Object.keys(FALLBACK_FIRST_QUESTIONS_VOCATIONAL));

function isVocationalGroup(directionGroup: string): boolean {
  return VOCATIONAL_GROUPS.has(directionGroup);
}

function getFallbackFirstQuestion(direction: string, directionGroup: string): string {
  const groupQuestions = FALLBACK_FIRST_QUESTIONS[directionGroup] ?? DEFAULT_FIRST_QUESTIONS;
  return groupQuestions[0] ?? `你好！歡迎來到${direction}的面試模擬。請先自我介紹，告訴我你為什麼對${direction}有興趣？`;
}

function getFallbackFeedbackAndNext(
  direction: string,
  directionGroup: string,
  round: number,
  maxRounds: number,
  userAnswer: string,
): { feedback: string; nextQuestion: string | null; isLastRound: boolean } {
  const answerLength = userAnswer.length;

  let feedback: string;
  if (answerLength < 30) {
    feedback = '你的回答比較簡短，建議面試時盡量展開說明，提供具體的例子和細節，讓面試官更了解你的想法。';
  } else if (answerLength < 80) {
    feedback = '你的回答有提到重點，建議可以更深入地描述你的經歷或想法，加入「為什麼」和「如何」的說明，會更有說服力。';
  } else {
    feedback = '你的回答相當完整，展現了你的思考深度。記得面試時保持這樣的表達水準，同時注意語速和眼神交流。';
  }

  const isLastRound = round >= maxRounds;
  const nextQuestion = isLastRound
    ? null
    : FALLBACK_FOLLOW_UPS[Math.min(round, FALLBACK_FOLLOW_UPS.length - 1)];

  return { feedback, nextQuestion, isLastRound };
}

export async function POST(request: NextRequest) {
  const body: InterviewRequestBody = await request.json();
  const { direction, directionGroup, round, maxRounds, userAnswer, chatHistory } = body;

  const isVocational = isVocationalGroup(directionGroup);
  const expertTitle = isVocational ? '台灣高職升學輔導專家' : '台灣大學入學面試的模擬面試官';
  const admissionContext = isVocational
    ? `你正在面試一位準備參加四技二專甄選入學的學生，報考${directionGroup}（${direction}方向）。
該學生來自高職背景，學習過程中可能包含專題實作、技能檢定、校外實習、統測等經歷。`
    : `你正在面試一位報考${directionGroup}學群（${direction}方向）的學生。`;

  const vocationalGuidelines = isVocational
    ? `6. 優先詢問與專題實作、技能檢定、實習經驗相關的問題
7. 可參考統測成績或在校表現，了解學生的專業基礎
8. 引導學生連結高職實務經驗與未來四技二專的學習目標`
    : '';

  const systemPrompt = `你是一位${expertTitle}。${admissionContext}

規則：
1. 每次只問一個問題
2. 問題要針對${direction}相關的知識、動機、經歷
3. 問題類型要多樣：動機題、經歷題、情境題、專業題
4. 語氣友善但專業
5. 如果是第${round}輪（共${maxRounds}輪），問題要適度深入
${vocationalGuidelines}`;

  if (userAnswer && chatHistory.length > 0) {
    // Follow-up: provide feedback and ask next question
    const userMessages = chatHistory.map(m => ({ role: m.role, content: m.content }));
    userMessages.push({ role: 'user', content: userAnswer });

    const feedbackPrompt = `學生回答了：「${userAnswer}」

請給予回饋，然後問下一個問題。格式如下（JSON）：
{
  "feedback": "對學生回答的回饋（優點 + 改進建議，2-3 句話）",
  "nextQuestion": "下一個問題",
  "isLastRound": ${round >= maxRounds}
}

回饋要具體、建設性。如果是最後一輪，nextQuestion 為 null。`;

    const aiResult = await callAI({
      systemPrompt,
      userPrompt: feedbackPrompt,
      temperature: 0.7,
    });

    if (aiResult.ok && aiResult.content) {
      const parsed = parseAIJson<{
        feedback: string;
        nextQuestion: string | null;
        isLastRound: boolean;
      }>(aiResult.content);

      if (parsed) {
        return NextResponse.json({
          feedback: parsed.feedback || '回答得不錯！',
          nextQuestion: parsed.nextQuestion || null,
          isLastRound: parsed.isLastRound ?? false,
          _fallback: false,
        });
      }
    }

    // Fallback
    const fallback = getFallbackFeedbackAndNext(direction, directionGroup, round, maxRounds, userAnswer);
    return NextResponse.json({
      ...fallback,
      _fallback: true,
      _aiError: aiResult.isRateLimited
        ? 'AI 服務目前請求頻繁，已改用基本回饋。'
        : 'AI 服務暫時不可用，已改用基本回饋。',
    });
  }

  // First question
  const firstQuestionPrompt = `這是第 1 輪面試（共 ${maxRounds} 輪）。請問第一個問題，作為開場。

格式（JSON）：
{
  "question": "你的第一個問題"
}

問題應該是讓學生放鬆的開場問題，例如自我介紹或為什麼選擇這個方向。`;

  const aiResult = await callAI({
    systemPrompt,
    userPrompt: firstQuestionPrompt,
    temperature: 0.7,
  });

  if (aiResult.ok && aiResult.content) {
    const parsed = parseAIJson<{ question: string }>(aiResult.content);
    if (parsed?.question) {
      return NextResponse.json({
        question: parsed.question,
        _fallback: false,
      });
    }
  }

  // Fallback first question
  return NextResponse.json({
    question: getFallbackFirstQuestion(direction, directionGroup),
    _fallback: true,
    _aiError: aiResult.isRateLimited
      ? 'AI 服務目前請求頻繁，已改用預設問題。'
      : 'AI 服務暫時不可用，已改用預設問題。',
  });
}
