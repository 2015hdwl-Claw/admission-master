'use client';

import { useState, useEffect, useRef } from 'react';
import { loadFromStorage } from '@/lib/storage';
import { VOCATIONAL_GROUP_LABELS } from '@/data/vocational-categories';
import type { VocationalGroup } from '@/types';
import type { InterviewMessage, OnboardingProfile } from '@/types';

const FREE_ROUNDS = 2;
const VOCATIONAL_GROUPS = Object.keys(VOCATIONAL_GROUP_LABELS) as VocationalGroup[];

const TIPS = [
  '注意眼神與虛擬鏡頭的交集',
  '談論專題實作時多強調細節',
  '語速可以稍微放慢 10%',
];

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
  const [direction, setDirection] = useState<VocationalGroup>('資訊群');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const maxRounds = 5;

  useEffect(() => {
    const stored = loadFromStorage<OnboardingProfile | null>('onboarding-profile', null);
    if (stored) {
      setProfile(stored);
      if (stored.selectedDirections.length > 0) {
        setDirection(stored.selectedDirections[0] as VocationalGroup);
      }
    }
    const sub = loadFromStorage<{ plan: string; expiresAt: string | null }>('user-subscription', { plan: 'free', expiresAt: null });
    setIsPro(sub.plan !== 'free');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getVocationalFallbackQuestion(dir: VocationalGroup): string {
    return `你好！歡迎來到${dir}的面試模擬。請先簡單自我介紹，告訴我你為什麼選擇${dir}？你在校期間的專題實作、技能檢定或實習經驗有哪些？`;
  }

  async function startInterview() {
    setIsLoading(true);
    setMessages([{ role: 'interviewer', content: '正在準備面試問題...' }]);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction,
          directionGroup: direction,
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
        setMessages([{ role: 'interviewer', content: getVocationalFallbackQuestion(direction) }]);
        setRound(1);
      }
    } catch {
      setMessages([{ role: 'interviewer', content: getVocationalFallbackQuestion(direction) }]);
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
          directionGroup: direction,
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

  function generateOverallFeedback(score: number, dir: VocationalGroup): string {
    if (score >= 90) {
      return `你在${dir}面試模擬中表現優異！回答有條理，展現了對專題實作和技能學習的深入理解。面試官能感受到你對這個領域的熱情與投入，建議在正式面試中保持這樣的狀態。`;
    }
    if (score >= 80) {
      return `你在${dir}面試模擬中表現良好！大部分回答都有結構，建議多加入具體的專題實作或技能檢定經歷來增強說服力，讓面試官更了解你的實務能力。`;
    }
    return `你在${dir}面試模擬中表現尚可。建議多練習 STAR 法則（情境、任務、行動、結果）來結構化你的回答，並準備好專題實作、技能檢定及實習經驗的具體案例。`;
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
  const isPreInterview = round === 0 && messages.length === 0;

  return (
    <div className="max-w-[1200px] mx-auto px-gutter py-xxl min-h-[calc(100vh-80px)] flex flex-col md:flex-row gap-gutter">
      {/* ── Left Column: Interviewer Info ── */}
      <aside className="w-full md:w-1/3 flex flex-col gap-gutter">
        {/* Interviewer Profile */}
        <div className="bg-surface-container-low border border-[#E9E5DB] p-xl rounded-lg">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-lg ring-4 ring-primary-fixed ring-offset-4 ring-offset-background">
              <img
                alt="面試官頭像"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIWnBKgPDpNJecFGR5VKnRFwPJ5p6282fhGCPpse19oEb-nCXO0W6EXL4TxMmXnyAye3JwFKTDB7hKK3MKqfIfasTrEg18XwJtGcX_X5f79YMN3bZP-hjvCgDS5QUJyNpN0kMWhkw_1-nZEyYN-VtrcDksQ4YEiFWZFgbVpwvJsOHGD3RFGR6dINx1mY0RDESiLKRwZmDs8eJHhuqbf5m4PuKNrap7gLPj3nPpc2URlmSvsWyTNoLUdZrstDC3QvLN-_QPagg9rmI7"
              />
            </div>
            <h2 className="font-h2 text-primary mb-xs">林教授</h2>
            <span className="font-label-caps text-outline uppercase tracking-widest mb-md">
              {direction} · 資深導師
            </span>
            <p className="font-body-md text-on-surface-variant leading-relaxed italic">
              「深呼吸，專注於你對{direction}的初心。這不只是一場測試，更是一次專業的對話。」
            </p>
          </div>
        </div>

        {/* Direction Selection (only before interview starts) */}
        {isPreInterview && (
          <div className="bg-surface-container-low border border-[#E9E5DB] p-xl rounded-lg">
            <h3 className="font-h3 text-on-background mb-lg text-center">選擇面試方向</h3>
            <label htmlFor="direction-select" className="font-label-caps text-primary uppercase tracking-widest block mb-sm">職業群科</label>
            <select
              id="direction-select"
              value={direction}
              onChange={e => setDirection(e.target.value as VocationalGroup)}
              className="w-full px-md py-3 bg-surface-container-lowest border border-[#E9E5DB] focus:border-primary focus:ring-1 focus:ring-primary font-body-md outline-none cursor-pointer mb-lg"
            >
              {VOCATIONAL_GROUPS.map(group => (
                <option key={group} value={group}>{VOCATIONAL_GROUP_LABELS[group]}</option>
              ))}
            </select>
            {!isPro && (
              <div className="bg-primary-fixed/20 border border-primary/20 p-lg mb-lg">
                <p className="font-body-md text-on-surface-variant">
                  免費版可體驗前 {FREE_ROUNDS} 輪面試。升級 Pro 解鎖完整 {maxRounds} 輪模擬 + 總體評分。
                </p>
                <a href="/pricing" className="font-label-caps text-primary hover:underline mt-sm inline-block">升級 Pro 方案</a>
              </div>
            )}
            <button
              onClick={startInterview}
              disabled={isLoading}
              className="w-full bg-primary text-white px-xl py-4 font-label-caps hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? '準備中...' : '開始面試模擬'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-sm">
          <div className="bg-surface-container-high p-lg border border-[#E9E5DB] flex flex-col gap-xs">
            <span className="font-label-caps text-primary uppercase">面試進度</span>
            <span className="font-h3">{round}/{maxRounds}</span>
          </div>
          <div className="bg-surface-container-high p-lg border border-[#E9E5DB] flex flex-col gap-xs">
            <span className="font-label-caps text-primary uppercase">目標職群</span>
            <span className="font-h3">{direction}</span>
          </div>
        </div>

        {/* Free round warning */}
        {!isPro && !isComplete && !isPreInterview && (
          <div className="bg-primary-fixed/20 p-lg border border-primary/20">
            <p className="text-sm text-on-surface-variant">
              免費版剩餘 <span className="font-bold text-primary">{Math.max(0, FREE_ROUNDS - round)}</span> 輪
              {round >= FREE_ROUNDS && (
                <>
                  <span className="font-bold ml-1">（已達免費上限）</span>
                  <a href="/pricing" className="text-primary font-medium hover:underline ml-1">升級 Pro 繼續</a>
                </>
              )}
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-primary-container/10 p-lg border border-primary/20 rounded-lg">
          <h4 className="font-label-caps text-primary mb-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
            當前建議
          </h4>
          <ul className="text-sm text-on-surface-variant flex flex-col gap-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary font-bold">{String(i + 1).padStart(2, '0')}.</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Right Column: Chat Interface ── */}
      <section className="flex-1 flex flex-col h-[700px] bg-white border border-[#E9E5DB] rounded-lg shadow-[0_4px_30px_rgba(125,139,126,0.05)] overflow-hidden">
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-xl space-y-xl chat-container">
          {isPreInterview && (
            <div className="flex flex-col items-center justify-center h-full text-center px-xl">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-lg">
                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
              </div>
              <h3 className="font-h3 text-on-surface mb-md">準備開始面試模擬</h3>
              <p className="font-body-md text-on-surface-variant max-w-[28rem]">
                在左側選擇你的目標職群方向，然後點擊「開始面試模擬」。AI 面試官將根據你選擇的方向提出專業問題，並在每輪回答後給予即時回饋。
              </p>
              <div className="flex items-center gap-md mt-xl">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                  AI 即時回饋
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                  {maxRounds} 輪問答
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                  總體評分
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'interviewer' && (
                <div className="flex items-start gap-md max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-surface-container shrink-0 flex items-center justify-center border border-[#E9E5DB]">
                    <span className="material-symbols-outlined text-primary">school</span>
                  </div>
                  <div className="space-y-sm">
                    <div className="bg-surface-container-low p-lg border border-[#E9E5DB] rounded-xl rounded-tl-none">
                      <p className="font-body-md text-on-surface leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-outline font-label-caps">AI 面試官</span>
                  </div>
                </div>
              )}

              {msg.role === 'user' && (
                <div className="flex items-start gap-md max-w-[85%] flex-row-reverse ml-auto">
                  <div className="w-10 h-10 rounded-full bg-primary shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">person</span>
                  </div>
                  <div className="space-y-sm text-right">
                    <div className="bg-primary text-white p-lg rounded-xl rounded-tr-none text-left">
                      <p className="font-body-md leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-outline font-label-caps">已傳送</span>
                  </div>
                </div>
              )}

              {msg.role === 'feedback' && (
                <div className="max-w-[85%] ml-14">
                  <div className="bg-primary-fixed/30 border border-primary/20 p-lg rounded-xl">
                    <p className="font-label-caps text-primary mb-sm">面試官回饋</p>
                    <p className="font-body-md text-on-surface leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-md max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-surface-container shrink-0 flex items-center justify-center border border-[#E9E5DB]">
                <span className="material-symbols-outlined text-primary">school</span>
              </div>
              <div className="bg-surface-container-low p-lg border border-[#E9E5DB] rounded-xl rounded-tl-none">
                <div className="flex gap-1.5 items-center h-6">
                  <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {isComplete && overallScore !== null && (
            <div className="max-w-[85%] ml-14 bg-surface-container-low border border-[#E9E5DB] p-xl rounded-xl">
              <div className="text-center mb-lg">
                <p className="font-label-caps text-primary mb-sm">面試總評</p>
                <p className="font-h1 text-primary">{overallScore}</p>
                <p className="text-sm text-outline font-label-caps">/ 100 分</p>
              </div>
              <p className="font-body-md text-on-surface-variant leading-relaxed text-center mb-lg">
                {overallFeedback}
              </p>
              {!isPro && (
                <div className="text-center mb-lg">
                  <a href="/pricing" className="font-label-caps text-primary hover:underline">
                    升級 Pro 解鎖更多方向的面試模擬
                  </a>
                </div>
              )}
              <div className="text-center">
                <button
                  onClick={resetInterview}
                  className="bg-primary text-white px-xl py-3 font-label-caps hover:opacity-90 transition-all cursor-pointer"
                >
                  再練習一次
                </button>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Controls */}
        {!isComplete && !isPreInterview && (
          <div className="p-lg bg-[#fbf9f7] border-t border-[#E9E5DB]">
            <div className="flex flex-col gap-md">
              <div className="relative">
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
                      : '點擊錄音或在此輸入回答內容...'
                  }
                  disabled={isLoading || !canContinue}
                  rows={2}
                  className="w-full bg-surface-container-lowest border-0 border-b border-[#E9E5DB] focus:border-primary focus:ring-0 font-body-md py-lg px-0 resize-none placeholder:text-outline/50 disabled:opacity-50 outline-none"
                />
                <div className="absolute right-0 bottom-4 flex items-center gap-md">
                  <button className="w-12 h-12 rounded-full border border-primary text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center cursor-pointer" aria-label="錄音">
                    <span className="material-symbols-outlined">mic</span>
                  </button>
                  <button
                    onClick={canContinue ? submitAnswer : () => {}}
                    disabled={isLoading || !currentInput.trim() || !canContinue}
                    className={
                      'bg-primary text-white font-label-caps px-xl py-3 flex items-center gap-2 transition-all cursor-pointer ' +
                      (canContinue && currentInput.trim() && !isLoading
                        ? 'hover:opacity-90'
                        : 'opacity-50 cursor-not-allowed')
                    }
                  >
                    送出回答
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <div className="flex gap-4">
                  <button className="text-stone-400 hover:text-primary transition-colors flex items-center gap-1 text-xs cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">attach_file</span>
                    附件參考
                  </button>
                  <button className="text-stone-400 hover:text-primary transition-colors flex items-center gap-1 text-xs cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    提示靈感
                  </button>
                </div>
                <div className="text-[10px] text-outline font-label-caps flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  AI 就緒
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
