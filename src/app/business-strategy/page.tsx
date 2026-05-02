import BusinessStrategyEngine from '@/components/BusinessStrategyEngine'

export const metadata = {
  title: '商管群科系推薦引擎 | 升學大師',
  description: '8維度能力評分系統，精準推薦最適合你的商管科系',
}

export default function BusinessStrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">商管群科系推薦引擎</h1>
              <p className="text-gray-600 mt-2">
                基於 8 維度能力評分，精準推薦最適合你的商管科系
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              返回首頁
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BusinessStrategyEngine />
      </div>
    </div>
  )
}