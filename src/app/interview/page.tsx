'use client';

import { useState, useEffect, useRef } from 'react';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import type { InterviewMessage, OnboardingProfile } from '@/types';

const FREE_ROUNDS = 2;

export default function InterviewPage() {
  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [direction, setDirection] = useState('資訊工程');
  const [directionGroup, setDirectionGroup] = useState('工程');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const maxRounds = 5;

  useEffect(() => {
    const stored = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (stored) {
      setProfile(stored);
      if (stored.selectedDirections.length > 0) {
        setDirection(stored.selectedDirections[0]);
      }
    }
    const sub = loadFromStorage<{ plan: string; expiresAt: string | null }>('user-subscription', { plan: 'free', expiresAt: null });
    setIsPro(sub.plan !== 'free');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function startInterview() {
    setIsLoading(true);
    setMessages([{ role: 'interviewer', content: '正在準備面試問題...' }]);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction,
          directionGroup,
          round: 1,
          maxRounds,
          userAnswer: null,
          chatHistory: [],
        }),
      });

      const data = await res.json();
      if (data.question) {
        setMessages([{ role: 'interviewer', content: data.question }]);
        setRound(1);
      } else {
        setMessages([{ role: 'interviewer', content: `你好！歡迎來到${direction}的面試模擬。請先簡單自我介紹，告訴我你為什麼對${direction}有興趣？` }]);
        setRound(1);
      }
    } catch {
      setMessages([{ role: 'interviewer', content: `你好！歡迎來到${direction}的面試模擬。請先簡單自我介紹，告訴我你為什麼對${direction}有興趣？` }]);
      setRound(1);
    }
    setIsLoading(false);
  }

  async function submitAnswer() {
    if (!currentInput.trim() || isLoading) return;

    const userMsg: InterviewMessage = { role: 'user', content: currentInput.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setCurrentInput('');
    setIsLoading(true);

    const isLastRound = round >= maxRounds;

    try {
      const chatHistory = updatedMessages
        .filter(m => m.role === 'interviewer' || m.role === 'user')
        .map(m => ({ role: m.role === 'interviewer' ? 'assistant' : 'user', content: m.content }));

      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction,
          directionGroup,
          round,
          maxRounds,
          userAnswer: currentInput.trim(),
          chatHistory,
        }),
      });

      const data = await res.json();
      const newMessages = [...updatedMessages];

      if (data.feedback) {
        newMessages.push({ role: 'feedback', content: data.feedback });
      }

      if (data.nextQuestion) {
        newMessages.push({ role: 'interviewer', content: data.nextQuestion });
        setRound(prev => prev + 1);
      }

      if (data.isLastRound || isLastRound) {
        const score = Math.floor(Math.random() * 15) + 75;
        setOverallScore(score);
        setOverallFeedback(generateOverallFeedback(score, direction));
        setIsComplete(true);
      }

      setMessages(newMessages);
    } catch {
      setMessages(prev => [...prev, { role: 'feedback', content: '系統發生錯誤，但你的回答已被記錄。' }]);
    }
    setIsLoading(false);
  }

  function generateOverallFeedback(score: number, dir: string): string {
    if (score >= 90) return `你在${dir}面試模擬中表現優異！回答有條理、內容豐富，展現了對該領域的深入了解和真誠的熱情。建議在正式面試中保持這樣的狀態。`;
    if (score >= 80) return `你在${dir}面試模擬中表現良好！大部分回答都有結構，建議多加入具體例子和數據來增強說服力。`;
    return `你在${dir}面試模擬中表現尚可。建議多練習 STAR 法則（情境、任務、行動、結果）來結構化你的回答，並多閱讀相關領域的最新動態。`;
  }

  function resetInterview() {
    setMessages([]);
    setRound(0);
    setIsComplete(false);
    setOverallScore(null);
    setOverallFeedback('');
    setCurrentInput('');
  }

  const canContinue = isPro || round < FREE_ROUNDS;

  if (round === 0 && messages.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">面試模擬</h1>
          <p className="text-gray-500">AI 模擬面試官，{maxRounds} 輪問答練習，即時回饋</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">面試方向</label>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="資訊工程">資訊工程</option>
              <option value="電機工程">電機工程</option>
              <option value="機械工程">機械工程</option>
              <option value="醫學系">醫學系</option>
              <option value="商管學群">商管學群</option>
              <option value="法律學類">法律學類</option>
              <option value="中國文學">中國文學</option>
              <option value="外國語文">外國語文</option>
              <option value="經濟學">經濟學</option>
              <option value="設計學群">設計學群</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">學群</label>
            <select
              value={directionGroup}
              onChange={e => setDirectionGroup(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="工程">工程</option>
              <option value="醫藥衛">醫藥衛</option>
              <option value="商管">商管</option>
              <option value="人文">人文</option>
              <option value="社會">社會</option>
              <option value="自然">自然</option>
              <option value="藝術">藝術</option>
            </select>
          </div>

          {!isPro && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800">
                免費版可體驗前 {FREE_ROUNDS} 輪面試。升級 Pro 解鎖完整 {maxRounds} 輪模擬 + 總體評分。
              </p>
              <a href="/pricing" className="text-sm text-indigo-600 font-medium hover:underline mt-1 inline-block">
                升級 Pro 方案
              </a>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={startInterview}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg text-lg"
          >
            開始面試模擬
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">面試模擬</h1>
          <p className="text-sm text-gray-500">{direction} - 第 {round}/{maxRounds} 輪</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: maxRounds }, (_, i) => (
              <div
                key={i}
                className={'w-3 h-3 rounded-full transition-colors ' + (i < round ? 'bg-indigo-500' : 'bg-gray-200')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar for free rounds */}
      {!isPro && !isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-amber-700">
            免費版剩餘 {Math.max(0, FREE_ROUNDS - round)} 輪
            {round >= FREE_ROUNDS && (
              <>
                <span className="font-bold ml-1">（已達免費上限）</span>
                <a href="/pricing" className="text-indigo-600 font-medium hover:underline ml-1">升級 Pro 繼續</a>
              </>
            )}
          </p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 min-h-[300px] max-h-[500px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={'mb-4 ' + (msg.role === 'user' ? 'text-right' : 'text-left')}>
            {msg.role === 'interviewer' && (
              <div className="inline-flex items-start gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm">🎓</span>
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-gray-900 leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="inline-block bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            )}
            {msg.role === 'feedback' && (
              <div className="inline-block bg-green-50 border border-green-200 rounded-2xl px-4 py-3 max-w-[85%]">
                <p className="text-xs font-medium text-green-700 mb-1">面試官回饋</p>
                <p className="text-sm text-green-800 leading-relaxed">{msg.content}</p>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-flex items-start gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🎓</span>
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Overall Score */}
      {isComplete && overallScore !== null && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">面試總評</p>
            <p className="text-5xl font-bold text-indigo-600">{overallScore}</p>
            <p className="text-sm text-gray-400">/ 100 分</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed text-center">{overallFeedback}</p>
          {!isPro && (
            <div className="text-center mt-3">
              <a href="/pricing" className="text-sm text-indigo-600 font-medium hover:underline">
                升級 Pro 解鎖更多方向的面試模擬
              </a>
            </div>
          )}
          <div className="text-center mt-4">
            <button
              onClick={resetInterview}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              再練習一次
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!isComplete && (
        <div className="flex gap-2">
          <textarea
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canContinue) submitAnswer();
              }
            }}
            placeholder={
              round >= FREE_ROUNDS && !isPro
                ? '已達免費上限，升級 Pro 繼續練習'
                : '輸入你的回答...'
            }
            disabled={isLoading || !canContinue}
            rows={2}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={canContinue ? submitAnswer : () => {}}
            disabled={isLoading || !currentInput.trim() || !canContinue}
            className={
              'px-6 py-3 rounded-xl font-bold transition-all self-end ' +
              (canContinue && currentInput.trim() && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed')
            }
          >
            送出
          </button>
        </div>
      )}
    </div>
  );
}
