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
  { value: 'certification', label: '技能檢定' },
  { value: 'capstone', label: '專題實作' },
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

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(4);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<CalendarEventType>('activity');
  const [selectedCodes, setSelectedCodes] = useState<LearningCode[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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

  // Calendar cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  // Upcoming events (next 30 days from today)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const limit = new Date(now);
    limit.setDate(limit.getDate() + 30);
    const limitStr = formatDate(limit);
    return allEvents.filter(e => e.date >= formatDate(now) && e.date <= limitStr).slice(0, 5);
  }, [allEvents]);

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return allEvents.filter(e => e.date === selectedDay);
  }, [allEvents, selectedDay]);

  // Countdown to next event
  const nextEvent = upcomingEvents[0];
  const countdown = useMemo(() => {
    if (!nextEvent) return null;
    const now = new Date();
    const target = new Date(nextEvent.date + 'T23:59:59');
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  }, [nextEvent]);

  const YEAR_NAMES = ['零','一','二','三','四','五','六','七','八','九'];
  function yearToChinese(y: number) {
    return y.toString().split('').map(d => YEAR_NAMES[parseInt(d)] || d).join('');
  }
  const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  return (
    <div className="page-container">
      {/* Header */}
      <section className="mb-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md border-l-4 border-primary pl-lg py-sm">
          <div>
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest block mb-xs">01 / CALENDAR</span>
            <h2 className="font-h1 text-h1 text-on-surface">二零{yearToChinese(viewYear)}年 · {MONTH_NAMES[viewMonth]}</h2>
          </div>
          <div className="flex gap-sm">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Calendar + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-xxl">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E9E5DB] p-sm md:p-md">
          <div className="grid grid-cols-7 gap-px bg-[#E9E5DB]">
            {/* Weekdays */}
            {WEEKDAY_LABELS.map(d => (
              <div key={d} className="bg-surface-container-low py-md text-center">
                <span className="font-label-caps text-label-caps text-on-surface-variant">{d}</span>
              </div>
            ))}
            {/* Days */}
            {calendarCells.map((day, i) => {
              if (day === null) {
                // Fill prev month days
                const prevMonthDays = i;
                const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
                const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
                const prevDaysCount = getDaysInMonth(prevY, prevM);
                const showDay = prevDaysCount - firstDay + prevMonthDays + 1;
                return (
                  <div key={'empty-' + i} className="bg-white min-h-[100px] md:min-h-[140px] p-2 opacity-30 flex flex-col items-end">
                    <span className="font-body-md text-body-md">{showDay}</span>
                  </div>
                );
              }
              const dateStr = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
              const dayEvents = allEvents.filter(e => e.date === dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDay;
              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                  className={`min-h-[100px] md:min-h-[140px] p-2 flex flex-col items-end group hover:bg-surface-container transition-colors cursor-pointer ${
                    isToday ? 'bg-surface-container-lowest border-2 border-primary' : isSelected ? 'bg-primary-fixed/10' : 'bg-white'
                  }`}
                >
                  <span className={`font-body-md text-body-md ${isToday ? 'font-bold text-primary' : ''}`}>{day}</span>
                  {isToday && <span className="text-[10px] uppercase font-bold text-primary mt-xs">Today</span>}
                  {dayEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className="mt-xs w-full flex flex-col gap-1">
                      <span className={`text-[10px] md:text-[12px] px-1 border-l-2 truncate ${
                        ev.isNational ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary' : 'bg-secondary-container text-on-secondary-container border-secondary'
                      }`}>
                        {ev.title}
                      </span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-outline px-1 mt-xs">+{dayEvents.length - 2}</div>
                  )}
                </div>
              );
            })}
            {/* Next month padding */}
            {Array.from({ length: (7 - (calendarCells.length % 7)) % 7 }, (_, i) => {
              const showDay = i + 1;
              return (
                <div key={'next-' + i} className="bg-white min-h-[100px] md:min-h-[140px] p-2 opacity-30 flex flex-col items-end">
                  <span className="font-body-md text-body-md">{showDay}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Bento Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Upcoming Event */}
          {nextEvent && countdown ? (
            <div className="bg-primary p-xl text-white">
              <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-widest block mb-sm">UPCOMING EVENT</span>
              <h3 className="font-h3 text-h3 mb-md">{nextEvent.title}</h3>
              <p className="font-body-md text-primary-fixed opacity-90 mb-xl">
                {nextEvent.isNational ? '全國性重要日期' : '請提前準備相關事項。'}
              </p>
              <div className="flex items-center gap-md">
                <div className="flex flex-col">
                  <span className="font-h2 text-h2 leading-none">{String(countdown.days).padStart(2, '0')}</span>
                  <span className="font-label-caps text-[10px] opacity-70">DAYS</span>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="flex flex-col">
                  <span className="font-h2 text-h2 leading-none">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="font-label-caps text-[10px] opacity-70">HOURS</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-primary p-xl text-white">
              <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-widest block mb-sm">UPCOMING EVENT</span>
              <h3 className="font-h3 text-h3 mb-md">暫無近期活動</h3>
              <p className="font-body-md text-primary-fixed opacity-90 mb-xl">
                點擊下方按鈕新增活動到你的校曆。
              </p>
            </div>
          )}

          {/* Selected Day Events or Event List */}
          {selectedDay ? (
            <div className="bg-[#F4F1EA] p-xl border border-[#E9E5DB]">
              <h3 className="font-h3 text-h3 mb-xl border-b border-[#E9E5DB] pb-sm">
                {selectedDay.slice(5)} 活動
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p className="font-body-md text-on-surface-variant">這天沒有活動</p>
              ) : (
                <ul className="flex flex-col gap-lg">
                  {selectedDayEvents.map(ev => (
                    <li key={ev.id} className="group">
                      <div className="flex items-start gap-md">
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            ev.isNational ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-secondary-container text-on-secondary-container'
                          }`}>
                            {EVENT_TYPE_LABELS[ev.type]}
                          </span>
                          <div className={`w-1 h-1 rounded-full mt-1 ${ev.isNational ? 'bg-primary' : 'bg-secondary'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-body-lg font-semibold group-hover:text-primary transition-colors">{ev.title}</h4>
                          <p className="text-on-surface-variant text-sm mt-1">
                            {ev.isNational ? '全國性活動' : '自訂活動'}
                          </p>
                          {!ev.isNational && (
                            <button onClick={() => handleDeleteEvent(ev.id)} className="text-error text-xs mt-1 hover:underline cursor-pointer">刪除</button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setSelectedDay(null)} className="w-full mt-xl py-md border border-primary text-primary font-label-caps hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer">
                返回近期時程
              </button>
            </div>
          ) : (
            <div className="bg-[#F4F1EA] p-xl border border-[#E9E5DB]">
              <h3 className="font-h3 text-h3 mb-xl border-b border-[#E9E5DB] pb-sm">近期時程</h3>
              {upcomingEvents.length === 0 ? (
                <p className="font-body-md text-on-surface-variant">近期沒有活動</p>
              ) : (
                <ul className="flex flex-col gap-lg">
                  {upcomingEvents.map(ev => (
                    <li key={ev.id} className="group cursor-pointer">
                      <div className="flex items-start gap-md">
                        <div className="flex flex-col items-center">
                          <span className="font-serif font-bold text-primary">{ev.date.slice(5)}</span>
                          <div className={`w-1 h-1 rounded-full mt-1 ${ev.isNational ? 'bg-primary' : 'bg-secondary'}`} />
                        </div>
                        <div>
                          <h4 className="font-body-lg font-semibold group-hover:text-primary transition-colors">{ev.title}</h4>
                          <p className="text-on-surface-variant text-sm mt-1">
                            {ev.isNational ? '全國性活動' : '自訂活動'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Button */}
      <div className="flex justify-center mb-xl">
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-xl py-sm font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm align-middle mr-2">add</span>
          新增活動
        </button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-low border border-[#E9E5DB] p-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-h3 text-h3 text-on-surface">新增活動</h2>
              <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-background text-2xl cursor-pointer" aria-label="關閉">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">活動名稱</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：校際英文演講比賽"
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">日期</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E9E5DB] text-on-surface font-body-md outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">類型</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map(et => (
                    <button key={et.value} onClick={() => setType(et.value)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        type === et.value ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}>
                      {et.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-primary mb-2 tracking-widest">學習歷程代碼（可多選）</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_LEARNING_CODES.map(code => (
                    <button key={code} onClick={() => toggleCode(code)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        selectedCodes.includes(code) ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}>
                      {LEARNING_CODE_LABELS[code]}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddEvent} disabled={!title.trim() || !date}
                className={`w-full py-3 rounded-md font-label-caps text-label-caps tracking-widest transition-all cursor-pointer ${
                  title.trim() && date ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-container-high text-outline cursor-not-allowed'
                }`}>
                新增活動
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation hint */}
      <div className="text-center mt-8 space-x-4">
        <Link href="/portfolio" className="text-primary hover:text-primary text-sm font-medium cursor-pointer">
          查看我的素材記錄
        </Link>
        <Link href="/timeline" className="text-on-surface-variant hover:text-on-background text-sm cursor-pointer">
          成就時光軸
        </Link>
      </div>
    </div>
  );
}
