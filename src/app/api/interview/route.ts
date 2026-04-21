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

/** Predefined fallback questions by direction group */
const FALLBACK_FIRST_QUESTIONS: Record<string, string[]> = {
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

  const systemPrompt = `你是一位台灣大學入學面試的模擬面試官。你正在面試一位報考${directionGroup}學群（${direction}方向）的學生。

規則：
1. 每次只問一個問題
2. 問題要針對${direction}相關的知識、動機、經歷
3. 問題類型要多樣：動機題、經歷題、情境題、專業題
4. 語氣友善但專業
5. 如果是第${round}輪（共${maxRounds}輪），問題要適度深入`;

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
