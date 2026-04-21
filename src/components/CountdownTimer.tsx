'use client';

import { useState, useEffect } from 'react';
import { NEXT_EXAM_DATE } from '@/data/admission';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = NEXT_EXAM_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

export default function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {[
        { value: time.days, label: '天' },
        { value: time.hours, label: '時' },
        { value: time.minutes, label: '分' },
        { value: time.seconds, label: '秒' }
      ].map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl font-bold tabular-nums text-indigo-600">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs md:text-sm text-gray-500 mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}
