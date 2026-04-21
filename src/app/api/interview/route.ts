import { NextRequest, NextResponse } from 'next/server';

const AI_API_BASE = process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/';
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || '';
const AI_MODEL = process.env.NEXT_PUBLIC_AI_MODEL || 'glm-4.7-flash';

interface InterviewRequestBody {
  direction: string;
  directionGroup: string;
  round: number;
  maxRounds: number;
  userAnswer: string | null;
  chatHistory: Array<{ role: string; content: string }>;
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

  let userMessages: Array<{ role: string; content: string }> = [];

  if (userAnswer && chatHistory.length > 0) {
    userMessages = chatHistory.map(m => ({ role: m.role, content: m.content }));
    userMessages.push({ role: 'user', content: userAnswer });

    const feedbackPrompt = `學生回答了：「${userAnswer}」

請給予回饋，然後問下一個問題。格式如下（JSON）：
{
  "feedback": "對學生回答的回饋（優點 + 改進建議，2-3 句話）",
  "nextQuestion": "下一個問題",
  "isLastRound": ${round >= maxRounds}
}

回饋要具體、建設性。如果是最後一輪，nextQuestion 為 null。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${AI_API_BASE}chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...userMessages,
            { role: 'user', content: feedbackPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
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

      const parsed = JSON.parse(content);
      return NextResponse.json({
        feedback: parsed.feedback || '回答得不錯！',
        nextQuestion: parsed.nextQuestion || null,
        isLastRound: parsed.isLastRound || false,
      });
    } catch {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: 'Request timeout or parse error' }, { status: 504 });
    }
  } else {
    const firstQuestionPrompt = `這是第 1 輪面試（共 ${maxRounds} 輪）。請問第一個問題，作為開場。

格式（JSON）：
{
  "question": "你的第一個問題"
}

問題應該是讓學生放鬆的開場問題，例如自我介紹或為什麼選擇這個方向。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${AI_API_BASE}chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: firstQuestionPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({
          question: `你好！歡迎來到${direction}的面試模擬。請先簡單自我介紹，告訴我你為什麼對${direction}有興趣？`,
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json({
          question: `你好！歡迎來到${direction}的面試模擬。請先簡單自我介紹，告訴我你為什麼對${direction}有興趣？`,
        });
      }

      const parsed = JSON.parse(content);
      return NextResponse.json({
        question: parsed.question || `請簡單自我介紹，並說明你為什麼想讀${direction}。`,
      });
    } catch {
      clearTimeout(timeoutId);
      return NextResponse.json({
        question: `你好！歡迎來到${direction}的面試模擬。請先簡單自我介紹，告訴我你為什麼對${direction}有興趣？`,
      });
    }
  }
}
