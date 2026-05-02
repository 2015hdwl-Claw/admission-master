'use client'

import React, { useState } from 'react'

interface FeedbackProps {
  type: 'business-strategy' | 'quiz' | 'general'
  onClose?: () => void
}

export default function StudentFeedback({ type, onClose }: FeedbackProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 這裡可以連接到後端 API 或 Google Sheets
      console.log('Feedback submitted:', { type, rating, feedback })

      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubmitted(true)
      setTimeout(() => {
        onClose?.()
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          感謝你的反饋！
        </h3>
        <p className="text-green-700 text-sm">
          你的意見對我們很重要，會幫助我們做得更好。
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {type === 'business-strategy' ? '商管科系推薦' : '職群測驗'}反饋
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 評分星星 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            你覺得這個功能怎麼樣？
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <span className="material-symbols-outlined">
                  {star <= rating ? 'star' : 'star_border'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 文字反饋 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            有什麼建議嗎？（選填）
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="例如：問題很清楚、結果很準確、希望能有更多說明..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* 快速反饋選項 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            你最喜歡什麼？（可多選）
          </label>
          <div className="space-y-2">
            {[
              '問題容易理解',
              '結果很準確',
              '介面很友善',
              '操作很簡單',
              '學到很多東西'
            ].map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFeedback(prev => prev ? `${prev}, ${option}` : option)
                    } else {
                      setFeedback(prev => prev.replace(`, ${option}`, '').replace(option, ''))
                    }
                  }}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 提交按鈕 */}
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? '提交中...' : '提交反饋'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          你的反饋會幫助我們改善，讓更多同學受益 🙏
        </p>
      </div>
    </div>
  )
}
