'use client';

import { useState } from 'react';
import type { ScoreInput as ScoreInputType } from '@/types';
import { SUBJECT_LABELS, MATH_TRACK_LABELS } from '@/data/admission';

interface Props {
  onSubmit: (scores: ScoreInputType) => void;
}

export default function ScoreInput({ onSubmit }: Props) {
  const [scores, setScores] = useState<ScoreInputType>({
    chinese: 0,
    english: 0,
    math: 0,
    science: 0,
    social: 0,
    mathTrack: 'B'
  });

  const updateScore = (subject: keyof Omit<ScoreInputType, 'mathTrack'>, value: number) => {
    setScores(prev => ({ ...prev, [subject]: Math.max(0, Math.min(15, value)) }));
  };

  const canSubmit = [scores.chinese, scores.english, scores.math, scores.science, scores.social].every(v => v > 0);

  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">輸入你的學測成績</h2>
      <p className="text-gray-500 mb-6">輸入各科級分（0-15），系統會幫你分析最適合的升學管道</p>

      <div className="space-y-4">
        {(['chinese', 'english', 'math', 'science', 'social'] as const).map(subject => (
          <div key={subject} className="flex items-center gap-4">
            <label className="w-16 text-sm font-medium text-gray-700 text-right">
              {SUBJECT_LABELS[subject]}
            </label>
            <input
              type="range"
              min={0}
              max={15}
              value={scores[subject]}
              onChange={e => updateScore(subject, parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="w-8 text-center font-bold text-lg text-indigo-600 tabular-nums">
              {scores[subject]}
            </span>
          </div>
        ))}

        <div className="flex items-center gap-4 pt-2">
          <label className="w-16 text-sm font-medium text-gray-700 text-right">數學</label>
          <div className="flex gap-2">
            {(['A', 'B'] as const).map(track => (
              <button
                key={track}
                onClick={() => setScores(prev => ({ ...prev, mathTrack: track }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scores.mathTrack === track
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {MATH_TRACK_LABELS[track]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => canSubmit && onSubmit(scores)}
        disabled={!canSubmit}
        className={`w-full mt-8 py-3 px-6 rounded-xl text-lg font-bold transition-all ${
          canSubmit
            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canSubmit ? '開始分析' : '請輸入所有科目成績'}
      </button>
    </div>
  );
}
