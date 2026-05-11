// 升學路徑時間線頁面 - Planner 規劃工具
// 目標：從個人歷程時間線轉變為升學路徑時間線，幫助學生掌握重要時間點

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

interface StudentProfile {
  user_id: string
  group_code: string
  grade?: string
  total_bonus_percent?: number
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  pathway: string
  importance: 'critical' | 'high' | 'medium' | 'low'
  completed: boolean
  category: 'deadline' | 'preparation' | 'milestone' | 'opportunity'
}

interface PathwayTimeline {
  pathway: string
  pathwayCode: string
  events: TimelineEvent[]
  color: string
  active: boolean
}

export default function RoadmapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [pathwayTimelines, setPathwayTimelines] = useState<PathwayTimeline[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPathway, setSelectedPathway] = useState<PathwayTimeline | null>(null)

  // 頁面載入時追蹤
  useEffect(() => {
    trackPageView('planner_admission_timeline')
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 獲取用戶資料
      const { data: profileData, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setProfile(profileData)

      // 生成升學路徑時間線
      generateAdmissionTimelines(profileData)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : '載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  // 根據用戶年級和職群，生成升學路徑時間線
  const generateAdmissionTimelines = (profile: StudentProfile) => {
    const currentYear = new Date().getFullYear()
    const timelines: PathwayTimeline[] = []

    // 繁星推薦時間線
    const xingxingEvents: TimelineEvent[] = [
      {
        id: 'xingxing_1',
        date: `${currentYear}-09`,
        title: '9月：開始準備',
        description: '與導師討論申請策略，確認目標科系，開始整理學習歷程資料',
        pathway: '繁星推薦',
        importance: 'high',
        completed: false,
        category: 'preparation'
      },
      {
        id: 'xingxing_2',
        date: `${currentYear}-10`,
        title: '10月：完成推薦',
        description: '取得導師推薦函，完成在校成績與表現紀錄整理',
        pathway: '繁星推薦',
        importance: 'critical',
        completed: false,
        category: 'deadline'
      },
      {
        id: 'xingxing_3',
        date: `${currentYear}-11`,
        title: '11月：提交申請',
        description: '提交繁星推薦申請，系統開始進行資格審查與分發',
        pathway: '繁星推薦',
        importance: 'critical',
        completed: false,
        category: 'deadline'
      },
      {
        id: 'xingxing_4',
        date: `${currentYear}-12`,
        title: '12月：結果公布',
        description: '繁星推薦錄取結果公布，確認錄取學校與科系',
        pathway: '繁星推薦',
        importance: 'critical',
        completed: false,
        category: 'milestone'
      }
    ]

    timelines.push({
      pathway: '繁星推薦',
      pathwayCode: 'xingxing',
      events: xingxingEvents,
      color: 'from-blue-500 to-indigo-600',
      active: true
    })

    // 個人申請時間線
    const individualEvents: TimelineEvent[] = [
      {
        id: 'individual_1',
        date: `${currentYear}-09`,
        title: '9月：資料準備',
        description: '開始準備學習歷程、在校成績、表現紀錄等申請資料',
        pathway: '個人申請',
        importance: 'high',
        completed: false,
        category: 'preparation'
      },
      {
        id: 'individual_2',
        date: `${currentYear}-11`,
        title: '11月：第一階段申請',
        description: '個人申請第一階段開始，提交基本資料與學習歷程',
        pathway: '個人申請',
        importance: 'critical',
        completed: false,
        category: 'deadline'
      },
      {
        id: 'individual_3',
        date: `${currentYear}-12`,
        title: '12月：第一階段結果',
        description: '個人申請第一階段結果公布，了解分發情況',
        pathway: '個人申請',
        importance: 'high',
        completed: false,
        category: 'milestone'
      },
      {
        id: 'individual_4',
        date: `${currentYear + 1}-01`,
        title: '1月：第二階段申請',
        description: '個人申請第二階段，針對未錄取的科系進行補申請',
        pathway: '個人申請',
        importance: 'medium',
        completed: false,
        category: 'opportunity'
      }
    ]

    timelines.push({
      pathway: '個人申請',
      pathwayCode: 'individual',
      events: individualEvents,
      color: 'from-green-500 to-emerald-600',
      active: true
    })

    // 技優甄審時間線
    if (profile.total_bonus_percent && profile.total_bonus_percent > 10) {
      const technicalEvents: TimelineEvent[] = [
        {
          id: 'technical_1',
          date: `${currentYear}-09`,
          title: '9月：技優文件整理',
          description: '整理技優加分證明、技能競賽獲獎紀錄等相關文件',
          pathway: '技優甄審',
          importance: 'high',
          completed: false,
          category: 'preparation'
        },
        {
          id: 'technical_2',
          date: `${currentYear}-11`,
          title: '11月：技優申請',
          description: '提交技優甄審申請，上傳技優相關證明文件',
          pathway: '技優甄審',
          importance: 'critical',
          completed: false,
          category: 'deadline'
        },
        {
          id: 'technical_3',
          date: `${currentYear}-12`,
          title: '12月：技優面試',
          description: '參加技優甄審面試，展示專業技能與作品',
          pathway: '技優甄審',
          importance: 'high',
          completed: false,
          category: 'milestone'
        }
      ]

      timelines.push({
        pathway: '技優甄審',
        pathwayCode: 'technical',
        events: technicalEvents,
        color: 'from-purple-500 to-pink-600',
        active: true
      })
    }

    // 指考分發時間線
    const zhikaoEvents: TimelineEvent[] = [
      {
        id: 'zhikao_1',
        date: `${currentYear}-09`,
        title: '9月：開始準備指考',
        description: '制定指考準備計畫，開始系統化複習指定科目',
        pathway: '指考分發',
        importance: 'high',
        completed: false,
        category: 'preparation'
      },
      {
        id: 'zhikao_2',
        date: `${currentYear}-12`,
        title: '12月：學測報名',
        description: '完成學測報名手續，確認考試科目與時間',
        pathway: '指考分發',
        importance: 'critical',
        completed: false,
        category: 'deadline'
      },
      {
        id: 'zhikao_3',
        date: `${currentYear + 1}-01`,
        title: '1月：學測考試',
        description: '參加學測考試，發揮最佳水準',
        pathway: '指考分發',
        importance: 'critical',
        completed: false,
        category: 'milestone'
      },
      {
        id: 'zhikao_4',
        date: `${currentYear + 1}-03`,
        title: '3月：指考報名',
        description: '完成指考報名，選擇指定考科',
        pathway: '指考分發',
        importance: 'high',
        completed: false,
        category: 'deadline'
      },
      {
        id: 'zhikao_5',
        date: `${currentYear + 1}-07`,
        title: '7月：指考考試',
        description: '參加指定科目考試',
        pathway: '指考分發',
        importance: 'critical',
        completed: false,
        category: 'milestone'
      }
    ]

    timelines.push({
      pathway: '指考分發',
      pathwayCode: 'zhikao',
      events: zhikaoEvents,
      color: 'from-orange-500 to-red-600',
      active: true
    })

    // 社區推甄時間線
    const communityEvents: TimelineEvent[] = [
      {
        id: 'community_1',
        date: `${currentYear}-09`,
        title: '9月：社區服務規劃',
        description: '規劃並參與社區服務活動，累積服務時數與經驗',
        pathway: '社區推甄',
        importance: 'medium',
        completed: false,
        category: 'preparation'
      },
      {
        id: 'community_2',
        date: `${currentYear}-11`,
        title: '11月：服務紀錄整理',
        description: '整理社區服務紀錄、心得感想等申請資料',
        pathway: '社區推甄',
        importance: 'medium',
        completed: false,
        category: 'preparation'
      },
      {
        id: 'community_3',
        date: `${currentYear}-12`,
        title: '12月：社區推甄申請',
        description: '提交社區推甄申請，附上服務紀錄與心得',
        pathway: '社區推甄',
        importance: 'medium',
        completed: false,
        category: 'deadline'
      }
    ]

    timelines.push({
      pathway: '社區推甄',
      pathwayCode: 'community',
      events: communityEvents,
      color: 'from-teal-500 to-cyan-600',
      active: false
    })

    // 特殊選才時間線
    const specialEvents: TimelineEvent[] = [
      {
        id: 'special_1',
        date: `${currentYear}-09`,
        title: '9月：專長發展',
        description: '持續發展個人專長或特殊才能，準備相關作品或成果',
        pathway: '特殊選才',
        importance: 'medium',
        completed: false,
        category: 'preparation'
      },
      {
        id: 'special_2',
        date: `${currentYear}-11`,
        title: '11月：特殊選才申請',
        description: '提交特殊選才申請，準備作品展示與說明',
        pathway: '特殊選才',
        importance: 'medium',
        completed: false,
        category: 'deadline'
      },
      {
        id: 'special_3',
        date: `${currentYear}-12`,
        title: '12月：特殊選才甄試',
        description: '參加特殊選才甄試，展示特殊才能',
        pathway: '特殊選才',
        importance: 'medium',
        completed: false,
        category: 'milestone'
      }
    ]

    timelines.push({
      pathway: '特殊選才',
      pathwayCode: 'special',
      events: specialEvents,
      color: 'from-yellow-500 to-amber-600',
      active: false
    })

    setPathwayTimelines(timelines)
  }

  const handleToggleEvent = (pathwayIndex: number, eventId: string) => {
    const updatedTimelines = [...pathwayTimelines]
    const timeline = updatedTimelines[pathwayIndex]
    const event = timeline.events.find(e => e.id === eventId)
    if (event) {
      event.completed = !event.completed
      setPathwayTimelines(updatedTimelines)
      trackFeatureUsage('toggle_timeline_event_completion')
    }
  }

  const handleViewPathwayDetails = (pathway: PathwayTimeline) => {
    setSelectedPathway(pathway)
    trackFeatureUsage('view_pathway_timeline_details')
  }

  const handleCloseModal = () => {
    setSelectedPathway(null)
  }

  const handleGoToAbilityCenter = () => {
    trackFeatureUsage('go_to_ability_center_from_roadmap')
    router.push('/ability-account')
  }

  const handleGoToPortfolio = () => {
    trackFeatureUsage('go_to_portfolio_from_roadmap')
    router.push('/portfolio')
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deadline': return '⏰'
      case 'preparation': return '📝'
      case 'milestone': return '🎯'
      case 'opportunity': return '💡'
      default: return '📌'
    }
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
            onClick={() => router.push('/login')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            返回登入
          </button>
        </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">升學大師 v2.0</span>
                <p className="text-xs text-indigo-600 font-medium">升學路徑時間線</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {profile?.group_code && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {profile.group_code === '01' ? '餐旅群' :
                     profile.group_code === '02' ? '機械群' :
                     profile.group_code === '03' ? '電機群' :
                     profile.group_code === '04' ? '電子群' :
                     profile.group_code === '05' ? '資訊群' :
                     profile.group_code === '06' ? '商管群' :
                     profile.group_code === '07' ? '設計群' :
                     profile.group_code === '08' ? '農業群' :
                     profile.group_code === '09' ? '化工群' :
                     profile.group_code === '10' ? '土木群' :
                     profile.group_code === '11' ? '海事群' :
                     profile.group_code === '12' ? '護理群' :
                     profile.group_code === '13' ? '家政群' :
                     profile.group_code === '14' ? '語文群' :
                     profile.group_code === '15' ? '商業與管理群' : profile.group_code}
                  </div>
                  <div className="text-xs text-gray-600">
                    {profile.grade ? `${profile.grade} 年級` : '就讀中'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8 px-4 py-2 bg-purple-100 rounded-full">
            <p className="text-purple-700 font-semibold text-sm">
              📅 Planner 規劃工具 - 升學路徑時間線
            </p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            升學重要時間點
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            掌握各個升學管道的重要截止日期和準備時間點，
            <br />
            <strong>規劃你的升學時程，確保不漏掉任何關鍵時刻。</strong>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mr-4">
                📅
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">追蹤管道</h3>
                <p className="text-blue-600 font-medium text-2xl">{pathwayTimelines.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white mr-4">
                ⏰
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">關鍵截止日</h3>
                <p className="text-red-600 font-medium text-2xl">
                  {pathwayTimelines.reduce((count, timeline) =>
                    count + timeline.events.filter(e => e.importance === 'critical' && !e.completed).length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mr-4">
                ✅
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">已完成</h3>
                <p className="text-green-600 font-medium text-2xl">
                  {pathwayTimelines.reduce((count, timeline) =>
                    count + timeline.events.filter(e => e.completed).length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pathway Timelines */}
        <div className="space-y-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              各管道時間線
            </h2>
            <p className="text-gray-600">
              點擊查看各升學管道的詳細時間線與重要事件
            </p>
          </div>

          {pathwayTimelines.map((timeline, timelineIndex) => {
            const completedEvents = timeline.events.filter(e => e.completed).length
            const totalEvents = timeline.events.length
            const progressPercent = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0

            return (
              <div key={timelineIndex} className={`bg-white rounded-xl p-6 shadow-sm border ${timeline.active ? 'border-indigo-100' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
                {/* Timeline Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${timeline.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                      {timelineIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{timeline.pathway}</h3>
                      <p className="text-sm text-gray-600">進度：{completedEvents}/{totalEvents} 事件 ({progressPercent}%)</p>
                    </div>
                  </div>
                  {!timeline.active && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">非主要管道</span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${timeline.color} h-2 rounded-full transition-all`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Events Preview */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timeline.events.slice(0, 4).map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl">{getCategoryIcon(event.category)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{event.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded border ${getImportanceColor(event.importance)}`}>
                              {event.importance === 'critical' ? '關鍵' :
                               event.importance === 'high' ? '重要' :
                               event.importance === 'medium' ? '中等' : '一般'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{event.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${event.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {event.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {timeline.events.length > 4 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">... 還有 {timeline.events.length - 4} 個事件</p>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewPathwayDetails(timeline)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                  >
                    <span>查看完整時間線</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-6">快速行動</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleGoToAbilityCenter}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">查看能力中心</span>
              </div>
              <p className="text-sm opacity-90">了解適合你的升學管道和準備進度</p>
            </button>

            <button
              onClick={handleGoToPortfolio}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">準備申請材料</span>
              </div>
              <p className="text-sm opacity-90">管理你的申請文件和準備進度</p>
            </button>
          </div>
        </div>

        {/* Help & Guidance */}
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>升學路徑時間線</strong>幫助你掌握升學節奏
            <br />• 各個升學管道的重要截止日期與準備時間點
            <br />• 關鍵事件提醒與進度追蹤
            <br />• 根據你的職群和年級，<strong>個人化的時間安排建議</strong>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            建議優先關注關鍵截止日，提前準備相關材料
          </p>
        </div>
      </main>

      {/* Modal for Pathway Timeline Details */}
      {selectedPathway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedPathway.pathway}</h2>
                  <p className="text-gray-600 mt-1">完整時間線與重要事件</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                {selectedPathway.events.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => handleToggleEvent(pathwayTimelines.indexOf(selectedPathway), event.id)}
                  >
                    {/* Timeline Connector */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.completed ? 'bg-green-500' : `bg-gradient-to-br ${selectedPathway.color}`} text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      {index < selectedPathway.events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(event.category)}</span>
                        <h4 className={`font-semibold text-gray-900 ${event.completed ? 'line-through' : ''}`}>
                          {event.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded border ${getImportanceColor(event.importance)}`}>
                          {event.importance === 'critical' ? '關鍵' :
                           event.importance === 'high' ? '重要' :
                           event.importance === 'medium' ? '中等' : '一般'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>📅 {event.date}</span>
                        <span>•</span>
                        <span>{event.category === 'deadline' ? '截止日期' :
                               event.category === 'preparation' ? '準備階段' :
                               event.category === 'milestone' ? '重要里程碑' : '機會'}</span>
                      </div>
                    </div>

                    {/* Completion Toggle */}
                    <div className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center ${event.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {event.completed && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>完成進度：</strong>
                  {selectedPathway.events.filter(e => e.completed).length} / {selectedPathway.events.length} 事件
                </div>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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