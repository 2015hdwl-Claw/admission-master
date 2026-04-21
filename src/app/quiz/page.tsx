'use client';

import { useState, useRef, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import type { QuizQuestion, QuizResult } from '@/types';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '週末早上醒來，你最想做的事是？',
    options: [
      { value: 'a', label: '研究昨晚想到的程式 bug 怎麼解' },
      { value: 'b', label: '去咖啡廳看一本小說' },
      { value: 'c', label: '跟朋友去打球或運動' },
      { value: 'd', label: '逛逛美術館或看展覽' },
    ],
  },
  {
    id: 2,
    question: '班上要辦活動，你會自願負責什麼？',
    options: [
      { value: 'a', label: '做一個報名網站或宣傳影片' },
      { value: 'b', label: '寫活動企劃書和流程表' },
      { value: 'c', label: '負責聯繫和協調所有人' },
      { value: 'd', label: '設計海報和視覺布置' },
    ],
  },
  {
    id: 3,
    question: '如果只能用一個詞形容理想的未來工作，你會選？',
    options: [
      { value: 'a', label: '創新' },
      { value: 'b', label: '深刻' },
      { value: 'c', label: '影響力' },
      { value: 'd', label: '自由' },
    ],
  },
  {
    id: 4,
    question: '以下哪個 YouTube 頻道最吸引你？',
    options: [
      { value: 'a', label: '3Blue1Brown / 兩光公式' },
      { value: 'b', label: '故事 StoryStudio / 鏡好聽' },
      { value: 'c', label: '台大啟思 / 灼灼有溫度' },
      { value: 'd', label: '老高與小茉 / 雞蛋圖書館' },
    ],
  },
  {
    id: 5,
    question: '遇到一個超難的問題，你的第一反應是？',
    options: [
      { value: 'a', label: '拆解成小問題，一步步解' },
      { value: 'b', label: '先查資料，看別人怎麼想' },
      { value: 'c', label: '找人討論，集思廣益' },
      { value: 'd', label: '直覺先試試看，不行再想' },
    ],
  },
  {
    id: 6,
    question: '選修課你最可能選哪門？',
    options: [
      { value: 'a', label: '程式設計 / AI 基礎' },
      { value: 'b', label: '哲學與人生 / 文學欣賞' },
      { value: 'c', label: '心理學 / 社會學' },
      { value: 'd', label: '美術 / 音樂 / 設計' },
    ],
  },
  {
    id: 7,
    question: '你最不想成為的人是？',
    options: [
      { value: 'a', label: '每天做重複工作的人' },
      { value: 'b', label: '不思考就下判斷的人' },
      { value: 'c', label: '只在乎自己的人' },
      { value: 'd', label: '沒有自己風格的人' },
    ],
  },
  {
    id: 8,
    question: '如果有時間旅行能力，你最想去？',
    options: [
      { value: 'a', label: '100 年後，看科技發展成什麼' },
      { value: 'b', label: '唐宋時期，體驗古代文化' },
      { value: 'c', label: '回到 10 年前，做不同的選擇' },
      { value: 'd', label: '文藝復興時期，見識大師們' },
    ],
  },
  {
    id: 9,
    question: '朋友心情不好找你，你通常怎麼做？',
    options: [
      { value: 'a', label: '幫他分析問題，提供解決方案' },
      { value: 'b', label: '安靜聽他說，給予陪伴' },
      { value: 'c', label: '帶他出去散心、轉換心情' },
      { value: 'd', label: '用幽默或故事讓他開心' },
    ],
  },
  {
    id: 10,
    question: '以下哪個成就最讓你有成就感？',
    options: [
      { value: 'a', label: '寫出一個被上千人使用的 App' },
      { value: 'b', label: '發表一篇被很多人轉發的文章' },
      { value: 'c', label: '成功策劃一場千人活動' },
      { value: 'd', label: '完成一件被展出的藝術作品' },
    ],
  },
];

