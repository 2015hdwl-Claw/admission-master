// 升學大師 v4 - 能力帳戶頁面
// 顯示學生的能力記錄、統計資料、學習歷程代碼分佈、星圖視覺化和策略引擎

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import AbilityStarChart from '@/components/AbilityStarChart'
import StrategyEngine from '@/components/StrategyEngine'
import AIAnalysisEngine from '@/components/AIAnalysisEngine'
import ParentManagement from '@/components/ParentManagement'
import ShareCardPreview from '@/components/ShareCardPreview'

type AbilityRecord = Database['public']['Tables']['ability_records']['Row']
type StudentProfile = Database['public']['Tables']['student_profiles']['Row']

interface AbilityStats {
  totalRecords: number
  portfolioBreakdown: {
    A: number
    B: number
    C: number
    D: number
  }
  categoryBreakdown: Record<string, number>
  totalBonusPercent: number
}

export default function AbilityAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [records, setRecords] = useState<AbilityRecord[]>([])
  const [stats, setStats] = useState<AbilityStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'starchart' | 'strategy' | 'ai-analysis' | 'parent'>('overview')
  const [showShareCard, setShowShareCard] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // 用戶已登入，取得資料
      await fetchData()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      // 取得當前用戶
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('未登入')
      }

      // 取得學生資料
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // 取得能力記錄
      const { data: recordsData, error: recordsError } = await supabase
        .from('ability_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (recordsError) throw recordsError
      setRecords(recordsData || [])

      // 計算統計資料
      const calculatedStats = calculateStats(recordsData || [], profileData)
      setStats(calculatedStats)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : '載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (records: AbilityRecord[], profile: StudentProfile | null): AbilityStats => {
    const portfolioBreakdown = { A: 0, B: 0, C: 0, D: 0 }
    const categoryBreakdown: Record<string, number> = {}

    records.forEach(record => {
      // 學習歷程代碼分佈
      if (record.portfolio_code) {
        portfolioBreakdown[record.portfolio_code as keyof typeof portfolioBreakdown]++
      }

      // 類別分佈
      if (record.category) {
        categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + 1
      }
    })

    return {
      totalRecords: records.length,
      portfolioBreakdown,
      categoryBreakdown,
      totalBonusPercent: profile?.total_bonus_percent || 0
    }
  }

  const getPortfolioCodeLabel = (code: string) => {
    const labels: Record<string, string> = {
      A: 'A類：專業證照',
      B: 'B類：競賽表現',
      C: 'C類：專題製作',
      D: 'D類：其他表現'
    }
    return labels[code] || code
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '證照': 'bg-blue-500',
      '競賽': 'bg-green-500',
      '專題': 'bg-purple-500',
      '其他': 'bg-gray-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
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
            onClick={fetchData}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">能力帳戶</h1>
              <p className="mt-1 text-gray-600">
                {profile?.group_code && `類群：${profile.group_code}`} •
                {profile?.grade && ` ${profile.grade}年級`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  {stats?.totalRecords || 0}
                </div>
                <div className="text-sm text-gray-600">總記錄數</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium transition ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                總覽
              </button>
              <button
                onClick={() => setActiveTab('starchart')}
                className={`py-4 px-6 text-sm font-medium transition ${
                  activeTab === 'starchart'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                能力星圖
              </button>
              <button
                onClick={() => setActiveTab('strategy')}
                className={`py-4 px-6 text-sm font-medium transition ${
                  activeTab === 'strategy'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                選考策略
              </button>
              <button
                onClick={() => setActiveTab('ai-analysis')}
                className={`py-4 px-6 text-sm font-medium transition ${
                  activeTab === 'ai-analysis'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                AI 分析
              </button>
              <button
                onClick={() => setActiveTab('parent')}
                className={`py-4 px-6 text-sm font-medium transition ${
                  activeTab === 'parent'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                家長管理
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* 總記錄數 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.totalRecords || 0}</div>
                <div className="text-sm text-gray-600">總記錄數</div>
              </div>
            </div>
          </div>

          {/* 總加分百分比 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.totalBonusPercent || 0}%</div>
                <div className="text-sm text-gray-600">總加分百分比</div>
              </div>
            </div>
          </div>

          {/* A類記錄 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                <div className="text-white font-bold">A</div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.portfolioBreakdown.A || 0}</div>
                <div className="text-sm text-gray-600">專業證照</div>
              </div>
            </div>
          </div>

          {/* C類記錄 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-lg p-3">
                <div className="text-white font-bold">C</div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.portfolioBreakdown.C || 0}</div>
                <div className="text-sm text-gray-600">專題製作</div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Achievement */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">分享你的成就！</h3>
              <p className="text-indigo-100">讓朋友看到你的學習歷程成果</p>
            </div>
            <button
              onClick={() => setShowShareCard(true)}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
            >
              生成分享卡片
            </button>
          </div>
        </div>

        {/* 學習歷程代碼分佈 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">學習歷程代碼分佈</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats?.portfolioBreakdown || {}).map(([code, count]) => (
              <div key={code} className="border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-600">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{getPortfolioCodeLabel(code)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 類別分佈 */}
        {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">類別分佈</h2>
            <div className="space-y-3">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)} mr-3`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{category}</span>
                      <span className="text-gray-900 font-semibold">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近記錄 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">最近記錄</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
              + 新增記錄
            </button>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-600">還沒有能力記錄，開始建立你的第一個記錄吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.slice(0, 5).map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(record.category)} text-white`}>
                          {record.category}
                        </span>
                        {record.portfolio_code && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                            {record.portfolio_code}類
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                      {record.description && (
                        <p className="text-gray-600 mt-1 line-clamp-2">{record.description}</p>
                      )}
                      {record.occurred_date && (
                        <p className="text-sm text-gray-500 mt-2">
                          發生日期：{new Date(record.occurred_date).toLocaleDateString('zh-TW')}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}

        {activeTab === 'starchart' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">能力星圖分析</h2>
              <p className="text-gray-600">
                基於你的學習歷程記錄，視覺化呈現你的 8 大能力維度發展狀況
              </p>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⭐</div>
                <p className="text-gray-600">
                  還沒有能力記錄，無法生成星圖分析。開始建立記錄吧！
                </p>
              </div>
            ) : (
              <AbilityStarChart records={records} size={500} />
            )}
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">116 選考策略引擎</h2>
              <p className="text-gray-600">
                AI 分析你的能力分佈，推薦最適合的大學科系和升學策略
              </p>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎯</div>
                <p className="text-gray-600">
                  還沒有能力記錄，無法生成選考策略。開始建立記錄吧！
                </p>
              </div>
            ) : (
              <StrategyEngine
                profile={profile}
                records={records}
              />
            )}
          </div>
        )}

        {activeTab === 'ai-analysis' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 學習歷程深度分析</h2>
              <p className="text-gray-600">
                AI 全方位分析你的學習歷程，提供個人化的成長建議
              </p>
            </div>

            <AIAnalysisEngine
              records={records}
              profile={profile ? {
                group_code: profile.group_code,
                grade: profile.grade?.toString(),
                total_bonus_percent: profile.total_bonus_percent
              } : undefined}
            />
          </div>
        )}

        {activeTab === 'parent' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">家長管理</h2>
              <p className="text-gray-600">
                邀請家長查看您的學習歷程和成長報告
              </p>
            </div>

            <ParentManagement profile={profile} />
          </div>
        )}
      </div>

      {/* Share Card Modal */}
      {showShareCard && (
        <ShareCardPreview
          options={{
            type: 'achievement',
            achievement: `累積了 ${stats?.totalRecords || 0} 項學習歷程記錄`,
            theme: 'default'
          }}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  )
}