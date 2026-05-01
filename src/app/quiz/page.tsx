'use client';

import { useState, useRef, useCallback } from 'react';
import { saveToStorage } from '@/lib/storage';
import type { QuizQuestion, QuizResult } from '@/types';

/* ═══════════════════════════════════════════════════════
   Quiz Data
   ═══════════════════════════════════════════════════════ */

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '在規劃一個專案時，你通常更傾向於關注哪個面向？',
    options: [
      { value: 'a', label: '邏輯與結構', description: '致力於建立嚴謹的框架，確保每一個環節都具備邏輯合理性與執行可行性。' },
      { value: 'b', label: '美學與感性', description: '注重專案呈現出的視覺美感與情感共鳴，追求細節上的極致藝術表達。' },
      { value: 'c', label: '人際與協作', description: '優先考量團隊成員的感受與溝通效率，相信和諧的氛圍是成功的基石。' },
      { value: 'd', label: '創新與突破', description: '不滿足於現狀，傾向於嘗試未知的可能性，為專案注入前所未有的獨特見解。' },
    ],
  },
  {
    id: 2,
    question: '實習或實作課中，你最享受哪個環節？',
    options: [
      { value: 'a', label: '動手做出成品', description: '享受從無到有的過程，將想法轉化為實際的產出。' },
      { value: 'b', label: '解決技術問題', description: '面對複雜的技術挑戰，找到最佳解決方案的成就感。' },
      { value: 'c', label: '和顧客互動', description: '與使用者對話，理解需求並提供專業服務。' },
      { value: 'd', label: '規劃和設計', description: '在開始之前，構思整體的藍圖與視覺方向。' },
    ],
  },
  {
    id: 3,
    question: '以下哪個工作環境最吸引你？',
    options: [
      { value: 'a', label: '電腦前面', description: '安靜的空間裡，專注於程式碼和數位工具。' },
      { value: 'b', label: '工廠／實驗室', description: '實際操作設備，感受材料和機械的運作。' },
      { value: 'c', label: '餐廳／服務現場', description: '與人互動，提供即時的服務和體驗。' },
      { value: 'd', label: '戶外／工地', description: '在真實場域中觀察和記錄，將設計融入環境。' },
    ],
  },
  {
    id: 4,
    question: '你最想學的一項技能是？',
    options: [
      { value: 'a', label: '寫程式', description: '掌握程式語言，開發能解決問題的應用程式。' },
      { value: 'b', label: '操作機器', description: '學習精密機具的操作，追求製造的精準度。' },
      { value: 'c', label: '烹飪／服務', description: '用專業技能創造讓人感動的體驗。' },
      { value: 'd', label: '設計／繪圖', description: '用視覺語言表達想法，創造美的作品。' },
    ],
  },
  {
    id: 5,
    question: '你的專題實作，最想選的主題是？',
    options: [
      { value: 'a', label: 'AI／自動化', description: '運用人工智慧技術，打造智慧化的解決方案。' },
      { value: 'b', label: '精密製造', description: '深入探索材料與製程，追求工藝極致。' },
      { value: 'c', label: '食品／觀光', description: '結合在地特色，創造有溫度的服務體驗。' },
      { value: 'd', label: '空間／品牌', description: '用設計思維重塑空間或品牌形象。' },
    ],
  },
  {
    id: 6,
    question: '你最崇拜的人是？',
    options: [
      { value: 'a', label: '科技創業家', description: '用技術改變世界，從零建立影響力。' },
      { value: 'b', label: '工藝大師', description: '一生投入一項技藝，追求極致的品質。' },
      { value: 'c', label: '知名主廚', description: '用創意和手藝，為每個人帶來美好體驗。' },
      { value: 'd', label: '設計師', description: '用美學改變日常，讓生活更有品味。' },
    ],
  },
  {
    id: 7,
    question: '班上要辦活動，你會負責？',
    options: [
      { value: 'a', label: '做活動網站', description: '發揮技術能力，為活動建立數位平台。' },
      { value: 'b', label: '搭建舞台燈光', description: '動手解決硬體問題，確保活動順利進行。' },
      { value: 'c', label: '規劃流程聯絡', description: '擔任溝通橋樑，讓每個人各司其職。' },
      { value: 'd', label: '設計海報布置', description: '負責視覺呈現，打造活動的整體氛圍。' },
    ],
  },
  {
    id: 8,
    question: '你的夢想工作是？',
    options: [
      { value: 'a', label: '軟體工程師', description: '在科技公司工作，開發影響千萬人的產品。' },
      { value: 'b', label: '精密製造技師', description: '在工廠或實驗室，追求製造技術的極致。' },
      { value: 'c', label: '餐飲／觀光業', description: '創造讓人開心的服務體驗，分享美好。' },
      { value: 'd', label: '設計師／創作者', description: '自由地用創意工作，作品就是最好的名片。' },
    ],
  },
  {
    id: 9,
    question: '你覺得自己最強的能力是？',
    options: [
      { value: 'a', label: '邏輯思考', description: '能快速拆解複雜問題，找到系統化的解法。' },
      { value: 'b', label: '動手操作', description: '手巧心細，能精準地完成實體操作任務。' },
      { value: 'c', label: '溝通服務', description: '善於理解他人需求，提供溫暖而專業的服務。' },
      { value: 'd', label: '美感和創意', description: '對色彩、比例和空間有敏銳的直覺。' },
    ],
  },
  {
    id: 10,
    question: '哪種成就感最讓你滿足？',
    options: [
      { value: 'a', label: '解決一個技術難題', description: '經過反覆嘗試，終於找到程式的 bug 或系統的最佳解。' },
      { value: 'b', label: '做出一件實體作品', description: '看著手中的材料一步步變成精美的成品。' },
      { value: 'c', label: '讓客人開心滿意', description: '收到真誠的感謝，知道自己創造了價值。' },
      { value: 'd', label: '完成一件設計作品', description: '看著自己的設計被實現，被更多人看到和欣賞。' },
    ],
  },
];

