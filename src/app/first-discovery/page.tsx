// 第一次發現頁面 - 即時計算潛在升學路徑
// 目標：製造驚喜感，讓用戶了解自己的選擇

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

// 高職四技二專 6 種入學管道
const ADMISSION_PATHWAYS = {
  stars: {
    name: '繁星推薦',
    icon: '📚',
    description: '用在校成績申請，不用考統測',
    color: 'from-blue-500 to-indigo-500',
    borderColor: 'border-blue-200',
    requirements: ['在校成績前 30%', '由學校推薦', '不用考統測'],
    benefits: ['不用考統測也能上科大', '壓力較小', '幫助縮短城鄉差距']
  },
  selection: {
    name: '甄選入學',
    icon: '🎯',
    description: '統測成績 + 備審面試，展現你的特色',
    color: 'from-indigo-500 to-purple-500',
    borderColor: 'border-indigo-200',
    requirements: ['統測成績', '準備備審資料', '參加系所面試'],
    benefits: ['招生名額最多', '可以展現個人特色', '不只看成績']
  },
  distribution: {
    name: '聯合登記分發',
    icon: '📝',
    description: '依統測成績填志願分發，分數決定一切',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-200',
    requirements: ['參加統測', '成績達到錄取標準', '依志願序分發'],
    benefits: ['標準最明確', '準備方式單純', '志願填越多上榜機會越高']
  },
  skills: {
    name: '技優甄審',
    icon: '🏆',
    description: '用專業技藝成績或證照申請，免統測',
    color: 'from-green-500 to-blue-500',
    borderColor: 'border-green-200',
    requirements: ['持有乙級技術士證', '或參加技藝競賽獲獎', '繳交書審資料'],
    benefits: ['不用考統測', '強調技能與證照', '適合實作型學生']
  },
  guarantee: {
    name: '技優保送',
    icon: '⭐',
    description: '技能競賽前三名直接保送科大',
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-200',
    requirements: ['全國技能競賽前三名', '或具國手資格', '不需統測成績'],
    benefits: ['直接保送不用考試', '競爭者極少', '實力證明就能入學']
  },
  special: {
    name: '特殊選才',
    icon: '🎓',
    description: '特殊才能、實作經驗的入學管道',
    color: 'from-red-500 to-pink-500',
    borderColor: 'border-red-200',
    requirements: ['特殊才能證明', '實作經驗展現', '通過特殊選才審查'],
    benefits: ['不看統測成績', '肯定特殊才能', '適合有特殊專長的學生']
  }
}

// 職群與適合升學管道的映射
const GROUP_PATHWAY_MAPPING = {
  '餐旅群': ['stars', 'selection', 'special', 'skills', 'guarantee'],
  '機械群': ['stars', 'selection', 'skills', 'distribution', 'guarantee'],
  '電機群': ['stars', 'selection', 'skills', 'distribution', 'guarantee'],
  '電子群': ['stars', 'selection', 'skills', 'distribution', 'guarantee'],
  '資訊群': ['stars', 'selection', 'skills', 'special', 'guarantee'],
  '商管群': ['stars', 'selection', 'distribution', 'skills'],
  '設計群': ['selection', 'special', 'stars', 'skills'],
  '農業群': ['stars', 'selection', 'skills', 'special'],
  '化工群': ['stars', 'selection', 'skills', 'distribution'],
  '土木群': ['stars', 'selection', 'skills', 'distribution'],
  '海事群': ['stars', 'selection', 'skills', 'special'],
  '護理群': ['stars', 'selection', 'skills', 'distribution'],
  '家政群': ['selection', 'special', 'stars', 'skills'],
  '語文群': ['stars', 'selection', 'special'],
  '商業與管理群': ['stars', 'selection', 'distribution', 'skills']
}

