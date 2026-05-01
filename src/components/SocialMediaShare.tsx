'use client'

import { useState } from 'react'
import { Share2, Copy, Download } from 'lucide-react'

interface SocialMediaShareProps {
  title: string
  description: string
  imageUrl?: string
  url?: string
  onCopyLink?: () => void
  onDownload?: () => void
}

export default function SocialMediaShare({
  title,
  description,
  imageUrl,
  url = typeof window !== 'undefined' ? window.location.href : '',
  onCopyLink,
  onDownload
}: SocialMediaShareProps) {
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopyLink?.()
  }

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description)

    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=升學大師,學習歷程`
        break
      case 'line':
        shareUrl = `https://line.me/R/msg/text/?${encodedDescription}${encodedUrl}`
        break
      case 'instagram':
        alert('請手動分享到 Instagram Story：\n1. 點擊下載按鈕儲存圖片\n2. 開啟 Instagram\n3. 選擇「分享到貼文」或「建立限時動態」\n4. 選擇剛下載的圖片')
        return
      default:
        return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <Share2 className="w-5 h-5" />
        分享
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMenu(false)}
          />

          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
            <h3 className="font-semibold text-gray-900 mb-3">分享到社群媒體</h3>

            <div className="space-y-2">
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">F</div>
                <span className="text-gray-700">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-5 h-5 bg-sky-500 rounded text-white flex items-center justify-center text-xs font-bold">T</div>
                <span className="text-gray-700">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('line')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-5 h-5 bg-green-500 rounded" />
                <span className="text-gray-700">LINE</span>
              </button>

              <button
                onClick={() => handleShare('instagram')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded" />
                <span className="text-gray-700">Instagram</span>
              </button>

              <div className="border-t border-gray-200 my-2" />

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">
                  {copied ? '已複製連結！' : '複製連結'}
                </span>
              </button>

              {onDownload && (
                <button
                  onClick={onDownload}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">下載圖片</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