const QUIZ_RESULTS: Record<string, QuizResult> = {
  type_a: {
    type: 'A',
    typeName: '科技實踐者',
    emoji: '🧩',
    description:
      '你熱愛科技與邏輯，享受用程式和技術解決問題的過程。你天生對數位世界充滿好奇，善於分析與系統化思考。資訊、電機、電子等科技領域，能讓你把想法變成實際的作品。',
    directions: ['資訊群', '電機群', '電子群'],
    color: 'from-blue-500 to-cyan-500',
  },
  type_b: {
    type: 'B',
    typeName: '工匠精神者',
    emoji: '🔧',
    description:
      '你喜歡動手操作、精雕細琢，享受從零開始打造實體作品的過程。你有耐心和毅力追求精準與品質，機械、化工、土木、農業等領域能讓你發揮精湛的技術與工匠精神。',
    directions: ['機械群', '化工群', '土木群', '農業群'],
    color: 'from-slate-500 to-zinc-500',
  },
  type_c: {
    type: 'C',
    typeName: '服務領航者',
    emoji: '⚓',
    description:
      '你擅長與人互動、關心他人需求，享受服務過程中帶來的成就感。你有出色的溝通能力和同理心，餐旅、護理、家政、海事、語文等領域能讓你用專業技能為他人創造美好體驗。',
    directions: ['餐旅群', '護理群', '家政群', '海事群', '語文群'],
    color: 'from-amber-500 to-orange-500',
  },
  type_d: {
    type: 'D',
    typeName: '創意表現者',
    emoji: '🎨',
    description:
      '你對美感與創意有敏銳的直覺，享受將想法轉化為視覺作品的過程。你不喜歡被框架束縛，設計、商管等領域能讓你自由揮灑創意，用作品打動人心。',
    directions: ['設計群', '商管群', '商業與管理群'],
    color: 'from-rose-500 to-pink-500',
  },
};

const QUIZ_QUOTES = [
  '探索不僅是尋找新風景，更是擁有新的眼光。',
  '真正的發現之旅，不在於尋找新風景，而在於擁有新的眼光。',
  '每個選擇，都是未來的一塊磚石。',
  '了解自己，是通往未來最短的路。',
  '沒有錯誤的答案，只有更深的認識。',
  '你的直覺，往往比你想像的更準確。',
  '勇於選擇，就是勇於成為自己。',
  '職業不是终点，而是你熱情的延伸。',
  '最好的職群，是讓你忘記時間的那一個。',
  '完成測驗，是認識自己的第一步。',
];

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
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

