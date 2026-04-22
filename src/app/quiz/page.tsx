'use client';

import { useState, useRef, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import type { QuizQuestion, QuizResult } from '@/types';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '實習或實作課中，你最享受哪個環節？',
    options: [
      { value: 'a', label: '動手做出成品' },
      { value: 'b', label: '解決技術問題' },
      { value: 'c', label: '和顧客互動' },
      { value: 'd', label: '規劃和設計' },
    ],
  },
  {
    id: 2,
    question: '以下哪個工作環境最吸引你？',
    options: [
      { value: 'a', label: '電腦前面' },
      { value: 'b', label: '工廠／實驗室' },
      { value: 'c', label: '餐廳／服務現場' },
      { value: 'd', label: '戶外／工地' },
    ],
  },
  {
    id: 3,
    question: '你最想學的一項技能是？',
    options: [
      { value: 'a', label: '寫程式' },
      { value: 'b', label: '操作機器' },
      { value: 'c', label: '烹飪／服務' },
      { value: 'd', label: '設計／繪圖' },
    ],
  },
  {
    id: 4,
    question: '你的專題實作，最想選的主題是？',
    options: [
      { value: 'a', label: 'AI／自動化' },
      { value: 'b', label: '精密製造' },
      { value: 'c', label: '食品／觀光' },
      { value: 'd', label: '空間／品牌' },
    ],
  },
  {
    id: 5,
    question: '你最崇拜的人是？',
    options: [
      { value: 'a', label: '科技創業家' },
      { value: 'b', label: '工藝大師' },
      { value: 'c', label: '知名主廚' },
      { value: 'd', label: '設計師' },
    ],
  },
  {
    id: 6,
    question: '班上要辦活動，你會負責？',
    options: [
      { value: 'a', label: '做活動網站' },
      { value: 'b', label: '搭建舞台燈光' },
      { value: 'c', label: '規劃流程聯絡' },
      { value: 'd', label: '設計海報布置' },
    ],
  },
  {
    id: 7,
    question: '你的夢想工作是？',
    options: [
      { value: 'a', label: '軟體工程師' },
      { value: 'b', label: '精密製造技師' },
      { value: 'c', label: '餐飲／觀光業' },
      { value: 'd', label: '設計師／創作者' },
    ],
  },
  {
    id: 8,
    question: '你覺得自己最強的能力是？',
    options: [
      { value: 'a', label: '邏輯思考' },
      { value: 'b', label: '動手操作' },
      { value: 'c', label: '溝通服務' },
      { value: 'd', label: '美感和創意' },
    ],
  },
  {
    id: 9,
    question: '週末你最可能做什麼？',
    options: [
      { value: 'a', label: '寫程式／研究科技' },
      { value: 'b', label: '修理東西／做手工' },
      { value: 'c', label: '和朋友聚餐出遊' },
      { value: 'd', label: '看展覽／畫畫' },
    ],
  },
  {
    id: 10,
    question: '哪種成就感最讓你滿足？',
    options: [
      { value: 'a', label: '解決一個技術難題' },
      { value: 'b', label: '做出一件實體作品' },
      { value: 'c', label: '讓客人開心滿意' },
      { value: 'd', label: '完成一件設計作品' },
    ],
  },
];

const QUIZ_RESULTS: Record<string, QuizResult> = {
  type_a: {
    type: 'A',
    typeName: '科技實踐者',
    emoji: '🧩',
    description: '你熱愛科技與邏輯，享受用程式和技術解決問題的過程。你天生對數位世界充滿好奇，善於分析與系統化思考。資訊、電機、電子等科技領域，能讓你把想法變成實際的作品。',
    directions: ['資訊群', '電機群', '電子群'],
    color: 'from-blue-500 to-cyan-500',
  },
  type_b: {
    type: 'B',
    typeName: '工匠精神者',
    emoji: '🔧',
    description: '你喜歡動手操作、精雕細琢，享受從零開始打造實體作品的過程。你有耐心和毅力追求精準與品質，機械、化工、土木、農業等領域能讓你發揮精湛的技術與工匠精神。',
    directions: ['機械群', '化工群', '土木群', '農業群'],
    color: 'from-slate-500 to-zinc-500',
  },
  type_c: {
    type: 'C',
    typeName: '服務領航者',
    emoji: '⚓',
    description: '你擅長與人互動、關心他人需求，享受服務過程中帶來的成就感。你有出色的溝通能力和同理心，餐旅、護理、家政、海事、語文等領域能讓你用專業技能為他人創造美好體驗。',
    directions: ['餐旅群', '護理群', '家政群', '海事群', '語文群'],
    color: 'from-amber-500 to-orange-500',
  },
  type_d: {
    type: 'D',
    typeName: '創意表現者',
    emoji: '🎨',
    description: '你對美感與創意有敏銳的直覺，享受將想法轉化為視覺作品的過程。你不喜歡被框架束縛，設計、商管等領域能讓你自由揮灑創意，用作品打動人心。',
    directions: ['設計群', '商管群', '商業與管理群'],
    color: 'from-rose-500 to-pink-500',
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
      ctx.fillText('升學大師 職群測驗', 540, 120);

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
      ctx.fillText('推薦職群方向', 540, rectY + 60);

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
        a.download = `升學大師-職群測驗-${result.typeName}.png`;
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
            <p className="text-sm opacity-80 mb-1">你的技能人格</p>
            <p className="text-4xl font-bold">{result.typeName}</p>
          </div>
          <p className="text-sm leading-relaxed opacity-95 mb-6">{result.description}</p>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-3">推薦職群方向</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">職群人格測驗</h1>
        <p className="text-gray-500">10 題找出你的技能人格，發現適合你的職群方向</p>
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