export default function FirstDiscoveryPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userGroup, setUserGroup] = useState<string>('')
  const [recommendedPathways, setRecommendedPathways] = useState<string[]>([])
  const [discoveryMade, setDiscoveryMade] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
    trackPageView('first_discovery')
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }

      // 獲取用戶的職群資訊（已登入用戶從DB讀取，未登入使用localStorage）
      let groupCode = ''

      if (user) {
        const { data: profile, error } = await supabase
          .from('student_profiles')
          .select('group_code')
          .eq('user_id', user.id)
          .single()

        if (!error && profile) {
          const profileData = profile as { group_code: string }
          groupCode = profileData.group_code || ''
        }
      }

      // 如果沒有DB資料，嘗試從localStorage讀取
      if (!groupCode && typeof window !== 'undefined') {
        groupCode = localStorage.getItem('admission-master:selectedGroup') || ''
      }

      // 如果都沒有，使用預設值讓用戶仍然能看到內容
      if (!groupCode) {
        groupCode = '06' // 預設商管群作為展示
      }

      // 將 group_code 轉換為職群名稱
      const groupCodeToName: Record<string, string> = {
        '01': '餐旅群', '02': '機械群', '03': '電機群', '04': '電子群',
        '05': '資訊群', '06': '商管群', '07': '設計群', '08': '農業群',
        '09': '化工群', '10': '土木群', '11': '海事群', '12': '護理群',
        '13': '家政群', '14': '語文群', '15': '商業與管理群'
      }

      const groupName = groupCodeToName[groupCode] || ''
      setUserGroup(groupName)

      // 計算推薦的升學管道
      const pathways = GROUP_PATHWAY_MAPPING[groupName as keyof typeof GROUP_PATHWAY_MAPPING] || ['stars', 'application', 'exam']
      setRecommendedPathways(pathways)

    } catch (error) {
      console.error('Error in loadUserData:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartDiscovery = () => {
    trackFeatureUsage('discover_pathways', {
      user_group: userGroup,
      pathways_count: recommendedPathways.length
    })
    setDiscoveryMade(true)

    // 自動滾動到結果區
    setTimeout(() => {
      document.getElementById('discovery-results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleStartPlanning = () => {
    trackFeatureUsage('start_planning_from_discovery', {
      user_group: userGroup,
      pathways_discovered: recommendedPathways.length
    })
    router.push('/ability-account')
  }

  const handleShareDiscovery = () => {
    trackFeatureUsage('share_discovery', {
      user_group: userGroup,
      pathways_count: recommendedPathways.length
    })

    // 複製分享文字到剪貼簿
    const shareText = `🎓 我用升學大師發現，原來${userGroup}有 ${recommendedPathways.length} 種升學管道可以選！你也來測測看吧：https://admission-master.vercel.app`
    navigator.clipboard.writeText(shareText)

    alert('分享文字已複製到剪貼簿！\n\n' + shareText)
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
      {/* Page title bar */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">升學路徑發現</p>
          <button onClick={() => router.push('/ability-account')} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            我的能力帳戶
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Initial Discovery State */}
        {!discoveryMade && (
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-6">
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                準備好發現你的升學路徑了嗎？
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                你是 <span className="font-bold text-indigo-600">{userGroup}</span> 的學生
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto shadow-sm border border-indigo-100">
                <p className="text-lg text-gray-700 leading-relaxed">
                  根據你的職群，我們發現你可能適合 <strong className="text-indigo-600">{recommendedPathways.length} 種升學管道</strong>。
                  <br /><br />
                  準備好看看你的選擇了嗎？這可能會改變你的升學策略！
                </p>
              </div>
            </div>

            <button
              onClick={handleStartDiscovery}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 shadow-lg text-lg"
            >
              🔍 開始發現我的升學路徑
            </button>
          </div>
        )}

        {/* Discovery Results */}
        {discoveryMade && (
          <div id="discovery-results">
            {/* Celebration Header */}
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 恭喜！發現你的升學路徑
              </h1>
              <p className="text-xl text-gray-600">
                你是 <span className="font-bold text-indigo-600">{userGroup}</span> 的學生
              </p>
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p className="text-lg font-semibold text-gray-900">
                  你有 <span className="text-3xl text-indigo-600 font-bold">{recommendedPathways.length}</span> 種升學管道可以選擇！
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  比你想像的還要多，對吧？
                </p>
              </div>
            </div>

            {/* Pathways Display */}
            <div className="space-y-6 mb-12">
              {recommendedPathways.map((pathwayKey, index) => {
                const pathway = ADMISSION_PATHWAYS[pathwayKey as keyof typeof ADMISSION_PATHWAYS]
                return (
                  <div key={pathwayKey} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${pathway.borderColor} hover:shadow-md transition`}>
                    <div className="flex items-start mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${pathway.color} rounded-xl flex items-center justify-center text-3xl mr-4 flex-shrink-0`}>
                        {pathway.icon}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{pathway.name}</h3>
                          <span className="text-sm text-indigo-600 font-medium">選項 {index + 1}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{pathway.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">📋 申請條件</h4>
                        <ul className="space-y-1">
                          {pathway.requirements.map((req, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-indigo-600 mr-2">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">✨ 優勢特色</h4>
                        <ul className="space-y-1">
                          {pathway.benefits.map((benefit, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">🚀 下一步：開始規劃你的升學策略</h2>
              <p className="mb-6 text-indigo-100">
                現在你知道有這麼多選擇了，該怎麼選擇最適合你的路徑呢？
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleStartPlanning}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  📋 開始規劃我的路徑
                </button>
                <button
                  onClick={handleShareDiscovery}
                  className="px-6 py-3 bg-indigo-800 text-white rounded-lg font-semibold hover:bg-indigo-900 transition"
                >
                  📢 分享給同學
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-2">💡 重要提醒</h3>
              <p className="text-sm text-gray-700">
                每種升學管道都有不同的申請時間和準備要求。建議你：
                <br />1. <strong>深入了解</strong>每個管道的申請條件
                <br />2. <strong>準備相關材料</strong>（學習歷程、證明、作品集等）
                <br />3. <strong>規劃時間表</strong>，避免錯過申請期限
              </p>
            </div>
          </div>
        )}
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