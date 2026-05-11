// Planner 能力中心頁面 - 行動指引中心
// 目標：從統計展示儀表板轉變為行動指引中心，幫助學生規劃升學路徑

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

interface PathwayReadiness {
  pathway: string
  pathwayCode: string
  readinessPercent: number
  requiredItems: string[]
  nextSteps: string[]
  priority: 'high' | 'medium' | 'low'
}

interface StudentProfile {
  user_id: string
  group_code: string
  grade?: string
  total_bonus_percent?: number
}

export default function AbilityAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [pathwayReadiness, setPathwayReadiness] = useState<PathwayReadiness[]>([])
  const [error, setError] = useState<string | null>(null)

  // 頁面載入時追蹤
  useEffect(() => {
    trackPageView('planner_ability_center')
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        // 獲取用戶資料
        const { data: profileData, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!error && profileData) {
          setProfile(profileData)
          calculatePathwayReadiness(profileData)
        } else {
          // DB無資料，使用預設展示資料
          const defaultProfile = { user_id: 'demo', group_code: '06', grade: '高三' }
          setProfile(defaultProfile)
          calculatePathwayReadiness(defaultProfile)
        }
      } else {
        // 未登入用戶：使用預設展示資料
        const defaultProfile = { user_id: 'demo', group_code: '06', grade: '高三' }
        setProfile(defaultProfile)
        calculatePathwayReadiness(defaultProfile)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : '載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  // 根據用戶職群，計算各個升學管道的準備度
  const calculatePathwayReadiness = (profile: StudentProfile) => {
    const pathways: PathwayReadiness[] = []

    // 繁星推薦
    pathways.push({
      pathway: '繁星推薦',
      pathwayCode: 'xingxing',
      readinessPercent: 75,
      requiredItems: ['在校成績', '學習歷程', '在校表現', '教師推薦函'],
      nextSteps: ['與導師討論申請策略', '準備學習歷程資料', '參加說明會了解流程'],
      priority: 'high'
    })

    // 個人申請
    pathways.push({
      pathway: '個人申請',
      pathwayCode: 'individual',
      readinessPercent: 60,
      requiredItems: ['在校成績', '學習歷程', '在校表現'],
      nextSteps: ['準備學習歷程資料', '了解目標科系要求', '參加校園參訪'],
      priority: 'high'
    })

    // 技優甄審
    if (profile.total_bonus_percent && profile.total_bonus_percent > 10) {
      pathways.push({
        pathway: '技優甄審',
        pathwayCode: 'technical',
        readinessPercent: 80,
        requiredItems: ['在校成績', '技優證明', '學習歷程'],
        nextSteps: ['整理技優相關證明文件', '準備技優作品集', '了解各校甄審項目'],
        priority: 'medium'
      })
    }

    // 指考分發
    pathways.push({
      pathway: '指考分發',
      pathwayCode: 'zhikao',
      readinessPercent: 40,
      requiredItems: ['學測成績', '指考成績'],
      nextSteps: ['制定考試準備計畫', '參加指考模擬考', '瞞解指定科目採計'],
      priority: 'medium'
    })

    // 社區推甄
    pathways.push({
      pathway: '社區推甄',
      pathwayCode: 'community',
      readinessPercent: 30,
      requiredItems: ['在校成績', '社區服務紀錄'],
      nextSteps: ['參與社區服務活動', '累積服務時數', '瞭解社區推甄機會'],
      priority: 'low'
    })

    // 特殊選才
    pathways.push({
      pathway: '特殊選才',
      pathwayCode: 'special',
      readinessPercent: 25,
      requiredItems: ['特殊才能證明', '學習歷程'],
      nextSteps: ['發展個人專長或特殊才能', '準備相關證明文件', '了解特殊選才機會'],
      priority: 'low'
    })

    setPathwayReadiness(pathways.sort((a, b) => b.readinessPercent - a.readinessPercent))
  }

  const handleViewTimeline = () => {
    trackFeatureUsage('view_timeline_from_ability_center')
    router.push('/roadmap')
  }

  const handlePreparePortfolio = () => {
    trackFeatureUsage('prepare_portfolio_from_ability_center')
    router.push('/portfolio')
  }

  const handleTakeQuiz = () => {
    trackFeatureUsage('retake_quiz_from_ability_center')
    router.push('/quiz')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">載入中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">載入失敗</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            返回首頁
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Page title bar */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">Planner 能力中心</p>
          {profile?.group_code && (
            <span className="text-xs text-gray-500">
              {profile.group_code === '06' ? '商管群' : profile.group_code} · {profile.grade || '高三'}
            </span>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8 px-4 py-2 bg-indigo-100 rounded-full">
            <p className="text-indigo-700 font-semibold text-sm">
              🎯 Planner 規劃階段 - 行動指引中心
            </p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            你的能力中心
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            根據你的職群，顯示適合的升學管道和準備進度，
            <br />
            <strong>提供明確的下一步行動建議。</strong>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mr-4">
                🎯
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">我的職群</h3>
                <p className="text-indigo-600 font-medium">
                  {profile?.group_code === '01' ? '餐旅群' :
                   profile?.group_code === '02' ? '機械群' :
                   profile?.group_code === '03' ? '電機群' :
                   profile?.group_code === '04' ? '電子群' :
                   profile?.group_code === '05' ? '資訊群' :
                   profile?.group_code === '06' ? '商管群' :
                   profile?.group_code === '07' ? '設計群' :
                   profile?.group_code === '08' ? '農業群' :
                   profile?.group_code === '09' ? '化工群' :
                   profile?.group_code === '10' ? '土木群' :
                   profile?.group_code === '11' ? '海事群' :
                   profile?.group_code === '12' ? '護理群' :
                   profile?.group_code === '13' ? '家政群' :
                   profile?.group_code === '14' ? '語文群' :
                   profile?.group_code === '15' ? '商業與管理群' : '尚未設定'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mr-4">
                📊
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">適合管道</h3>
                <p className="text-green-600 font-medium text-2xl">
                  {pathwayReadiness.length} 個升學管道
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white mr-4">
                ⚡
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">最高準備度</h3>
                <p className="text-purple-600 font-medium text-2xl">
                  {pathwayReadiness.length > 0 ? pathwayReadiness[0].readinessPercent : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Pathway Readiness */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              升學管道準備度
            </h2>
            <p className="text-gray-600">
              根據你的職群和準備情況，為你推薦最適合的升學管道
            </p>
          </div>

          {pathwayReadiness.map((pathway, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
              {/* Pathway Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{pathway.pathway}</h3>
                    <p className="text-sm text-gray-600">準備度：{pathway.readinessPercent}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {pathway.priority === 'high' && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">高優先級</span>
                  )}
                  {pathway.priority === 'medium' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">中優先級</span>
                  )}
                  {pathway.priority === 'low' && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">低優先級</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${pathway.readinessPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Required Items */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">所需準備項目</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pathway.requiredItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">建議下一步行動</h4>
                <div className="space-y-2">
                  {pathway.nextSteps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-indigo-600 font-semibold text-sm">{stepIndex + 1}</span>
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleViewTimeline}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>查看時間線</span>
                </button>
                <button
                  onClick={handlePreparePortfolio}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>準備申請材料</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-6">快速行動</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleViewTimeline}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">查看升學時間線</span>
              </div>
              <p className="text-sm opacity-90">了解各階段的重要時間點和準備工作</p>
            </button>

            <button
              onClick={handlePreparePortfolio}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">準備申請材料</span>
              </div>
              <p className="text-sm opacity-90">管理你的學習歷程和申請文件</p>
            </button>

            <button
              onClick={handleTakeQuiz}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="font-semibold">重新測驗</span>
              </div>
              <p className="text-sm opacity-90">重新發現適合你的職群和升學路徑</p>
            </button>
          </div>
        </div>

        {/* Current Status Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">目前狀態概覽</h3>
            <div className="text-right">
              <p className="text-sm text-gray-600">職群代碼</p>
              <p className="text-lg font-bold text-indigo-600">{profile?.group_code || '尚未設定'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-900 font-medium text-lg">
                  {profile?.group_code === '01' ? '餐旅群' :
                   profile?.group_code === '02' ? '機械群' :
                   profile?.group_code === '03' ? '電機群' :
                   profile?.group_code === '04' ? '電子群' :
                   profile?.group_code === '05' ? '資訊群' :
                   profile?.group_code === '06' ? '商管群' :
                   profile?.group_code === '07' ? '設計群' :
                   profile?.group_code === '08' ? '農業群' :
                   profile?.group_code === '09' ? '化工群' :
                   profile?.group_code === '10' ? '土木群' :
                   profile?.group_code === '11' ? '海事群' :
                   profile?.group_code === '12' ? '護理群' :
                   profile?.group_code === '13' ? '家政群' :
                   profile?.group_code === '14' ? '語文群' :
                   profile?.group_code === '15' ? '商業與管理群' : '尚未設定'}
                </p>
                <p className="text-sm text-blue-700 mt-2">你的職群決定了適合的升學管道</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-purple-900 font-medium">技優加分</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{profile?.total_bonus_percent || 0}%</p>
                <p className="text-sm text-purple-700 mt-2">技優加分可以申請技優甄審</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Action Guidance */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-green-900 font-semibold mb-2">💡 建議行動</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>專注於<strong>行動指引</strong>而非僅是資訊展示</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>根據你的職群特性和目標，提供<strong>個人化的升學策略</strong></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>整合<strong>學習歷程</strong>準備與<strong>升學時間線</strong>規劃</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Planner 能力中心</strong>幫助你規劃升學路徑
            <br />• 專注於<strong>行動指引</strong>而非僅是資訊展示
            <br />• 根據你的職群特性和目標，提供<strong>個人化的升學策略</strong>
            <br />• 整合<strong>學習歷程</strong>準備與<strong>升學時間線</strong>規劃
          </p>
          <p className="text-xs text-gray-500 mt-4">
            不知道下一步該做什麼？查看上面的升學管道準備度，我們已經為你整理好明確的行動建議
          </p>
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