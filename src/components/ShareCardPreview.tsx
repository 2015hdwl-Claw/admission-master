'use client'

import { useState, useEffect } from 'react'
import { generateShareCard, type ShareCardOptions } from '@/lib/share-card-generator'
import SocialMediaShare from './SocialMediaShare'
import { Download, Share2 } from 'lucide-react'

interface ShareCardPreviewProps {
  options: ShareCardOptions
  onClose?: () => void
}

export default function ShareCardPreview({ options, onClose }: ShareCardPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateCard()
  }, [options])

  const generateCard = async () => {
    try {
      setLoading(true)
      setError(null)
      const url = await generateShareCard(options)
      setImageUrl(url)
    } catch (err) {
      console.error('Error generating share card:', err)
      setError('生成分享卡片失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `升學大師-${options.type}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-700">生成分享卡片中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">生成失敗</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">分享你的成就</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Share Card Preview */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <img
              src={imageUrl}
              alt="Share Card"
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Share Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SocialMediaShare
              title="升學大師 - 我的學習歷程"
              description="看看我在升學大師的學習成果！"
              imageUrl={imageUrl}
              onDownload={handleDownload}
            />

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-5 h-5" />
              下載圖片
            </button>

            <button
              onClick={generateCard}
              className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              重新生成
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">分享建議</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Instagram Story：下載圖片後直接上傳分享</li>
              <li>• Facebook/Twitter：使用上方按鈕一鍵分享</li>
              <li>• LINE：分享給親友查看你的學習歷程</li>
              <li>• 預設匿名分享，保護個人隱私</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}