const QUIZ_RESULTS: Record<string, QuizResult> = {
  type_a: {
    type: 'A',
    typeName: '邏輯建構者',
    emoji: '🧩',
    description: '你喜歡拆解問題、建立系統，享受從無到有創造東西的過程。你天生適合需要邏輯思考和技術能力的領域，工程和科技世界等著你發光。',
    directions: ['資訊工程', '電機工程', '機械工程', '數學系', '統計學'],
    color: 'from-blue-500 to-cyan-500',
  },
  type_b: {
    type: 'B',
    typeName: '深度思考者',
    emoji: '📖',
    description: '你喜歡探究事物背後的意義，享受閱讀和思考帶來的滿足。你對文字和思想敏感，人文和社會科學領域能讓你發揮所長。',
    directions: ['中國文學', '外國語文', '歷史學', '哲學', '法律學'],
    color: 'from-purple-500 to-pink-500',
  },
  type_c: {
    type: 'C',
    typeName: '社會連結者',
    emoji: '🤝',
    description: '你擅長理解他人、組織團隊，享受與人互動帶來的能量。你有強大的溝通和領導能力，商管和社會科學領域是你的舞台。',
    directions: ['企業管理', '經濟學', '政治學', '社會學', '傳播學'],
    color: 'from-amber-500 to-orange-500',
  },
  type_d: {
    type: 'D',
    typeName: '創意表現者',
    emoji: '🎨',
    description: '你對美感和創造力有獨特敏銳度，享受用作品表達自己。你不喜歡被框架限制，設計和藝術領域能讓你自由發揮。',
    directions: ['設計學群', '建築學', '音樂學', '美術學', '大眾傳播'],
    color: 'from-rose-500 to-red-500',
  },
};

function calculateResult(answers: Record<number, string>): QuizResult {
  const counts = { a: 0, b: 0, c: 0, d: 0 };
  Object.values(answers).forEach(v => {
    if (v in counts) counts[v as keyof typeof counts]++;
  });

  let maxType = 'a';
  let maxCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxType = type;
    }
  }

  return QUIZ_RESULTS[`type_${maxType}`] || QUIZ_RESULTS.type_a;
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleAnswer(value: string) {
    const newAnswers = { ...answers, [QUIZ_QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const quizResult = calculateResult(newAnswers);
      setResult(quizResult);
      saveToStorage('quiz-result', quizResult);
    }
  }

  const generateShareImage = useCallback(async () => {
    if (!cardRef.current || !result) return;

    setIsSharing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(900, 300, 200, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(200, 1600, 250, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('升學大師 科系測驗', 540, 120);

      ctx.font = '180px sans-serif';
      ctx.fillText(result.emoji, 540, 450);

      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(result.typeName, 540, 580);

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '32px sans-serif';
      const descLines = wrapText(ctx, result.description, 800);
      descLines.forEach((line, i) => {
        ctx.fillText(line, 540, 680 + i * 50);
      });

      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      const rectY = 920 + descLines.length * 50;
      ctx.fillRect(140, rectY, 800, 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('推薦學群方向', 540, rectY + 60);

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = '34px sans-serif';
      result.directions.forEach((dir, i) => {
        ctx.fillText(dir, 540, rectY + 120 + i * 55);
      });

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '28px sans-serif';
      ctx.fillText('掃碼或搜尋「升學大師」測測看', 540, 1820);

      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `升學大師-科系測驗-${result.typeName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setIsSharing(false);
    }
  }, [result]);

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-2">你的測驗結果</p>
          <h1 className="text-3xl font-bold text-gray-900">{result.emoji} {result.typeName}</h1>
        </div>

        {/* Share Card */}
        <div ref={cardRef} className={`bg-gradient-to-br ${result.color} rounded-2xl p-8 text-white mb-6 shadow-xl`}>
          <div className="text-center mb-6">
            <p className="text-sm opacity-80 mb-1">你的升學人格</p>
            <p className="text-4xl font-bold">{result.typeName}</p>
          </div>
          <p className="text-sm leading-relaxed opacity-95 mb-6">{result.description}</p>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-3">推薦學群方向</p>
            <div className="flex flex-wrap gap-2">
              {result.directions.map(dir => (
                <span key={dir} className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  {dir}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={generateShareImage}
            disabled={isSharing}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSharing ? '產生圖片中...' : '下載分享圖卡'}
          </button>
          <button
            onClick={() => {
              setResult(null);
              setCurrentQuestion(0);
              setAnswers({});
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            重測
          </button>
        </div>

        <div className="text-center">
          <a href="/onboarding/step1" className="text-sm text-indigo-600 hover:underline">
            想更深入了解？開始完整的導入流程
          </a>
        </div>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">科系人格測驗</h1>
        <p className="text-gray-500">10 題找出你的升學人格，發現適合你的學群方向</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>第 {currentQuestion + 1} 題 / 共 {QUIZ_QUESTIONS.length} 題</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: progress + '%' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="w-full text-left px-4 py-3.5 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-gray-700 text-sm leading-relaxed"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = '';
  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
