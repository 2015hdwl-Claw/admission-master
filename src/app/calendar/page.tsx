'use client';

import { useState, useEffect, useMemo } from 'react';
import { NATIONAL_CALENDAR_EVENTS, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, LEARNING_CODE_LABELS, LEARNING_CODE_COLORS } from '@/data/national-calendar';
import { loadFromStorage, saveToStorage, generateId } from '@/lib/storage';
import Link from 'next/link';
import type { CalendarEvent, CalendarEventType, LearningCode } from '@/types';

const ALL_LEARNING_CODES: LearningCode[] = ['B','C','D','E','F','G','H','I','J','K','L','M'];

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: 'exam', label: '考試' },
  { value: 'activity', label: '活動' },
  { value: 'competition', label: '競賽' },
  { value: 'other', label: '其他' },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(4);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<CalendarEventType>('activity');
  const [selectedCodes, setSelectedCodes] = useState<LearningCode[]>([]);

  useEffect(() => {
    const stored = loadFromStorage<CalendarEvent[]>('calendar-events', []);
    setEvents(stored);
  }, []);

  function persistEvents(newEvents: CalendarEvent[]) {
    setEvents(newEvents);
    saveToStorage('calendar-events', newEvents);
  }

  function handleAddEvent() {
    if (!title.trim() || !date) return;
    const newEvent: CalendarEvent = {
      id: generateId(),
      title: title.trim(),
      date,
      type,
      isNational: false,
      learningCodes: [...selectedCodes],
    };
    persistEvents([...events, newEvent]);
    setTitle('');
    setDate('');
    setType('activity');
    setSelectedCodes([]);
    setShowForm(false);
  }

  function handleDeleteEvent(id: string) {
    persistEvents(events.filter(e => e.id !== id));
  }

  function toggleCode(code: LearningCode) {
    setSelectedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const allEvents = useMemo(() => {
    return [...NATIONAL_CALENDAR_EVENTS, ...events].sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const monthEvents = useMemo(() => {
    const prefix = viewYear + '-' + String(viewMonth + 1).padStart(2, '0');
    return allEvents.filter(e => e.date.startsWith(prefix));
  }, [allEvents, viewYear, viewMonth]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = formatDate(new Date());

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">校曆同步</h1>
        <p className="text-gray-500">記錄你的校園活動，自動連結學習歷程代碼</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          &larr; 上月
        </button>
        <h2 className="text-xl font-bold text-gray-900">{viewYear}年 {MONTH_NAMES[viewMonth]}</h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          下月 &rarr;
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日','一','二','三','四','五','六'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((day, i) => {
            if (day === null) return <div key={'empty-' + i} className="h-20" />;
            const dateStr = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
            const dayEvents = allEvents.filter(e => e.date === dateStr);
            const isToday = dateStr === today;
            return (
              <div key={dateStr} className={'h-20 border border-gray-50 rounded-lg p-1 overflow-hidden' + (isToday ? ' bg-indigo-50' : '')}>
                <div className={'text-xs font-medium mb-0.5 ' + (isToday ? 'text-indigo-600' : 'text-gray-600')}>{day}</div>
                {dayEvents.slice(0, 2).map(ev => (
                  <div key={ev.id} className={'text-[10px] px-1 py-0.5 rounded truncate ' + EVENT_TYPE_COLORS[ev.type]}>
                    {ev.isNational ? '★' : ''}{ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 2}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
        >
          + 新增活動
        </button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">新增活動</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活動名稱</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例如：校際英文演講比賽"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                <div className="flex gap-2">
                  {EVENT_TYPES.map(et => (
                    <button
                      key={et.value}
                      onClick={() => setType(et.value)}
                      className={'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' + (type === et.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                    >
                      {et.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">學習歷程代碼（可多選）</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_LEARNING_CODES.map(code => (
                    <button
                      key={code}
                      onClick={() => toggleCode(code)}
                      className={'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (selectedCodes.includes(code) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                    >
                      {LEARNING_CODE_LABELS[code]}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddEvent}
                disabled={!title.trim() || !date}
                className={'w-full py-3 rounded-xl font-bold transition-all ' + (title.trim() && date ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
              >
                新增活動
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">本月活動 ({monthEvents.length})</h3>
        {monthEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>這個月還沒有活動</p>
            <p className="text-sm mt-1">點擊上方「新增活動」開始記錄</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + EVENT_TYPE_COLORS[ev.type]}>
                      {EVENT_TYPE_LABELS[ev.type]}
                    </span>
                    {ev.isNational && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">全國</span>
                    )}
                  </div>
                  <div className="font-medium text-gray-900">{ev.title}</div>
                  <div className="text-sm text-gray-500">{ev.date}</div>
                  {ev.learningCodes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ev.learningCodes.map(code => (
                        <span key={code} className="text-[10px] px-1.5 py-0.5 rounded text-white font-medium" style={{ backgroundColor: 'var(--tw-gradient-from)' }}>
                          <span className={'inline-block w-2 h-2 rounded-full mr-1 ' + LEARNING_CODE_COLORS[code]} />
                          {code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!ev.isNational && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ev.learningCodes.length > 0 && (
                      <Link
                        href="/portfolio"
                        onClick={() => {
                          const newPortfolioItem = {
                            id: generateId(),
                            title: ev.title,
                            content: `從校曆活動「${ev.title}」轉換`,
                            code: ev.learningCodes[0],
                            date: ev.date,
                            createdAt: new Date().toISOString(),
                          };
                          const existing = loadFromStorage('portfolio-items', []);
                          saveToStorage('portfolio-items', [newPortfolioItem, ...existing]);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        轉為素材
                      </Link>
                    )}
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-gray-400 hover:text-red-500 text-sm">
                      刪除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation hint */}
      <div className="text-center mt-8 space-x-4">
        <Link href="/portfolio" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          查看我的素材記錄
        </Link>
        <Link href="/timeline" className="text-gray-500 hover:text-gray-700 text-sm">
          成就時光軸
        </Link>
      </div>
    </div>
  );
}
