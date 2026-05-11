// 升學大師 v2.0 - Explorer 主題首頁
// 重新定位：從「學習歷程管理」轉變為「升學路徑發現引擎」

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    trackPageView('homepage_v2_explorer')
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartDiscovery = () => {
    trackFeatureUsage('start_discovery_click', { has_user: !!user })
    router.push('/first-discovery')
  }

  const handleExploreGroups = () => {
    trackFeatureUsage('explore_groups_click')
    router.push('/explore')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">升學大師 v2.0</span>
                <p className="text-xs text-indigo-600 font-medium">升學路徑發現引擎</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 text-sm">{user.email?.split('@')[0]}</span>
                  <button
                    onClick={() => router.push('/ability-account')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    我的能力帳戶
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="text-gray-700 hover:text-indigo-600 transition text-sm font-medium"
                  >
                    登入
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    免費註冊
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Explorer Theme */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Attention Grabber */}
          <div className="inline-block mb-8 px-4 py-2 bg-indigo-100 rounded-full">
            <p className="text-indigo-700 font-semibold text-sm">
              🚨 99% 的高職生不知道自己有這些選擇
            </p>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            你以為只有<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              聯考和推甄這兩條路？
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            <strong>其實你有 6 種升學管道。</strong>多數高職生只知道聯考和推甄，
            錯過了原本可以申請的夢想校系。<strong>3 分鐘發現你的潛在路徑</strong>，不再遺憾。
          </p>

          {/* Primary CTA */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={handleStartDiscovery}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 shadow-lg text-lg"
            >
              {user ? '🔍 發現我的升學路徑' : '🚀 開始免費發現之旅'}
            </button>
            <button
              onClick={handleExploreGroups}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold border-2 border-gray-200 hover:border-indigo-300 transition text-lg"
            >
              👥 看看我的職群
            </button>
          </div>

          {/* 6 Pathways Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto shadow-sm border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 你不知道的 6 種升學管道</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-100">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-bold text-gray-900 mb-1">繁星推薦</h3>
                <p className="text-sm text-gray-600">校內推薦升學</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-bold text-gray-900 mb-1">個人申請</h3>
                <p className="text-sm text-gray-600">備審+口試評比</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-bold text-gray-900 mb-1">指考分發</h3>
                <p className="text-sm text-gray-600">統一入學考試</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-100">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-bold text-gray-900 mb-1">技優甄審</h3>
                <p className="text-sm text-gray-600">技藝優秀甄審</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-100">
                <div className="text-2xl mb-2">⭐</div>
                <h3 className="font-bold text-gray-900 mb-1">社區推甄</h3>
                <p className="text-sm text-gray-600">社區高中推薦</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-100">
                <div className="text-2xl mb-2">🎓</div>
                <h3 className="font-bold text-gray-900 mb-1">特殊選才</h3>
                <p className="text-sm text-gray-600">特殊才能入學</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              <strong>不知道哪個適合你？</strong> 3 分鐘免費測試，立即發現最適合的升學路徑！
            </p>
          </div>

          {/* Success Stories Preview */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">🎓 真實成功案例</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    陳
                  </div>
                  <div className="ml-3">
                    <p className="font-bold text-gray-900">陳同學 • 電子群</p>
                    <p className="text-sm text-gray-600">原本只知道聯考</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  「以為只能拼命考指考，後來發現有繁星推薦，用我的專題競賽成果申請上了台灣科大！」
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                    林
                  </div>
                  <div className="ml-3">
                    <p className="font-bold text-gray-900">林同學 • 設計群</p>
                    <p className="text-sm text-gray-600">發現特殊選才機會</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  「完全不知道有特殊選才這條路，用我的設計作品集申請上了實踐大學工業設計！」
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 max-w-4xl mx-auto border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 3 分鐘發現流程</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-600 shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-gray-900 mb-2">選擇職群</h3>
                <p className="text-sm text-gray-600">15 個職群，找到你屬於哪一個</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-600 shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-gray-900 mb-2">發現路徑</h3>
                <p className="text-sm text-gray-600">AI 分析你的潛在升學管道</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-600 shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-gray-900 mb-2">開始行動</h3>
                <p className="text-sm text-gray-600">獲得個人化升學建議</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">15</div>
              <div className="text-gray-600 text-sm">職群類別</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">6</div>
              <div className="text-gray-600 text-sm">升學管道</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">100+</div>
              <div className="text-gray-600 text-sm">成功案例</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-gray-600 text-sm">免費使用</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 升學大師 v2.0 • 讓每個高職生都找到最適合的升學路徑</p>
          </div>
        </div>
      </footer>
    </div>
  )
}