/* ═══════════════════════════════════════════════════════
   Quiz Page
   ═══════════════════════════════════════════════════════ */

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

  /* ── Result View ───────────────────────────────────── */

  if (result) {
    return (
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-xl">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-sm">
            ASSESSMENT RESULT
          </span>
          <h1 className="font-h1 text-h1 text-on-surface">
            {result.emoji} {result.typeName}
          </h1>
        </div>

        {/* Score badge */}
        <div className="flex justify-center mb-lg">
          <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 text-xs font-label-caps font-bold">
            類型 {result.type}
          </span>
        </div>

        {/* Share Card */}
        <div
          ref={cardRef}
          className={`max-w-[42rem] mx-auto p-xl mb-xl bg-gradient-to-br ${result.color} border-none rounded-md`}
        >
          <div className="text-center mb-lg">
            <p className="text-sm text-white/80 mb-xs">你的技能人格</p>
            <p className="font-h2 text-h2 text-white">
              {result.typeName}
            </p>
          </div>

          <p className="font-body-md text-white/95 leading-relaxed mb-lg">
            {result.description}
          </p>

          <div>
            <p className="font-label-caps text-label-caps text-white/70 tracking-widest mb-md">
              推薦職群方向
            </p>
            <div className="flex flex-wrap gap-sm">
              {result.directions.map(dir => (
                <span
                  key={dir}
                  className="inline-flex items-center px-md py-sm bg-white/20 rounded-full text-sm font-medium text-white backdrop-blur-sm"
                >
                  {dir}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-md mb-xl max-w-[42rem] mx-auto">
          <button
            onClick={generateShareImage}
            disabled={isSharing}
            className="flex-1 bg-primary text-white px-xl py-sm font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSharing ? '產生圖片中...' : '下載分享圖卡'}
          </button>
          <button
            onClick={() => {
              setResult(null);
              setCurrentQuestion(0);
              setAnswers({});
            }}
            className="border border-[#E9E5DB] text-on-surface px-xl py-sm font-label-caps text-label-caps tracking-widest hover:bg-surface-container-low transition-all cursor-pointer"
          >
            重測
          </button>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/onboarding/step1"
            className="text-primary hover:underline font-body-md"
          >
            想更深入了解？開始完整的導入流程
          </a>
        </div>
      </div>
    );
  }

  /* ── Quiz View ─────────────────────────────────────── */

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = (currentQuestion / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="page-container">
      {/* Progress Section */}
      <div className="max-w-[42rem] mx-auto mb-xxl">
        <div className="flex justify-between items-end mb-4">
          <div className="text-left">
            <span className="font-h3 text-h3 text-primary block">07</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">當前進度</span>
          </div>
          <div className="text-right">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              剩餘 {QUIZ_QUESTIONS.length - currentQuestion - 1} 題
            </span>
          </div>
        </div>
        <div className="w-full h-1 bg-[#E9E5DB] overflow-hidden">
          <div
            className="h-full bg-[#7D8B7E] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quiz Container */}
      <div className="max-w-[48rem] mx-auto flex flex-col items-center">
        {/* Question Card */}
        <div className="w-full mb-12">
          <h2 className="font-h1 text-h1 text-center text-primary leading-snug mb-8">
            {question.question}
          </h2>
          <p className="font-body-lg text-center text-on-surface-variant italic font-display-italic">
            &ldquo;{QUIZ_QUOTES[currentQuestion]}&rdquo;
          </p>
        </div>

        {/* Options Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter w-full">
          {question.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="group flex flex-col p-xl border border-[#E9E5DB] bg-white hover:bg-[#F4F1EA] hover:border-[#7D8B7E] text-left transition-all duration-300 cursor-pointer"
            >
              <span className="font-h3 text-h3 text-primary mb-4 group-hover:translate-x-2 transition-transform duration-300">{opt.label}</span>
              <p className="font-body-md text-stone-600 mb-6">
                {opt.description}
              </p>
              <div className="mt-auto flex items-center text-[#7D8B7E] font-label-caps opacity-0 group-hover:opacity-100 transition-opacity">
                <span>選擇此項</span>
                <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
              </div>
            </button>
          ))}
        </div>

        {/* Interaction Guidance */}
        <div className="mt-xl flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                className="p-4 border border-[#E9E5DB] text-on-surface-variant hover:text-primary hover:bg-[#F4F1EA] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}
            <button
              onClick={() => {
                if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
                  setCurrentQuestion(prev => prev + 1);
                }
              }}
              className="px-8 py-4 bg-[#7D8B7E] text-white font-label-caps tracking-widest hover:bg-[#6a786c] transition-all cursor-pointer"
            >
              跳過此題
            </button>
          </div>
          <span className="text-on-surface-variant font-label-caps text-[10px]">您可以隨時返回上一題修改答案</span>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="fixed bottom-0 right-0 opacity-5 pointer-events-none hidden lg:block">
        <span className="material-symbols-outlined text-[300px]">architecture</span>
      </div>
    </div>
  );
}
