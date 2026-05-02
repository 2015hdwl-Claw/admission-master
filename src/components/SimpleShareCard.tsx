'use client'

import React, { useState } from 'react'

interface SimpleShareProps {
  title: string
  description: string
  result?: string
  url?: string
  onClose?: () => void
}

export default function SimpleShareCard({ title, description, result, url, onClose }: SimpleShareProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.origin : 'https://admission-master-ecru.vercel.app')

  const shareText = `${title} - ${description} ${result ? `結果：${result}` : ''} ${shareUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async (platform: string) => {
    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title + ' - ' + description)}`
        break
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title + ' - ' + description)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + ' - ' + description)}&url=${encodeURIComponent(shareUrl)}`
        break
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📱 分享給同學
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

      {/* 分享內容預覽 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-4xl">🎓</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">升學大師</h4>
            <p className="text-sm font-medium text-gray-800">{title}</p>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
            {result && (
              <p className="text-sm text-indigo-600 font-medium mt-2">結果：{result}</p>
            )}
          </div>
        </div>
      </div>

      {/* 分享按鈕 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => handleShare('facebook')}
          className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
        >
          <span className="text-2xl mb-1">📘</span>
          <span className="text-xs text-blue-700">FB</span>
        </button>
        <button
          onClick={() => handleShare('line')}
          className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
        >
          <span className="text-2xl mb-1">💬</span>
          <span className="text-xs text-green-700">LINE</span>
        </button>
        <button
          onClick={() => handleShare('twitter')}
          className="flex flex-col items-center p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition"
        >
          <span className="text-2xl mb-1">🐦</span>
          <span className="text-xs text-sky-700">推特</span>
        </button>
        <button
          onClick={handleCopy}
          disabled={copied}
          className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        >
          <span className="text-2xl mb-1">{copied ? '✅' : '📋'}</span>
          <span className="text-xs text-gray-700">{copied ? '已複製' : '複製'}</span>
        </button>
      </div>

      {/* 說明 */}
      <div className="text-center text-sm text-gray-600">
        <p className="mb-2">
          讓同學們也來找到適合的升學方向！
        </p>
        <p className="text-xs text-gray-500">
          🎁 完全免費，讓更多同學受益
        </p>
      </div>
    </div>
  )
}