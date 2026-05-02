import BusinessStrategyEngine from '@/components/BusinessStrategyEngine'

export const metadata = {
  title: '找到適合你的商管科系 | 升學大師',
  description: '簡單幾個問題，幫你找到最適合的商管類科系',
}

export default function BusinessStrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                🎯 找到適合你的商管科系
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                簡單 8 個問題，幫你找到最適合的商管類科系 🚀
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              返回首頁
            </a>
          </div>
        </div>
      </div>

      {/* 引導說明 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h2 className="font-semibold text-blue-900 mb-2">三分鐘瞭解你的優勢</h2>
              <p className="text-blue-800 text-sm">
                不需要準備，憑直覺回答就好！我們會根據你的回答，推薦最適合你的商管科系，包含會計、財金、行銷、企管等 7 個熱門科系。
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <BusinessStrategyEngine />
      </div>
    </div>
  )
}